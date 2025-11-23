"use client"

import { useAppStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"
import { cn } from "@/lib/utils"
import { Box, Layers, Palette } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export function ViewModeToggle() {
    const { viewMode, setViewMode, renderMode, setRenderMode } = useAppStore(
        useShallow((state) => ({
            viewMode: state.viewMode,
            setViewMode: state.setViewMode,
            renderMode: state.renderMode,
            setRenderMode: state.setRenderMode,
        }))
    )

    const [isRenderMenuOpen, setIsRenderMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsRenderMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-row gap-3 items-center">

            {/* Render Mode Dropdown */}
            <div className="relative" ref={menuRef}>
                {isRenderMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-32 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden flex flex-col p-1 animate-in fade-in zoom-in-95 duration-100">
                        <button
                            onClick={() => { setRenderMode('rendered'); setIsRenderMenuOpen(false) }}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left",
                                renderMode === 'rendered' ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                            )}
                        >
                            <span className="w-2 h-2 rounded-full bg-white border border-gray-300 shadow-sm" />
                            Rendered
                        </button>
                        <button
                            onClick={() => { setRenderMode('shaded'); setIsRenderMenuOpen(false) }}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left",
                                renderMode === 'shaded' ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                            )}
                        >
                            <span className="w-2 h-2 rounded-full bg-gray-400 shadow-sm" />
                            Shaded
                        </button>
                    </div>
                )}
                <button
                    onClick={() => setIsRenderMenuOpen(!isRenderMenuOpen)}
                    className={cn(
                        "bg-background/80 backdrop-blur-sm border border-border rounded-full w-9 h-9 flex items-center justify-center shadow-sm transition-colors",
                        isRenderMenuOpen ? "bg-muted text-foreground" : "hover:bg-muted text-muted-foreground"
                    )}
                    title="Render Mode"
                >
                    <Palette className="w-4 h-4" />
                </button>
            </div>

            {/* View Mode (Standard vs Dollhouse) */}
            <div className="bg-background/80 backdrop-blur-sm border border-border rounded-full p-1 flex gap-1 shadow-sm">
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
        </div>
    )
}
