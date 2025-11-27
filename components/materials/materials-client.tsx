"use client"

import { useState, useMemo } from "react"
import { MaterialsGrid } from "@/components/materials/passport/materials-grid"
import { MaterialsDashboard } from "@/components/materials/passport/materials-dashboard"
import { allMaterials } from '@/lib/data/materials'
import { MaterialFilterState } from "@/types/materials-filters"

export function MaterialsClient() {
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)

    const [filters, setFilters] = useState<MaterialFilterState>({
        search: '',
        classification: 'ALL',
        health: 'ALL',
        sort: 'CARBON_ASC',
        mode: 'thumbnail'
    })

    const handleFilterChange = (updates: Partial<MaterialFilterState>) => {
        setFilters(prev => ({ ...prev, ...updates }))
    }

    const filteredMaterials = useMemo(() => {
        let result = [...allMaterials]

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
                m.manufacturer.toLowerCase().includes(q) ||
                m.description.toLowerCase().includes(q)
            )
        }

        result.sort((a, b) => {
            switch (filters.sort) {
                case 'PRICE_ASC':
                    return a.matrixMetrics.financialCost.unitRate - b.matrixMetrics.financialCost.unitRate
                case 'PRICE_DESC':
                    return b.matrixMetrics.financialCost.unitRate - a.matrixMetrics.financialCost.unitRate
                case 'DISTANCE_ASC':
                    return a.matrixMetrics.provenance.distanceToSiteMiles - b.matrixMetrics.provenance.distanceToSiteMiles
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
    }, [filters])

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