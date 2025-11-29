'use client'

import { ReactNode } from "react"
import {
    Search,
    ChevronsRight,
    ArrowUpDown,
    Leaf,
    DollarSign,
    MapPin,
    CheckCircle2,
    LayoutGrid,
    Image as ImageIcon,
    ExternalLink,
    History,
    Hourglass,
    ListFilter,
    Box,
    X,
    Terminal,
    Recycle,
    Thermometer,
    Globe
} from "lucide-react"
import { cn } from '@/lib/utils'
import { SortOption } from "@/types/materials-filters"
import { Classification } from "@/types/material-passport"
import { PhaseSelector } from "@/components/dashboard/phases/phase-selector"
import { useAppStore } from "@/lib/store"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const getSortLabel = (sort: SortOption) => {
    switch (sort) {
        case 'VOLUME_DESC': return { label: 'HIGH VOLUME', icon: Box }
        case 'CARBON_ASC': return { label: 'LOW CARBON', icon: Leaf }
        case 'PRICE_ASC': return { label: 'LOW PRICE', icon: DollarSign }
        case 'AGE_DESC': return { label: 'OLDEST', icon: History }
        case 'AGE_ASC': return { label: 'NEWEST', icon: Hourglass }
        case 'DISTANCE_ASC': return { label: 'NEAREST', icon: MapPin }
        case 'CIRCULARITY_DESC': return { label: 'DETACHABILITY', icon: Recycle }
        case 'THERMAL_ASC': return { label: 'INSULATION', icon: Thermometer }
        default: return { label: 'SORT', icon: ArrowUpDown }
    }
}

interface MaterialsDashboardProps {
    totalCount: number
    planningContent?: ReactNode // <--- NEW PROP to inject calculator
}

