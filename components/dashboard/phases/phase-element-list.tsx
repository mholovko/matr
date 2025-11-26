'use client'

import { useAppStore } from '@/lib/store'
import { useState, useMemo, memo, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Search,
  ChevronRight,
  ChevronDown,
  Package,
  // Architecture Icons
  BrickWall, DoorOpen, Layers, Triangle, Armchair, Box, Columns,
  Cable, Lightbulb, Fan, Droplet, Mountain, Component, Footprints, Fence,
  Square, RectangleVertical, Briefcase, PenTool, Ruler, Zap, Flower2, Car,
  Grid3x3, Grid2x2, LucideIcon
} from 'lucide-react'

// --- 1. Icon Mapping Utility ---
const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  'Walls': BrickWall, 'Curtain Walls': Grid3x3, 'Doors': DoorOpen, 'Windows': Grid2x2,
  'Floors': Layers, 'Roofs': Triangle, 'Ceilings': Layers, 'Stairs': Footprints,
  'Railings': Fence, 'Ramps': Triangle, 'Columns': Columns, 'Furniture': Armchair,
  'Furniture Systems': Armchair, 'Casework': Briefcase, 'Specialty Equipment': Component,
  'Structural Columns': RectangleVertical, 'Structural Framing': Component,
  'Structural Foundations': Box, 'Ducts': Fan, 'Duct Fittings': Fan,
  'Mechanical Equipment': Fan, 'Pipes': Cable, 'Pipe Fittings': Cable,
  'Plumbing Fixtures': Droplet, 'Sprinklers': Droplet, 'Electrical Fixtures': Zap,
  'Lighting Fixtures': Lightbulb, 'Conduits': Cable, 'Topography': Mountain,
  'Site': Mountain, 'Planting': Flower2, 'Parking': Car, 'Generic Models': Box,
  'Mass': Box, 'Rooms': Square, 'Areas': Square, 'Text Notes': PenTool, 'Dimensions': Ruler,
}

const DefaultIcon = Box

function getCategoryIcon(category: string | undefined): LucideIcon {
  if (!category) return DefaultIcon
  if (CATEGORY_ICON_MAP[category]) return CATEGORY_ICON_MAP[category]
  const normalizedKey = Object.keys(CATEGORY_ICON_MAP).find(key => category.includes(key))
  return normalizedKey ? CATEGORY_ICON_MAP[normalizedKey] : DefaultIcon
}

// --- 2. Types ---

type CategoryItem = {
  type: 'category'
  category: string
  count: number
  added: number
  removed: number
  elementIds: string[]
  id: string
}

type GroupItem = {
  type: 'group'
  name: string
  count: number
  added: number
  removed: number
  elementIds: string[]
  id: string
}

type ElementItem = {
  type: 'element'
  element: any
  id: string
}

type VirtualItem = CategoryItem | GroupItem | ElementItem

// --- 3. Sub-Components ---

// Helper for Diff Stats
const DiffStats = ({ added, removed }: { added: number, removed: number }) => {
  if (added === 0 && removed === 0) return null
  return (
    <div className="flex items-center gap-1.5 text-[9px] font-mono font-medium leading-none">
      {added > 0 && (
        <span className="text-green-600 bg-green-500/10 px-1 py-0.5 rounded">+{added}</span>
      )}
      {removed > 0 && (
        <span className="text-red-600 bg-red-500/10 px-1 py-0.5 rounded">-{removed}</span>
      )}
    </div>
  )
}

// LEVEL 1: Category Header
const CategoryHeaderItem = memo(({
  category, count, added, removed, isExpanded, onClick, onMouseEnter, onMouseLeave, style
}: {
  category: string, count: number, added: number, removed: number, isExpanded: boolean,
  onClick: () => void, onMouseEnter: () => void, onMouseLeave: () => void,
  style: React.CSSProperties
}) => {
  const Icon = getCategoryIcon(category)
  return (
    <div style={style} className="w-full px-2 z-20">
      <button
        onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
        className={cn(
          "w-full h-full flex items-center gap-2 px-2 rounded-md transition-colors select-none group",
          "hover:bg-muted bg-background/80 border border-transparent"
        )}
      >
        <div className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        <Icon size={13} className="text-foreground transition-colors" />

        <span className="flex-1 text-left font-bold text-[11px] uppercase tracking-wider text-foreground truncate">
          {category || "Uncategorized"}
        </span>

        <div className="flex items-center gap-2">
          <DiffStats added={added} removed={removed} />
          <span className="text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
            {count}
          </span>
        </div>
      </button>
    </div>
  )
})
CategoryHeaderItem.displayName = 'CategoryHeaderItem'

