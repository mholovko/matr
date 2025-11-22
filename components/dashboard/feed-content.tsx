"use client"

import { cn } from "@/lib/utils"
import { feedEvents, type FeedEvent } from "@/lib/data/feed"
import { FeedItem } from "./feed-item"

interface FeedContentProps {
    filterType: FeedEvent['type'] | 'all'
    setFilterType: (type: FeedEvent['type'] | 'all') => void
    filteredEvents: FeedEvent[]
}

export function FeedContent({ filterType, setFilterType, filteredEvents }: FeedContentProps) {
    return (
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
    )
}
