"use client"

import { useAppStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"
import { useMemo } from "react"
import { aggregateMaterials, calculateComponentInventory } from "@/lib/circular/material-aggregator"
import { Box, Filter, Recycle } from "lucide-react"

export function CircularDashboard() {
    const {
        modelElements,
        getFilteredElementIds,
        selectedElementId,
        selectedElementData,
        filters,
        selectedMaterialName,
        selectedAssemblyId,
        phases,
        searchTerm,
        setHoveredElementIds
    } = useAppStore(
        useShallow((state) => ({
            modelElements: state.modelElements,
            getFilteredElementIds: state.getFilteredElementIds,
            selectedElementId: state.selectedElementId,
            selectedElementData: state.selectedElementData,
            filters: state.filters,
            selectedMaterialName: state.selectedMaterialName,
            selectedAssemblyId: state.selectedAssemblyId,
            phases: state.phases,
            searchTerm: state.searchTerm,
            setHoveredElementIds: state.setHoveredElementIds
        }))
    )

    // Get working set of elements based on current filters/selection
    const workingSet = useMemo(() => {
        // Single element selected
        if (selectedElementId && selectedElementData) {
            return [selectedElementData]
        }

        // Get filtered IDs from store (handles all filter combinations)
        const filteredIds = getFilteredElementIds()

        // If filteredIds is null, show all elements
        if (!filteredIds) {
            return modelElements
        }

        // Filter modelElements by the filtered IDs
        return modelElements.filter(el => filteredIds.has(el.id))
    }, [
        selectedElementId,
        selectedElementData,
        modelElements,
        filters,
        selectedMaterialName,
        selectedAssemblyId,
        phases.selectedPhase,
        phases.filterMode,
        searchTerm
    ])

    // Aggregate materials and calculate component inventory
    const componentInventory = useMemo(() => {
        const materialMap = aggregateMaterials(workingSet)
        return calculateComponentInventory(materialMap)
    }, [workingSet])

    // Calculate summary stats
    const totalVolume = componentInventory.reduce((sum, mat) => sum + mat.volume, 0)

    // Active filters summary
    const activeFilters = []
    if (filters.categories.length > 0) activeFilters.push(`${filters.categories.length} categories`)
    if (filters.levels.length > 0) activeFilters.push(`${filters.levels.length} levels`)
    if (filters.groups.length > 0) activeFilters.push(`${filters.groups.length} groups`)
    if (selectedMaterialName) activeFilters.push(`Material: ${selectedMaterialName}`)
    if (selectedAssemblyId) activeFilters.push(`Assembly: ${selectedAssemblyId}`)
    if (phases.selectedPhase) activeFilters.push(`Phase: ${phases.selectedPhase}`)

    return (
        <div className="flex flex-col h-full">
            {/* Selection Summary */}
            <section>
                <div className="p-3 bg-muted/5 border-b border-border">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Selection Summary
                    </span>
                </div>
                <div className="p-4 space-y-2">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold font-mono text-foreground">
                            {workingSet.length}
                        </span>
                        <span className="text-xs font-bold uppercase text-muted-foreground">
                            {workingSet.length === 1 ? 'Element' : 'Elements'}
                        </span>
                    </div>
                    {activeFilters.length > 0 && (
                        <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
                            <Filter className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{activeFilters.join(' • ')}</span>
                        </div>
                    )}
                </div>
            </section>

            {/* Material Summary */}
            {componentInventory.length > 0 && (
                <section>
                    <div className="p-3 bg-muted/5 border-b border-border">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Material Summary
                        </span>
                    </div>
                    <div className="p-4 space-y-3">
                        {/* Total Volume */}
                        <div className="p-3 bg-muted/10 rounded-md border border-border">
                            <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1">
                                Total Material Volume
                            </div>
                            <div className="text-2xl font-mono font-bold text-foreground">
                                {totalVolume.toFixed(2)} m³
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                                {componentInventory.length} material{componentInventory.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Material Breakdown */}
            {componentInventory.length > 0 && (
                <section className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-3 bg-muted/5 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Box className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Material Breakdown
                            </span>
                        </div>
                    </div>
                    <div className="p-4 space-y-2">
                        {componentInventory.map((mat, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between text-xs p-2 bg-muted/5 rounded border border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                                onMouseEnter={() => {
                                    // Find all elements with this material
                                    const ids = workingSet
                                        .filter(el => {
                                            const materialQuantities = el.properties?.["Material Quantities"] || {}
                                            return Object.keys(materialQuantities).some(name => name === mat.name)
                                        })
                                        .map(el => el.id)
                                        .filter((id): id is string => !!id)

                                    if (ids.length > 0) {
                                        setHoveredElementIds(ids)
                                    }
                                }}
                                onMouseLeave={() => setHoveredElementIds(null)}
                            >
                                <div>
                                    <div className="font-bold text-foreground">{mat.name}</div>
                                    <div className="text-[10px] text-muted-foreground">{mat.class}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-bold text-foreground">
                                        {mat.volume.toFixed(2)} m³
                                    </div>
                                    {mat.componentCount > 0 && (
                                        <div className="text-[10px] text-muted-foreground">
                                            ~{mat.componentCount.toLocaleString()} bricks
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* No Data State */}
            {componentInventory.length === 0 && (
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center text-muted-foreground">
                        <Recycle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="text-xs font-mono">
                            No materials in selection
                        </p>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-auto border-t border-border p-2 bg-muted/10 text-[10px] font-mono text-muted-foreground flex justify-between px-4 uppercase tracking-wider">
                <span>Dashboard</span>
                <span>{componentInventory.length} Materials</span>
            </div>
        </div>
    )
}
