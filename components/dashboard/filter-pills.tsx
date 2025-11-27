"use client"

import { useAppStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"
import { X, FilterX } from "lucide-react"
import { cn } from "@/lib/utils"

export function FilterPills() {
    const {
        filters,
        selectedAssemblyId,
        searchTerm,
        toggleCategoryFilter,
        toggleMaterialFilter,
        toggleElementNameFilter,
        toggleGroupFilter,
        setSelectedAssembly,
        setSearchTerm,
        clearAllFilters,
        clearHighlights
    } = useAppStore(
        useShallow((state) => ({
            filters: state.filters,
            selectedAssemblyId: state.selectedAssemblyId,
            searchTerm: state.searchTerm,
            toggleCategoryFilter: state.toggleCategoryFilter,
            toggleMaterialFilter: state.toggleMaterialFilter,
            toggleElementNameFilter: state.toggleElementNameFilter,
            toggleGroupFilter: state.toggleGroupFilter,
            setSelectedAssembly: state.setSelectedAssembly,
            setSearchTerm: state.setSearchTerm,
            clearAllFilters: state.clearAllFilters,
            clearHighlights: state.clearHighlights
        }))
    )

    const pills = [
        ...filters.categories.map(c => ({ type: 'category', value: c, label: c })),
        ...filters.materials.map(m => ({ type: 'material', value: m, label: m })),
        ...filters.elementNames.map(n => ({ type: 'element', value: n, label: n })),
        ...filters.groups.map(g => ({ type: 'assembly', value: g, label: g })),
        // Only show selectedAssemblyId if it's not already in filters.groups
        ...(selectedAssemblyId && !filters.groups.includes(selectedAssemblyId) ? [{ type: 'assembly', value: selectedAssemblyId, label: selectedAssemblyId }] : []),
        ...(searchTerm ? [{ type: 'search', value: searchTerm, label: `Search: ${searchTerm}` }] : [])
    ]

    if (pills.length === 0) return null

    const handleRemove = (type: string, value: string) => {
        switch (type) {
            case 'category':
                toggleCategoryFilter(value)
                break
            case 'material':
                toggleMaterialFilter(value)
                break
            case 'element':
                toggleElementNameFilter(value)
                break
            case 'assembly':
                // Remove from filters.groups if it exists there
                if (filters.groups.includes(value)) {
                    toggleGroupFilter(value)
                }
                // Clear selectedAssemblyId if this is the selected assembly
                if (selectedAssemblyId === value) {
                    setSelectedAssembly(null)
                }
                break
            case 'search':
                setSearchTerm('')
                break
        }
    }

    const handleClearAll = () => {
        clearAllFilters()
        clearHighlights()
    }

    return (
        <div className="flex items-center gap-2 flex-wrap p-3 bg-muted/5 border-b border-border">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FilterX className="w-3 h-3" />
                Active Filters:
            </div>

            {pills.map((pill, i) => (
                <div
                    key={`${pill.type}-${i}`}
                    className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium border transition-colors",
                        pill.type === 'category' && "bg-blue-500/10 border-blue-500/20 text-blue-700",
                        pill.type === 'material' && "bg-orange-500/10 border-orange-500/20 text-orange-700",
                        pill.type === 'element' && "bg-green-500/10 border-green-500/20 text-green-700",
                        pill.type === 'assembly' && "bg-purple-500/10 border-purple-500/20 text-purple-700",
                        pill.type === 'search' && "bg-slate-500/10 border-slate-500/20 text-slate-700"
                    )}
                >
                    <span className="uppercase tracking-wide text-[9px] opacity-70">
                        {pill.type}
                    </span>
                    <span className="font-mono truncate max-w-32">
                        {pill.value}
                    </span>
                    <button
                        onClick={() => handleRemove(pill.type, pill.value)}
                        className="hover:bg-black/10 rounded p-0.5 transition-colors"
                    >
                        <X className="w-2.5 h-2.5" />
                    </button>
                </div>
            ))}

            <button
                onClick={handleClearAll}
                className="ml-auto flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
            >
                <FilterX className="w-3 h-3" />
                Clear All
            </button>
        </div>
    )
}
