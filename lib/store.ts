import { create } from 'zustand'
import { SpeckleObject } from '@/lib/speckle/types'

interface FilterState {
    categories: string[]
    levels: string[]
    materials: string[]
    groups: string[]
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
    setSelectedElement: (id: string | null, data?: any) => void

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

    // UI State
    isLogOpen: boolean
    toggleLog: (isOpen: boolean) => void

    // Retrofit Selection
    selectedRetrofitScopeId: string | null
    setSelectedRetrofitScope: (id: string | null) => void

    // Model Loading
    isLoading: boolean
    loadingProgress: number
    setLoading: (loading: boolean, progress?: number) => void
}

export const useAppStore = create<AppState>((set, get) => ({
    selectedElementId: null,
    selectedElementData: null,

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

    isLogOpen: false,

    isLoading: false,
    loadingProgress: 0,

    selectedRetrofitScopeId: null,
    setSelectedRetrofitScope: (id) => set({ selectedRetrofitScopeId: id }),

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