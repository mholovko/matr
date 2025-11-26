import { create } from 'zustand'
import { SpeckleObject } from '@/lib/speckle/types'
import { FeedEvent } from '@/lib/data/feed'
import { RoomPerformanceData } from '@/lib/data/performance'
import { PhaseDataTree } from '@/lib/data/phase-map'

interface FilterState {
    categories: string[]
    levels: string[]
    materials: string[]
    groups: string[]
}

interface PhaseState {
    dataTree: PhaseDataTree | null
    selectedPhase: string | null
    filterMode: 'complete' | 'new' | 'demolished' | 'diff'
    colorCodingEnabled: boolean
}

interface ModelData {
    availableCategories: string[]
    availableLevels: string[]
    availableMaterials: { name: string; class: string; volume: number }[]
    availableGroups: string[]
    totalVolume: number
}

interface AppState {
    // Selection
    selectedElementId: string | null
    selectedElementData: SpeckleObject | null
    setSelectedElement: (id: string | null, data?: SpeckleObject) => void

    // Assembly Selection
    selectedAssemblyId: string | null
    setSelectedAssembly: (id: string | null) => void

    // Material Selection
    selectedMaterialName: string | null
    setSelectedMaterial: (materialName: string | null) => void

    // View Mode
    viewMode: 'standard' | 'dollhouse'
    setViewMode: (mode: 'standard' | 'dollhouse') => void

    // Render Mode
    renderMode: 'rendered' | 'shaded' | 'technical'
    setRenderMode: (mode: 'rendered' | 'shaded' | 'technical') => void

    // Selection Mode
    selectionMode: 'assembly' | 'elements' | 'material'
    setSelectionMode: (mode: 'assembly' | 'elements' | 'material') => void

    // Interaction State
    isInteracting: boolean
    setIsInteracting: (isInteracting: boolean) => void

    // Model Elements
    modelElements: SpeckleObject[]
    setModelElements: (elements: SpeckleObject[]) => void
    modelData: ModelData
    updateModelData: () => void

    // Filters
    filters: FilterState
    toggleCategoryFilter: (category: string) => void
    toggleLevelFilter: (level: string) => void
    toggleMaterialFilter: (material: string) => void
    toggleGroupFilter: (group: string) => void
    clearFilters: () => void

    // Search
    searchTerm: string
    setSearchTerm: (term: string) => void

    isLogOpen: boolean
    toggleLog: (isOpen: boolean) => void
    logActiveTab: 'materials' | 'carbon' | 'docs'
    setLogActiveTab: (tab: 'materials' | 'carbon' | 'docs') => void

    // Feed State
    feedFilterType: 'all' | FeedEvent['type']
    setFeedFilterType: (type: 'all' | FeedEvent['type']) => void

    // Performance State
    performanceSelectedRoom: RoomPerformanceData | null
    setPerformanceSelectedRoom: (room: RoomPerformanceData | null) => void

    // Retrofit Selection
    selectedRetrofitScopeId: string | null
    setSelectedRetrofitScope: (id: string | null) => void

    // Model Loading
    isLoading: boolean
    loadingProgress: number
    setLoading: (loading: boolean, progress?: number) => void

    // Camera Debug (dev mode)
    cameraDebugInfo: { position: { x: number; y: number; z: number }; target: { x: number; y: number; z: number } } | null
    setCameraDebugInfo: (info: { position: { x: number; y: number; z: number }; target: { x: number; y: number; z: number } }) => void

    // Mobile Drawer
    mobileDrawerSnap: number | string | null
    setMobileDrawerSnap: (snap: number | string | null) => void

    // Phases
    phases: PhaseState
    setPhaseDataTree: (tree: PhaseDataTree | null) => void
    setSelectedPhase: (phase: string | null) => void
    setPhaseFilterMode: (mode: 'complete' | 'new' | 'demolished' | 'diff') => void
    setPhaseColorCoding: (enabled: boolean) => void
    getFilteredElementIds: () => Set<string> | null
}

