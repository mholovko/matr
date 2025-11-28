import { AssetLifecycle } from "@/types/lifecycle"
import { initialConstructionLifecycle } from "./00-init-structure"
import { initialFlooringLifecycle } from "./01-init-flooring"
import { initialFinishesLifecycle } from "./02-init-finishes"
import { retrofitStuccoLifecycle } from "./03-retrofit-wall-stucco"
import { retrofitEwiLifecycle } from "./04-retrofit-wall-insulation"


// 1. The Ordered List (Source of Truth for Time/Order)
export const allPhases: AssetLifecycle[] = [
    initialConstructionLifecycle,
    initialFlooringLifecycle,
    initialFinishesLifecycle,
    retrofitStuccoLifecycle,
    retrofitEwiLifecycle

]

// 2. The Lookup Map (Generated automatically for O(1) access)
// This creates: { 'init-structure-1889': { ...obj }, 'retrofit-insulation': { ...obj } }
export const lifecycleMap = allPhases.reduce((acc, phase) => {
    acc[phase.revitPhaseId] = phase
    return acc
}, {} as Record<string, AssetLifecycle>)


export const phasesOrder = allPhases.map(phase => phase.revitPhaseId)
