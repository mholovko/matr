export interface ReusabilityData {
    materialClass: string
    durability: "High" | "Medium" | "Low"
    extractionDifficulty: "Easy" | "Moderate" | "Hard"
    reusePercentage: number // 0-100
    notes: string
}

export const REUSABILITY_DB: ReusabilityData[] = [
    {
        materialClass: "Masonry",
        durability: "High",
        extractionDifficulty: "Moderate",
        reusePercentage: 80,
        notes: "Requires mortar removal, 10-20% breakage typical"
    }
]

export function getReusabilityData(materialClass: string): ReusabilityData | null {
    return REUSABILITY_DB.find(r => r.materialClass === materialClass) || null
}
