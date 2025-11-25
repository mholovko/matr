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
    mode: 'complete' | 'new' | 'demolished' | 'diff'
    label: string
    count: number
    icon?: string
  }> = [
    {
      mode: 'diff',
      label: 'Diff',
      count: phaseData.active.size + phaseData.demolished.size
    },
    {
      mode: 'complete',
      label: 'Complete',
      count: phaseData.active.size
    },
    {
      mode: 'new',
      label: 'New',
      count: phaseData.created.size,
      icon: '+'
    },
    {
      mode: 'demolished',
      label: 'Demolished',
      count: phaseData.demolished.size,
      icon: '−'
    }
  ]

  // Filter out modes with 0 elements
  const availableTabs = tabs.filter(tab => tab.count > 0)

  if (availableTabs.length === 0) return null

  return (
    <div className="p-4 space-y-3 border-b border-border">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Filter Mode
      </label>
      <div className="flex flex-wrap gap-2">
        {availableTabs.map((tab) => (
          <button
            key={tab.mode}
            onClick={() => setPhaseFilterMode(tab.mode)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 whitespace-nowrap',
              filterMode === tab.mode
                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                : 'bg-muted/50 text-foreground border-border hover:bg-muted hover:border-foreground/20'
            )}
          >
            {tab.icon && <span className="font-mono text-[10px]">{tab.icon}</span>}
            <span>{tab.label}</span>
            <span className={cn(
              'ml-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold',
              filterMode === tab.mode
                ? 'bg-primary-foreground/20'
                : 'bg-muted text-muted-foreground'
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
