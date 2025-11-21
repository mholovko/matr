"use client"
import { X, ChevronsRight, Info, Box, Layers, Activity } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function LogPanel() {
    const { selectedElementId } = useAppStore()
    const [activeTab, setActiveTab] = useState<"materials" | "carbon" | "docs">("materials")
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <aside
            className={cn(
                "fixed right-0 top-0 h-screen flex flex-col shadow-2xl z-50 transition-all duration-300 ease-in-out",
                "border-l border-border bg-background/95 backdrop-blur-sm",
                isCollapsed ? "w-12" : "w-[400px]"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border bg-muted/10">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary animate-pulse" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">System Log</h3>
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

            {/* Element ID Section */}
            {!isCollapsed && (
                <>
                    <div className="p-3 bg-muted/5 border-b border-border flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target ID</span>
                        <span className="text-[10px] font-mono bg-primary text-primary-foreground px-1.5 py-0.5">
                            #{selectedElementId}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {/* Tabs */}
                        <div className="grid grid-cols-3 border-b border-border">
                            {[
                                { id: "materials", label: "MATS", icon: Box },
                                { id: "carbon", label: "CO2e", icon: Activity },
                                { id: "docs", label: "DOCS", icon: Layers },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-r border-border last:border-r-0",
                                        activeTab === tab.id
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-background text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    <tab.icon className="h-3 w-3" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="p-0">
                            {activeTab === "materials" && (
                                <section>
                                    <div className="p-3 bg-muted/5 border-b border-border">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Composition</span>
                                    </div>
                                    <div className="p-4">
                                        <ul className="space-y-2">
                                            {[
                                                "Wood Fibre Insulation (140mm)",
                                                "Lime Plaster Finish",
                                                "Timber Studs (C24)"
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs font-mono text-slate-600">
                                                    <span className="text-primary mt-1">›</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </section>
                            )}

                            {activeTab === "carbon" && (
                                <section>
                                    <div className="p-3 bg-muted/5 border-b border-border">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Impact Analysis</span>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold font-mono text-emerald-600">-120</span>
                                            <span className="text-xs font-bold uppercase text-muted-foreground">kgCO₂e</span>
                                        </div>

                                    </div>
                                </section>
                            )}

                            {activeTab === "docs" && (
                                <section>
                                    <div className="p-3 bg-muted/5 border-b border-border">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Documentation</span>
                                    </div>
                                    <div className="p-4 text-xs text-muted-foreground font-mono">
                                        No documentation attached.
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Footer Stats */}
                        <div className="mt-auto border-t border-border p-2 bg-muted/10 text-[10px] font-mono text-muted-foreground flex justify-between px-4 uppercase tracking-wider">
                            <span>STATUS: ACTIVE</span>
                            <span>UPDATED: NOW</span>
                        </div>
                    </div>
                </>
            )}
        </aside>
    )
}