export const useAppStore = create<AppState>((set, get) => ({
    selectedElementId: null,
    selectedElementData: null,

    selectedAssemblyId: null,
    setSelectedAssembly: (id) => set({ selectedAssemblyId: id, isLogOpen: !!id }),

    selectedMaterialName: null,
    setSelectedMaterial: (materialName) => set({
        selectedMaterialName: materialName,
        isLogOpen: !!materialName
    }),

    // View Mode
    viewMode: 'standard',
    setViewMode: (mode) => set({ viewMode: mode }),

    // Render Mode
    renderMode: 'rendered',
    setRenderMode: (mode) => set({ renderMode: mode }),

    // Selection Mode
    selectionMode: 'elements',
    setSelectionMode: (mode) => {
        set({ selectionMode: mode })
        const state = get()

        // Clear material selection when leaving material mode
        if (mode !== 'material' && state.selectedMaterialName) {
            get().setSelectedMaterial(null)
        }

        // Clear assembly selection when leaving assembly mode
        if (mode !== 'assembly' && state.selectedAssemblyId) {
            get().setSelectedAssembly(null)
            get().clearFilters()
        }
    },

    // Interaction State (for optimization)
    isInteracting: false,
    setIsInteracting: (isInteracting) => set({ isInteracting }),

    modelElements: [],
    modelData: {
        availableCategories: [],
        availableLevels: [],
        availableMaterials: [],
        availableGroups: [],
        totalVolume: 0
    },

    filters: {
        categories: [],
        levels: [],
        materials: [],
        groups: []
    },

    searchTerm: '',
    setSearchTerm: (term) => set({ searchTerm: term }),

    isLogOpen: false,
    logActiveTab: 'materials',
    setLogActiveTab: (tab) => set({ logActiveTab: tab }),

    feedFilterType: 'all',
    setFeedFilterType: (type) => set({ feedFilterType: type }),

    performanceSelectedRoom: null,
    setPerformanceSelectedRoom: (room) => set({ performanceSelectedRoom: room }),

    isLoading: false,
    loadingProgress: 0,

    selectedRetrofitScopeId: null,
    setSelectedRetrofitScope: (id) => set({ selectedRetrofitScopeId: id }),

    cameraDebugInfo: null,
    setCameraDebugInfo: (info) => set({ cameraDebugInfo: info }),

    mobileDrawerSnap: 0.5,
    setMobileDrawerSnap: (snap) => set({ mobileDrawerSnap: snap }),

    // Phases
    phases: {
        dataTree: null,
        selectedPhase: null,
        filterMode: 'complete',
        colorCodingEnabled: true
    },

    setPhaseDataTree: (tree) => set((state) => ({
        phases: {
            ...state.phases,
            dataTree: tree,
            selectedPhase: tree && tree.phasesByOrder.length > 0 ? tree.phasesByOrder[tree.phasesByOrder.length - 1] : null
        }
    })),

    setSelectedPhase: (phase) => set((state) => ({
        phases: {
            ...state.phases,
            selectedPhase: phase
        }
    })),

    setPhaseFilterMode: (mode) => set((state) => ({
        phases: {
            ...state.phases,
            filterMode: mode
        }
    })),

    setPhaseColorCoding: (enabled) => set((state) => ({
        phases: {
            ...state.phases,
            colorCodingEnabled: enabled
        }
    })),

    getFilteredElementIds: () => {
        const state = get()
        const { dataTree, selectedPhase, filterMode } = state.phases
        const { categories, levels, groups } = state.filters
        const searchTerm = state.searchTerm.toLowerCase().trim()
        const modelElements = state.modelElements

        // 1. Calculate Phase IDs
        let phaseIds: Set<string> | null = null

        if (dataTree && selectedPhase) {
            const phaseData = dataTree.elementsByPhase[selectedPhase]
            if (phaseData) {
                if (filterMode === 'complete') {
                    phaseIds = phaseData.active
                } else if (filterMode === 'new') {
                    phaseIds = phaseData.created
                } else if (filterMode === 'demolished') {
                    phaseIds = phaseData.demolished
                } else if (filterMode === 'diff') {
                    // Return active elements + demolished elements
                    const diff = new Set<string>()
                    phaseData.active.forEach(id => diff.add(id))
                    phaseData.demolished.forEach(id => diff.add(id))
                    phaseIds = diff
                }
            }
        }

        // 2.5. Apply Material Filter (if material mode is active)
        const { selectedMaterialName, selectedAssemblyId } = state
        let materialFilteredIds: Set<string> | null = null

        if (selectedMaterialName) {
            const tempMaterialIds = new Set<string>()

            modelElements.forEach(element => {
                const elementId = element.id
                if (!elementId) return

                // If assembly is selected, only consider elements from that assembly
                if (selectedAssemblyId) {
                    const groupName = element.properties?.groupName
                    if (groupName !== selectedAssemblyId) return
                }

                // Check if element has the selected material name
                const materialQuantities = element.properties?.["Material Quantities"] || {}
                const materialNames = Object.keys(materialQuantities)

                if (materialNames.includes(selectedMaterialName)) {
                    tempMaterialIds.add(elementId)
                }
            })

            materialFilteredIds = tempMaterialIds
        }

        // 2. Check if any attribute filters are active
        const hasAttributeFilters = categories.length > 0 || levels.length > 0 || groups.length > 0 || !!selectedMaterialName || !!searchTerm

        // If no filters at all (no phase, no attributes), return null (Show All)
        if (!phaseIds && !hasAttributeFilters) {
            return null as any // Type cast to satisfy signature if needed, or update signature
        }

        // If only phase filters, return phase IDs
        if (phaseIds && !hasAttributeFilters) {
            return phaseIds
        }

        // If only material filter (no phase, no other attributes), return material IDs
        if (materialFilteredIds && !phaseIds && categories.length === 0 && levels.length === 0 && groups.length === 0 && !searchTerm) {
            return materialFilteredIds
        }

        // 3. Apply Attribute Filters (and intersect with Phase IDs if present)
        const resultIds = new Set<string>()

        modelElements.forEach(element => {
            const elementId = element.id
            if (!elementId) return

            // Check Phase (if active)
            if (phaseIds && !phaseIds.has(elementId)) return

            // Check Material Filter (if active)
            if (materialFilteredIds && !materialFilteredIds.has(elementId)) return

            // Check Category
            if (categories.length > 0) {
                const category = element.category || element.properties?.builtInCategory?.replace("OST_", "")
                if (!categories.includes(category)) return
            }

            // Check Level
            if (levels.length > 0) {
                const level = element.level || element.properties?.Parameters?.["Instance Parameters"]?.Constraints?.["Base Constraint"]?.value
                if (!levels.includes(level)) return
            }

            // Check Group
            if (groups.length > 0) {
                const groupName = element.properties?.groupName
                if (!groups.includes(groupName)) return
            }

            // Check Search Term
            if (searchTerm) {
                const name = element.name?.toLowerCase() || ''
                const id = element.id?.toLowerCase() || ''
                if (!name.includes(searchTerm) && !id.includes(searchTerm)) return
            }

            resultIds.add(elementId)
        })

        return resultIds
    },

    setSelectedElement: (id, data) => set({
        selectedElementId: id,
        selectedElementData: data,
        isLogOpen: !!id
    }),

    setModelElements: (elements) => {
        set({ modelElements: elements })
        get().updateModelData()
    },

    updateModelData: () => {
        const elements = get().modelElements

        // Aggregate categories
        const categories = new Set<string>()
        const levels = new Set<string>()
        const groups = new Set<string>()
        const materialClassMap = new Map<string, number>() // Group by CLASS, not name
        let totalMaterialVolume = 0

        elements.forEach(el => {
            // Categories - exclude Lines and sketch-related categories
            const category = el.category || el.properties?.builtInCategory?.replace("OST_", "")
            if (category &&
                category !== "Lines" &&
                !category.toLowerCase().includes("sketch")) {
                categories.add(category)
            }

            // Levels
            const level = el.level || el.properties?.Parameters?.["Instance Parameters"]?.Constraints?.["Base Constraint"]?.value
            if (level) levels.add(level)

            // Groups
            const groupName = el.properties?.groupName
            if (groupName) groups.add(groupName)

            // Materials - group by CLASS instead of name
            const materialQuantities = el.properties?.["Material Quantities"] || {}
            Object.entries(materialQuantities).forEach(([name, data]: [string, any]) => {
                const materialClass = data.materialClass || 'Generic'
                const vol = data.volume?.value || 0

                // Add to total material volume
                totalMaterialVolume += vol

                // Aggregate by material class
                const existing = materialClassMap.get(materialClass)
                if (existing) {
                    materialClassMap.set(materialClass, existing + vol)
                } else {
                    materialClassMap.set(materialClass, vol)
                }
            })
        })

        set({
            modelData: {
                availableCategories: Array.from(categories).sort(),
                availableLevels: Array.from(levels).sort(),
                availableGroups: Array.from(groups).sort(),
                availableMaterials: Array.from(materialClassMap.entries())
                    .map(([materialClass, volume]) => ({
                        name: materialClass, // Using class as name for display
                        class: materialClass,
                        volume: volume
                    }))
                    .sort((a, b) => b.volume - a.volume), // Sort by volume descending
                totalVolume: totalMaterialVolume // Use material volume, not element volume
            }
        })
    },

    toggleCategoryFilter: (category) => set((state) => ({
        filters: {
            ...state.filters,
            categories: state.filters.categories.includes(category)
                ? state.filters.categories.filter(c => c !== category)
                : [...state.filters.categories, category]
        }
    })),

    toggleLevelFilter: (level) => set((state) => ({
        filters: {
            ...state.filters,
            levels: state.filters.levels.includes(level)
                ? state.filters.levels.filter(l => l !== level)
                : [...state.filters.levels, level]
        }
    })),

    toggleMaterialFilter: (material) => set((state) => ({
        filters: {
            ...state.filters,
            materials: state.filters.materials.includes(material)
                ? state.filters.materials.filter(m => m !== material)
                : [...state.filters.materials, material]
        }
    })),

    toggleGroupFilter: (group) => set((state) => ({
        filters: {
            ...state.filters,
            groups: state.filters.groups.includes(group)
                ? state.filters.groups.filter(g => g !== group)
                : [...state.filters.groups, group]
        }
    })),

    clearFilters: () => set({
        filters: {
            categories: [],
            levels: [],
            materials: [],
            groups: []
        }
    }),

    toggleLog: (isOpen) => set({ isLogOpen: isOpen }),

    setLoading: (loading, progress = 0) => set({
        isLoading: loading,
        loadingProgress: progress
    })
}))