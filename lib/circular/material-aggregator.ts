import { SpeckleObject } from '@/lib/speckle/types'
import { estimateComponentCount } from './component-estimates'
import { getReusabilityData, ReusabilityData } from './reusability-data'

export interface MaterialAggregate {
    name: string
    class: string
    volume: number
    componentCount: number
    reusability: ReusabilityData | null
}

export function aggregateMaterials(
    elements: SpeckleObject[]
): Map<string, { volume: number; class: string }> {
    const materialMap = new Map<string, { volume: number; class: string }>()

    elements.forEach(el => {
        const materialQuantities = el.properties?.["Material Quantities"] || {}
        Object.entries(materialQuantities).forEach(([name, data]: [string, any]) => {
            const vol = data.volume?.value || 0
            const matClass = data.materialClass || 'Generic'

            const existing = materialMap.get(name)
            if (existing) {
                existing.volume += vol
            } else {
                materialMap.set(name, { volume: vol, class: matClass })
            }
        })
    })

    return materialMap
}

export function calculateComponentInventory(
    materialMap: Map<string, { volume: number; class: string }>
): MaterialAggregate[] {
    return Array.from(materialMap.entries())
        .map(([name, data]) => ({
            name,
            class: data.class,
            volume: data.volume,
            componentCount: estimateComponentCount(data.volume, data.class),
            reusability: getReusabilityData(data.class)
        }))
        // Show ALL materials, not just those with component counts
        .sort((a, b) => b.volume - a.volume)
}
