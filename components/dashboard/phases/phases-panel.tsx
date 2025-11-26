'use client'

import { useAppStore } from '@/lib/store'
import { ChevronsLeft, GitBranch } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { PhaseSelector } from './phase-selector'
import { PhaseFilterTabs } from './phase-filter-tabs'
import { PhaseElementList } from './phase-element-list'

export function PhasesPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { phases } = useAppStore()

  if (!phases.dataTree) return null

  return (
    <div
      className={cn(
        'absolute left-4 top-20 z-40 flex flex-col shadow-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]',
        'border border-border bg-background/95 backdrop-blur-md overflow-hidden',
        isCollapsed
          ? 'w-9 h-9  cursor-pointer hover:bg-muted hover:border-foreground/30 shadow-sm'
          : 'w-80 bottom-4 '
      )}
      onClick={() => {
        if (isCollapsed) setIsCollapsed(false)
      }}
      role={isCollapsed ? "button" : "region"}
      aria-label="Timeline Panel"
    >
      {/* Header Section */}
      <div className={cn(
        "flex items-center shrink-0 transition-all duration-300",
        isCollapsed
          ? "w-full h-full justify-center items-center bg-transparent border-0 p-0" // Force centering
          : "justify-between px-3 py-2 h-10 border-b border-border bg-muted/30"
      )}>

        {/* Icon & Title Group */}
        <div className={cn(
          "flex items-center overflow-hidden transition-all",
          isCollapsed ? "gap-0 justify-center w-full" : "gap-2" // REMOVE GAP when collapsed
        )}>
          <GitBranch className={cn(
            "shrink-0 text-muted-foreground transition-colors",
            "w-4 h-4",
            isCollapsed && "text-foreground"
          )} />

          <span className={cn(
            "text-xs font-bold uppercase tracking-widest text-foreground",
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            Timeline
          </span>
        </div>

        {/* Collapse Trigger - Only visible when expanded */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsCollapsed(true)
          }}
          className={cn(
            "h-6 w-6 flex items-center justify-center hover:bg-muted/80 rounded transition-colors text-muted-foreground",
            isCollapsed ? "hidden" : "flex"
          )}
          aria-label="Collapse panel"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col min-h-0 transition-opacity duration-200",
        isCollapsed ? "opacity-0 pointer-events-none absolute inset-0" : "opacity-100 delay-75"
      )}>
        <div className="flex-none bg-muted/5">
          <PhaseSelector />
          <PhaseFilterTabs />
        </div>

        <div className="flex-1 overflow-hidden flex flex-col relative bg-background/50">
          <PhaseElementList />
        </div>
      </div>
    </div>
  )
}