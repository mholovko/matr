"use client"

import { useState, useMemo } from "react"
import { MaterialsGrid } from "@/components/materials/passport/materials-grid"
import { MaterialsDashboard } from "@/components/materials/passport/materials-dashboard"
import { combinedMaterials } from '@/lib/data/materials'
import { MaterialFilterState, DashboardViewMode } from "@/types/materials-filters"

import { useAppStore } from "@/lib/store"
import { EnrichedMaterialPassport } from "@/types/material-passport"
import { aggregateMaterials } from "@/lib/circular/material-aggregator"
import { useEffect } from "react"
import { phasesOrder } from "@/lib/data/phases"
import { buildPhaseDataTree } from "@/lib/filters/phase-map"




export function MaterialsClient() {
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
    const [viewMode, setViewMode] = useState<DashboardViewMode>('BANK')


    const modelElements = useAppStore(state => state.modelElements)
    const { phases, setPhaseDataTree, getFilteredElementIds } = useAppStore()



    const [filters, setFilters] = useState<MaterialFilterState>({
        search: '',
        classification: 'ALL',
        health: 'ALL',
        sort: 'CARBON_ASC',
        mode: 'thumbnail',
        origin: 'ALL',
        usage: 'ALL'
    })


    const handleFilterChange = (updates: Partial<MaterialFilterState>) => {
        setFilters(prev => ({ ...prev, ...updates }))
    }

    // Initialize Phase Data if missing
    useEffect(() => {
        if (modelElements.length > 0 && !phases.dataTree) {
            const tree = buildPhaseDataTree(modelElements, phasesOrder)
            setPhaseDataTree(tree)
        }
    }, [modelElements, phases.dataTree, setPhaseDataTree])

    const filteredMaterials = useMemo(() => {
        // 1. Calculate Aggregated Volumes from Model Elements
        // We use the same logic as the Circular Dashboard to ensure consistency

        // Get the working set of elements based on current phase (and other filters)
        // We skip material filter because we want to show ALL materials available in the filtered set
        const activeElementIds = getFilteredElementIds({ skipMaterialFilter: true })

        // If activeElementIds is null, it means "All Elements" (no filters active)
        // If it's a Set, we filter modelElements
        const workingSet = activeElementIds
            ? modelElements.filter(el => activeElementIds.has(el.id))
            : modelElements

        const materialMap = aggregateMaterials(workingSet)

        // 1b. Calculate Material Phases (Global Context - All Elements)
        // We want to show all created phases where a material is used, regardless of current view
        const materialPhasesMap = new Map<string, Set<string>>()

        if (phases.dataTree) {
            modelElements.forEach(el => {
                const createdPhase = phases.dataTree!.elementPhaseInfo[el.id]?.createdPhase
                if (!createdPhase) return

                const materialQuantities = el.properties?.["Material Quantities"] || {}
                Object.keys(materialQuantities).forEach(matName => {
                    if (!materialPhasesMap.has(matName)) {
                        materialPhasesMap.set(matName, new Set())
                    }
                    materialPhasesMap.get(matName)!.add(createdPhase)
                })
            })
        }


        // 2. Enrich with Model Data
        let result: EnrichedMaterialPassport[] = combinedMaterials.map(mat => {
            // Match by Name (Exact match required as per Speckle data)
            const modelData = materialMap.get(mat.id)
            const phasesSet = materialPhasesMap.get(mat.id)

            return {
                ...mat,
                isUsed: !!modelData,
                volume: modelData ? modelData.volume : 0,
                phases: phasesSet ? Array.from(phasesSet).sort((a, b) => phasesOrder.indexOf(a) - phasesOrder.indexOf(b)) : []
            }
        })


        // 2. Apply Filters

        // Mode-Specific Logic
        if (viewMode === 'BANK') {
            // Bank Mode: Show only materials used in the model
            result = result.filter(m => m.isUsed)
        } else {
            // Planning Mode: Show all materials (potentially allow usage filter if needed, but usually we want everything)
            // We can keep the usage filter active here if the user wants to drill down, 
            // OR we can disable it. For now, let's respect the usage filter ONLY in Planning mode if set,
            // but usually Planning implies "Library" view.
            if (filters.usage !== "ALL") {
                result = result.filter(m => filters.usage === 'USED' ? m.isUsed : true)
            }
        }

        if (filters.origin !== "ALL") {
            result = result.filter(m => {
                const isExisting = 'auditData' in m; // ExistingMaterialPassport has auditData
                return filters.origin === 'EXISTING' ? isExisting : !isExisting;
            })
        }


        if (filters.classification !== "ALL") {
            result = result.filter(m => m.classification === filters.classification)
        }
        if (filters.health !== "ALL") {
            result = result.filter(m => m.circularity.materialHealth === filters.health)
        }
        if (filters.search) {
            const q = filters.search.toLowerCase()
            result = result.filter(m =>
                m.name.toLowerCase().includes(q) ||
                ('manufacturer' in m ? m.manufacturer.toLowerCase().includes(q) : false) ||
                m.description.toLowerCase().includes(q)
            )
        }

        result.sort((a, b) => {
            const getPrice = (m: EnrichedMaterialPassport) => {
                if ('unitRate' in m.matrixMetrics.financialCost) {
                    return m.matrixMetrics.financialCost.unitRate;
                }
                return m.matrixMetrics.financialCost.repairCost; // Use repair cost for existing
            };

            switch (filters.sort) {
                case 'PRICE_ASC':
                    return getPrice(a) - getPrice(b)
                case 'PRICE_DESC':
                    return getPrice(b) - getPrice(a)
                case 'DISTANCE_ASC':
                    return a.matrixMetrics.provenance.distanceToSiteMiles - b.matrixMetrics.provenance.distanceToSiteMiles
                case 'VOLUME_DESC':
                    return b.volume - a.volume
                case 'VOLUME_ASC':
                    return a.volume - b.volume
                case 'CARBON_DESC':
                    return (b.matrixMetrics.embodiedCarbon.totalEmbodied + b.matrixMetrics.embodiedCarbon.biogenicStorage) -
                        (a.matrixMetrics.embodiedCarbon.totalEmbodied + a.matrixMetrics.embodiedCarbon.biogenicStorage)
                case 'CARBON_ASC':
                default:
                    return (a.matrixMetrics.embodiedCarbon.totalEmbodied + a.matrixMetrics.embodiedCarbon.biogenicStorage) -
                        (b.matrixMetrics.embodiedCarbon.totalEmbodied + b.matrixMetrics.embodiedCarbon.biogenicStorage)
            }
        })


        return result
        return result
    }, [filters, modelElements, viewMode, phases.selectedPhase, getFilteredElementIds])




    return (
        <div className="relative h-screen pt-20 overflow-hidden bg-gray-50">

            {/* The Grid adapts to the panel state */}
            <MaterialsGrid
                materials={filteredMaterials}
                mode={filters.mode}
                sortBy={filters.sort}
                isPanelCollapsed={isPanelCollapsed}
            />

            {/* The Dashboard controls its own width state via parent */}
            <MaterialsDashboard
                filters={filters}
                onFilterChange={handleFilterChange}
                totalCount={filteredMaterials.length}
                isCollapsed={isPanelCollapsed}
                setIsCollapsed={setIsPanelCollapsed}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />
        </div>
    )
}