"use client"

import { LogPanel } from "@/components/dashboard/log-panel"
import { MobileDrawer } from "@/components/dashboard/mobile-drawer"
import { LogContent } from "@/components/dashboard/log-content"
import { FilterControls } from "@/components/dashboard/filter-controls"
import { useAppStore } from "@/lib/store"
import { useState } from "react"

export default function InventoryPage() {
  const { selectedElementId, selectedElementData, setSelectedElement } = useAppStore()
  const [activeTab, setActiveTab] = useState<"materials" | "carbon" | "docs">("materials")

  return (
    <>
      <LogPanel />
      <MobileDrawer>
        {selectedElementId ? (
          <LogContent
            selectedElementId={selectedElementId}
            selectedElementData={selectedElementData}
            setSelectedElement={setSelectedElement}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
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
