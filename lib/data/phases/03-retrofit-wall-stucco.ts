import { AssetLifecycle } from '@/types/lifecycle';

// ==============================================================================
// ASSET: INTERNAL WALL STUCCO (Living Room Only)
// Context: 33 Link Road - Ground Floor Front Room
// Challenge: The "Cold Wall". Needs breathability AND thermal improvement.
// ==============================================================================

const WALL_AREA_M2 = 35; // Net wall area for calculation
const LABOR_RATE = 2000; // Estimated plastering labor

export const retrofitStuccoLifecycle: AssetLifecycle = {
    revitPhaseId: 'retrofit-wall-stucco',
    displayName: 'Living Room: Internal Plastering',
    category: 'finishes',
    currentStage: '6_Handover',

    viewpoint: {
        camera: { x: 8.29, y: 162.72, z: -11.31 },
        target: { x: 8.0, y: 162.72, z: -15.0 },
    },

    heritageContext: {
        yearBuilt: 1889,
        originalMaterial: 'Horsehair Lime Plaster (Failed)',
        significance: 'Low',
        conditionPrior: 'Critical' // Damaged by previous gypsum skim
    },

    history: [
        {
            stage: '0_Strategic',
            status: 'COMPLETED',
            dates: { start: '2025-09-01', end: '2025-09-05' },
            baselineData: {
                issueDetected: 'Damp trapped by non-breathable gypsum causing brick spalling.',
                evidenceRef: 'survey-damp-001'
            }
        },
        {
            stage: '2_Concept',
            status: 'COMPLETED',
            dates: { start: '2025-09-10', end: '2025-09-15' },
            decision: {
                selectedOptionId: 'lime-hemp-tymawr',
                decidedBy: 'Material Cultures / Client',
                rationale: 'Ty-Mawr Lime Hemp selected because it is an "Insulating Plaster" (Lambda 0.14), offering thermal gain unlike standard Clay or Lime.',
                date: '2025-09-18'
            },
            designOptions: [
                // ---------------------------------------------------------
                // OPTION A: THE INSULATING CHOICE (Selected)
                // Product: Ty-Mawr Lime Hemp Plaster
                // ---------------------------------------------------------
                {
                    id: 'lime-hemp-tymawr',
                    name: 'Ty-Mawr Lime Hemp',
                    description: 'High-calcium lime mixed with hemp fibres. Acts as an insulating layer.',
                    materiality: 'bio-based',

                    economics: {
                        capex: (8.36 * WALL_AREA_M2) + LABOR_RATE, // £2292 approx
                        annualEnergySaving: 120, // Better insulation = higher saving
                        maintenanceCost: 0,
                        paybackPeriod: 19.1,
                    },

                    carbon: {
                        embodied: 0.15 * WALL_AREA_M2, // Very low (5.25 kg total)
                        sequestered: 15,         // Hemp storage
                        transport: 5,            // Sourced from Wales (93 miles)
                        annualCarbonSaving: 80,  // Good thermal performance
                        carbonPaybackYears: 0,   // Net Zero immediately
                        netZeroDate: '2025-10-01'
                    },

                    circularity: {
                        expectedLifespan: 60,
                        maintenanceFreq: 0,
                        endOfLifeStrategy: 'Compost',
                        disassemblyFactor: 0.8, // Can be scraped off
                        recoveryMethod: 'Biodegradable. Can be crushed and spread on garden.'
                    },

                    performance: {
                        uValue: 1.2, // Improves wall U-value
                        breathability: 'vapor-open',
                        // Highlighting the Physics from the passport
                        // @ts-ignore (Adding custom field for UI display)
                        thermalConductivity: 0.14 // Excellent for a plaster
                    },
                    pros: ['Insulating properties', 'Flexible', 'Grown in UK'],
                    cons: ['Thicker application required', 'Rougher texture']
                },

                // ---------------------------------------------------------
                // OPTION B: THE AESTHETIC CHOICE (Clay)
                // Product: Clayworks Clay Plaster
                // ---------------------------------------------------------
                {
                    id: 'clay-plaster-clayworks',
                    name: 'Clayworks Clay Plaster',
                    description: 'Unfired clay from Cornwall. Absorbs toxins and regulates humidity.',
                    materiality: 'mineral',

                    economics: {
                        capex: (25.00 * WALL_AREA_M2) + LABOR_RATE, // £2875 - Most Expensive
                        annualEnergySaving: 60,  // Standard thermal performance
                        maintenanceCost: 0,
                        paybackPeriod: 47.9,
                    },

                    carbon: {
                        embodied: 0.136 * WALL_AREA_M2, // Lowest embodied (4.7 kg total)
                        sequestered: 0,
                        transport: 12,           // Cornwall -> Bham (240 miles)
                        annualCarbonSaving: 40,
                        carbonPaybackYears: 0.2,
                        netZeroDate: '2026-01-01'
                    },

                    circularity: {
                        expectedLifespan: 100,
                        maintenanceFreq: 0,
                        endOfLifeStrategy: 'Reuse_Direct', // Unique feature
                        disassemblyFactor: 0.9,
                        recoveryMethod: 'Simply wet the wall and scrape it off. Clay never sets chemically.'
                    },

                    performance: {
                        uValue: 2.1,
                        breathability: 'vapor-open',
                        // @ts-ignore
                        thermalConductivity: 0.85 // Standard conductivity
                    },
                    pros: ['Beautiful finish', 'Re-usable indefinitely', 'Absorbs odours'],
                    cons: ['Expensive material', 'Not an insulator', 'Water sensitive']
                },

                // ---------------------------------------------------------
                // OPTION C: THE BASELINE (Gypsum)
                // Product: Generic Thistle Multi-Finish
                // ---------------------------------------------------------
                {
                    id: 'gypsum-standard',
                    name: 'Standard Gypsum Skim',
                    description: 'Modern pink plaster. Fast setting, hard finish.',
                    materiality: 'mineral',

                    economics: {
                        capex: (3.50 * WALL_AREA_M2) + 1200, // £1322 - Cheapest
                        annualEnergySaving: 30,
                        maintenanceCost: 0,
                        paybackPeriod: 44.0,
                    },

                    carbon: {
                        embodied: 0.8 * WALL_AREA_M2, // Higher carbon (28kg)
                        sequestered: 0,
                        transport: 5,
                        annualCarbonSaving: -20, // Negative: Promotes damp/cooling
                        carbonPaybackYears: 999,
                        netZeroDate: 'N/A'
                    },

                    circularity: {
                        expectedLifespan: 15,    // Fails on damp walls
                        maintenanceFreq: 5,
                        endOfLifeStrategy: 'Landfill',
                        disassemblyFactor: 0.1,
                        recoveryMethod: 'Contaminated waste. Sulphates ruin recycled concrete.'
                    },

                    performance: {
                        uValue: 2.1,
                        breathability: 'vapor-closed',
                        // @ts-ignore
                        thermalConductivity: 0.5
                    },
                    pros: ['Cheap', 'Smooth'],
                    cons: ['Traps moisture', 'Rot risk', 'Brittle']
                }
            ]
        },
        {
            stage: '5_Construction',
            contractor: 'Material Cultures',
            status: 'COMPLETED',
            dates: { start: '2025-10-15', end: '2025-11-19' },
            completionPercentage: 100,
            linkedEventIds: ['event-stucco-strip'],
            notes: 'Ty-Mawr hemp plaster applied in 2 coats (Base + Top). Drying time 4 weeks.'
        },
        {
            stage: '6_Handover',
            status: 'ACTIVE',
            dates: { start: '2025-11-21' },
            linkedEventIds: ['event-stucco-strip'],
            notes: 'Ty-Mawr hemp plaster applied in 2 coats (Base + Top). Drying time 4 weeks.'
        }
    ]
};