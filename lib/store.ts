import { create } from 'zustand'
import { SpeckleObject } from '@/lib/speckle/types'
import { FeedEvent } from '@/lib/data/feed'
import { RoomPerformanceData } from '@/lib/data/performance'
import { PhaseDataTree } from '@/lib/data/phase-map'
import { AssetLifecycle } from '@/types/lifecycle'
import { lifecycleMap } from './data/phases'

// ------------------------------------------------------------------
// Types & Interfaces
// ------------------------------------------------------------------

interface FilterState {
    categories: string[]
    levels: string[]
    materials: string[]
    groups: string[]
    elementNames: string[]
}

interface HighlightState {
    type: 'material' | 'category' | 'element' | null
    values: string[]
}

interface PhaseState {
    dataTree: PhaseDataTree | null
    selectedPhase: string | null
    filterMode: 'complete' | 'new' | 'demolished' | 'diff'
    colorCodingEnabled: boolean
    lifecycleMap: Record<string, AssetLifecycle>
}

interface ModelData {
    availableCategories: string[]
    availableLevels: string[]
    availableMaterials: { name: string; class: string; volume: number }[]
    availableGroups: string[]
    totalVolume: number
}

interface AppState {
    // --- Selection ---
    selectedElementId: string | null
    selectedElementData: SpeckleObject | null
    selectedElementIds: string[]
    setSelectedElement: (id: string | null, data?: SpeckleObject) => void
    toggleElementSelection: (id: string, data: SpeckleObject) => void

    // --- Hover ---
    hoveredElementIds: string[] | null
    setHoveredElementIds: (ids: string[] | null) => void

    // --- Assembly ---
    selectedAssemblyId: string | null
    setSelectedAssembly: (id: string | null) => void

    // --- View/Render ---
    viewMode: 'standard' | 'dollhouse'
    setViewMode: (mode: 'standard' | 'dollhouse') => void
    renderMode: 'rendered' | 'shaded' | 'technical'
    setRenderMode: (mode: 'rendered' | 'shaded' | 'technical') => void

    // --- Modes ---
    selectionMode: 'assembly' | 'elements' | 'material'
    setSelectionMode: (mode: 'assembly' | 'elements' | 'material') => void
    isInteracting: boolean
    setIsInteracting: (isInteracting: boolean) => void

    // --- Model Data ---
    modelElements: SpeckleObject[]
    modelData: ModelData
    isLoading: boolean
    loadingProgress: number
    setModelElements: (elements: SpeckleObject[]) => void
    updateModelData: () => void
    setLoading: (loading: boolean, progress?: number) => void

    // --- Filters ---
    filters: FilterState
    toggleCategoryFilter: (category: string) => void
    setCategoryFilter: (category: string | null) => void
    toggleLevelFilter: (level: string) => void
    toggleMaterialFilter: (material: string) => void
    setMaterialFilter: (material: string | null) => void
    toggleGroupFilter: (group: string) => void
    toggleElementNameFilter: (name: string) => void
    setElementNameFilter: (name: string | null) => void
    clearFilters: () => void
    setCrossFilter: (attrs: {
        categories?: string[]
        materials?: string[]
        elementNames?: string[]
        levels?: string[]
        groups?: string[]
    }) => void
    clearAllFilters: () => void

    // --- Highlights ---
    highlights: HighlightState
    setHighlights: (highlights: HighlightState) => void
    clearHighlights: () => void

    // --- Search & UI ---
    searchTerm: string
    setSearchTerm: (term: string) => void
    isLogOpen: boolean
    toggleLog: (isOpen: boolean) => void
    logActiveTab: 'materials' | 'carbon' | 'docs'
    setLogActiveTab: (tab: 'materials' | 'carbon' | 'docs') => void

    // --- Domain Specific ---
    feedFilterType: 'all' | FeedEvent['type']
    setFeedFilterType: (type: 'all' | FeedEvent['type']) => void
    performanceSelectedRoom: RoomPerformanceData | null
    setPerformanceSelectedRoom: (room: RoomPerformanceData | null) => void
    selectedRetrofitScopeId: string | null
    setSelectedRetrofitScope: (id: string | null) => void

    // --- Dev / Mobile ---
    cameraDebugInfo: { position: { x: number; y: number; z: number }; target: { x: number; y: number; z: number } } | null
    setCameraDebugInfo: (info: { position: { x: number; y: number; z: number }; target: { x: number; y: number; z: number } }) => void
    mobileDrawerSnap: number | string | null
    setMobileDrawerSnap: (snap: number | string | null) => void

