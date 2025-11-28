import { AssetLifecycle } from '@/types/lifecycle';

export const initialFlooringLifecycle: AssetLifecycle = {
    revitPhaseId: 'init-flooring',
    displayName: 'Original Suspended Timber Floor',
    category: 'structure',
    currentStage: '7_Use',

    viewpoint: {
        camera: { x: 8.5, y: 158.5, z: -8.0 },
        target: { x: 10.0, y: 158.0, z: -10.0 },
    },

    history: [
        {
            stage: '5_Construction',
            status: 'COMPLETED',
            dates: { start: '1889-02-01', end: '1889-05-30' },
            contractor: 'Original Builders',
            completionPercentage: 100,
            notes: 'Joists laid on brick sleeper walls. Air bricks installed for ventilation (crucial for preventing rot).',
        },
        {
            stage: '7_Use',
            status: 'ACTIVE',
            dates: { start: '1890-01-01' },
            linkedEventIds: ['event-survey-rot-check'],
            notes: '135 years of wear. Gaps have opened between boards (shrinkage), creating significant drafts. U-Value approx 1.2 W/m²K.',
        }
    ]
};
