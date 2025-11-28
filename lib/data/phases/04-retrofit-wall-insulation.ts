import { AssetLifecycle } from '@/types/lifecycle';

// ==============================================================================
// ASSET: EXTERNAL WALL INSULATION (EWI) - COMPLETED PHASE
// Context: 33 Link Road (Whole House Wrap)
// Status: Work finished. System active.
// Selected System: Pavatex Wood Fibre (Winner of Concept Phase)
// ==============================================================================

const EWI_AREA = 80;     // m2
const EWI_THICKNESS = 0.1; // 100mm
const EWI_VOLUME = 8;    // m3
const BASE_LABOR = 8000; // Fixed costs (Scaffold + Installation)

export const retrofitEwiLifecycle: AssetLifecycle = {
    revitPhaseId: 'retrofit-wall-insulation',
    displayName: 'External Wall Insulation System',
    category: 'insulation',
    currentStage: '6_Handover', // Current Status: Handed over to residents

    viewpoint: {
        camera: { x: 20.65, y: 164.38, z: -9.47 },
        target: { x: 11.68, y: 158.1, z: -2.73 },
    },

    history: [
        {
            stage: '0_Strategic',
            status: 'COMPLETED',
            dates: { start: '2025-10-01', end: '2025-10-20' },
            driver: 'thermal-performance',
            baselineData: {
                issueDetected: 'Thermal imaging confirms 40% of total heat loss is through solid walls.',
                evidenceRef: 'survey-ir-001'
            }
        },
        {
            stage: '2_Concept',
            status: 'COMPLETED',
            dates: { start: '2025-10-21', end: '2025-11-01' },
            decision: {
                selectedOptionId: 'ewi-wood-fibre-pavatex',
                decidedBy: 'Consensus (Residents + Architect)',
                rationale: 'Wood fibre selected for best balance of U-value (0.28) and wall thickness. Hempcrete blocks would have encroached too far onto the pavement.',
                date: '2025-10-30'
            },
            designOptions: [
                // ---------------------------------------------------------
                // OPTION A: RIGID WOOD FIBRE (WINNER)
                // ---------------------------------------------------------
                {
                    id: 'ewi-wood-fibre-pavatex',
                    name: 'Pavatex Wood Fibre',
                    description: 'Rigid boards made from waste softwood thinnings. Dense, screw-fixed system ready for lime render.',
                    materiality: 'bio-based',

                    economics: {
                        capex: (807 * EWI_VOLUME) + BASE_LABOR, // ~£14,456
                        annualEnergySaving: 680,
                        maintenanceCost: 50,
                        paybackPeriod: 21.2,
                        subsidyAvailable: true
                    },

                    carbon: {
                        embodied: 19.7 * EWI_VOLUME, // ~157 kgCO2e processing
                        sequestered: 19.67 * EWI_VOLUME, // ~157 kgCO2e stored (Neutral)
                        transport: 150, // From Germany
                        annualCarbonSaving: 850,
                        carbonPaybackYears: 0.2, // Almost immediate payback
                        netZeroDate: '2026-02-01'
                    },

                    circularity: {
                        expectedLifespan: 60,
                        maintenanceFreq: 20, // Render cleaning
                        endOfLifeStrategy: 'Incineration', // Clean biomass fuel
                        disassemblyFactor: 0.8,     // Mechanically fixed (screws)
                        recoveryMethod: 'Boards can be unscrewed. Clean wood waste suitable for biomass fuel.'
                    },

                    performance: { uValue: 0.28, breathability: 'vapor-open' },
                    pros: ['High density (blocks summer heat)', 'Proven system'],
                    cons: ['Expensive per m3', 'Imported (Germany)']
                },

                // ---------------------------------------------------------
                // OPTION B: HEMPCRETE BLOCKS (RUNNER UP)
                // ---------------------------------------------------------
                {
                    id: 'ewi-hemp-blocks-isohemp',
                    name: 'Isohemp Hempcrete Blocks',
                    description: 'Solid blocks of hemp and lime built against the existing wall.',
                    materiality: 'bio-based',

                    economics: {
                        capex: 13240,
                        annualEnergySaving: 550,
                        maintenanceCost: 20,
                        paybackPeriod: 24.0,
                    },

                    carbon: {
                        embodied: 56,
                        sequestered: 58,
                        transport: 80,
                        annualCarbonSaving: 700,
                        carbonPaybackYears: 0,
                        netZeroDate: '2025-11-01'
                    },

                    circularity: {
                        expectedLifespan: 100,
                        maintenanceFreq: 50,
                        endOfLifeStrategy: 'Compost',
                        disassemblyFactor: 0.9,
                        recoveryMethod: 'Blocks can be crushed for soil improver.'
                    },

                    performance: { uValue: 0.45, breathability: 'vapor-open' },
                    pros: ['Extremely durable', 'Fire resistant'],
                    cons: ['Thicker wall needed for same U-value']
                }
            ]
        },
        {
            stage: '4_Technical',
            status: 'COMPLETED',
            dates: { start: '2025-11-02', end: '2025-11-15' },
            notes: 'Technical Design: Compacfoam thermal break brackets specified for all downpipes and satellite dishes to prevent cold bridges.'
        },
        {
            stage: '5_Construction',
            status: 'COMPLETED',
            dates: { start: '2025-10-20', end: '2025-11-20' },
            completionPercentage: 100,
            contractor: 'Retrofit Cooperatives Birmingham',
            notes: 'Installation complete. Delays in Dec due to frost preventing lime render application. Base coat applied Dec 5th, Top coat Jan 10th.',
            linkedEventIds: ['event-ewi-install-01', 'event-ewi-render-finish']
        },
        {
            stage: '6_Handover',
            status: 'ACTIVE',
            dates: { start: '2026-01-21' },
            notes: 'SYSTEM LIVE. Maintenance Warning: Do not use standard masonry plugs. Use expanding stress-plates for heavy loads. Lime wash required in 15 years.'
        }
    ]
};