// LEVEL 2: Group Header (Name)
const GroupHeaderItem = memo(({
  name, count, added, removed, isExpanded, onClick, onMouseEnter, onMouseLeave, style
}: {
  name: string, count: number, added: number, removed: number, isExpanded: boolean,
  onClick: () => void, onMouseEnter: () => void, onMouseLeave: () => void,
  style: React.CSSProperties
}) => {
  return (
    <div style={style} className="w-full px-2 z-10">
      <button
        onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
        className={cn(
          "w-[calc(100%-12px)] ml-3 h-full flex items-center gap-2 px-2 rounded-md transition-colors select-none group relative",
          "hover:bg-muted bg-muted/30 border border-transparent hover:border-border/50",
          // Vertical Line
          "before:absolute before:-left-3 before:top-0 before:bottom-0 before:w-px before:bg-border/40"
        )}
      >
        <div className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        <Package size={12} className="text-muted-foreground/70 group-hover:text-primary/70 transition-colors" />

        <span className="flex-1 text-left font-mono text-[11px] font-medium text-muted-foreground group-hover:text-foreground truncate transition-colors">
          {name || "Unnamed Group"}
        </span>

        <div className="flex items-center gap-2">
          <DiffStats added={added} removed={removed} />
          <span className="text-[9px] font-mono text-muted-foreground/60">
            {count}
          </span>
        </div>
      </button>
    </div>
  )
})
GroupHeaderItem.displayName = 'GroupHeaderItem'

// LEVEL 3: Element Item
const ElementListItem = memo(({ element, status, onClick, onMouseEnter, onMouseLeave, style }: {
  element: any, status: 'created' | 'demolished' | 'existing',
  onClick: () => void, onMouseEnter?: () => void, onMouseLeave?: () => void,
  style: React.CSSProperties
}) => {
  return (
    <div style={style} className="w-full px-2">
      <button
        onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
        className={cn(
          'w-[calc(100%-36px)] ml-9 h-full text-left flex items-center gap-2 px-2 rounded-md transition-colors group select-none relative',
          status === 'created' && 'hover:bg-green-50/50',
          status === 'demolished' && 'hover:bg-red-50/50',
          status === 'existing' && 'hover:bg-muted',
          // Tree connection lines
          "before:absolute before:-left-3 before:top-1/2 before:w-2 before:h-px before:bg-border/60 before:-translate-y-1/2",
          "after:absolute after:-left-[27px] after:top-0 after:bottom-0 after:w-px after:bg-border/40"
        )}
      >
        <div className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          status === 'created' && 'bg-green-500',
          status === 'demolished' && 'bg-red-500',
          status === 'existing' && 'bg-slate-300'
        )} />
        <span className={cn(
          "truncate flex-1 font-mono text-[11px] tracking-tight text-slate-700 group-hover:text-slate-900",
          status === 'created' && "text-green-700 group-hover:text-green-800",
          status === 'demolished' && "text-red-700 group-hover:text-red-800 line-through decoration-red-300/50 opacity-70"
        )}>
          {element?.name || element?.id}
        </span>
      </button>
    </div>
  )
})
ElementListItem.displayName = 'ElementListItem'

// --- 4. Main Component ---

