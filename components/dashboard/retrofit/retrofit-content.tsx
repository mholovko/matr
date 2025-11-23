"use client"

import { useState } from "react"
import { Calendar, DollarSign, Activity, ChevronDown, ChevronUp, ArrowLeft, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { retrofitScopes, type RetrofitScope } from "@/lib/data/scopes"
import { feedEvents } from "@/lib/data/feed"
import { FeedItem } from "../feed/feed-item"

import { useAppStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"

export function RetrofitContent() {
    const { selectedRetrofitScopeId, setSelectedRetrofitScope } = useAppStore(useShallow(state => ({
        selectedRetrofitScopeId: state.selectedRetrofitScopeId,
        setSelectedRetrofitScope: state.setSelectedRetrofitScope
    })))
    const [expandedScenarios, setExpandedScenarios] = useState(false)

    // Derived state for selected scope
    const selectedScope = selectedRetrofitScopeId
        ? retrofitScopes.find(s => s.id === selectedRetrofitScopeId) || null
        : null

    const getStatusColor = (status: RetrofitScope['status']) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500'
            case 'in-progress': return 'bg-amber-500'
            case 'planning': return 'bg-blue-500'
        }
    }

    const getCategoryIcon = (category: RetrofitScope['category']) => {
        return <Layers className="h-4 w-4" />
    }

    const relatedEvents = selectedScope
        ? feedEvents.filter(e => e.relatedScope === selectedScope.id)
        : []

    if (selectedScope) {
        // SCOPE DETAILS
        return (
            <div>
                {/* Status & Description */}
                <div className="p-4 border-b border-border">
                    <button
                        onClick={() => {
                            setSelectedRetrofitScope(null)
                            setExpandedScenarios(false)
                        }}
                        className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-4 group"
                    >
                        <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
                        Back to Scopes
                    </button>

                    <div className="flex items-center gap-2 mb-3">
                        <div className={cn("w-2 h-2 rounded-full", getStatusColor(selectedScope.status))} />
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">{selectedScope.status.replace('-', ' ')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedScope.description}</p>
                </div>

                {/* Timeline */}
                <section>
                    <div className="p-3 bg-muted/5 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Timeline</span>
                        </div>
                    </div>
                    <div className="p-4 space-y-2 text-xs font-mono">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-bold text-foreground">{selectedScope.timeline.duration}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Start:</span>
                            <span className="font-bold text-foreground">{new Date(selectedScope.timeline.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">End:</span>
                            <span className="font-bold text-foreground">{new Date(selectedScope.timeline.endDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </section>

                {/* Cost */}
                <section>
                    <div className="p-3 bg-muted/5 border-b border-border">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cost</span>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold font-mono text-foreground">£{selectedScope.baseCost.toLocaleString()}</span>
                        </div>
                    </div>
                </section>

                {/* Embodied Carbon */}
                <section>
                    <div className="p-3 bg-muted/5 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Activity className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Embodied Carbon</span>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold font-mono text-foreground">{selectedScope.baseEmbodiedCarbon}</span>
                            <span className="text-xs font-bold uppercase text-muted-foreground">kgCO₂e</span>
                        </div>
                    </div>
                </section>

                {/* Design Scenarios */}
                {selectedScope.scenarios.length > 0 && (
                    <section>
                        <div className="p-3 bg-muted/5 border-b border-border flex items-center justify-between cursor-pointer hover:bg-muted/10 transition-colors"
                            onClick={() => setExpandedScenarios(!expandedScenarios)}>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Design Options ({selectedScope.scenarios.length})
                            </span>
                            {expandedScenarios ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                        </div>

                        {expandedScenarios && (
                            <div className="p-4 space-y-3">
                                {selectedScope.scenarios.map((scenario) => (
                                    <div
                                        key={scenario.id}
                                        className={cn(
                                            "p-3 rounded border transition-colors",
                                            selectedScope.selectedScenario === scenario.id
                                                ? "border-primary bg-primary/5"
                                                : "border-border bg-background hover:border-primary/50"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h5 className="font-bold text-xs uppercase tracking-wider">{scenario.name}</h5>
                                            {selectedScope.selectedScenario === scenario.id && (
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Selected</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-3">{scenario.description}</p>
                                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                            <div>
                                                <span className="text-muted-foreground">Cost:</span>
                                                <span className="font-bold ml-1 text-foreground">£{scenario.cost.toLocaleString()}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Carbon:</span>
                                                <span className="font-bold ml-1 text-foreground">{scenario.embodiedCarbon} kg</span>
                                            </div>
                                            {scenario.performance?.uValue && (
                                                <div>
                                                    <span className="text-muted-foreground">U-value:</span>
                                                    <span className="font-bold ml-1 text-foreground">{scenario.performance.uValue}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Related Feed Events */}
                {relatedEvents.length > 0 && (
                    <section>
                        <div className="p-3 bg-muted/5 border-b border-border">
                            <div className="flex items-center gap-2">
                                <Activity className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Activity Log</span>
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="p-4 space-y-4">
                                {relatedEvents.map((event, index) => (
                                    <FeedItem
                                        key={event.id}
                                        event={event}
                                        showRelatedScope={false}
                                        isLast={index === relatedEvents.length - 1}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

            </div>
        )
    }

    // SCOPES LIST
    return (
        <div>
            <div className="p-3 bg-muted/5 border-b border-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Planning Scopes</span>
            </div>
            <div className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground mb-4">Select a renovation work package to view details</p>

                {retrofitScopes.map((scope) => (
                    <button
                        key={scope.id}
                        onClick={() => setSelectedRetrofitScope(scope.id)}
                        className="w-full text-left p-3 hover:bg-muted/50 rounded border border-transparent hover:border-border transition-all group"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {getCategoryIcon(scope.category)}
                                <h5 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{scope.title}</h5>
                            </div>
                            <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5", getStatusColor(scope.status))} />
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{scope.description}</p>
                        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                            <div>
                                <div className="text-muted-foreground text-[10px] uppercase">Cost</div>
                                <div className="font-bold text-foreground">£{(scope.baseCost / 1000).toFixed(0)}k</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground text-[10px] uppercase">Carbon</div>
                                <div className="font-bold text-foreground">{scope.baseEmbodiedCarbon}kg</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground text-[10px] uppercase">Duration</div>
                                <div className="font-bold text-foreground">{scope.timeline.duration}</div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
