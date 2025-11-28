import { AssetLifecycle } from '@/types/lifecycle';

export const initialFinishesLifecycle: AssetLifecycle = {
    revitPhaseId: 'init-finishings',
    displayName: 'Original Internal Finishes',
    category: 'finishes',
    currentStage: '7_Use',

    viewpoint: {
        camera: { x: 8.5, y: 161.5, z: -10.0 },
        target: { x: 8.5, y: 162.0, z: -12.0 },
    },

    history: [
        {
            stage: '5_Construction',
            status: 'COMPLETED',
            dates: { start: '1889-06-01', end: '1889-09-30' },
            contractor: 'Local Plasterers',
            completionPercentage: 100,
            notes: '3-coat lime work. Hair reinforcement sourced from local tannery. Run-in-situ cornices.',
        },
        {
            stage: '7_Use',
            status: 'ACTIVE',
            dates: { start: '1890-01-01' },
            linkedEventIds: ['event-1985-gypsum-skim'],
            notes: 'Original fabric performed well for 100 years until sealed with vinyl paints in the late 20th century.',
        }
    ]
};