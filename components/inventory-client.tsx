"use client"

import { LogPanel } from "@/components/dashboard/log/log-panel"
import { MobileDrawer } from "@/components/dashboard/mobile-drawer"
import { LogContent } from "@/components/dashboard/log/log-content"
import { FilterControls } from "@/components/dashboard/filter-controls"
import { useAppStore } from "@/lib/store"

export function InventoryClient() {
    const selectedElementId = useAppStore(state => state.selectedElementId)

    return (
        <>
            <LogPanel />
            <MobileDrawer>
                {selectedElementId ? (
                    <LogContent />
                ) : (
                    <div className="p-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">
                            Model Filters
                        </h3>
                        <FilterControls />
                    </div>
                )}
            </MobileDrawer>
        </>
    )
}