export function MaterialsDashboard({ totalCount, planningContent }: MaterialsDashboardProps) {
    const {
        filters,
        viewMode,
        isPanelCollapsed
    } = useAppStore(state => state.materialsUI)

    const {
        updateMaterialFilters,
        setMaterialViewMode,
        setMaterialPanelCollapsed
    } = useAppStore()

    const activeSort = getSortLabel(filters.sort)

    const activeFiltersCount =
        filters.classification.length +
        filters.endOfLife.length +
        (filters.origin !== 'ALL' ? 1 : 0) +
        (filters.health !== 'ALL' ? 1 : 0) +
        (filters.onlyLocal ? 1 : 0);

    // Filter Handlers
    const toggleClassification = (cls: string) => {
        const current = filters.classification
        const next = current.includes(cls) ? current.filter(c => c !== cls) : [...current, cls]
        updateMaterialFilters({ classification: next })
    }

    const toggleEndOfLife = (eol: string) => {
        const current = filters.endOfLife
        const next = current.includes(eol) ? current.filter(e => e !== eol) : [...current, eol]
        updateMaterialFilters({ endOfLife: next })
    }

    const handleClearFilters = () => {
        updateMaterialFilters({
            classification: [],
            endOfLife: [],
            health: 'ALL',
            origin: 'ALL',
            onlyLocal: false,
            search: ''
        })
    }

    return (
        <div
            className={cn(
                'absolute right-0 top-0 h-full flex flex-col transition-all duration-300 ease-linear',
                'bg-background shadow-none rounded-none',
                isPanelCollapsed
                    ? 'w-12 cursor-pointer hover:bg-muted items-center justify-start pt-4'
                    : 'w-full'
            )}
            onClick={(e) => {
                if (isPanelCollapsed) {
                    e.stopPropagation()
                    setMaterialPanelCollapsed(false)
                }
            }}
        >
            {isPanelCollapsed && <Terminal className="w-5 h-5 text-primary" />}

            <div className={cn("flex flex-col h-full w-full transition-all duration-300", isPanelCollapsed ? "hidden" : "flex")}>

                {/* --- 1. HEADER (Tabs) --- */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/10 bg-muted/20 shrink-0">
                    <div className="flex items-center gap-0 border border-foreground/10 bg-background">
                        <button
                            onClick={() => setMaterialViewMode('BANK')}
                            className={cn(
                                "px-4 py-1.5 text-[10px] font-mono font-bold uppercase transition-colors rounded-none",
                                viewMode === 'BANK' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            BANK
                        </button>
                        <div className="w-px h-3 bg-foreground/10" />
                        <button
                            onClick={() => setMaterialViewMode('PLANNING')}
                            className={cn(
                                "px-4 py-1.5 text-[10px] font-mono font-bold uppercase transition-colors rounded-none",
                                viewMode === 'PLANNING' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            PLAN
                        </button>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-none text-muted-foreground hover:text-foreground hover:bg-transparent"
                        onClick={(e) => { e.stopPropagation(); setMaterialPanelCollapsed(true); }}
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* --- 2. SEARCH (Always Visible) --- */}
                <div className="px-4 py-4 bg-background shrink-0">
                    <div className="relative group flex items-center">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-muted-foreground">
                            <Search className="h-3.5 w-3.5" />
                        </div>
                        <input
                            type="text"
                            placeholder={viewMode === 'PLANNING' ? "SEARCH TO ADD..." : "SEARCH DATABASE..."}
                            className="w-full pl-9 pr-12 py-2 text-[10px] font-mono bg-muted/30 border-b border-foreground/20 focus:outline-none focus:border-primary focus:bg-muted/50 transition-all placeholder:text-muted-foreground/60 uppercase rounded-none"
                            value={filters.search}
                            onChange={(e) => updateMaterialFilters({ search: e.target.value })}
                        />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full flex items-center px-2 border-b border-transparent">
                            <span className="text-[9px] font-mono font-bold text-muted-foreground">[{totalCount.toString().padStart(3, '0')}]</span>
                        </div>
                    </div>
                </div>

                {/* --- 3. TOOLBAR (Sort/Filter - Always Visible) --- */}
                <div className="px-4 pb-4 flex items-center gap-2 border-b border-foreground/5 shrink-0">

                    {/* SORT MENU */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 justify-between h-8 text-[10px] font-mono uppercase rounded-none border-foreground/20 hover:bg-muted">
                                <span className="flex items-center gap-2"><activeSort.icon className="w-3 h-3 opacity-70" />{activeSort.label}</span>
                                <ArrowUpDown className="w-3 h-3 opacity-40 ml-1" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px] rounded-none border-foreground/10">
                            <DropdownMenuLabel className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Parameters</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-foreground/10" />
                            <DropdownMenuRadioGroup value={filters.sort} onValueChange={(v) => updateMaterialFilters({ sort: v as SortOption })}>
                                <DropdownMenuRadioItem value="VOLUME_DESC" className="rounded-none text-[10px] font-mono uppercase cursor-pointer"><Box className="w-3 h-3 mr-2" /> High Volume</DropdownMenuRadioItem>
                                <DropdownMenuSeparator className="bg-foreground/10" />
                                <DropdownMenuRadioItem value="CARBON_ASC" className="rounded-none text-[10px] font-mono uppercase cursor-pointer"><Leaf className="w-3 h-3 mr-2" /> Low Carbon</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="PRICE_ASC" className="rounded-none text-[10px] font-mono uppercase cursor-pointer"><DollarSign className="w-3 h-3 mr-2" /> Low Price</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="CIRCULARITY_DESC" className="rounded-none text-[10px] font-mono uppercase cursor-pointer"><Recycle className="w-3 h-3 mr-2" /> High Detachability</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="THERMAL_ASC" className="rounded-none text-[10px] font-mono uppercase cursor-pointer"><Thermometer className="w-3 h-3 mr-2" /> Best Insulation</DropdownMenuRadioItem>
                                {viewMode === 'BANK' ? (
                                    <>
                                        <DropdownMenuSeparator className="bg-foreground/10" />
                                        <DropdownMenuRadioItem value="AGE_DESC" className="rounded-none text-[10px] font-mono uppercase cursor-pointer"><History className="w-3 h-3 mr-2" /> Oldest</DropdownMenuRadioItem>
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuSeparator className="bg-foreground/10" />
                                        <DropdownMenuRadioItem value="DISTANCE_ASC" className="rounded-none text-[10px] font-mono uppercase cursor-pointer"><MapPin className="w-3 h-3 mr-2" /> Nearest</DropdownMenuRadioItem>
                                    </>
                                )}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* FILTER MENU */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={activeFiltersCount > 0 ? "default" : "outline"} size="sm" className={cn("h-8 px-3 text-[10px] font-mono uppercase rounded-none border-foreground/20 transition-all", activeFiltersCount > 0 ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")}>
                                <ListFilter className="w-3.5 h-3.5 mr-2" /> Filters {activeFiltersCount > 0 && <span className="ml-1.5 font-bold">({activeFiltersCount})</span>}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[240px] rounded-none border-foreground/10">
                            {/* ... Filter content (Category, Origin, EoL, etc.) same as before ... */}
                            <DropdownMenuLabel className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Properties</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-foreground/10" />
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="text-[10px] font-mono uppercase rounded-none cursor-pointer h-8">
                                    <LayoutGrid className="w-3 h-3 mr-2 opacity-70" /> Category
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent className="w-[180px] rounded-none border-foreground/10 bg-background p-1">
                                        {Object.values(Classification).map((cls) => (
                                            <DropdownMenuCheckboxItem
                                                key={cls}
                                                checked={filters.classification.includes(cls)}
                                                onCheckedChange={() => toggleClassification(cls)}
                                                onSelect={(e) => e.preventDefault()}
                                                className="rounded-none text-[10px] font-mono uppercase cursor-pointer"
                                            >
                                                {cls.replace('_', ' ')}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                            {/* ... (Other Filter Submenus: Origin, EoL, RedList, Local) ... */}
                            {activeFiltersCount > 0 && (
                                <>
                                    <DropdownMenuSeparator className="bg-foreground/10" />
                                    <DropdownMenuItem className="text-[10px] font-mono uppercase justify-center text-muted-foreground hover:text-foreground rounded-none cursor-pointer h-8" onClick={handleClearFilters}>
                                        Clear Selection
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* VIEW MODE TOGGLE */}
                    <div className="flex border border-foreground/20 bg-background h-8">
                        <button onClick={() => updateMaterialFilters({ mode: 'card' })} className={cn("w-8 flex items-center justify-center transition-colors border-r border-foreground/10", filters.mode === 'card' ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted")}><LayoutGrid size={12} /></button>
                        <button onClick={() => updateMaterialFilters({ mode: 'thumbnail' })} className={cn("w-8 flex items-center justify-center transition-colors", filters.mode === 'thumbnail' ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted")}><ImageIcon size={12} /></button>
                    </div>
                </div>

                {/* --- 4. CONTENT AREA (Swappable) --- */}
                {/* If Planning: Show Calculator
                    If Bank: Show Timeline & Tags
                */}
                <div className="flex-1 overflow-hidden flex flex-col bg-background relative">
                    {viewMode === 'PLANNING' ? (
                        <div className="flex-1 h-full w-full">
                            {planningContent}
                        </div>
                    ) : (
                        // BANK MODE CONTENT (Scrollable)
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
                            <section>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-1 bg-primary" />
                                    <h3 className="text-[9px] font-mono font-bold uppercase text-muted-foreground tracking-widest">Timeline_Sequence</h3>
                                </div>
                                <div className="border border-foreground/10 bg-muted/5">
                                    <PhaseSelector />
                                </div>
                            </section>

                            {/* ACTIVE TAGS */}
                            {activeFiltersCount > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {filters.classification.map(cls => (
                                        <div key={cls} className="flex items-center gap-1 pl-2 pr-1 py-1 bg-muted border border-foreground/10 text-[9px] font-mono font-bold uppercase text-foreground">
                                            {cls.replace('_', ' ')}<button onClick={() => toggleClassification(cls)} className="hover:text-primary"><X size={10} /></button>
                                        </div>
                                    ))}
                                    {filters.endOfLife.map(eol => (
                                        <div key={eol} className="flex items-center gap-1 pl-2 pr-1 py-1 bg-blue-500/10 border border-blue-500/20 text-[9px] font-mono font-bold uppercase text-blue-700">
                                            {eol.replace('_', ' ')}<button onClick={() => toggleEndOfLife(eol)} className="hover:text-primary"><X size={10} /></button>
                                        </div>
                                    ))}
                                    {filters.onlyLocal && (
                                        <div className="flex items-center gap-1 pl-2 pr-1 py-1 bg-blue-500/10 border border-blue-500/20 text-[9px] font-mono font-bold uppercase text-blue-700">
                                            Ecoregional<button onClick={() => updateMaterialFilters({ onlyLocal: false })} className="hover:text-primary"><X size={10} /></button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- 5. FOOTER (Only in Bank Mode) --- */}
                {/* In Planning Mode, the calculator has its own totals footer */}
                {viewMode === 'BANK' && (
                    <div className={cn("flex-none px-4 py-2 border-t border-foreground/10 bg-muted/10 shrink-0", isPanelCollapsed && "hidden")}>
                        <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground">
                            <a
                                href="https://materialcultures.org/2024-building-skills-report"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-foreground transition-colors hover:underline decoration-1 underline-offset-2"
                            >
                                DATA BASED ON: Material Cultures Report_2024
                                <ExternalLink size={8} />
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}