"use client"

import { useMemo, useEffect } from "react"
import { MaterialsGrid } from "@/components/materials/passport/materials-grid"
import { MaterialsDashboard } from "@/components/materials/passport/materials-dashboard"
import { useAppStore } from "@/lib/store"
import { phasesOrder, lifecycleMap } from "@/lib/data/phases"
import { buildPhaseDataTree } from "@/lib/filters/phase-map"
import { PlanningCalculator } from "@/components/materials/planning/planning-calculator"
import { cn } from "@/lib/utils"
import { useMaterialsData } from "@/hooks/use-materials-data"

export function MaterialsClient() {
    // --- ZUSTAND STATE ---
    const modelElements = useAppStore(state => state.modelElements)
    const { phases, setPhaseDataTree, getFilteredElementIds } = useAppStore()

    // Materials UI Slice
    const {
        viewMode,
        isPanelCollapsed,
        filters,
        planningSelection
    } = useAppStore(state => state.materialsUI)

    // Actions
    const {
        setMaterialViewMode,
        setMaterialPanelCollapsed,
        updateMaterialFilters,
        togglePlanningSelection,
        updatePlanningQuantity,
        clearPlanningSelection
    } = useAppStore()

    // --- EFFECTS ---

    useEffect(() => {
        if (modelElements.length > 0 && !phases.dataTree) {
            const tree = buildPhaseDataTree(modelElements, phasesOrder)
            setPhaseDataTree(tree)
        }
    }, [modelElements, phases.dataTree, setPhaseDataTree])

    // --- MEMOIZED DATA PROCESSING ---
    const filteredMaterials = useMaterialsData()

    return (
        <div className="relative h-screen pt-20 overflow-hidden bg-gray-50 flex">

            {/* MAIN GRID */}
            <div className="flex-1 relative h-full overflow-hidden">
                <MaterialsGrid
                    materials={filteredMaterials}
                    mode={filters.mode}
                    sortBy={filters.sort}
                    isPanelCollapsed={false}
                    viewMode={viewMode}
                    selectedIds={Object.keys(planningSelection)}
                    onToggleSelect={togglePlanningSelection}
                />
            </div>

            {/* SIDEBAR PANEL */}
            <div className={cn(
                "relative z-40 h-full transition-all duration-300 ease-in-out border-l border-foreground/10 bg-background shadow-xl",
                isPanelCollapsed ? "w-12" : "w-[360px]"
            )}>
                {/* We now always render MaterialsDashboard.
                   If we are in PLANNING mode, we pass the Calculator as the 'planningContent' prop.
                */}
                <MaterialsDashboard
                    totalCount={filteredMaterials.length}
                    planningContent={
                        // This component renders inside the Dashboard's body when in Planning Mode
                        <PlanningCalculator
                            materials={filteredMaterials}
                        />
                    }
                />
            </div>
        </div>
    )
}