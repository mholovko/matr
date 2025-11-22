"use client"

import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function FilterControls() {
    const { filters, toggleCategoryFilter, toggleLevelFilter, toggleGroupFilter, clearFilters, modelData } = useAppStore()

    const hasActiveFilters = filters.categories.length > 0 || filters.levels.length > 0 || filters.groups.length > 0

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">


            {/* Level Filter */}
            {modelData.availableLevels.length > 0 && (
                <section>
                    <div className="mb-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Level
                        </h4>
                    </div>
                    <div className="space-y-2">
                        {modelData.availableLevels.map((level) => (
                            <label
                                key={level}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <input
                                    type="checkbox"
                                    checked={filters.levels.includes(level)}
                                    onChange={() => toggleLevelFilter(level)}
                                    className="w-3 h-3 border-2 border-border rounded-sm checked:bg-primary checked:border-primary cursor-pointer"
                                />
                                <span className="text-xs font-mono text-foreground group-hover:text-primary transition-colors">
                                    {level}
                                </span>
                            </label>
                        ))}
                    </div>
                </section>
            )}

            {/* Group Filter */}
            {modelData.availableGroups.length > 0 && (
                <section>
                    <div className="mb-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Group
                        </h4>
                    </div>
                    <div className="space-y-2">
                        {modelData.availableGroups.map((group) => (
                            <label
                                key={group}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <input
                                    type="checkbox"
                                    checked={filters.groups.includes(group)}
                                    onChange={() => toggleGroupFilter(group)}
                                    className="w-3 h-3 border-2 border-border rounded-sm checked:bg-primary checked:border-primary cursor-pointer"
                                />
                                <span className="text-xs font-mono text-foreground group-hover:text-primary transition-colors">
                                    {group}
                                </span>
                            </label>
                        ))}
                    </div>
                </section>
            )}

            {/* Category Filter */}
            {modelData.availableCategories.length > 0 && (
                <section>
                    <div className="mb-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Category
                        </h4>
                    </div>
                    <div className="space-y-2">
                        {modelData.availableCategories.map((category) => (
                            <label
                                key={category}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <input
                                    type="checkbox"
                                    checked={filters.categories.includes(category)}
                                    onChange={() => toggleCategoryFilter(category)}
                                    className="w-3 h-3 border-2 border-border rounded-sm checked:bg-primary checked:border-primary cursor-pointer"
                                />
                                <span className="text-xs font-mono text-foreground group-hover:text-primary transition-colors">
                                    {category}
                                </span>
                            </label>
                        ))}
                    </div>
                </section>
            )}

            {/* Material Summary */}
            {modelData.availableMaterials.length > 0 && (
                <section>
                    <div className="mb-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Material Class
                        </h4>
                    </div>
                    <div className="space-y-3">
                        {modelData.availableMaterials.slice(0, 5).map((material) => {
                            const percentage = modelData.totalVolume > 0
                                ? (material.volume / modelData.totalVolume) * 100
                                : 0

                            // Color based on material class
                            const colorClass = material.class === 'Masonry' ? 'bg-blue-500' :
                                material.class === 'Wood' ? 'bg-blue-900' :
                                    material.class === 'Concrete' ? 'bg-gray-600' :
                                        'bg-orange-500'

                            return (
                                <div key={material.name}>
                                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                                        <span className="text-muted-foreground truncate">{material.class}</span>
                                        <span className="text-primary font-bold">{percentage.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div className={cn("h-full", colorClass)} style={{ width: `${percentage}%` }} />
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                        {material.volume.toFixed(2)} m³
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Volume Summary */}
            {modelData.totalVolume > 0 && (
                <section>
                    <div className="mb-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Sum of Volume
                        </h4>
                    </div>
                    <div className="text-2xl font-bold font-mono text-foreground">
                        {modelData.totalVolume.toFixed(2)} m³
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                        Total Volume
                    </div>
                </section>
            )}

            {/* Loading state */}
            {modelData.availableCategories.length === 0 && (
                <div className="text-xs text-muted-foreground font-mono text-center py-8">
                    Loading model data...
                </div>
            )}
            {/* Clear Filters */}
            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="w-full text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                >
                    Clear All Filters
                </button>
            )}
        </div>
    )
}
