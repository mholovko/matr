'use client'

import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function PhaseSelector() {
  const { phases, setSelectedPhase, setPhaseFilterMode } = useAppStore()
  const { dataTree, selectedPhase, filterMode } = phases

  if (!dataTree) return null

  const handlePhaseChange = (phaseId: string) => {
    const newPhaseData = dataTree.elementsByPhase[phaseId]
    if (!newPhaseData) return

    setSelectedPhase(phaseId)

    // Check if current filter mode is still valid for the new phase
    const hasNew = newPhaseData.created.size > 0
    const hasDemolished = newPhaseData.demolished.size > 0
    const hasActive = newPhaseData.active.size > 0

    // Smart filter mode switching
    if (filterMode === 'new' && !hasNew) {
      // No new elements, switch to diff
      setPhaseFilterMode('diff')
    } else if (filterMode === 'demolished' && !hasDemolished) {
      // No demolished elements, switch to diff
      setPhaseFilterMode('diff')
    } else if (filterMode === 'complete' && !hasActive) {
      // No active elements (shouldn't happen, but handle it)
      setPhaseFilterMode('diff')
    }
    // Otherwise, preserve the current filter mode
  }

  return (
    <div className="p-4 space-y-2 border-b border-border">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Select Phase
      </label>
      <div className="flex flex-col gap-2">
        {dataTree.phasesByOrder.map((phaseId, index) => {
          const phaseData = dataTree.elementsByPhase[phaseId]
          const added = phaseData?.created.size || 0
          const removed = phaseData?.demolished.size || 0

          return (
            <button
              key={phaseId}
              onClick={() => handlePhaseChange(phaseId)}
              className={cn(
                'px-3 py-2 rounded text-left text-xs transition-colors border',
                selectedPhase === phaseId
                  ? 'bg-transparent text-primary border-primary border-2 font-medium'
                  : 'bg-muted/5 text-foreground border-border hover:bg-muted'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Phase {index + 1}</span>
                {/* Git-like diff indicator */}
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  {added > 0 && (
                    <span className={selectedPhase === phaseId ? 'text-green-600' : 'text-green-600'}>
                      +{added}
                    </span>
                  )}
                  {removed > 0 && (
                    <span className={selectedPhase === phaseId ? 'text-red-600' : 'text-red-600'}>
                      −{removed}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs font-mono">{phaseId}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
