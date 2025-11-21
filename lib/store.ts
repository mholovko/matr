import { create } from 'zustand'
import { SpeckleObject } from '@/lib/speckle/types'

interface AppState {
    // Selection
    selectedElementId: string | null
    selectedElementData: SpeckleObject | null
    setSelectedElement: (id: string | null, data?: any) => void

    // UI State
    isLogOpen: boolean
    toggleLog: (isOpen: boolean) => void

    // Model Loading
    isLoading: boolean
    loadingProgress: number
    setLoading: (loading: boolean, progress?: number) => void
}

export const useAppStore = create<AppState>((set) => ({
    selectedElementId: null,
    selectedElementData: null,

    isLogOpen: false,

    isLoading: false, // Start false, component sets true on mount
    loadingProgress: 0,

    setSelectedElement: (id, data) => set({
        selectedElementId: id,
        selectedElementData: data,
        isLogOpen: !!id
    }),

    toggleLog: (isOpen) => set({ isLogOpen: isOpen }),

    setLoading: (loading, progress = 0) => set({
        isLoading: loading,
        loadingProgress: progress
    })
}))