export function PhaseElementList() {
  const { phases, modelElements, setSelectedElement, searchTerm, setSearchTerm, setHoveredElementIds } = useAppStore()

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const toggleCategory = useCallback((cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev); next.has(cat) ? next.delete(cat) : next.add(cat); return next
    })
  }, [])

  const toggleGroup = useCallback((id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
    })
  }, [])

  const filteredElementIds = useMemo(() => {
    const ids = useAppStore.getState().getFilteredElementIds()
    if (ids === null) return useAppStore.getState().modelElements.map(el => el.id).filter(Boolean) as string[]
    return Array.from(ids)
  }, [phases.selectedPhase, phases.filterMode, phases.dataTree, useAppStore.getState().filters, searchTerm])

  const getElementStatus = useCallback((elementId: string): 'created' | 'demolished' | 'existing' => {
    if (!phases.dataTree || !phases.selectedPhase) return 'existing'
    const phaseData = phases.dataTree.elementsByPhase[phases.selectedPhase]
    if (!phaseData) return 'existing'
    if (phaseData.created.has(elementId)) return 'created'
    if (phaseData.demolished.has(elementId)) return 'demolished'
    return 'existing'
  }, [phases.dataTree, phases.selectedPhase])

  const elementMap = useMemo(() => {
    const map = new Map(); modelElements.forEach((el) => { if (el.id) map.set(el.id, el) }); return map
  }, [modelElements])

  // --- Aggregation & Sorting Logic ---
  const hierarchy = useMemo(() => {
    const IGNORED_CATEGORIES = new Set(['Lines', '<Room Separation>', 'Toposolid'])
    const structure = new Map<string, Map<string, any[]>>()

    // Stat Lookup Maps
    const catStats = new Map<string, { added: number, removed: number }>()
    const grpStats = new Map<string, { added: number, removed: number }>()

    filteredElementIds.forEach(id => {
      const el = elementMap.get(id); if (!el) return
      const category = el.category || "Uncategorized"
      if (IGNORED_CATEGORIES.has(category)) return

      const name = el.name || "Unnamed"

      // 1. Build Structure
      if (!structure.has(category)) structure.set(category, new Map())
      const catGroup = structure.get(category)!
      if (!catGroup.has(name)) catGroup.set(name, [])
      catGroup.get(name)!.push(el)

      // 2. Calculate Stats (Added/Removed)
      const status = getElementStatus(id)
      const isAdded = status === 'created' ? 1 : 0
      const isRemoved = status === 'demolished' ? 1 : 0

      // Update Category Stats
      const cs = catStats.get(category) || { added: 0, removed: 0 }
      cs.added += isAdded
      cs.removed += isRemoved
      catStats.set(category, cs)

      // Update Group Stats (Use composite key to avoid collision between identical names in diff categories)
      const grpKey = `${category}::${name}`
      const gs = grpStats.get(grpKey) || { added: 0, removed: 0 }
      gs.added += isAdded
      gs.removed += isRemoved
      grpStats.set(grpKey, gs)
    })

    // 3. Sort Categories (Changed items first, then alphabetical)
    const sortedCategories = Array.from(structure.keys()).sort((a, b) => {
      const sA = catStats.get(a) || { added: 0, removed: 0 }
      const sB = catStats.get(b) || { added: 0, removed: 0 }
      const changeA = sA.added > 0 || sA.removed > 0
      const changeB = sB.added > 0 || sB.removed > 0

      // Priority: Has Diff > No Diff
      if (changeA && !changeB) return -1
      if (!changeA && changeB) return 1

      // Secondary: Alphabetical
      return a.localeCompare(b)
    })

    return { structure, sortedCategories, catStats, grpStats }
  }, [filteredElementIds, elementMap, getElementStatus])

  // --- Auto-Expand / Collapse Effect ---
  useEffect(() => {
    if (searchTerm && searchTerm.trim().length > 0) {
      const allCats = new Set<string>()
      const allGrps = new Set<string>()
      hierarchy.sortedCategories.forEach(cat => {
        allCats.add(cat)
        const groups = hierarchy.structure.get(cat)
        if (groups) {
          Array.from(groups.keys()).forEach(grpName => allGrps.add(`grp-${cat}-${grpName}`))
        }
      })
      setExpandedCategories(allCats)
      setExpandedGroups(allGrps)
    } else {
      setExpandedCategories(new Set())
      setExpandedGroups(new Set())
    }
  }, [hierarchy, searchTerm])

  // 3. Flattening for Virtualization
  const flatVirtualItems = useMemo(() => {
    const items: VirtualItem[] = []
    const { structure, sortedCategories, catStats, grpStats } = hierarchy

    sortedCategories.forEach(cat => {
      const groupMap = structure.get(cat)!

      // 1. Sort Groups (Changed first, then alphabetical)
      const sortedGroups = Array.from(groupMap.keys()).sort((a, b) => {
        const keyA = `${cat}::${a}`
        const keyB = `${cat}::${b}`
        const sA = grpStats.get(keyA) || { added: 0, removed: 0 }
        const sB = grpStats.get(keyB) || { added: 0, removed: 0 }
        const changeA = sA.added > 0 || sA.removed > 0
        const changeB = sB.added > 0 || sB.removed > 0

        if (changeA && !changeB) return -1
        if (!changeA && changeB) return 1
        return a.localeCompare(b)
      })

      // Collect Element IDs for Category Hover
      const allCatElements: any[] = []
      sortedGroups.forEach(g => allCatElements.push(...groupMap.get(g)!))

      const cStats = catStats.get(cat) || { added: 0, removed: 0 }

      // 2. Push Category Header
      items.push({
        type: 'category',
        category: cat,
        count: allCatElements.length,
        added: cStats.added,
        removed: cStats.removed,
        elementIds: allCatElements.map(e => e.id),
        id: `cat-${cat}`
      })

      if (expandedCategories.has(cat)) {
        sortedGroups.forEach(grpName => {
          const elements = groupMap.get(grpName)!
          const grpKey = `${cat}::${grpName}`
          const gStats = grpStats.get(grpKey) || { added: 0, removed: 0 }

          // Sort Elements inside group (Created/Demo first)
          elements.sort((a, b) => {
            const w = { created: 0, demolished: 1, existing: 2 }
            const sA = getElementStatus(a.id)
            const sB = getElementStatus(b.id)
            return w[sA] - w[sB]
          })

          const groupId = `grp-${cat}-${grpName}`

          // 3. Push Group Header
          items.push({
            type: 'group',
            name: grpName,
            count: elements.length,
            added: gStats.added,
            removed: gStats.removed,
            elementIds: elements.map(e => e.id),
            id: groupId
          })

          if (expandedGroups.has(groupId)) {
            elements.forEach(el => {
              items.push({ type: 'element', element: el, id: el.id })
            })
          }
        })
      }
    })

    return items
  }, [hierarchy, expandedCategories, expandedGroups, getElementStatus])

  // 4. Virtual Scroll
  const ITEM_HEIGHT = 32
  const [scrollTop, setScrollTop] = useState(0)
  const CONTAINER_HEIGHT = 800
  const BUFFER = 5
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER)
    const endIndex = Math.min(flatVirtualItems.length, Math.ceil((scrollTop + CONTAINER_HEIGHT) / ITEM_HEIGHT) + BUFFER)
    return { startIndex, endIndex }
  }, [scrollTop, flatVirtualItems.length])

  const visibleElements = flatVirtualItems.slice(visibleRange.startIndex, visibleRange.endIndex)
  const totalHeight = flatVirtualItems.length * ITEM_HEIGHT

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-3 py-2 border-b border-border bg-background">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 text-[11px] font-mono bg-muted/30 border border-transparent rounded-md focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground placeholder:font-sans"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar" onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleElements.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index
            const style = { position: 'absolute' as const, top: 0, left: 0, transform: `translateY(${actualIndex * ITEM_HEIGHT}px)`, height: ITEM_HEIGHT }

            if (item.type === 'category') {
              return (
                <CategoryHeaderItem
                  key={item.id} category={item.category} count={item.count}
                  added={item.added} removed={item.removed}
                  style={style}
                  isExpanded={expandedCategories.has(item.category)}
                  onClick={() => toggleCategory(item.category)}
                  onMouseEnter={() => setHoveredElementIds(item.elementIds)}
                  onMouseLeave={() => setHoveredElementIds(null)}
                />
              )
            } else if (item.type === 'group') {
              return (
                <GroupHeaderItem
                  key={item.id} name={item.name} count={item.count}
                  added={item.added} removed={item.removed}
                  style={style}
                  isExpanded={expandedGroups.has(item.id)}
                  onClick={() => toggleGroup(item.id)}
                  onMouseEnter={() => setHoveredElementIds(item.elementIds)}
                  onMouseLeave={() => setHoveredElementIds(null)}
                />
              )
            } else {
              return (
                <ElementListItem
                  key={item.id} element={item.element} style={style}
                  status={getElementStatus(item.element.id)}
                  onClick={() => setSelectedElement(item.element.id, item.element)}
                  onMouseEnter={() => setHoveredElementIds([item.element.id])}
                  onMouseLeave={() => setHoveredElementIds(null)}
                />
              )
            }
          })}
        </div>
        {flatVirtualItems.length === 0 && <div className="p-4 text-center text-xs text-muted-foreground">No elements found</div>}
      </div>
    </div>
  )
}