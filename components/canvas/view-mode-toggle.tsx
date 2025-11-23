"use client"

import { useAppStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"
import { cn } from "@/lib/utils"
import { Box, Layers } from "lucide-react"

export function ViewModeToggle() {
    const { viewMode, setViewMode } = useAppStore(
        useShallow((state) => ({
            viewMode: state.viewMode,
            setViewMode: state.setViewMode,
        }))
    )

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border rounded-full p-1 flex gap-1 shadow-sm">
            <button
                onClick={() => setViewMode('standard')}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    viewMode === 'standard'
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground"
                )}
            >
                <Box className="w-3 h-3" />
                Standard
            </button>
            <button
                onClick={() => setViewMode('dollhouse')}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    viewMode === 'dollhouse'
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground"
                )}
            >
                <Layers className="w-3 h-3" />
                Dollhouse
            </button>
        </div>
    )
}
