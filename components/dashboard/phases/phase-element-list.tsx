'use client'

import React, { useState, useMemo, memo, useCallback, useEffect, useRef } from 'react' // Added useRef
import { useAppStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/lib/utils'
import {
  Search, ChevronRight, Package, Box, Check, Filter,
  BrickWall, DoorOpen, Layers, Triangle, Armchair, Columns,
  Cable, Lightbulb, Fan, Droplet, Mountain, Component, Footprints, Fence,
  Square, RectangleVertical, Briefcase, PenTool, Ruler, Zap, Flower2,
  Grid3x3, Grid2x2, LucideIcon
} from 'lucide-react'

// --- 0. Local Fallback Component ---
const EmptyFilterState = () => (
  <div className="flex flex-col items-center justify-center py-8 text-center px-4">
    <div className="bg-muted/50 p-3 rounded-full mb-3">
      <Filter className="h-5 w-5 text-muted-foreground/50" />
    </div>
    <p className="text-xs font-medium text-foreground">No elements found</p>
    <p className="text-[10px] text-muted-foreground mt-1 max-w-[180px]">
      Try adjusting your material filters or search terms.
    </p>
  </div>
)

// --- 1. Constants & Icons ---
const ICON_MAP: Record<string, LucideIcon> = {
  'Walls': BrickWall, 'Curtain Walls': Grid3x3, 'Doors': DoorOpen, 'Windows': Grid2x2,
  'Floors': Layers, 'Roofs': Triangle, 'Ceilings': Layers, 'Stairs': Footprints,
  'Railings': Fence, 'Ramps': Triangle, 'Columns': Columns, 'Furniture': Armchair,
  'Furniture Systems': Armchair, 'Casework': Briefcase, 'Specialty Equipment': Component,
  'Structural Columns': RectangleVertical, 'Structural Framing': Component,
  'Structural Foundations': Box, 'Ducts': Fan, 'Mechanical Equipment': Fan,
  'Pipes': Cable, 'Plumbing Fixtures': Droplet, 'Electrical Fixtures': Zap,
  'Lighting Fixtures': Lightbulb, 'Topography': Mountain, 'Planting': Flower2,
  'Rooms': Square, 'Areas': Square, 'Text Notes': PenTool, 'Dimensions': Ruler,
}

const getIcon = (category: string) => ICON_MAP[category] || Object.values(ICON_MAP).find((_, i) => category.includes(Object.keys(ICON_MAP)[i])) || Box

// --- 2. Types ---
type ElementStatus = 'created' | 'demolished' | 'existing'

interface TreeStats {
  added: number
  removed: number
}

interface VirtualItem {
  id: string
  type: 'category' | 'group' | 'element'
  label: string
  count?: number
  stats?: TreeStats
  depth: number
  data?: any
  isExpanded?: boolean
  isSelected?: boolean
  isDimmed?: boolean
}

// --- 3. Custom Hook: Data Processing ---
const useElementTree = () => {
  const {
    modelElements, selectedElementIds, filters, phases, searchTerm,
    getFilteredElementIds
  } = useAppStore(useShallow(state => ({
    modelElements: state.modelElements,
    selectedElementIds: state.selectedElementIds,
    filters: state.filters,
    phases: state.phases,
    searchTerm: state.searchTerm,
    getFilteredElementIds: state.getFilteredElementIds,
  })))

  const activeIds = useMemo(() => {
    const filtered = getFilteredElementIds({ skipSelectionFilters: true })
    if (filtered) return filtered
    return new Set(modelElements.map(e => e.id).filter(Boolean) as string[])
  }, [
    getFilteredElementIds,
    modelElements,
    phases.selectedPhase,
    phases.filterMode,
    searchTerm,
    filters.materials,
  ])

  const hierarchy = useMemo(() => {
    const structure = new Map<string, Map<string, any[]>>()
    const catStats = new Map<string, TreeStats>()
    const grpStats = new Map<string, TreeStats>()

    const getStatus = (id: string): ElementStatus => {
      if (!phases.dataTree || !phases.selectedPhase) return 'existing'
      const p = phases.dataTree.elementsByPhase[phases.selectedPhase]
      if (p?.created.has(id)) return 'created'
      if (p?.demolished.has(id)) return 'demolished'
      return 'existing'
    }

    modelElements.forEach(el => {
      if (!el.id || !activeIds.has(el.id)) return

      const category = el.category || "Uncategorized"
      const name = el.name || "Unnamed"
      const status = getStatus(el.id)

      if (['Lines', '<Room Separation>', 'Toposolid'].includes(category)) return

      if (!structure.has(category)) structure.set(category, new Map())
      const groupMap = structure.get(category)!
      if (!groupMap.has(name)) groupMap.set(name, [])
      groupMap.get(name)!.push({ ...el, __status: status })

      const isAdd = status === 'created' ? 1 : 0
      const isRem = status === 'demolished' ? 1 : 0

      const cStat = catStats.get(category) || { added: 0, removed: 0 }
      catStats.set(category, { added: cStat.added + isAdd, removed: cStat.removed + isRem })

      const gKey = `${category}::${name}`
      const gStat = grpStats.get(gKey) || { added: 0, removed: 0 }
      grpStats.set(gKey, { added: gStat.added + isAdd, removed: gStat.removed + isRem })
    })

    return { structure, catStats, grpStats }
  }, [modelElements, activeIds, phases.dataTree, phases.selectedPhase])

  return { hierarchy, activeIds }
}

// --- 4. Sub-Components ---
const DiffBadge = memo(({ stats }: { stats?: TreeStats }) => {
  if (!stats || (stats.added === 0 && stats.removed === 0)) return null
  return (
    <div className="flex items-center gap-1 text-[9px] font-mono font-medium">
      {stats.added > 0 && <span className="text-green-600 bg-green-500/10 px-1 rounded">+{stats.added}</span>}
      {stats.removed > 0 && <span className="text-red-600 bg-red-500/10 px-1 rounded">-{stats.removed}</span>}
    </div>
  )
})
DiffBadge.displayName = 'DiffBadge'

const CategoryRow = memo(({ item, onSelect, onExpand, onHover, style }: any) => {
  const Icon = getIcon(item.label)
  return (
    <div style={style} className="px-2 w-full flex items-center group/row">
      <button
        onClick={(e) => { e.stopPropagation(); onExpand() }}
        className="h-[30px] w-[24px] flex items-center justify-center hover:bg-muted/50 rounded-l-md transition-colors text-muted-foreground hover:text-foreground"
      >
        <div className={cn("transition-transform duration-200", item.isExpanded && "rotate-90")}>
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </button>
      <button
        onClick={onSelect}
        onMouseEnter={() => onHover(item.data.ids)}
        onMouseLeave={() => onHover(null)}
        className={cn(
          "flex-1 h-[30px] flex items-center gap-2 pr-2 rounded-r-md transition-all border-y border-r border-l-0 select-none",
          item.isSelected ? "bg-primary/10 border-primary/20" : "bg-transparent border-transparent hover:bg-muted/50",
          item.isDimmed && "opacity-40 grayscale hover:opacity-70 hover:grayscale-0"
        )}
      >
        <div className={cn(
          "w-4 h-4 rounded-full border flex items-center justify-center transition-colors ml-1",
          item.isSelected ? "bg-primary border-primary" : "border-muted-foreground/30 group-hover/row:border-muted-foreground/60"
        )}>
          {item.isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
        </div>
        <Icon className={cn("h-3.5 w-3.5", item.isSelected ? "text-primary" : "text-muted-foreground")} />
        <span className="flex-1 text-left text-[12px] font-medium truncate">{item.label}</span>
        <DiffBadge stats={item.stats} />
        <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 rounded-sm">{item.count}</span>
      </button>
    </div>
  )
})
CategoryRow.displayName = 'CategoryRow'

const GroupRow = memo(({ item, onSelect, onExpand, onHover, style }: any) => {
  return (
    <div style={style} className="px-2 w-full flex items-center group/row">
      <div className="h-[30px] w-[32px] flex items-center justify-end relative shrink-0">
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border/40" />
        <button
          onClick={(e) => { e.stopPropagation(); onExpand() }}
          className="w-[24px] h-[24px] flex items-center justify-center hover:bg-muted/50 rounded z-10 mr-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className={cn("h-3 w-3 transition-transform duration-200", item.isExpanded && "rotate-90")} />
        </button>
      </div>
      <button
        onClick={onSelect}
        onMouseEnter={() => onHover(item.data.ids)}
        onMouseLeave={() => onHover(null)}
        className={cn(
          "flex-1 h-[30px] flex items-center gap-2 pr-2 rounded-md transition-all border select-none",
          item.isSelected ? "bg-primary/10 border-primary/20" : "bg-transparent border-transparent hover:bg-muted/50",
          item.isDimmed && "opacity-40 grayscale hover:opacity-70 hover:grayscale-0"
        )}
      >
        <div className={cn(
          "w-3 h-3 rounded-full border flex items-center justify-center transition-colors ml-0.5",
          item.isSelected ? "bg-primary border-primary" : "border-muted-foreground/30 group-hover/row:border-muted-foreground/60"
        )}>
          {item.isSelected && <Check className="w-2 h-2 text-primary-foreground" />}
        </div>
        <Package className="h-3 w-3 text-muted-foreground/50" />
        <span className="flex-1 text-left text-[11px] font-mono text-muted-foreground truncate">{item.label}</span>
        <DiffBadge stats={item.stats} />
        <span className="text-[9px] text-muted-foreground/50">{item.count}</span>
      </button>
    </div>
  )
})
GroupRow.displayName = 'GroupRow'

const ElementRow = memo(({ item, onClick, onHover, style }: any) => {
  const status = item.data.status
  return (
    <div style={style} className="px-2 w-full flex items-center">
      <div className="w-full h-full flex items-center relative pl-12">
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border/40" />
        <div className="absolute left-[19px] top-1/2 w-2 h-px bg-border/40" />

        <button
          onClick={onClick}
          onMouseEnter={() => onHover([item.id])}
          onMouseLeave={() => onHover(null)}
          className={cn(
            "w-full h-[30px] flex items-center gap-2 px-2 rounded-md transition-all group relative border border-transparent select-none",
            item.isSelected ? "bg-primary/10 text-primary border-primary/20" : "hover:bg-muted",
            !item.isSelected && status === 'created' && "bg-green-500/5 hover:bg-green-500/10 text-green-700",
            !item.isSelected && status === 'demolished' && "bg-red-500/5 hover:bg-red-500/10 text-red-700 line-through opacity-70",
          )}
        >
          <div className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            status === 'created' ? "bg-green-500" :
              status === 'demolished' ? "bg-red-500" : "bg-slate-300"
          )} />
          <span className="flex-1 text-left text-[11px] truncate font-mono tracking-tight">
            {item.label}
          </span>
          {item.isSelected && <Check className="w-3 h-3 ml-auto opacity-50" />}
        </button>
      </div>
    </div>
  )
})
ElementRow.displayName = 'ElementRow'

