'use client'

import { useAppStore } from '@/lib/store'
import { useState, useMemo, memo } from 'react'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'

const ElementListItem = memo(({ element, status, onClick, style }: {
  element: any
  status: 'created' | 'demolished' | 'existing'
  onClick: () => void
  style: React.CSSProperties
}) => {
  return (
    <div style={style} className="w-full px-2">
      <button
        onClick={onClick}
        className={cn(
          'w-full h-full text-left flex items-center gap-2 px-2 rounded-md transition-colors group select-none',
          status === 'created' && 'hover:bg-green-50/50',
          status === 'demolished' && 'hover:bg-red-50/50',
          status === 'existing' && 'hover:bg-muted'
        )}
      >
        {/* Status Indicator Dot */}
        <div className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          status === 'created' && 'bg-green-500',
          status === 'demolished' && 'bg-red-500',
          status === 'existing' && 'bg-slate-300'
        )} />

        {/* Name - Applied Monospace */}
        <span className={cn(
          "truncate flex-1 font-mono text-[11px] tracking-tight text-slate-700 group-hover:text-slate-900",
          status === 'created' && "text-green-700 group-hover:text-green-800",
          status === 'demolished' && "text-red-700 group-hover:text-red-800 line-through decoration-red-300/50 opacity-70"
        )}>
          {element?.name || element?.id}
        </span>

        {/* Category Tag - Applied Monospace */}
        <span className="text-[9px] font-mono text-muted-foreground/50 truncate max-w-[80px] text-right uppercase tracking-wider">
          {element?.category}
        </span>
      </button>
    </div>
  )
})

ElementListItem.displayName = 'ElementListItem'

export function PhaseElementList() {
  const { phases, modelElements, setSelectedElement } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')

  // 1. Filtering Logic
  const filteredElementIds = useMemo(() => {
    const ids = useAppStore.getState().getFilteredElementIds()
    if (ids === null) return useAppStore.getState().modelElements.map(el => el.id).filter(Boolean) as string[]
    return Array.from(ids)
  }, [phases.selectedPhase, phases.filterMode, phases.dataTree, useAppStore.getState().filters])

  const getElementStatus = (elementId: string): 'created' | 'demolished' | 'existing' => {
    if (!phases.dataTree || !phases.selectedPhase) return 'existing'
    const phaseData = phases.dataTree.elementsByPhase[phases.selectedPhase]
    if (!phaseData) return 'existing'
    if (phaseData.created.has(elementId)) return 'created'
    if (phaseData.demolished.has(elementId)) return 'demolished'
    return 'existing'
  }

  // 2. Mapping
  const elementMap = useMemo(() => {
    const map = new Map()
    modelElements.forEach((el) => { if (el.id) map.set(el.id, el) })
    return map
  }, [modelElements])

  // 3. Sorting
  const displayedElements = useMemo(() => {
    const elements = filteredElementIds
      .map((id) => elementMap.get(id))
      .filter((el) => el && (el.name?.toLowerCase().includes(searchTerm.toLowerCase()) || el.id?.toLowerCase().includes(searchTerm.toLowerCase())))

    return elements.sort((a, b) => {
      const statusA = getElementStatus(a?.id || '')
      const statusB = getElementStatus(b?.id || '')
      const weights = { created: 0, demolished: 1, existing: 2 }
      if (weights[statusA] !== weights[statusB]) return weights[statusA] - weights[statusB]
      return (a?.name || '').localeCompare(b?.name || '')
    })
  }, [filteredElementIds, searchTerm, elementMap, phases.selectedPhase])

  // Virtual Scroll Config
  const ITEM_HEIGHT = 32
  const [scrollTop, setScrollTop] = useState(0)
  const CONTAINER_HEIGHT = 800
  const BUFFER = 5

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER)
    const endIndex = Math.min(displayedElements.length, Math.ceil((scrollTop + CONTAINER_HEIGHT) / ITEM_HEIGHT) + BUFFER)
    return { startIndex, endIndex }
  }, [scrollTop, displayedElements.length])

  const visibleElements = displayedElements.slice(visibleRange.startIndex, visibleRange.endIndex)
  const totalHeight = displayedElements.length * ITEM_HEIGHT

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Search Input */}
      <div className="px-3 py-2 border-b border-border bg-background">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search elements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // Added font-mono to search input as well for consistency
            className="w-full pl-8 pr-2 py-1.5 text-[11px] font-mono bg-muted/30 border border-transparent rounded-md focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground placeholder:font-sans"
          />
        </div>
      </div>

      {/* Virtualized List */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar"
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleElements.map((element, index) => {
            const actualIndex = visibleRange.startIndex + index
            const status = getElementStatus(element?.id || '')

            return (
              <ElementListItem
                key={element?.id || actualIndex}
                element={element}
                status={status}
                onClick={() => element?.id && setSelectedElement(element.id, element)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transform: `translateY(${actualIndex * ITEM_HEIGHT}px)`,
                  height: ITEM_HEIGHT
                }}
              />
            )
          })}
        </div>

        {displayedElements.length === 0 && (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No elements found
          </div>
        )}
      </div>
    </div>
  )
}