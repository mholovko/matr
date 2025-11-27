"use client"

import { useAppStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"
import { cn } from "@/lib/utils"
import { Box, Layers, Palette, MousePointerClick, Package, BrickWall } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { FilterPills } from "../dashboard/filter-pills"

export function ViewModeToggle() {
    const { viewMode, setViewMode, renderMode, setRenderMode, selectionMode, setSelectionMode } = useAppStore(
        useShallow((state) => ({
            viewMode: state.viewMode,
            setViewMode: state.setViewMode,
            renderMode: state.renderMode,
            setRenderMode: state.setRenderMode,
            selectionMode: state.selectionMode,
            setSelectionMode: state.setSelectionMode,
        }))
    )

    const [isRenderMenuOpen, setIsRenderMenuOpen] = useState(false)
    const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false)
    const renderMenuRef = useRef<HTMLDivElement>(null)
    const selectionMenuRef = useRef<HTMLDivElement>(null)

    // Close menus when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (renderMenuRef.current && !renderMenuRef.current.contains(event.target as Node)) {
                setIsRenderMenuOpen(false)
            }
            if (selectionMenuRef.current && !selectionMenuRef.current.contains(event.target as Node)) {
                setIsSelectionMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col gap-3 items-center">

            {/* Filter Pills */}
            <FilterPills />

            <div className="flex flex-row gap-3 items-center">
            {/* Selection Mode Dropdown */}
            <div className="relative" ref={selectionMenuRef}>
                {isSelectionMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-44 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden flex flex-col p-1 animate-in fade-in zoom-in-95 duration-100">
                        <button
                            onClick={() => { setSelectionMode('assembly'); setIsSelectionMenuOpen(false) }}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left",
                                selectionMode === 'assembly' ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                            )}
                        >
                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" />
                            Assembly
                        </button>
                        <button
                            onClick={() => { setSelectionMode('elements'); setIsSelectionMenuOpen(false) }}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left",
                                selectionMode === 'elements' ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                            )}
                        >
                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm" />
                            Elements
                        </button>
                        <button
                            onClick={() => { setSelectionMode('material'); setIsSelectionMenuOpen(false) }}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left",
                                selectionMode === 'material' ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                            )}
                        >
                            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-sm" />
                            Material
                        </button>
                    </div>
                )}
                <button
                    onClick={() => setIsSelectionMenuOpen(!isSelectionMenuOpen)}
                    className={cn(
                        "bg-background/80 backdrop-blur-sm border border-border rounded-full w-9 h-9 flex items-center justify-center shadow-sm transition-colors",
                        isSelectionMenuOpen ? "bg-muted text-foreground" : "hover:bg-muted text-muted-foreground"
                    )}
                    title="Selection Mode"
                >
                    {selectionMode === 'assembly' ? (
                        <Package className="w-4 h-4" />
                    ) : selectionMode === 'material' ? (
                        <BrickWall className="w-4 h-4" />
                    ) : (
                        <MousePointerClick className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Render Mode Dropdown */}
            <div className="relative" ref={renderMenuRef}>
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
                        <button
                            onClick={() => { setRenderMode('technical'); setIsRenderMenuOpen(false) }}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left",
                                renderMode === 'technical' ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                            )}
                        >
                            <span className="w-2 h-2 rounded-full bg-black border border-gray-300 shadow-sm" />
                            Technical
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
        </div>
    )
}
