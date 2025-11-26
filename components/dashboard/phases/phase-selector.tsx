'use client'

import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function PhaseSelector() {
  const { phases, setSelectedPhase, setPhaseFilterMode } = useAppStore()
  const { dataTree, selectedPhase } = phases

  if (!dataTree) return null

  // Reverse phases to show latest on top
  const reversedPhases = [...dataTree.phasesByOrder].reverse()
  const latestPhaseId = reversedPhases[0] // Identify the latest phase

  const handlePhaseChange = (phaseId: string) => {
    const newPhaseData = dataTree.elementsByPhase[phaseId]
    if (!newPhaseData) return

    setSelectedPhase(phaseId)

    // New Logic: 
    // If Latest Phase -> 'complete' (All)
    // Else -> 'diff'
    if (phaseId === latestPhaseId) {
      setPhaseFilterMode('complete')
    } else {
      setPhaseFilterMode('diff')
    }
  }

  return (
    <div className="py-2 border-b border-border bg-background/50 backdrop-blur-sm">
      <div className="relative">
        {/* VERTICAL LINE */}
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border/80 z-0" />

        <div className="flex flex-col">
          {reversedPhases.map((phaseId, index) => {
            const phaseData = dataTree.elementsByPhase[phaseId]
            const added = phaseData?.created.size || 0
            const removed = phaseData?.demolished.size || 0
            const isSelected = selectedPhase === phaseId

            // Calculate original index (assuming 1-based or 0-based from the original order)
            const originalIndex = dataTree.phasesByOrder.length - index

            return (
              <button
                key={phaseId}
                onClick={() => handlePhaseChange(phaseId)}
                className={cn(
                  'group relative flex items-stretch text-left transition-colors outline-none',
                  isSelected ? 'bg-primary/5' : 'hover:bg-muted/40'
                )}
              >
                {/* 1. TIMELINE TRACK */}
                <div className="w-[30px] shrink-0 flex items-center justify-center relative z-10">
                  {/* The Node */}
                  <div className={cn(
                    "w-3.5 h-3.5 rounded-full border-1 transition-all duration-200 box-border",
                    isSelected
                      ? "bg-background border-foreground shadow-sm scale-110"
                      : "bg-background border-border group-hover:border-foreground/40"
                  )}>
                    {/* Inner Dot for Selected State */}
                    {isSelected && (
                      <div className="w-1 h-1 bg-foreground rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>

                {/* 2. CONTENT AREA */}
                <div className="flex-1 min-w-0 py-2.5 pr-3 border-b border-border/40 group-last:border-0">
                  <div className="flex items-center justify-between gap-3 mb-0.5">
                    <span className={cn(
                      "text-xs font-semibold truncate transition-colors",
                      isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80"
                    )}>
                      {phaseId}
                    </span>

                    {/* Diff Stats */}
                    <div className="flex items-center text-[10px] font-mono shrink-0 tabular-nums leading-none">
                      {(added > 0 || removed > 0) ? (
                        <>
                          {added > 0 && <span className="text-green-600 font-medium">+{added}</span>}
                          {removed > 0 && <span className={cn("ml-1.5 font-medium", isSelected ? "text-red-600" : "text-red-500")}>-{removed}</span>}
                        </>
                      ) : null}
                    </div>
                  </div>

                  {/* Meta info row */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground/60 font-mono">
                      Phase {originalIndex}
                    </span>
                    {index === 0 && (
                      <span className="text-[9px] px-1 py-px rounded bg-muted text-muted-foreground font-medium uppercase tracking-wide">
                        latest
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}