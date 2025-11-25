'use client'

import { useAppStore } from '@/lib/store'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
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
        'fixed left-0 top-0 h-screen flex-col shadow-2xl z-40 transition-all duration-300',
        'border-r border-border bg-background/95 backdrop-blur-sm',
        'hidden md:flex',
        isCollapsed ? 'w-12' : 'w-[400px]'
      )}
    >
      {/* Header with collapse button */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/10">
        {!isCollapsed && (
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
            Phases
          </h3>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'h-6 w-6 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors',
            isCollapsed && 'mx-auto'
          )}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? (
            <ChevronsRight className="w-4 h-4" />
          ) : (
            <ChevronsLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Phase Selector */}
          <PhaseSelector />

          {/* Filter Tabs */}
          <PhaseFilterTabs />

          {/* Element List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <PhaseElementList />
          </div>
        </>
      )}
    </div>
  )
}
