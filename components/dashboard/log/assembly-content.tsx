"use client"

import { useAppStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"
import { Box, Layers, Component, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMemo } from "react"
import { SpeckleObject } from "@/lib/speckle/types"

export function AssemblyContent() {
    const {
        selectedAssemblyId,
        modelElements,
        setSelectedAssembly,
        clearFilters
    } = useAppStore(
        useShallow((state) => ({
            selectedAssemblyId: state.selectedAssemblyId,
            modelElements: state.modelElements,
            setSelectedAssembly: state.setSelectedAssembly,
            clearFilters: state.clearFilters
        }))
    )

    // Aggregate data for the assembly
    const assemblyData = useMemo(() => {
        if (!selectedAssemblyId) return null

        const elements = modelElements.filter(el => el.properties?.groupName === selectedAssemblyId)

        // Aggregate totals
        let totalVolume = 0
        let totalArea = 0
        const materialMap = new Map<string, { volume: number, class: string }>()
        const categories = new Set<string>()
        const types = new Set<string>()

        elements.forEach(el => {
            // Volume & Area
            const vol = el.properties?.Parameters?.["Instance Parameters"]?.Dimensions?.Volume?.value || 0
            const area = el.properties?.Parameters?.["Instance Parameters"]?.Dimensions?.Area?.value || 0
            totalVolume += vol
            totalArea += area

            // Categories & Types
            const category = el.category || el.properties?.builtInCategory?.replace("OST_", "")
            if (category) categories.add(category)

            const type = el.properties?.Parameters?.["Instance Parameters"]?.Other?.Type?.value
            if (type) types.add(type)

            // Materials
            const materialQuantities = el.properties?.["Material Quantities"] || {}
            Object.entries(materialQuantities).forEach(([name, data]: [string, any]) => {
                const vol = data.volume?.value || 0
                const matClass = data.materialClass || 'Generic'

                const existing = materialMap.get(name)
                if (existing) {
                    existing.volume += vol
                } else {
                    materialMap.set(name, { volume: vol, class: matClass })
                }
            })
        })

        return {
            elementCount: elements.length,
            totalVolume,
            totalArea,
            materials: Array.from(materialMap.entries()).map(([name, data]) => ({
                name,
                ...data
            })).sort((a, b) => b.volume - a.volume),
            categories: Array.from(categories),
            types: Array.from(types)
        }
    }, [selectedAssemblyId, modelElements])

    if (!assemblyData) return null

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 bg-muted/5 border-b border-border">
                <button
                    onClick={() => {
                        setSelectedAssembly(null)
                        clearFilters()
                    }}
                    className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-3 group"
                >
                    <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
                    Back to Inventory
                </button>
                <div className="flex items-center gap-2 mb-2">
                    <Component className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Assembly</span>
                </div>
                <h2 className="text-lg font-bold text-foreground mb-1">{selectedAssemblyId}</h2>
                <div className="text-xs text-muted-foreground">
                    {assemblyData.elementCount} Elements • {assemblyData.categories.join(", ")}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">

                {/* Actions */}


                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/10 rounded-md border border-border">
                        <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Total Volume</div>
                        <div className="text-sm font-mono font-bold">{assemblyData.totalVolume.toFixed(2)} m³</div>
                    </div>
                    <div className="p-3 bg-muted/10 rounded-md border border-border">
                        <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Total Area</div>
                        <div className="text-sm font-mono font-bold">{assemblyData.totalArea.toFixed(2)} m²</div>
                    </div>
                </div>

                {/* Materials */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <Box className="h-3 w-3" />
                        Material Aggregation
                    </h3>
                    <div className="space-y-2">
                        {assemblyData.materials.map((mat, i) => (
                            <div key={i} className="flex items-center justify-between text-xs p-2 bg-muted/5 rounded border border-border/50">
                                <div>
                                    <div className="font-bold text-foreground">{mat.name}</div>
                                    <div className="text-[10px] text-muted-foreground">{mat.class}</div>
                                </div>
                                <div className="font-mono font-bold text-muted-foreground">
                                    {mat.volume.toFixed(2)} m³
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Composition */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <Layers className="h-3 w-3" />
                        Composition
                    </h3>
                    <div className="space-y-1">
                        {assemblyData.types.map((type, i) => (
                            <div key={i} className="text-xs text-muted-foreground border-l-2 border-border pl-2 py-1">
                                {type}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto border-t border-border p-2 bg-muted/10 text-[10px] font-mono text-muted-foreground flex justify-between px-4 uppercase tracking-wider">
                <span>ASSEMBLY VIEW</span>
                <span>{selectedAssemblyId}</span>
            </div>
        </div>
    )
}
