"use client"

import { useAppStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"
import { useMemo } from "react"
import { aggregateMaterials, calculateComponentInventory } from "@/lib/circular/material-aggregator"
import { Box, Filter, Recycle, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function CircularDashboard() {
    const {
        modelElements,
        getFilteredElementIds,
        // selectedElementId, // Unused in this specific logic, removed for cleanliness
        // selectedElementData, // Unused
        selectedElementIds,
        filters,
        selectedAssemblyId,
        phases,
        searchTerm,
        setHoveredElementIds,
        toggleMaterialFilter,
        setMaterialFilter,
        setHighlights,
        clearHighlights
    } = useAppStore(
        useShallow((state) => ({
            modelElements: state.modelElements,
            getFilteredElementIds: state.getFilteredElementIds,
            selectedElementIds: state.selectedElementIds,
            filters: state.filters,
            selectedAssemblyId: state.selectedAssemblyId,
            phases: state.phases,
            searchTerm: state.searchTerm,
            setHoveredElementIds: state.setHoveredElementIds,
            toggleMaterialFilter: state.toggleMaterialFilter,
            setMaterialFilter: state.setMaterialFilter,
            setHighlights: state.setHighlights,
            clearHighlights: state.clearHighlights
        }))
    )

    // 1. INVENTORY LIST SET (The Single Source of Truth)
    // This calculates the "Universe" of materials available in the current View/Phase/Category.
    // We skip the material filter here so the list always shows all options.
    const inventoryWorkingSet = useMemo(() => {
        // If specific elements are manually selected (clicked in 3D), they override everything
        if (selectedElementIds.length > 0) {
            return modelElements.filter(el => selectedElementIds.includes(el.id))
        }

        const filteredIds = getFilteredElementIds({ skipMaterialFilter: true })
        if (!filteredIds) return modelElements

        return modelElements.filter(el => filteredIds.has(el.id))
    }, [
        selectedElementIds,
        modelElements,
        filters.categories,
        filters.levels,
        filters.groups,
        filters.elementNames,
        selectedAssemblyId,
        phases.selectedPhase,
        phases.filterMode,
        searchTerm,
        getFilteredElementIds
    ])

    // 2. Highlight Logic (Memoized strictly for highlights)
    const highlightedMaterials = useMemo(() => {
        if (filters.materials.length > 0) return filters.materials

        if (selectedElementIds.length > 0) {
            const explicitMaterials = new Set<string>()
            selectedElementIds.forEach(id => {
                const el = modelElements.find(e => e.id === id)
                if (el && el.properties?.["Material Quantities"]) {
                    Object.keys(el.properties["Material Quantities"]).forEach(mat => {
                        explicitMaterials.add(mat)
                    })
                }
            })
            return Array.from(explicitMaterials)
        }
        return []
    }, [filters.materials, selectedElementIds, modelElements])

    // 3. Calculate Full List (The Expensive Operation - Done Once)
    const componentInventory = useMemo(() => {
        const materialMap = aggregateMaterials(inventoryWorkingSet)
        return calculateComponentInventory(materialMap)
    }, [inventoryWorkingSet])

    // 4. Calculate Stats (Optimization: Derived from the List, not the raw elements)
    // Instead of re-aggregating, we just sum up the rows from step 3 that are currently active.
    const { totalVolume, activeMaterialCount } = useMemo(() => {
        let activeItems = componentInventory

        // If a material filter is active, we only sum up the selected materials
        if (filters.materials.length > 0) {
            activeItems = componentInventory.filter(mat => filters.materials.includes(mat.name))
        }

        const vol = activeItems.reduce((sum, mat) => sum + mat.volume, 0)

        return {
            totalVolume: vol,
            activeMaterialCount: activeItems.length
        }
    }, [componentInventory, filters.materials])


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
                            {inventoryWorkingSet.length}
                        </span>
                        <span className="text-xs font-bold uppercase text-muted-foreground">
                            {inventoryWorkingSet.length === 1 ? 'Element' : 'Elements'}
                        </span>
                    </div>
                </div>
            </section>

            {/* Material Summary Header */}
            {(componentInventory.length > 0) && (
                <section>
                    <div className="p-3 bg-muted/5 border-b border-border">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Material Summary
                        </span>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="p-3 bg-muted/10 rounded-md border border-border">
                            <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1">
                                {filters.materials.length > 0 ? "Selected Volume" : "Total Volume"}
                            </div>
                            <div className="text-2xl font-mono font-bold text-foreground">
                                {totalVolume.toFixed(2)} m³
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                                {filters.materials.length > 0
                                    ? `${activeMaterialCount} selected of ${componentInventory.length} materials`
                                    : `${componentInventory.length} materials`
                                }
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Material List */}
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
                        {componentInventory.map((mat, i) => {
                            const isSelected = filters.materials.includes(mat.name)
                            const isAnyFilterActive = filters.materials.length > 0
                            const isDimmed = isAnyFilterActive && !isSelected

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex items-center justify-between text-xs p-2 rounded border transition-all cursor-pointer select-none",
                                        isSelected
                                            ? "bg-primary/10 border-primary/40 shadow-sm"
                                            : "bg-muted/5 border-border/50 hover:bg-muted/20",
                                        isDimmed && "opacity-40 grayscale hover:opacity-70 hover:grayscale-0"
                                    )}
                                    onClick={(e) => {
                                        const isMulti = e.metaKey || e.ctrlKey

                                        if (isSelected && !isMulti) {
                                            setMaterialFilter(null)
                                            clearHighlights()
                                        } else if (isMulti) {
                                            toggleMaterialFilter(mat.name)
                                            const updatedMaterials = isSelected
                                                ? filters.materials.filter(m => m !== mat.name)
                                                : [...filters.materials, mat.name]
                                            setHighlights({ type: 'material', values: updatedMaterials })
                                        } else {
                                            setMaterialFilter(mat.name)
                                            setHighlights({ type: 'material', values: [mat.name] })
                                        }
                                    }}
                                    onMouseEnter={() => {
                                        const ids = inventoryWorkingSet
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
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-3 h-3 rounded-full border flex items-center justify-center transition-colors",
                                            isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                                        )}>
                                            {isSelected && <Check className="w-2 h-2 text-primary-foreground" />}
                                        </div>

                                        <div>
                                            <div className={cn(
                                                "font-bold transition-colors",
                                                isSelected ? "text-primary" : "text-foreground"
                                            )}>
                                                {mat.name}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">{mat.class}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={cn(
                                            "font-mono font-bold transition-colors",
                                            isSelected ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                            {mat.volume.toFixed(2)} m³
                                        </div>
                                        {mat.componentCount > 0 && (
                                            <div className="text-[10px] text-muted-foreground">
                                                ~{mat.componentCount.toLocaleString()} bricks
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

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