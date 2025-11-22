export interface DesignScenario {
    id: string
    name: string
    description: string
    cost: number
    embodiedCarbon: number
    performance: {
        uValue?: number
        thermalResistance?: number
    }
}

export interface RetrofitScope {
    id: string
    title: string
    description: string
    category: 'insulation' | 'windows' | 'walls' | 'roof' | 'heating' | 'other'
    status: 'planning' | 'in-progress' | 'completed'
    timeline: {
        startDate: string
        endDate: string
        duration: string
    }
    baseCost: number
    baseEmbodiedCarbon: number
    scenarios: DesignScenario[]
    selectedScenario?: string
    relatedElements?: string[] // IDs of BIM elements
}

export const retrofitScopes: RetrofitScope[] = [
    {
        id: 'wall-stucco',
        title: 'Wall Stucco Replacement',
        description: 'Remove existing damaged stucco and replace with lime-based breathable render',
        category: 'walls',
        status: 'in-progress',
        timeline: {
            startDate: '2025-11-15',
            endDate: '2025-12-20',
            duration: '5 weeks'
        },
        baseCost: 8500,
        baseEmbodiedCarbon: 125,
        scenarios: [
            {
                id: 'lime-render',
                name: 'Lime Render',
                description: 'Traditional breathable lime render with natural pigments',
                cost: 8500,
                embodiedCarbon: 125,
                performance: {}
            },
            {
                id: 'silicate-render',
                name: 'Silicate Render',
                description: 'Modern mineral-based silicate render',
                cost: 9200,
                embodiedCarbon: 168,
                performance: {}
            }
        ],
        selectedScenario: 'lime-render',
        relatedElements: ['wall-external-front', 'wall-external-side']
    },
    {
        id: 'external-wall-insulation',
        title: 'External Wall Insulation',
        description: 'Add insulation to solid brick walls to improve thermal performance',
        category: 'insulation',
        status: 'planning',
        timeline: {
            startDate: '2026-01-10',
            endDate: '2026-03-15',
            duration: '9 weeks'
        },
        baseCost: 15000,
        baseEmbodiedCarbon: 450,
        scenarios: [
            {
                id: 'wood-fiber',
                name: 'Wood Fiber Insulation',
                description: '100mm wood fiber insulation with lime render finish',
                cost: 15000,
                embodiedCarbon: 280,
                performance: {
                    uValue: 0.28,
                    thermalResistance: 3.5
                }
            },
            {
                id: 'mineral-wool',
                name: 'Mineral Wool Insulation',
                description: '100mm mineral wool with silicate render',
                cost: 13500,
                embodiedCarbon: 450,
                performance: {
                    uValue: 0.26,
                    thermalResistance: 3.8
                }
            },
            {
                id: 'hemp-insulation',
                name: 'Hemp Insulation',
                description: '120mm hemp fiber insulation with breathable render',
                cost: 16800,
                embodiedCarbon: 220,
                performance: {
                    uValue: 0.30,
                    thermalResistance: 3.3
                }
            }
        ],
        relatedElements: ['wall-external-all']
    },
    {
        id: 'window-replacement',
        title: 'Window Replacement',
        description: 'Replace single-glazed windows with high-performance double-glazing',
        category: 'windows',
        status: 'planning',
        timeline: {
            startDate: '2026-02-01',
            endDate: '2026-02-28',
            duration: '4 weeks'
        },
        baseCost: 12000,
        baseEmbodiedCarbon: 380,
        scenarios: [
            {
                id: 'timber-double',
                name: 'Timber Double Glazing',
                description: 'FSC-certified timber frames with double glazing',
                cost: 12000,
                embodiedCarbon: 285,
                performance: {
                    uValue: 1.4
                }
            },
            {
                id: 'timber-triple',
                name: 'Timber Triple Glazing',
                description: 'FSC-certified timber frames with triple glazing',
                cost: 15500,
                embodiedCarbon: 380,
                performance: {
                    uValue: 0.8
                }
            },
            {
                id: 'upvc-double',
                name: 'uPVC Double Glazing',
                description: 'uPVC frames with double glazing',
                cost: 9500,
                embodiedCarbon: 420,
                performance: {
                    uValue: 1.6
                }
            }
        ],
        relatedElements: ['windows-all']
    },
    {
        id: 'loft-insulation',
        title: 'Loft Insulation',
        description: 'Increase loft insulation to reduce heat loss through roof',
        category: 'insulation',
        status: 'completed',
        timeline: {
            startDate: '2025-10-01',
            endDate: '2025-10-15',
            duration: '2 weeks'
        },
        baseCost: 2500,
        baseEmbodiedCarbon: 95,
        scenarios: [
            {
                id: 'mineral-wool-300mm',
                name: 'Mineral Wool 300mm',
                description: 'Glass mineral wool insulation to 300mm depth',
                cost: 2500,
                embodiedCarbon: 95,
                performance: {
                    uValue: 0.13,
                    thermalResistance: 7.5
                }
            }
        ],
        selectedScenario: 'mineral-wool-300mm',
        relatedElements: ['roof-structure']
    }
]
