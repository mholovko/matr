"use client"

import { useState, useMemo, useEffect } from "react"
import { MaterialsGrid } from "@/components/materials/passport/materials-grid"
import { MaterialsDashboard } from "@/components/materials/passport/materials-dashboard"
import { combinedMaterials } from '@/lib/data/materials'
import { MaterialFilterState, DashboardViewMode } from "@/types/materials-filters"
import { useAppStore } from "@/lib/store"
import { aggregateMaterials } from "@/lib/circular/material-aggregator"
import { phasesOrder, lifecycleMap } from "@/lib/data/phases"
import { buildPhaseDataTree } from "@/lib/filters/phase-map"

const getAgeData = (dateStr?: string) => {
    if (!dateStr) return { ms: 0, label: 'N/A' }
    const start = new Date(dateStr).getTime()
    const now = new Date().getTime()
    const diff = now - start
    if (diff < 0) return { ms: diff, label: 'Planned' }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const years = Math.floor(days / 365.25)
    return { ms: diff, label: years > 0 ? `${years} Year${years > 1 ? 's' : ''}` : `${days} Days` }
}

export function MaterialsClient() {
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
    const [viewMode, setViewMode] = useState<DashboardViewMode>('BANK')

    const modelElements = useAppStore(state => state.modelElements)
    const { phases, setPhaseDataTree, getFilteredElementIds } = useAppStore()

    // Default Sort is VOLUME (because default view is Bank)
    const [filters, setFilters] = useState<MaterialFilterState>({
        search: '',
        classification: [],
        endOfLife: [],
        health: 'ALL',
        origin: 'ALL',
        onlyLocal: false,
        sort: 'VOLUME_DESC',
        mode: 'thumbnail',
        usage: 'ALL'
    })

    const handleModeChange = (mode: DashboardViewMode) => {
        setViewMode(mode)

        // Context-aware Default Sorting
        setFilters(prev => ({
            ...prev,
            sort: mode === 'PLANNING' ? 'CARBON_ASC' : 'VOLUME_DESC'
        }))
    }

    const handleFilterChange = (updates: Partial<MaterialFilterState>) => {
        setFilters(prev => ({ ...prev, ...updates }))
    }

    useEffect(() => {
        if (modelElements.length > 0 && !phases.dataTree) {
            const tree = buildPhaseDataTree(modelElements, phasesOrder)
            setPhaseDataTree(tree)
        }
    }, [modelElements, phases.dataTree, setPhaseDataTree])

    const filteredMaterials = useMemo(() => {
        const activeElementIds = getFilteredElementIds({ skipMaterialFilter: true })

        const workingSet = activeElementIds
            ? modelElements.filter(el => activeElementIds.has(el.id))
            : modelElements

        const materialMap = aggregateMaterials(workingSet)
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

        let result = combinedMaterials.map(mat => {
            const modelData = materialMap.get(mat.id)
            const phasesSet = materialPhasesMap.get(mat.id)

            const sortedPhases = phasesSet
                ? Array.from(phasesSet).sort((a, b) => phasesOrder.indexOf(a) - phasesOrder.indexOf(b))
                : []

            const earliestPhaseId = sortedPhases[0]
            const phaseInfo = earliestPhaseId ? lifecycleMap[earliestPhaseId] : null
            const constructionStage = phaseInfo?.history.find(h => h.stage === '5_Construction')
            const dateRef = constructionStage?.dates.end || phaseInfo?.history[0]?.dates.end || phaseInfo?.history[0]?.dates.start
            const ageData = getAgeData(dateRef)

            return {
                ...mat,
                isUsed: !!modelData,
                volume: modelData ? modelData.volume : 0,
                phases: sortedPhases,
                age: {
                    ms: sortedPhases.length > 0 ? ageData.ms : 0,
                    label: sortedPhases.length > 0 ? ageData.label : '-'
                }
            }
        })

        // --- FILTERING ---
        if (viewMode === 'BANK') {
            result = result.filter(m => m.isUsed)
        }

        if (filters.classification.length > 0) result = result.filter(m => filters.classification.includes(m.classification))
        if (filters.endOfLife.length > 0) result = result.filter(m => filters.endOfLife.includes(m.circularity.endOfLifeStrategy))
        if (filters.onlyLocal) result = result.filter(m => m.matrixMetrics.provenance.isEcoregional)
        if (filters.origin !== "ALL") {
            result = result.filter(m => {
                const isExisting = 'auditData' in m;
                return filters.origin === 'EXISTING' ? isExisting : !isExisting;
            })
        }
        if (filters.health !== "ALL") result = result.filter(m => m.circularity.materialHealth === filters.health)
        if (filters.search) {
            const q = filters.search.toLowerCase()
            result = result.filter(m =>
                m.name.toLowerCase().includes(q) ||
                ('manufacturer' in m ? m.manufacturer.toLowerCase().includes(q) : false) ||
                m.description.toLowerCase().includes(q)
            )
        }

        // --- SORTING ---
        result.sort((a, b) => {
            const getPrice = (m: any) => {
                if ('unitRate' in m.matrixMetrics.financialCost) return m.matrixMetrics.financialCost.unitRate;
                return m.matrixMetrics.financialCost.repairCost;
            };

            switch (filters.sort) {
                // VOLUME IS NOW DEFAULT, ENSURE LOGIC IS ROBUST
                case 'VOLUME_DESC': return b.volume - a.volume
                case 'VOLUME_ASC': return a.volume - b.volume

                case 'AGE_DESC': return b.age.ms - a.age.ms
                case 'AGE_ASC': return a.age.ms - b.age.ms
                case 'CIRCULARITY_DESC': return b.circularity.detachabilityIndex - a.circularity.detachabilityIndex
                case 'THERMAL_ASC': return a.physics.thermalConductivity - b.physics.thermalConductivity
                case 'PRICE_ASC': return getPrice(a) - getPrice(b)
                case 'PRICE_DESC': return getPrice(b) - getPrice(a)
                case 'DISTANCE_ASC': return a.matrixMetrics.provenance.distanceToSiteMiles - b.matrixMetrics.provenance.distanceToSiteMiles
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
    }, [filters, modelElements, viewMode, phases.selectedPhase, getFilteredElementIds, phases.dataTree])

    return (
        <div className="relative h-screen pt-20 overflow-hidden bg-gray-50">
            <MaterialsGrid
                materials={filteredMaterials}
                mode={filters.mode}
                sortBy={filters.sort}
                isPanelCollapsed={isPanelCollapsed}
            />
            <MaterialsDashboard
                filters={filters}
                onFilterChange={handleFilterChange}
                totalCount={filteredMaterials.length}
                isCollapsed={isPanelCollapsed}
                setIsCollapsed={setIsPanelCollapsed}
                viewMode={viewMode}
                setViewMode={handleModeChange}
            />
        </div>
    )
}