export interface FeedEvent {
    id: string
    date: string
    type: 'construction' | 'meeting' | 'decision' | 'delivery' | 'survey' | 'milestone'
    title: string
    description: string
    participants?: string[]
    relatedScope?: string
    relatedElements?: string[]
    attachments?: {
        type: 'image' | 'document'
        url: string
        name: string
    }[]
}

export const feedEvents: FeedEvent[] = [
    {
        id: 'event-001',
        date: '2025-11-22',
        type: 'construction',
        title: 'Wall Stucco Removal Progress',
        description: 'Continued removal of damaged stucco from front facade. Exposed solid brick wall shows minimal damage. No insulation found as expected.',
        relatedScope: 'wall-stucco',
        relatedElements: ['wall-external-front']
    },
    {
        id: 'event-002',
        date: '2025-11-20',
        type: 'meeting',
        title: 'Community Meeting: Insulation Options',
        description: 'Presented three insulation scenarios to residents. Discussion focused on embodied carbon vs. cost trade-offs. Hemp insulation generated strong interest despite higher cost.',
        participants: ['Civic Square Team', 'Residents', 'Material Cultures', 'Retrofit Coordinator'],
        relatedScope: 'external-wall-insulation'
    },
    {
        id: 'event-003',
        date: '2025-11-18',
        type: 'decision',
        title: 'Lime Render Selected for Stucco',
        description: 'Decision made to use traditional lime render for wall finish. Prioritizes breathability and lower embodied carbon over modern alternatives.',
        relatedScope: 'wall-stucco'
    },
    {
        id: 'event-004',
        date: '2025-11-15',
        type: 'construction',
        title: 'Stucco Removal Commenced',
        description: 'Started removal of existing stucco from front and side walls. Initial survey confirmed solid brick construction throughout.',
        relatedScope: 'wall-stucco',
        relatedElements: ['wall-external-front', 'wall-external-side']
    },
    {
        id: 'event-005',
        date: '2025-11-10',
        type: 'delivery',
        title: 'Lime Render Materials Delivered',
        description: 'Delivery of natural hydraulic lime (NHL 3.5), sand, and natural pigments for render mix. Materials stored on-site in dry conditions.',
        relatedScope: 'wall-stucco'
    },
    {
        id: 'event-006',
        date: '2025-11-08',
        type: 'survey',
        title: 'Thermal Imaging Survey Completed',
        description: 'Infrared thermal survey identified significant heat loss through walls and windows. Confirms priority for external wall insulation and window replacement.',
        relatedElements: ['wall-external-all', 'windows-all']
    },
    {
        id: 'event-007',
        date: '2025-10-28',
        type: 'meeting',
        title: 'Workshop: Embodied Carbon in Retrofits',
        description: 'Educational workshop with residents exploring embodied carbon concepts. Discussed ICE database and whole-life carbon assessment methods.',
        participants: ['Civic Square Team', 'Residents', 'Carbon Expert']
    },
    {
        id: 'event-008',
        date: '2025-10-15',
        type: 'milestone',
        title: 'Loft Insulation Complete',
        description: 'Successfully installed 300mm mineral wool insulation in loft space. U-value improved from 2.5 to 0.13 W/m²K. First retrofit intervention completed.',
        relatedScope: 'loft-insulation',
        relatedElements: ['roof-structure']
    },
    {
        id: 'event-009',
        date: '2025-10-01',
        type: 'construction',
        title: 'Loft Insulation Installation Started',
        description: 'Began installation of loft insulation. Cleared existing minimal insulation and prepared joists for new 300mm layer.',
        relatedScope: 'loft-insulation'
    },
    {
        id: 'event-010',
        date: '2025-09-20',
        type: 'survey',
        title: 'Initial Building Survey Complete',
        description: 'Comprehensive survey of No. 33 Link Road completed. Documented existing construction, identified retrofit priorities, and established baseline conditions.',
        participants: ['Material Cultures', 'Retrofit Coordinator']
    },
    {
        id: 'event-011',
        date: '2025-09-10',
        type: 'meeting',
        title: 'Project Kickoff Meeting',
        description: 'First community meeting to introduce the retrofit project. Discussed goals, timeline, and participatory approach.',
        participants: ['Civic Square Team', 'Residents', 'Retrofit Coordinator']
    }
]
