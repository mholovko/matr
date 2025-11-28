'use client'

import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { CalendarClock } from 'lucide-react'

export function PhaseSelector() {
  const { phases, setSelectedPhase, setPhaseFilterMode } = useAppStore()
  const { dataTree, selectedPhase, lifecycleMap } = phases
  console.log(lifecycleMap)

  if (!dataTree) return null

  // Reverse phases to show latest on top
  const reversedPhases = [...dataTree.phasesByOrder].reverse()
  const latestPhaseId = reversedPhases[0]

  const handlePhaseChange = (phaseId: string) => {
    // ... existing logic ...
    setSelectedPhase(phaseId)
    if (phaseId === latestPhaseId) {
      setPhaseFilterMode('complete')
    } else {
      setPhaseFilterMode('diff')
    }
  }

  // Helper to format dates (e.g., "1889-11-30" -> "Nov 1889")
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="py-2 border-b border-border bg-background/50 backdrop-blur-sm">
      <div className="relative">
        {/* VERTICAL LINE */}
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border/80 z-0" />

        <div className="flex flex-col">
          {reversedPhases.map((phaseId, index) => {
            const phaseData = dataTree.elementsByPhase[phaseId]

            // --- 1. DATA LOOKUP ---
            // Look up the Rich Data using the Map
            const info = lifecycleMap?.[phaseId]

            // Fallback to ID if no name found
            const displayName = info?.displayName || phaseId

            // Attempt to find a relevant end date (Construction or general end)
            const constructionStage = info?.history.find(h => h.stage === '5_Construction')
            // Priority: Construction End > General End > Start Date
            const dateString = constructionStage?.dates.end || info?.history[0]?.dates.end || info?.history[0]?.dates.start
            const displayDate = formatDate(dateString)

            const added = phaseData?.created.size || 0
            const removed = phaseData?.demolished.size || 0
            const isSelected = selectedPhase === phaseId

            return (
              <button
                key={phaseId}
                onClick={() => handlePhaseChange(phaseId)}
                className={cn(
                  'group relative flex items-stretch text-left transition-colors outline-none',
                  isSelected ? 'bg-primary/5' : 'hover:bg-muted/40'
                )}
              >
                {/* 2. TIMELINE TRACK (Unchanged) */}
                <div className="w-[30px] shrink-0 flex items-center justify-center relative z-10">
                  <div className={cn(
                    "w-3.5 h-3.5 rounded-full border-1 transition-all duration-200 box-border",
                    isSelected
                      ? "bg-background border-foreground shadow-sm scale-110"
                      : "bg-background border-border group-hover:border-foreground/40"
                  )}>
                    {isSelected && (
                      <div className="w-1 h-1 bg-foreground rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>

                {/* 3. CONTENT AREA */}
                <div className="flex-1 min-w-0 py-2.5 pr-3 border-b border-border/40 group-last:border-0">

                  {/* Top Row: Name & Diff Stats */}
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className={cn(
                      "text-xs font-bold truncate transition-colors",
                      isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80"
                    )}>
                      {displayName}
                    </span>

                    {/* Diff Stats (Unchanged) */}
                    <div className="flex items-center text-[10px] font-mono shrink-0 tabular-nums leading-none">
                      {(added > 0 || removed > 0) ? (
                        <>
                          {added > 0 && <span className="text-green-600 font-medium">+{added}</span>}
                          {removed > 0 && <span className={cn("ml-1.5 font-medium", isSelected ? "text-red-600" : "text-red-500")}>-{removed}</span>}
                        </>
                      ) : null}
                    </div>
                  </div>

                  {/* Bottom Row: Date & Metadata */}
                  <div className="flex items-center gap-2">
                    {displayDate && (
                      <div className={cn(
                        "flex items-center gap-1 text-[10px] font-mono",
                        isSelected ? "text-foreground/70" : "text-muted-foreground/60"
                      )}>
                        <CalendarClock className="w-3 h-3 opacity-70" />
                        <span>{displayDate}</span>
                      </div>
                    )}

                    {/* Category Tag (e.g. Structure vs Retrofit) */}
                    {info?.category && (
                      <span className="text-[9px] px-1.5 py-px rounded-sm bg-muted/50 border border-border/50 text-muted-foreground font-medium uppercase tracking-wide">
                        {info.category}
                      </span>
                    )}

                    {/* Latest Badge */}
                    {index === 0 && (
                      <span className="ml-auto text-[9px] px-1 py-px rounded bg-primary/10 text-primary font-medium uppercase tracking-wide">
                        Current
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