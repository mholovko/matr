'use client'

import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function PhaseFilterTabs() {
  const { phases, setPhaseFilterMode } = useAppStore()
  const { dataTree, selectedPhase, filterMode } = phases

  if (!dataTree || !selectedPhase) return null

  const phaseData = dataTree.elementsByPhase[selectedPhase]
  if (!phaseData) return null

  const tabs: Array<{
    mode: 'diff' | 'complete' | 'new' | 'demolished' | 'context'
    label: string
    count: number
    colorClass: string
  }> = [
      { mode: 'diff', label: 'Diff', count: phaseData.active.size + phaseData.demolished.size, colorClass: 'text-foreground' },
      { mode: 'complete', label: 'All', count: phaseData.active.size, colorClass: 'text-foreground' },
      { mode: 'context', label: 'Context', count: phaseData.created.size, colorClass: 'text-blue-500' },
      { mode: 'new', label: 'New', count: phaseData.created.size, colorClass: 'text-green-600' },
      { mode: 'demolished', label: 'Demo', count: phaseData.demolished.size, colorClass: 'text-red-600' }
    ]

  const availableTabs = tabs.filter(tab => tab.count > 0)
  if (availableTabs.length === 0) return null

  return (
    <div className="px-3 py-2 border-b border-border bg-background">
      <div className="flex p-0.5 bg-muted rounded-md w-full">
        {availableTabs.map((tab) => {
          const isActive = filterMode === tab.mode
          return (
            <button
              key={tab.mode}
              onClick={() => setPhaseFilterMode(tab.mode)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-1 px-2 text-[10px] font-medium rounded-sm transition-all',
                isActive
                  ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
            >
              <span>{tab.label}</span>
              <span className={cn(
                'font-mono text-[9px] px-1 rounded-sm bg-muted-foreground/10',
                tab.colorClass,
                isActive ? 'opacity-100' : 'opacity-70'
              )}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}