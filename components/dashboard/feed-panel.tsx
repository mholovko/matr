"use client"

import { useState } from "react"
import { ChevronsRight, Calendar, Users, CheckCircle, Package, Search, Milestone } from "lucide-react"
import { cn } from "@/lib/utils"
import { feedEvents, type FeedEvent } from "@/lib/data/feed"

export function FeedPanel() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [filterType, setFilterType] = useState<FeedEvent['type'] | 'all'>('all')

    const getEventIcon = (type: FeedEvent['type']) => {
        switch (type) {
            case 'construction': return <Package className="h-3 w-3" />
            case 'meeting': return <Users className="h-3 w-3" />
            case 'decision': return <CheckCircle className="h-3 w-3" />
            case 'delivery': return <Package className="h-3 w-3" />
            case 'survey': return <Search className="h-3 w-3" />
            case 'milestone': return <Milestone className="h-3 w-3" />
        }
    }

    const getEventColor = (type: FeedEvent['type']) => {
        switch (type) {
            case 'construction': return 'bg-blue-500'
            case 'meeting': return 'bg-purple-500'
            case 'decision': return 'bg-emerald-500'
            case 'delivery': return 'bg-amber-500'
            case 'survey': return 'bg-pink-500'
            case 'milestone': return 'bg-red-500'
        }
    }

    const filteredEvents = filterType === 'all'
        ? feedEvents
        : feedEvents.filter(event => event.type === filterType)

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
                                <div key={event.id} className="relative pl-4">
                                    {/* Timeline line */}
                                    {index < filteredEvents.length - 1 && (
                                        <div className="absolute left-[5px] top-2 bottom-[-24px] w-px bg-border" />
                                    )}

                                    {/* Event Item */}
                                    <div className="flex gap-3">
                                        {/* Dot */}
                                        <div className={cn(
                                            "absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-background",
                                            getEventColor(event.type)
                                        )} />

                                        <div className="flex-1">
                                            {/* Date & Type */}
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                                                        {new Date(event.date).toLocaleDateString('en-GB', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground"
                                                )}>
                                                    {event.type}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <h4 className="font-bold text-sm text-foreground mb-1">{event.title}</h4>
                                            <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{event.description}</p>

                                            {/* Metadata Tags */}
                                            <div className="flex flex-wrap gap-2">
                                                {event.participants && event.participants.length > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {event.participants.join(", ")}
                                                        </span>
                                                    </div>
                                                )}
                                                {event.relatedScope && (
                                                    <div className="flex items-center gap-1">
                                                        <Package className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {event.relatedScope}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