// --- 5. Main Component ---

export function PhaseElementList() {
  const {
    filters, toggleCategoryFilter, setCategoryFilter,
    toggleElementNameFilter, setElementNameFilter,
    setSelectedElement, setHoveredElementIds, toggleElementSelection,
    setHighlights, clearHighlights,
    searchTerm, setSearchTerm,
    selectedElementIds, modelElements
  } = useAppStore()

  const { hierarchy, activeIds } = useElementTree()
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set())
  const [expandedGrps, setExpandedGrps] = useState<Set<string>>(new Set())
  const [scrollTop, setScrollTop] = useState(0)

  // NEW: Scroll Ref and "Pending" state for the 2-step scroll process
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null)

  // --- Step 1: Detect New Selection ---
  useEffect(() => {
    if (selectedElementIds.length > 0) {
      // Get the latest selected item (the last one in the array)
      const latestId = selectedElementIds[selectedElementIds.length - 1]
      setPendingScrollId(latestId)
    }
  }, [selectedElementIds])

  // --- AUTO-EXPAND / AUTO-COLLAPSE LOGIC ---
  useEffect(() => {
    const hasSearch = searchTerm.length > 0
    const hasSelection = selectedElementIds.length > 0
    const hasMaterialFilter = filters.materials.length > 0

    if (!hasSearch && !hasSelection && !hasMaterialFilter) {
      setExpandedCats(prev => prev.size > 0 ? new Set() : prev)
      setExpandedGrps(prev => prev.size > 0 ? new Set() : prev)
      return
    }

    if (hasSearch) {
      const c = new Set<string>()
      const g = new Set<string>()
      Array.from(hierarchy.structure.keys()).forEach(cat => {
        c.add(cat)
        hierarchy.structure.get(cat)?.forEach((_, grpName) => {
          g.add(`grp-${cat}-${grpName}`)
        })
      })
      setExpandedCats(c); setExpandedGrps(g)
      return
    }

    if (hasSelection) {
      const c = new Set<string>(expandedCats)
      const g = new Set<string>(expandedGrps)
      let changed = false

      selectedElementIds.forEach(id => {
        const el = modelElements.find(e => e.id === id)
        if (el && activeIds.has(el.id)) {
          const cat = el.category || "Uncategorized"
          if (!c.has(cat)) { c.add(cat); changed = true }
          const gKey = `grp-${cat}-${el.name}`
          if (!g.has(gKey)) { g.add(gKey); changed = true }
        }
      })
      if (changed) { setExpandedCats(c); setExpandedGrps(g) }
    }
  }, [searchTerm, selectedElementIds, filters.materials, activeIds, hierarchy])

  const handleExpand = useCallback((type: 'category' | 'group', id: string) => {
    if (type === 'category') {
      setExpandedCats(prev => {
        const next = new Set(prev)
        next.has(id) ? next.delete(id) : next.add(id)
        return next
      })
    } else {
      setExpandedGrps(prev => {
        const next = new Set(prev)
        next.has(id) ? next.delete(id) : next.add(id)
        return next
      })
    }
  }, [])

  const handleCategorySelect = useCallback((cat: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const isMulti = e.ctrlKey || e.metaKey
    const isSelected = filters.categories.includes(cat)

    if (isMulti) {
      toggleCategoryFilter(cat)
      const next = isSelected ? filters.categories.filter(c => c !== cat) : [...filters.categories, cat]
      setHighlights({ type: 'category', values: next })
    } else {
      if (isSelected && filters.categories.length === 1) {
        setCategoryFilter(null)
        clearHighlights()
      } else {
        setCategoryFilter(cat)
        setHighlights({ type: 'category', values: [cat] })
      }
    }
  }, [filters, toggleCategoryFilter, setCategoryFilter, setHighlights, clearHighlights])

  const handleGroupSelect = useCallback((grpName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const isMulti = e.ctrlKey || e.metaKey
    const isSelected = filters.elementNames.includes(grpName)

    if (isMulti) {
      toggleElementNameFilter(grpName)
      const next = isSelected ? filters.elementNames.filter(n => n !== grpName) : [...filters.elementNames, grpName]
      setHighlights({ type: 'element', values: next })
    } else {
      if (isSelected && filters.elementNames.length === 1) {
        setElementNameFilter(null)
        clearHighlights()
      } else {
        setElementNameFilter(grpName)
        setHighlights({ type: 'element', values: [grpName] })
      }
    }
  }, [filters, toggleElementNameFilter, setElementNameFilter, setHighlights, clearHighlights])

  // --- Virtualization Flattening ---
  const flatItems = useMemo(() => {
    const items: VirtualItem[] = []

    const sortedCats = Array.from(hierarchy.structure.keys()).sort((a, b) => {
      const sA = hierarchy.catStats.get(a), sB = hierarchy.catStats.get(b)
      const hasDiffA = (sA?.added || 0) + (sA?.removed || 0) > 0
      const hasDiffB = (sB?.added || 0) + (sB?.removed || 0) > 0
      if (hasDiffA !== hasDiffB) return hasDiffA ? -1 : 1
      return a.localeCompare(b)
    })

    sortedCats.forEach(cat => {
      const groups = hierarchy.structure.get(cat)!
      const cStats = hierarchy.catStats.get(cat)
      const allIds = Array.from(groups.values()).flat().map(e => e.id)

      const isCatSelected = filters.categories.includes(cat)
      const isAnyCatFilter = filters.categories.length > 0

      items.push({
        id: `cat-${cat}`, type: 'category', label: cat, depth: 0,
        count: allIds.length, stats: cStats,
        isExpanded: expandedCats.has(cat),
        isSelected: isCatSelected,
        isDimmed: isAnyCatFilter && !isCatSelected,
        data: { ids: allIds }
      })

      if (expandedCats.has(cat)) {
        const sortedGrps = Array.from(groups.keys()).sort((a, b) => {
          const keyA = `${cat}::${a}`, keyB = `${cat}::${b}`
          const sA = hierarchy.grpStats.get(keyA), sB = hierarchy.grpStats.get(keyB)
          const diffA = (sA?.added || 0) + (sA?.removed || 0)
          const diffB = (sB?.added || 0) + (sB?.removed || 0)
          if ((diffA > 0) !== (diffB > 0)) return diffA > 0 ? -1 : 1
          return a.localeCompare(b)
        })

        sortedGrps.forEach(grp => {
          const elements = groups.get(grp)!
          const gKey = `grp-${cat}-${grp}`
          const gStats = hierarchy.grpStats.get(`${cat}::${grp}`)
          const isGrpSelected = filters.elementNames.includes(grp)
          const isAnyGrpFilter = filters.elementNames.length > 0

          items.push({
            id: gKey, type: 'group', label: grp, depth: 1,
            count: elements.length, stats: gStats,
            isExpanded: expandedGrps.has(gKey),
            isSelected: isGrpSelected,
            isDimmed: isAnyGrpFilter && !isGrpSelected,
            data: { ids: elements.map(e => e.id), realName: grp }
          })

          if (expandedGrps.has(gKey)) {
            elements.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
            elements.forEach(el => {
              items.push({
                id: el.id, type: 'element', label: el.name || "Unnamed", depth: 2,
                data: { status: el.__status },
                isSelected: selectedElementIds.includes(el.id)
              })
            })
          }
        })
      }
    })
    return items
  }, [hierarchy, expandedCats, expandedGrps, filters, selectedElementIds])

  // --- Step 2: Scroll Action ---
  const ROW_HEIGHT = 30
  const CONTAINER_H = 600

  useEffect(() => {
    // Only proceed if we have a pending scroll target AND the list data is ready
    if (pendingScrollId && scrollContainerRef.current) {
      const index = flatItems.findIndex(item => item.id === pendingScrollId)

      if (index !== -1) {
        // Calculate position to center the item in the view
        const targetTop = (index * ROW_HEIGHT) - (CONTAINER_H / 2) + (ROW_HEIGHT / 2)

        scrollContainerRef.current.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        })

        // Clear the pending state so we don't scroll again on next render
        setPendingScrollId(null)
      }
    }
  }, [flatItems, pendingScrollId]) // Re-run when flatItems updates (post-expansion)

  // --- Rendering ---
  const visibleCount = Math.ceil(CONTAINER_H / ROW_HEIGHT) + 5
  const startIndex = Math.floor(scrollTop / ROW_HEIGHT)
  const endIndex = Math.min(flatItems.length, startIndex + visibleCount)
  const visibleItems = flatItems.slice(Math.max(0, startIndex - 2), endIndex)

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <div className="p-3 border-b sticky top-0 bg-background z-20">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            className="w-full h-8 pl-8 pr-3 text-xs bg-muted/40 border border-transparent focus:border-primary/50 focus:bg-background rounded-md outline-none transition-all placeholder:text-muted-foreground/70"
            placeholder="Search elements..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar"
        onScroll={e => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div style={{ height: flatItems.length * ROW_HEIGHT, position: 'relative' }}>
          {visibleItems.length > 0 ? visibleItems.map((item, i) => {
            const top = (Math.max(0, startIndex - 2) + i) * ROW_HEIGHT

            if (item.type === 'category') {
              return <CategoryRow
                key={item.id} item={item} style={{ position: 'absolute', top, height: ROW_HEIGHT }}
                onExpand={() => handleExpand('category', item.label)}
                onSelect={(e: React.MouseEvent) => handleCategorySelect(item.label, e)}
                onHover={setHoveredElementIds}
              />
            } else if (item.type === 'group') {
              return <GroupRow
                key={item.id} item={item} style={{ position: 'absolute', top, height: ROW_HEIGHT }}
                onExpand={() => handleExpand('group', item.id)}
                onSelect={(e: React.MouseEvent) => handleGroupSelect(item.data.realName, e)}
                onHover={setHoveredElementIds}
              />
            } else {
              return <ElementRow
                key={item.id} item={item} style={{ position: 'absolute', top, height: ROW_HEIGHT }}
                onClick={(e: React.MouseEvent) => {
                  const isMulti = e.ctrlKey || e.metaKey
                  if (isMulti) {
                    toggleElementSelection(item.id, item.data)
                  } else {
                    setSelectedElement(item.id, undefined)
                  }
                }}
                onHover={setHoveredElementIds}
              />
            }
          }) : (
            <EmptyFilterState />
          )}
        </div>
      </div>
    </div>
  )
}