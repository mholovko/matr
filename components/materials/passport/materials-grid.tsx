'use client'

import { EnrichedMaterialPassport } from '@/types/material-passport'
import { MaterialCardCompact } from './material-card'
import { MaterialThumbnail } from './material-thumbnail'
import { memo } from 'react'
import { SortOption, DisplayMode } from '@/types/materials-filters'
import { cn } from '@/lib/utils'

interface MaterialsGridProps {
    materials: EnrichedMaterialPassport[]
    mode: DisplayMode
    sortBy: SortOption
    isPanelCollapsed: boolean
    selectedIds?: string[]
    onToggleSelect?: (id: string) => void
    viewMode?: string
}

export const MaterialsGrid = memo(({ materials, mode, sortBy, isPanelCollapsed, selectedIds, onToggleSelect, viewMode }: MaterialsGridProps) => {
    return (
        <div className="h-full w-full flex flex-col bg-gray-50/50">

            {/* Header */}
            <div
                className={cn(
                    "flex-none px-8  border-b border-gray-200/60 bg-gray-50/80 backdrop-blur-sm z-10 transition-[margin] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]",
                    // Align header text with grid content

                )}
            >
            </div>

            {/* Scrollable Grid */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">

                {viewMode === 'BANK' ? (
                    <div className="space-y-12 pb-20">
                        {/* Existing Stock Group */}
                        {materials.some(m => 'auditData' in m) && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-black/5 pb-2">
                                    <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-black/60">Existing Stock</h2>
                                    <span className="text-xs font-mono text-black/30 px-2 py-0.5 bg-black/5 rounded-full">
                                        {materials.filter(m => 'auditData' in m).length}
                                    </span>
                                </div>
                                <div className={cn(
                                    "grid transition-[margin] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]",
                                    mode === 'card'
                                        ? 'gap-6 grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                                        : 'gap-x-8 gap-y-12 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
                                )}>
                                    {materials.filter(m => 'auditData' in m).map((material) => (
                                        mode === 'card' ? (
                                            <MaterialCardCompact key={material.id} material={material} />
                                        ) : (
                                            <MaterialThumbnail
                                                key={material.id}
                                                material={material}
                                                sortBy={sortBy}
                                                isSelected={selectedIds?.includes(material.id)}
                                                onToggle={() => onToggleSelect && onToggleSelect(material.id)}
                                                viewMode={viewMode}
                                            />
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Materials Group */}
                        {materials.some(m => !('auditData' in m)) && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-black/5 pb-2">
                                    <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-black/60">New Materials</h2>
                                    <span className="text-xs font-mono text-black/30 px-2 py-0.5 bg-black/5 rounded-full">
                                        {materials.filter(m => !('auditData' in m)).length}
                                    </span>
                                </div>
                                <div className={cn(
                                    "grid transition-[margin] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]",
                                    mode === 'card'
                                        ? 'gap-6 grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                                        : 'gap-x-8 gap-y-12 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
                                )}>
                                    {materials.filter(m => !('auditData' in m)).map((material) => (
                                        mode === 'card' ? (
                                            <MaterialCardCompact key={material.id} material={material} />
                                        ) : (
                                            <MaterialThumbnail
                                                key={material.id}
                                                material={material}
                                                sortBy={sortBy}
                                                isSelected={selectedIds?.includes(material.id)}
                                                onToggle={() => onToggleSelect && onToggleSelect(material.id)}
                                                viewMode={viewMode}
                                            />
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={cn(
                        "grid pb-20 transition-[margin] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]",
                        mode === 'card'
                            ? 'gap-6 grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                            : 'gap-x-8 gap-y-12 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
                    )}>
                        {materials.map((material) => (
                            mode === 'card' ? (
                                <MaterialCardCompact key={material.id} material={material} />
                            ) : (
                                <MaterialThumbnail
                                    key={material.id}
                                    material={material}
                                    sortBy={sortBy}
                                    isSelected={selectedIds?.includes(material.id)}
                                    onToggle={() => onToggleSelect && onToggleSelect(material.id)}
                                    viewMode={viewMode}
                                />
                            )
                        ))}
                    </div>
                )}

                {materials.length === 0 && (
                    <div className="h-[50vh] flex flex-col items-center justify-center text-muted-foreground">
                        <div className="text-4xl font-thin mb-4 opacity-20">∅</div>
                        <span className="font-mono text-xs uppercase tracking-widest opacity-50">No Materials Found</span>
                    </div>
                )}
            </div>
        </div>
    )
});

