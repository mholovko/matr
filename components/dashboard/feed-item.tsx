"use client"

import { Calendar, Users, CheckCircle, Package, Search, Milestone, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { type FeedEvent } from "@/lib/data/feed"
import { useAppStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

interface FeedItemProps {
    event: FeedEvent
    showRelatedScope?: boolean
    isLast?: boolean
}

export function FeedItem({ event, showRelatedScope = true, isLast = false }: FeedItemProps) {
    const { setSelectedRetrofitScope } = useAppStore()
    const router = useRouter()

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

    return (
        <div className="relative pl-4">
            {/* Timeline line */}
            {!isLast && (
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
                        {showRelatedScope && event.relatedScope && (
                            <button
                                className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors group/link"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    event.relatedScope && setSelectedRetrofitScope(event.relatedScope)
                                    router.push('/retrofit')
                                }}
                            >
                                <Package className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground group-hover/link:text-primary transition-colors">
                                    {event.relatedScope}
                                </span>
                                <ExternalLink className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-all group-hover/link:text-primary" />
                            </button>
                        )}
                    </div>

                    {/* Attachments (Images) */}
                    {event.attachments && event.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {event.attachments.map((attachment, index) => {
                                if (attachment.type === 'image') {
                                    return (
                                        <Dialog key={index}>
                                            <DialogTrigger asChild>
                                                <div className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md border border-border hover:opacity-90 transition-opacity">
                                                    <img
                                                        src={attachment.url}
                                                        alt={attachment.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                                                <div className="relative w-full h-full flex items-center justify-center">
                                                    <img
                                                        src={attachment.url}
                                                        alt={attachment.name}
                                                        className="max-h-[85vh] max-w-full rounded-lg shadow-2xl"
                                                    />
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )
                                }
                                return null
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
