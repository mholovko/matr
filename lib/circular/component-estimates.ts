export interface ComponentEstimate {
    materialClass: string
    standardUnit: string
    volumePerUnit: number // m³ per unit
    description: string
}

export const COMPONENT_ESTIMATES: ComponentEstimate[] = [
    {
        materialClass: "Masonry",
        standardUnit: "brick",
        volumePerUnit: 0.003, // Standard brick ~215x102.5x65mm
        description: "Standard clay brick"
    }
]

export function estimateComponentCount(
    materialVolume: number,
    materialClass: string
): number {
    const estimate = COMPONENT_ESTIMATES.find(e => e.materialClass === materialClass)
    if (!estimate) return 0
    return Math.round(materialVolume / estimate.volumePerUnit)
}
