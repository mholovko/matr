"use client"

import { useMemo } from "react"
import { EnrichedMaterialPassport } from "@/types/material-passport"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAppStore } from "@/lib/store"
import {
    CalculatorHeader,
    CalculatorTotals,
    CalculatorItem,
    CalculatorFooter,
    CalculatorEmptyState
} from "./calculator-components"

interface PlanningCalculatorProps {
    materials: EnrichedMaterialPassport[]
}

export function PlanningCalculator({ materials }: PlanningCalculatorProps) {
    // --- CONNECT TO STORE ---
    const { planningSelection } = useAppStore(state => state.materialsUI)
    const {
        updatePlanningQuantity,
        togglePlanningSelection,
        clearPlanningSelection
    } = useAppStore()

    // --- DERIVED DATA ---

    // 1. Flat list for totals calculation
    const selectedItems = useMemo(() => {
        return materials.filter(m => Object.keys(planningSelection).includes(m.id))
    }, [materials, planningSelection])

    // 2. Grouped list for Rendering
    const groupedItems = useMemo(() => {
        const groups: Record<string, EnrichedMaterialPassport[]> = {}

        selectedItems.forEach(item => {
            const category = item.classification.replace('_', ' ')
            if (!groups[category]) {
                groups[category] = []
            }
            groups[category].push(item)
        })

        // Sort groups alphabetically
        return Object.keys(groups).sort().reduce((acc, key) => {
            acc[key] = groups[key]
            return acc
        }, {} as Record<string, EnrichedMaterialPassport[]>)
    }, [selectedItems])

    // --- CALCULATIONS ---
    const totals = useMemo(() => {
        let totalVolume = 0
        let totalCost = 0
        let totalCarbon = 0
        let weightedDistance = 0

        selectedItems.forEach(item => {
            const vol = planningSelection[item.id] || 0

            // Financial Cost
            const rate = 'unitRate' in item.matrixMetrics.financialCost
                ? item.matrixMetrics.financialCost.unitRate
                : item.matrixMetrics.financialCost.repairCost || 0

            // Net Carbon
            const carbonUnit = item.matrixMetrics.embodiedCarbon.totalEmbodied + item.matrixMetrics.embodiedCarbon.biogenicStorage

            // Distance
            const distance = item.matrixMetrics.provenance.distanceToSiteMiles

            totalVolume += vol
            totalCost += (rate * vol)
            totalCarbon += (carbonUnit * vol)
            weightedDistance += (distance * vol)
        })

        return {
            cost: totalCost,
            carbon: totalCarbon,
            avgDistance: totalVolume > 0 ? (weightedDistance / totalVolume) : 0,
            volume: totalVolume
        }
    }, [selectedItems, planningSelection])

    // --- EMPTY STATE ---
    if (selectedItems.length === 0) {
        return <CalculatorEmptyState />
    }

    return (
        <div className="flex flex-col h-full bg-background w-full">

            {/* HEADER */}
            <CalculatorHeader onClear={clearPlanningSelection} />

            {/* TOTALS SUMMARY BANNER */}
            <CalculatorTotals totals={totals} />

            {/* SCROLLABLE ITEM LIST */}
            <ScrollArea className="flex-1 bg-muted/5">
                <div className="flex flex-col pb-4">
                    {Object.entries(groupedItems).map(([category, items]) => (
                        <div key={category} className="flex flex-col">

                            {/* CATEGORY HEADER */}
                            <div className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm px-4 py-1.5 border-y border-foreground/5 shadow-sm">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                                    {category}
                                </span>
                            </div>

                            {/* ITEM ROWS */}
                            {items.map(item => {
                                const volume = planningSelection[item.id] || 0
                                return (
                                    <CalculatorItem
                                        key={item.id}
                                        item={item}
                                        volume={volume}
                                        onUpdateQuantity={updatePlanningQuantity}
                                        onRemove={togglePlanningSelection}
                                    />
                                )
                            })}
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* FOOTER METADATA */}
            <CalculatorFooter avgDistance={totals.avgDistance} />
        </div>
    )
}