    // --- Phases ---
    phases: PhaseState
    setPhaseDataTree: (tree: PhaseDataTree | null) => void
    setSelectedPhase: (phase: string | null) => void
    setPhaseFilterMode: (mode: 'complete' | 'new' | 'demolished' | 'diff') => void
    setPhaseColorCoding: (enabled: boolean) => void

    // --- Core Logic ---
    getFilteredElementIds: (options?: { skipSelectionFilters?: boolean; skipMaterialFilter?: boolean }) => Set<string> | null
}

// ------------------------------------------------------------------
// Optimization Helpers (Pure Functions)
// ------------------------------------------------------------------

/** Calculates the set of allowed IDs based on phase configuration */
const getAllowedPhaseIds = (phaseState: PhaseState): Set<string> | null => {
    const { dataTree, selectedPhase, filterMode } = phaseState
    if (!selectedPhase || !dataTree) return null

    const phaseData = dataTree.elementsByPhase[selectedPhase]
    if (!phaseData) return null

    switch (filterMode) {
        case 'new': return phaseData.created
        case 'demolished': return phaseData.demolished
        case 'complete':
        case 'diff':
            // Optimization: If performance is still slow, these sets can be cached in the phase processor
            const combined = new Set(phaseData.active)
            phaseData.demolished.forEach(id => combined.add(id))
            return combined
        default: return null
    }
}

/** Checks if element string attributes match search term */
const matchesSearch = (element: SpeckleObject, lowerTerm: string): boolean => {
    if (!lowerTerm) return true

    const name = element.name?.toLowerCase() || ""
    const category = (element.category || "").toLowerCase()
    const family = (element.type || "").toLowerCase()
    const id = element.id.toLowerCase()

    return name.includes(lowerTerm) ||
        category.includes(lowerTerm) ||
        family.includes(lowerTerm) ||
        id.includes(lowerTerm)
}

/** Checks if element contains specific materials */
const matchesMaterial = (element: SpeckleObject, targetMaterials: string[]): boolean => {
    if (targetMaterials.length === 0) return true

    const quantities = element.properties?.["Material Quantities"]
    if (!quantities) return false

    // optimization: iterate the smaller list (object keys)
    const elementMats = Object.keys(quantities)
    return elementMats.some(mat => targetMaterials.includes(mat))
}

// ------------------------------------------------------------------
// Store Implementation
// ------------------------------------------------------------------

