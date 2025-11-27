"use client"

import { useState, useMemo } from "react"
import { MaterialsGrid } from "@/components/materials/passport/materials-grid"
import { MaterialsDashboard } from "@/components/materials/passport/materials-dashboard"
import { combinedMaterials } from '@/lib/data/materials'
import { MaterialFilterState } from "@/types/materials-filters"
import { useAppStore } from "@/lib/store"
import { EnrichedMaterialPassport } from "@/types/material-passport"
import { aggregateMaterials } from "@/lib/circular/material-aggregator"



export function MaterialsClient() {
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)

    const modelElements = useAppStore(state => state.modelElements)


    const [filters, setFilters] = useState<MaterialFilterState>({
        search: '',
        classification: 'ALL',
        health: 'ALL',
        sort: 'CARBON_ASC',
        mode: 'thumbnail',
        origin: 'EXISTING',
        usage: 'ALL'
    })


    const handleFilterChange = (updates: Partial<MaterialFilterState>) => {
        setFilters(prev => ({ ...prev, ...updates }))
    }

    const filteredMaterials = useMemo(() => {
        // 1. Calculate Aggregated Volumes from Model Elements
        // We use the same logic as the Circular Dashboard to ensure consistency
        const materialMap = aggregateMaterials(modelElements)

        // 2. Enrich with Model Data
        let result: EnrichedMaterialPassport[] = combinedMaterials.map(mat => {
            // Match by Name (Exact match required as per Speckle data)
            const modelData = materialMap.get(mat.name)

            return {
                ...mat,
                isUsed: !!modelData,
                volume: modelData ? modelData.volume : 0
            }
        })


        // 2. Apply Filters
        if (filters.origin !== "ALL") {
            result = result.filter(m => {
                const isExisting = 'auditData' in m; // ExistingMaterialPassport has auditData
                return filters.origin === 'EXISTING' ? isExisting : !isExisting;
            })
        }

        if (filters.usage !== "ALL") {
            result = result.filter(m => filters.usage === 'USED' ? m.isUsed : true)
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
    }, [filters, modelElements])


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
            />
        </div>
    )
}