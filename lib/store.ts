import { create } from 'zustand'

interface AppState {
    selectedElementId: string | null
    isLogOpen: boolean
    setSelectedElement: (id: string | null) => void
    toggleLog: (isOpen: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
    selectedElementId: null,
    isLogOpen: false,
    setSelectedElement: (id) => set({ selectedElementId: id, isLogOpen: !!id }),
    toggleLog: (isOpen) => set({ isLogOpen: isOpen }),
}))