/**
 * Phase Data Tree - Inspired by Speckle's MaterialProxies pattern
 * Pre-calculated aggregate data structure mapping phases to element sets
 * Enables O(1) element lookups for real-time 3D visibility without runtime filtering
 */

export interface ElementPhaseInfo {
  id: string
  createdPhase: string | null
  demolishedPhase: string | null
  activePhases: string[] // Phases where element exists (from creation to demolition)
}

export interface PhaseDataInPhase {
  phaseId: string
  created: Set<string> // Elements created in this phase
  demolished: Set<string> // Elements demolished in this phase
  active: Set<string> // Cumulative: all elements existing up to this phase (including all prior phases)
  existing: Set<string> // Active elements MINUS created elements (Context)
}

export interface PhaseDataTree {
  phasesByOrder: string[] // Ordered phase IDs from phasesOrder
  elementsByPhase: Record<string, PhaseDataInPhase> // Phase-keyed lookup
  elementPhaseInfo: Record<string, ElementPhaseInfo> // Element-keyed metadata
  allElementIds: Set<string> // All elements in model
}
