import { AssetLifecycle } from "@/types/lifecycle";

export const initialConstructionLifecycle: AssetLifecycle = {
    revitPhaseId: 'init-structure',
    displayName: 'Original Victorian Structure',
    category: 'structure',
    currentStage: '7_Use',

    viewpoint: {
        camera: { x: -15.5, y: 172.0, z: 25.0 },
        target: { x: 5.0, y: 160.0, z: 0.0 }
    },

    history: [
        {
            stage: '5_Construction',
            status: 'COMPLETED',
            dates: { start: '1889-03-01', end: '1889-11-30' },
            contractor: 'Local Guild Builders (Birmingham)',
            completionPercentage: 100,
            notes: 'Constructed during the rapid expansion of Ladywood. Materials sourced locally to minimize transport costs (horse & cart).',
        },
        {
            stage: '7_Use',
            status: 'ACTIVE',
            dates: { start: '1890-01-01' },
            linkedEventIds: ['event-1950-coal-conversion', 'event-survey-2025'], // Imaginary history events
            notes: '135+ years of service life achieved. Original lime mortar allows for building movement without cracking.'
        }
    ]
};
