"use client"

import { useEffect, useState } from "react"
import { ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { retrofitScopes } from "@/lib/data/scopes"
import { useAppStore } from "@/lib/store"
import { CameraDebugUI } from "../camera-debug-ui"
import { RetrofitContent } from "./retrofit-content"

export function RetrofitPanel() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const { selectedRetrofitScopeId, setSelectedRetrofitScope } = useAppStore()

    // Derived state for selected scope
    const selectedScope = selectedRetrofitScopeId
        ? retrofitScopes.find(s => s.id === selectedRetrofitScopeId) || null
        : null

    // Auto-expand when scope is selected
    useEffect(() => {
        if (selectedScope) {
            setIsCollapsed(false)
        }
    }, [selectedScope])

    return (
        <aside
            className={cn(
                "hidden md:flex fixed right-0 top-0 h-screen flex-col shadow-2xl z-50 transition-all duration-300 ease-in-out",
                "border-l border-border bg-background/95 backdrop-blur-sm",
                isCollapsed ? "w-12" : "w-[480px]"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border bg-muted/10">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary animate-pulse" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                            {selectedScope ? selectedScope.title : "Retrofit Scopes"}
                        </h3>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "h-6 w-6 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors",
                        isCollapsed && "mx-auto"
                    )}
                >
                    <ChevronsRight className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                </button>
            </div>

            {!isCollapsed && (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <RetrofitContent />
                </div>
            )}

            {/* Camera Debug Helper - bottom of panel */}
            {!isCollapsed && (
                <div className="p-3 border-t border-border">
                    <CameraDebugUI />
                </div>
            )}
        </aside>
    )
}
