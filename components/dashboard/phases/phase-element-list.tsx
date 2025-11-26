'use client'

import { useAppStore } from '@/lib/store'
import { useState, useMemo, memo } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// Memoized list item to prevent unnecessary re-renders
const ElementListItem = memo(({ element, status, onClick }: {
  element: any
  status: 'created' | 'demolished' | 'existing'
  onClick: () => void
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-4 py-3 text-left transition-colors flex items-center justify-between group',
        status === 'created' && 'hover:bg-green-50/30',
        status === 'demolished' && 'hover:bg-red-50/30',
        status === 'existing' && 'hover:bg-primary/5'
      )}
    >
      <div className="flex-1 min-w-0 flex items-start gap-2">
        {/* Git-style indicator */}
        <div className={cn('mt-0.5 font-bold text-sm flex-shrink-0', status === 'created' && 'text-green-600', status === 'demolished' && 'text-red-600', status === 'existing' && 'text-muted-foreground')}>
          {status === 'created' && '+'}
          {status === 'demolished' && '−'}
          {status === 'existing' && '·'}
        </div>

        {/* Element info */}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              'text-sm font-medium truncate',
              status === 'created' && 'text-green-700',
              status === 'demolished' && 'text-red-700 line-through',
              status === 'existing' && 'text-foreground'
            )}
          >
            {element?.name || element?.id?.slice(0, 8)}
          </div>
          <div className={cn('text-[10px] truncate', status === 'demolished' ? 'text-red-600' : 'text-muted-foreground')}>
            {element?.category}
          </div>
          {element?.id && (
            <div className="text-[10px] text-muted-foreground truncate font-mono opacity-60">
              {element.id.slice(0, 12)}...
            </div>
          )}
        </div>
      </div>
      <ChevronRight className={cn('w-4 h-4 ml-2 flex-shrink-0 transition-colors', status === 'created' && 'text-green-600 group-hover:text-green-700', status === 'demolished' && 'text-red-600 group-hover:text-red-700', status === 'existing' && 'text-muted-foreground group-hover:text-foreground')} />
    </button>
  )
})

ElementListItem.displayName = 'ElementListItem'

export function PhaseElementList() {
  const { phases, modelElements, setSelectedElement } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredElementIds = useMemo(() => {
    const ids = useAppStore.getState().getFilteredElementIds()

    if (ids === null) {
      // Show all elements if no filter
      const allIds = useAppStore.getState().modelElements.map(el => el.id).filter(Boolean) as string[]
      console.log(`Phase filter updated: showing all ${allIds.length} elements`)
      return allIds
    }

    console.log(`Phase filter updated: ${ids.size} elements`)
    return Array.from(ids)
  }, [phases.selectedPhase, phases.filterMode, phases.dataTree, useAppStore.getState().filters])

  // Get element change status (created, demolished, or existing)
  const getElementStatus = (elementId: string): 'created' | 'demolished' | 'existing' => {
    if (!phases.dataTree || !phases.selectedPhase) return 'existing'
    const phaseData = phases.dataTree.elementsByPhase[phases.selectedPhase]
    if (!phaseData) return 'existing'

    if (phaseData.created.has(elementId)) return 'created'
    if (phaseData.demolished.has(elementId)) return 'demolished'
    return 'existing'
  }

  // Create map of element IDs to elements for quick lookup
  const elementMap = useMemo(() => {
    const map = new Map<string, (typeof modelElements)[0]>()
    modelElements.forEach((el) => {
      if (el.id) map.set(el.id, el)
    })
    return map
  }, [modelElements])

  // Get filtered elements with search and sort by status
  const displayedElements = useMemo(() => {
    const startTime = performance.now()

    const elements = filteredElementIds
      .map((id) => elementMap.get(id))
      .filter(
        (el) =>
          el &&
          (el.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            el.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            el.category?.toLowerCase().includes(searchTerm.toLowerCase()))
      )

    // Sort: created first, then demolished, then existing
    const sorted = elements.sort((a, b) => {
      const statusA = getElementStatus(a?.id || '')
      const statusB = getElementStatus(b?.id || '')

      // Priority order: created (0), demolished (1), existing (2)
      const priorityMap = { created: 0, demolished: 1, existing: 2 }
      const priorityA = priorityMap[statusA]
      const priorityB = priorityMap[statusB]

      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }

      // Within same status, sort by name
      const nameA = a?.name || a?.id || ''
      const nameB = b?.name || b?.id || ''
      return nameA.localeCompare(nameB)
    })

    const endTime = performance.now()
    console.log(`Element list calculation took ${(endTime - startTime).toFixed(2)}ms for ${sorted.length} elements`)

    return sorted
  }, [filteredElementIds, searchTerm, elementMap, phases.selectedPhase, phases.dataTree])

  // Virtual scrolling state
  const [scrollTop, setScrollTop] = useState(0)
  const ITEM_HEIGHT = 72 // Approximate height of each item in pixels
  const CONTAINER_HEIGHT = 600 // Approximate visible height
  const BUFFER = 5 // Extra items to render above/below viewport

  // Calculate which items are visible
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER)
    const endIndex = Math.min(
      displayedElements.length,
      Math.ceil((scrollTop + CONTAINER_HEIGHT) / ITEM_HEIGHT) + BUFFER
    )
    return { startIndex, endIndex }
  }, [scrollTop, displayedElements.length])

  const visibleElements = useMemo(() => {
    return displayedElements.slice(visibleRange.startIndex, visibleRange.endIndex)
  }, [displayedElements, visibleRange])

  const totalHeight = displayedElements.length * ITEM_HEIGHT
  const offsetY = visibleRange.startIndex * ITEM_HEIGHT

  if (filteredElementIds.length === 0) {
    return (
      <div className="p-4 text-center text-[10px] text-muted-foreground">
        No elements in this phase
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="p-4 border-b border-border space-y-2">
        <input
          type="text"
          placeholder="Search elements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        />
        <div className="text-[10px] text-muted-foreground">
          Showing {displayedElements.length} of {filteredElementIds.length} elements
        </div>
      </div>

      {/* Virtual Scrolled Element List */}
      <div
        className="flex-1 overflow-y-auto"
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleElements.map((element, index) => {
              const actualIndex = visibleRange.startIndex + index
              const status = getElementStatus(element?.id || '')
              return (
                <ElementListItem
                  key={element?.id || actualIndex}
                  element={element}
                  status={status}
                  onClick={() => {
                    if (element?.id) {
                      setSelectedElement(element.id, element)
                    }
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
