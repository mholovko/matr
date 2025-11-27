'use client'

import {
    Search,
    SlidersHorizontal,
    ChevronsRight,
    ArrowUpDown,
    Leaf,
    DollarSign,
    MapPin,
    CheckCircle2,
    LayoutGrid,
    Image as ImageIcon,
    ExternalLink
} from "lucide-react"
import { cn } from '@/lib/utils'
import { MaterialFilterState, SortOption } from "@/types/materials-filters"
import { Classification } from "@/types/material-passport"

interface MaterialsDashboardProps {
    filters: MaterialFilterState
    onFilterChange: (updates: Partial<MaterialFilterState>) => void
    totalCount: number
    isCollapsed: boolean
    setIsCollapsed: (v: boolean) => void
}

export function MaterialsDashboard({ filters, onFilterChange, totalCount, isCollapsed, setIsCollapsed }: MaterialsDashboardProps) {

    return (
        <div
            className={cn(
                'absolute right-4 top-20 z-40 flex flex-col shadow-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]',
                'border border-border bg-background/95 backdrop-blur-md overflow-hidden',
                isCollapsed
                    ? 'w-9 h-9 cursor-pointer hover:bg-muted hover:border-foreground/30 shadow-sm'
                    : 'w-[400px] bottom-4'
            )}
            onClick={() => {
                if (isCollapsed) setIsCollapsed(false)
            }}
            role={isCollapsed ? "button" : "region"}
            aria-label="Control Panel"
        >
            {/* --- HEADER --- */}
            <div className={cn(
                "flex flex-col shrink-0 transition-all duration-300 border-b border-border bg-muted/10",
                isCollapsed ? "items-center justify-center h-full p-0 border-0 bg-transparent" : "p-0"
            )}>

                {/* Title Row */}
                <div className={cn(
                    "flex items-center w-full",
                    isCollapsed ? "justify-center h-full" : "justify-between px-6 py-4"
                )}>
                    <div className={cn(
                        "flex items-center overflow-hidden transition-all",
                        isCollapsed ? "justify-center w-full" : "gap-2"
                    )}>
                        <SlidersHorizontal className={cn(
                            "shrink-0 text-muted-foreground transition-colors",
                            "w-4 h-4",
                            isCollapsed && "text-foreground"
                        )} />

                        <span className={cn(
                            "text-xs font-bold uppercase tracking-widest text-foreground whitespace-nowrap",
                            isCollapsed ? "opacity-0 w-0" : "opacity-100"
                        )}>
                            Control Panel
                        </span>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsCollapsed(true)
                        }}
                        className={cn(
                            "h-6 w-6 flex items-center justify-center hover:bg-muted/80 rounded transition-colors text-muted-foreground",
                            isCollapsed ? "hidden" : "flex"
                        )}
                    >
                        <ChevronsRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Search Row */}
                <div className={cn(
                    "px-6 pb-5 transition-opacity duration-200",
                    isCollapsed ? "opacity-0 h-0 p-0 overflow-hidden" : "opacity-100"
                )}>
                    <div className="relative group">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                        <input
                            type="text"
                            placeholder="Search materials..."
                            className="w-full pl-6 pr-12 py-2 text-xs bg-transparent border-b border-border rounded-none focus:outline-none focus:border-foreground transition-all placeholder:text-muted-foreground font-sans"
                            value={filters.search}
                            onChange={(e) => onFilterChange({ search: e.target.value })}
                        />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground">
                            {totalCount.toString().padStart(2, '0')}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CONTENT --- */}
            <div className={cn(
                "flex-1 flex flex-col min-h-0 transition-opacity duration-200",
                isCollapsed ? "opacity-0 pointer-events-none absolute inset-0" : "opacity-100 delay-75"
            )}>

                {/* Filters */}
                <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar bg-background/30">

                    {/* View Mode */}
                    <section>
                        <h3 className="text-[10px] font-bold uppercase text-muted-foreground mb-3 tracking-widest">View</h3>
                        <div className="flex p-0.5 bg-muted rounded-md">
                            {[
                                { id: 'card', icon: LayoutGrid, label: 'Cards' },
                                { id: 'thumbnail', icon: ImageIcon, label: 'Tiles' }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => onFilterChange({ mode: mode.id as any })}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-[10px] font-medium rounded-sm transition-all",
                                        filters.mode === mode.id
                                            ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                    )}
                                >
                                    <mode.icon size={12} />
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Sort */}
                    <section>
                        <h3 className="text-[10px] font-bold uppercase text-muted-foreground mb-3 tracking-widest">Sort By</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'CARBON_ASC', label: 'Lowest Carbon', icon: Leaf },
                                { id: 'PRICE_ASC', label: 'Lowest Price', icon: DollarSign },
                                { id: 'DISTANCE_ASC', label: 'Nearest Origin', icon: MapPin },
                                { id: 'PRICE_DESC', label: 'Highest Price', icon: ArrowUpDown },
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => onFilterChange({ sort: option.id as SortOption })}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2.5 text-[10px] rounded-md border transition-all text-left",
                                        filters.sort === option.id
                                            ? "bg-primary/5 text-foreground border-primary/20"
                                            : "bg-background border-border text-muted-foreground hover:border-foreground/30"
                                    )}
                                >
                                    <option.icon size={12} />
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Classification */}
                    <section>
                        <h3 className="text-[10px] font-bold uppercase text-muted-foreground mb-3 tracking-widest">Classification</h3>
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={cn(
                                    "w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors",
                                    filters.classification === 'ALL' ? "border-foreground bg-foreground" : "border-muted-foreground group-hover:border-foreground"
                                )}>
                                    {filters.classification === 'ALL' && <div className="w-1 h-1 bg-background rounded-full" />}
                                </div>
                                <span className={cn("text-xs", filters.classification === 'ALL' ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground")}>
                                    All Categories
                                </span>
                                <input type="radio" className="hidden" checked={filters.classification === 'ALL'} onChange={() => onFilterChange({ classification: 'ALL' })} />
                            </label>

                            {Object.values(Classification).map((cls) => (
                                <label key={cls} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={cn(
                                        "w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors",
                                        filters.classification === cls ? "border-foreground bg-foreground" : "border-muted-foreground group-hover:border-foreground"
                                    )}>
                                        {filters.classification === cls && <div className="w-1 h-1 bg-background rounded-full" />}
                                    </div>
                                    <span className={cn("text-xs capitalize", filters.classification === cls ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground")}>
                                        {cls.replace('_', ' ').toLowerCase()}
                                    </span>
                                    <input type="radio" className="hidden" checked={filters.classification === cls} onChange={() => onFilterChange({ classification: cls })} />
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Health */}
                    <section>
                        <h3 className="text-[10px] font-bold uppercase text-muted-foreground mb-3 tracking-widest">Health</h3>
                        <button
                            onClick={() => onFilterChange({ health: filters.health === 'Red_List_Free' ? 'ALL' : 'Red_List_Free' })}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-3 text-xs border rounded-md transition-all",
                                filters.health === 'Red_List_Free'
                                    ? "bg-green-500/5 border-green-500/20 text-green-700"
                                    : "bg-background border-border text-muted-foreground hover:border-foreground/30"
                            )}
                        >
                            <CheckCircle2 size={14} className={filters.health === 'Red_List_Free' ? "text-green-600" : "text-muted-foreground"} />
                            <span className="font-medium">Red List Free Only</span>
                        </button>
                    </section>
                </div>

                {/* Footer Section */}
                <div className="flex-none p-4 border-t border-border bg-muted/10 space-y-4">

                    {/* Reset Button */}
                    <button
                        onClick={() => onFilterChange({ search: '', classification: 'ALL', health: 'ALL', sort: 'CARBON_ASC', mode: 'card' })}
                        className="w-full py-2.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground border border-transparent hover:border-border rounded-md transition-all"
                    >
                        Reset Filters
                    </button>

                    {/* DATA CITATION - Single Line */}
                    <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-center gap-1 text-[9px] text-muted-foreground/60">
                        <span>Data based on</span>
                        <a
                            href="https://materialcultures.org/2024-building-skills-report"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-0.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <span className="hover:underline decoration-dotted underline-offset-2">Material Cultures Study (2024)</span>
                            <ExternalLink size={9} className="opacity-50 group-hover:opacity-100" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}