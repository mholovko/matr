/**
 * Phase tree builder - O(n) single-pass construction
 * Extracts phase information from element properties and builds cumulative active sets
 */

import { SpeckleObject } from '@/lib/speckle/types'
import { PhaseDataTree, PhaseDataInPhase, ElementPhaseInfo } from '@/lib/data/phase-map'

export function buildPhaseDataTree(
  elements: SpeckleObject[],
  phasesOrder: string[]
): PhaseDataTree {
  // Initialize phase data structure
  const elementsByPhase: Record<string, PhaseDataInPhase> = {}
  const elementPhaseInfo: Record<string, ElementPhaseInfo> = {}
  const allElementIds = new Set<string>()

  // Initialize empty sets for each phase
  phasesOrder.forEach((phaseId) => {
    elementsByPhase[phaseId] = {
      phaseId,
      created: new Set(),
      demolished: new Set(),
      active: new Set(),
      existing: new Set()
    }
  })

  // Single pass through all elements
  elements.forEach((element) => {
    const elementId = element.id
    if (!elementId) return

    allElementIds.add(elementId)

    // Extract phase information from element properties
    const phaseCreated = extractPhase(element, 'Phase Created')
    const phaseDemolished = extractPhase(element, 'Phase Demolished')

    // Calculate active phases (phases where element exists)
    const activePhases = calculateActivePhases(phaseCreated, phaseDemolished, phasesOrder)

    // Store element phase info
    elementPhaseInfo[elementId] = {
      id: elementId,
      createdPhase: phaseCreated,
      demolishedPhase: phaseDemolished,
      activePhases
    }

    // Add element to created set
    if (phaseCreated && elementsByPhase[phaseCreated]) {
      elementsByPhase[phaseCreated].created.add(elementId)
    }

    // Add element to demolished set
    if (phaseDemolished && elementsByPhase[phaseDemolished]) {
      elementsByPhase[phaseDemolished].demolished.add(elementId)
    }
  })

  // Calculate cumulative active sets for each phase
  // Active set for phase N = all elements that exist up to phase N (inclusive)
  let cumulativeActive = new Set<string>()

  phasesOrder.forEach((phaseId) => {
    const phaseData = elementsByPhase[phaseId]

    // Add newly created elements in this phase
    phaseData.created.forEach((elementId) => {
      cumulativeActive.add(elementId)
    })

    // Remove demolished elements in this phase
    phaseData.demolished.forEach((elementId) => {
      cumulativeActive.delete(elementId)
    })

    // Set cumulative active for this phase
    phaseData.active = new Set(cumulativeActive)

    // Calculate existing (Context) = Active - Created
    phaseData.active.forEach(id => {
      if (!phaseData.created.has(id)) {
        phaseData.existing.add(id)
      }
    })
  })

  return {
    phasesByOrder: phasesOrder,
    elementsByPhase,
    elementPhaseInfo,
    allElementIds
  }
}

/**
 * Extract phase value from element properties
 * Looks in: properties?.Parameters?.["Instance Parameters"]?.Phasing?.["Phase Name"]?.value
 */
function extractPhase(element: SpeckleObject, phaseName: 'Phase Created' | 'Phase Demolished'): string | null {
  try {
    const phaseValue = element.properties?.Parameters?.['Instance Parameters']?.Phasing?.[phaseName]?.value
    return phaseValue ? String(phaseValue) : null
  } catch {
    return null
  }
}

/**
 * Calculate which phases an element is active in
 * Element is active from creation phase until (but not including) demolition phase
 */
function calculateActivePhases(
  createdPhase: string | null,
  demolishedPhase: string | null,
  phasesOrder: string[]
): string[] {
  if (!createdPhase) return []

  const createdIndex = phasesOrder.indexOf(createdPhase)
  if (createdIndex === -1) return []

  const demolishedIndex = demolishedPhase ? phasesOrder.indexOf(demolishedPhase) : phasesOrder.length

  return phasesOrder.slice(createdIndex, demolishedIndex)
}

/**
 * Get elements created in a specific phase
 * Use case: "New" filter - show only newly added elements
 */
export function getElementsCreatedInPhase(tree: PhaseDataTree, phaseId: string): Set<string> {
  return tree.elementsByPhase[phaseId]?.created ?? new Set()
}

/**
 * Get elements demolished in a specific phase
 * Use case: "Demolished" filter - show only removed elements
 */
export function getElementsDemolishedInPhase(tree: PhaseDataTree, phaseId: string): Set<string> {
  return tree.elementsByPhase[phaseId]?.demolished ?? new Set()
}

/**
 * Get all elements existing up to and including a specific phase
 * Use case: "Complete" filter - show construction state at this phase
 * This is the cumulative view showing all elements that exist at this point
 */
export function getElementsCompleteInPhase(tree: PhaseDataTree, phaseId: string): Set<string> {
  return tree.elementsByPhase[phaseId]?.active ?? new Set()
}