export const useAppStore = create<AppState>((set, get) => ({
    // --- Initial State ---
    selectedElementId: null,
    selectedElementData: null,
    selectedElementIds: [],
    hoveredElementIds: null,
    selectedAssemblyId: null,
    viewMode: 'standard',
    renderMode: 'rendered',
    selectionMode: 'elements',
    isInteracting: false,
    modelElements: [],
    modelData: {
        availableCategories: [],
        availableLevels: [],
        availableMaterials: [],
        availableGroups: [],
        totalVolume: 0
    },
    isLoading: false,
    loadingProgress: 0,
    filters: {
        categories: [],
        levels: [],
        materials: [],
        groups: [],
        elementNames: []
    },
    highlights: { type: null, values: [] },
    searchTerm: '',
    isLogOpen: false,
    logActiveTab: 'materials',
    feedFilterType: 'all',
    performanceSelectedRoom: null,
    selectedRetrofitScopeId: null,
    cameraDebugInfo: null,
    mobileDrawerSnap: 0.5,
    phases: {
        dataTree: null,
        selectedPhase: null,
        filterMode: 'complete',
        colorCodingEnabled: true,
        lifecycleMap: lifecycleMap,
    },

    // --- Actions ---

    setHoveredElementIds: (ids) => set({ hoveredElementIds: ids }),
    setSelectedAssembly: (id) => set({ selectedAssemblyId: id, isLogOpen: !!id }),
    setViewMode: (mode) => set({ viewMode: mode }),
    setRenderMode: (mode) => set({ renderMode: mode }),
    setIsInteracting: (isInteracting) => set({ isInteracting }),
    setSearchTerm: (term) => set({ searchTerm: term }),
    setLogActiveTab: (tab) => set({ logActiveTab: tab }),
    setFeedFilterType: (type) => set({ feedFilterType: type }),
    setPerformanceSelectedRoom: (room) => set({ performanceSelectedRoom: room }),
    setSelectedRetrofitScope: (id) => set({ selectedRetrofitScopeId: id }),
    setCameraDebugInfo: (info) => set({ cameraDebugInfo: info }),
    setMobileDrawerSnap: (snap) => set({ mobileDrawerSnap: snap }),
    setLoading: (loading, progress = 0) => set({ isLoading: loading, loadingProgress: progress }),

    setSelectionMode: (mode) => {
        set({ selectionMode: mode })
        const state = get()
        // Clear side effects when switching modes
        if (mode !== 'assembly' && state.selectedAssemblyId) {
            get().setSelectedAssembly(null)
        }
        if (mode !== 'material') {
            set((s) => ({ filters: { ...s.filters, materials: [] } }))
        }
    },

    // --- Phase Actions ---
    setPhaseDataTree: (tree) => set((state) => ({
        phases: {
            ...state.phases,
            dataTree: tree,
            // Auto-select last phase
            selectedPhase: tree && tree.phasesByOrder.length > 0
                ? tree.phasesByOrder[tree.phasesByOrder.length - 1]
                : null
        }
    })),
    setSelectedPhase: (phase) => set((s) => ({ phases: { ...s.phases, selectedPhase: phase } })),
    setPhaseFilterMode: (mode) => set((s) => ({ phases: { ...s.phases, filterMode: mode } })),
    setPhaseColorCoding: (enabled) => set((s) => ({ phases: { ...s.phases, colorCodingEnabled: enabled } })),

    // --- Selection Actions ---
    setSelectedElement: (id, data) => set({
        selectedElementId: id,
        selectedElementData: data || null,
        selectedElementIds: id ? [id] : [],
        isLogOpen: !!id
    }),

    toggleElementSelection: (id, data) => {
        const state = get()
        const isSelected = state.selectedElementIds.includes(id)

        if (isSelected) {
            const newIds = state.selectedElementIds.filter(eid => eid !== id)
            set({
                selectedElementIds: newIds,
                selectedElementId: newIds.length > 0 ? newIds[0] : null,
                selectedElementData: newIds.length > 0 ? state.selectedElementData : null
            })
        } else {
            set({
                selectedElementIds: [...state.selectedElementIds, id],
                selectedElementId: id,
                selectedElementData: data
            })
        }
    },

    // --- Model Data Handling ---
    setModelElements: (elements) => {
        set({ modelElements: elements })
        get().updateModelData()
    },

    updateModelData: () => {
        const elements = get().modelElements
        const categories = new Set<string>()
        const levels = new Set<string>()
        const groups = new Set<string>()
        const materialClassMap = new Map<string, number>()
        let totalMaterialVolume = 0

        elements.forEach(el => {
            // Categories
            const cat = el.category || el.properties?.builtInCategory?.replace("OST_", "")
            if (cat && cat !== "Lines" && !cat.toLowerCase().includes("sketch")) {
                categories.add(cat)
            }

            // Levels
            const lvl = el.level || el.properties?.Parameters?.["Instance Parameters"]?.Constraints?.["Base Constraint"]?.value
            if (lvl) levels.add(lvl)

            // Groups
            if (el.properties?.groupName) groups.add(el.properties.groupName)

            // Materials
            const materialQuantities = el.properties?.["Material Quantities"] || {}
            Object.entries(materialQuantities).forEach(([_name, data]: [string, any]) => {
                const materialClass = data.materialClass || 'Generic'
                const vol = data.volume?.value || 0
                totalMaterialVolume += vol
                const existing = materialClassMap.get(materialClass) || 0
                materialClassMap.set(materialClass, existing + vol)
            })
        })

        set({
            modelData: {
                availableCategories: Array.from(categories).sort(),
                availableLevels: Array.from(levels).sort(),
                availableGroups: Array.from(groups).sort(),
                availableMaterials: Array.from(materialClassMap.entries())
                    .map(([mClass, volume]) => ({ name: mClass, class: mClass, volume }))
                    .sort((a, b) => b.volume - a.volume),
                totalVolume: totalMaterialVolume
            }
        })
    },

    // --- Core Filtering Logic (REFACTORED) ---
    getFilteredElementIds: (options) => {
        const state = get()
        const { modelElements, filters, phases, searchTerm, selectedAssemblyId } = state

        // 1. Resolve Configuration
        const skipSelection = options?.skipSelectionFilters ?? false
        const skipMaterial = options?.skipMaterialFilter ?? false
        const term = searchTerm.toLowerCase().trim()

        // 2. Resolve Active Filters (Flags)
        const hasPhase = !!phases.selectedPhase
        const hasAssembly = !!selectedAssemblyId
        const hasCategory = !skipSelection && filters.categories.length > 0
        const hasLevel = filters.levels.length > 0
        const hasGroup = !skipSelection && filters.groups.length > 0
        const hasName = !skipSelection && filters.elementNames.length > 0
        const hasMaterial = !skipMaterial && filters.materials.length > 0
        const hasSearch = !!term

        // 3. Early Exit: If no filters active, return null (Show All)
        if (!hasPhase && !hasAssembly && !hasCategory && !hasLevel &&
            !hasGroup && !hasName && !hasMaterial && !hasSearch) {
            return null
        }

        // 4. Pre-calculate Phase Set (O(1) lookups)
        const allowedPhaseIds = hasPhase ? getAllowedPhaseIds(phases) : null

        // 5. Single Pass Loop
        const resultIds = new Set<string>()

        for (let i = 0; i < modelElements.length; i++) {
            const el = modelElements[i]
            if (!el.id) continue

            // Priority 1: Phase (Highest rejection rate, fastest check)
            if (allowedPhaseIds && !allowedPhaseIds.has(el.id)) {
                continue
            }

            // Priority 2: Assembly Identity
            if (hasAssembly) {
                if (el.properties?.groupName !== selectedAssemblyId) continue
            }

            // Priority 3: Simple Attributes (Fast property access)
            if (hasLevel) {
                const lvl = el.level?.name || "Unassigned"
                if (!filters.levels.includes(lvl)) continue
            }

            if (hasCategory) {
                const cat = el.category || el.properties?.builtInCategory?.replace("OST_", "")
                if (!filters.categories.includes(cat)) continue
            }

            if (hasGroup) {
                const grp = el.properties?.groupName
                if (!filters.groups.includes(grp)) continue
            }

            if (hasName) {
                if (!filters.elementNames.includes(el.name)) continue
            }

            // Priority 4: Search (String operations)
            if (hasSearch) {
                if (!matchesSearch(el, term)) continue
            }

            // Priority 5: Materials (Deep object lookup - most expensive)
            if (hasMaterial) {
                if (!matchesMaterial(el, filters.materials)) continue
            }

            // Passed all checks
            resultIds.add(el.id)
        }

        return resultIds
    },

    // --- Filter Setters ---
    toggleCategoryFilter: (category) => set((s) => ({
        filters: {
            ...s.filters,
            categories: s.filters.categories.includes(category)
                ? s.filters.categories.filter(c => c !== category)
                : [...s.filters.categories, category]
        }
    })),
    setCategoryFilter: (category) => set((s) => ({
        filters: { ...s.filters, categories: category ? [category] : [] }
    })),
    toggleLevelFilter: (level) => set((s) => ({
        filters: {
            ...s.filters,
            levels: s.filters.levels.includes(level)
                ? s.filters.levels.filter(l => l !== level)
                : [...s.filters.levels, level]
        }
    })),
    toggleMaterialFilter: (material) => set((s) => ({
        filters: {
            ...s.filters,
            materials: s.filters.materials.includes(material)
                ? s.filters.materials.filter(m => m !== material)
                : [...s.filters.materials, material]
        }
    })),
    setMaterialFilter: (material) => set((s) => ({
        filters: { ...s.filters, materials: material ? [material] : [] }
    })),
    toggleGroupFilter: (group) => set((s) => ({
        filters: {
            ...s.filters,
            groups: s.filters.groups.includes(group)
                ? s.filters.groups.filter(g => g !== group)
                : [...s.filters.groups, group]
        }
    })),
    toggleElementNameFilter: (name) => set((s) => ({
        filters: {
            ...s.filters,
            elementNames: s.filters.elementNames.includes(name)
                ? s.filters.elementNames.filter(n => n !== name)
                : [...s.filters.elementNames, name]
        }
    })),
    setElementNameFilter: (name) => set((s) => ({
        filters: { ...s.filters, elementNames: name ? [name] : [] }
    })),
    clearFilters: () => set({
        filters: { categories: [], levels: [], materials: [], groups: [], elementNames: [] }
    }),
    setCrossFilter: (attrs) => set((s) => ({
        filters: {
            ...s.filters,
            categories: attrs.categories ?? s.filters.categories,
            materials: attrs.materials ?? s.filters.materials,
            elementNames: attrs.elementNames ?? s.filters.elementNames,
            levels: attrs.levels ?? s.filters.levels,
            groups: attrs.groups ?? s.filters.groups
        }
    })),
    clearAllFilters: () => {
        set({
            filters: { categories: [], levels: [], materials: [], groups: [], elementNames: [] },
            selectedAssemblyId: null,
            searchTerm: ''
        })
        get().clearHighlights()
    },

    // --- Highlights & UI Toggles ---
    setHighlights: (highlights) => set({ highlights }),
    clearHighlights: () => set({ highlights: { type: null, values: [] } }),
    toggleLog: (isOpen) => set({ isLogOpen: isOpen })
}))