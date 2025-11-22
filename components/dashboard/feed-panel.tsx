"use client"

import { useState } from "react"
import { ChevronsRight, Calendar, Users, CheckCircle, Package, Search, Milestone, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { feedEvents, type FeedEvent } from "@/lib/data/feed"
import { useAppStore } from "@/lib/store"
import { retrofitScopes } from "@/lib/data/scopes"
import { useRouter } from "next/navigation"
import { FeedItem } from "./feed-item"

export function FeedPanel() {
    const router = useRouter()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [filterType, setFilterType] = useState<FeedEvent['type'] | 'all'>('all')
    const { selectedRetrofitScopeId, setSelectedRetrofitScope } = useAppStore()


    const filteredEvents = feedEvents.filter(event => {
        // Filter by type
        if (filterType !== 'all' && event.type !== filterType) return false

        return true
    })

    const selectedScopeTitle = selectedRetrofitScopeId
        ? retrofitScopes.find(s => s.id === selectedRetrofitScopeId)?.title
        : null

    return (
        <aside
            className={cn(
                "fixed right-0 top-0 h-screen flex flex-col shadow-2xl z-50 transition-all duration-300 ease-in-out",
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
                            Renovation Feed
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
                <>
                    {/* Filter Section */}
                    <div className="p-3 bg-muted/5 border-b border-border">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filters</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            <button
                                onClick={() => setFilterType('all')}
                                className={cn(
                                    "px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors border",
                                    filterType === 'all'
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                                )}
                            >
                                All
                            </button>
                            {(['construction', 'meeting', 'decision', 'delivery', 'survey', 'milestone'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={cn(
                                        "px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors border",
                                        filterType === type
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background text-muted-foreground border-border hover:border-primary/50"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-3 bg-muted/5 border-b border-border">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Activity Log ({filteredEvents.length})
                            </span>
                        </div>

                        <div className="p-4 space-y-6">
                            {filteredEvents.map((event, index) => (
                                <FeedItem
                                    key={event.id}
                                    event={event}
                                    isLast={index === filteredEvents.length - 1}
                                />
                            ))}
                        </div>

                        {filteredEvents.length === 0 && (
                            <div className="text-center py-8 text-xs text-muted-foreground font-mono">
                                No events found for this filter
                            </div>
                        )}
                    </div>
                </>
            )}
        </aside>
    )
}
