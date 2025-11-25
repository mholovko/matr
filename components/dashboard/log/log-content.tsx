"use client"
import { Box, Layers, Activity, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

import { useAppStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"

export function LogContent() {
    const {
        selectedElementId,
        selectedElementData,
        setSelectedElement,
        logActiveTab,
        setLogActiveTab,
        selectedAssemblyId,
        phases
    } = useAppStore(
        useShallow((state) => ({
            selectedElementId: state.selectedElementId,
            selectedElementData: state.selectedElementData,
            setSelectedElement: state.setSelectedElement,
            logActiveTab: state.logActiveTab,
            setLogActiveTab: state.setLogActiveTab,
            selectedAssemblyId: state.selectedAssemblyId,
            phases: state.phases
        }))
    )
    // Extract element info from selectedElementData
    const elementName = selectedElementData?.name ||
        selectedElementData?.properties?.Parameters?.["Instance Parameters"]?.Other?.["Family and Type"]?.value ||
        "Unknown Element"

    const elementType = selectedElementData?.type ||
        selectedElementData?.properties?.Parameters?.["Instance Parameters"]?.Other?.Type?.value ||
        ""

    const elementCategory = selectedElementData?.category ||
        selectedElementData?.properties?.builtInCategory?.replace("OST_", "") ||
        "Unknown"

    const elementLevel = selectedElementData?.level ||
        selectedElementData?.properties?.Parameters?.["Instance Parameters"]?.Constraints?.["Base Constraint"]?.value ||
        ""

    const elementFamily = selectedElementData?.family ||
        selectedElementData?.properties?.Parameters?.["Instance Parameters"]?.Other?.Family?.value ||
        ""


    // Extract dimensions
    const volume = selectedElementData?.properties?.Parameters?.["Instance Parameters"]?.Dimensions?.Volume?.value
    const area = selectedElementData?.properties?.Parameters?.["Instance Parameters"]?.Dimensions?.Area?.value
    const length = selectedElementData?.properties?.Parameters?.["Instance Parameters"]?.Dimensions?.Length?.value
    const volumeUnits = selectedElementData?.properties?.Parameters?.["Instance Parameters"]?.Dimensions?.Volume?.units || "m³"
    const areaUnits = selectedElementData?.properties?.Parameters?.["Instance Parameters"]?.Dimensions?.Area?.units || "m²"
    const lengthUnits = selectedElementData?.properties?.Parameters?.["Instance Parameters"]?.Dimensions?.Length?.units || "mm"

    // Extract materials
    const materialQuantities = selectedElementData?.properties?.["Material Quantities"] || {}
    const materials = Object.entries(materialQuantities).map(([name, data]: [string, any]) => ({
        name,
        volume: data.volume?.value,
        volumeUnits: data.volume?.units,
        materialClass: data.materialClass,
        density: data.density?.value
    }))

    return (
        <>
            {/* Element Info */}
            <div className="p-3 bg-muted/5 border-b border-border">
                <button
                    onClick={() => setSelectedElement(null)}
                    className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-3 group"
                >
                    <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
                    {selectedAssemblyId ? "Back to Assembly" : "Back to Inventory"}
                </button>
                <div className="space-y-2">
                    <div className="text-sm font-bold text-foreground">{elementName}</div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-wider">
                        <div>
                            <span className="text-muted-foreground">Category: </span>
                            <span className="text-foreground font-bold">{elementCategory}</span>
                        </div>
                        {elementLevel && (
                            <div>
                                <span className="text-muted-foreground">Level: </span>
                                <span className="text-foreground font-bold">{elementLevel}</span>
                            </div>
                        )}
                        {elementFamily && (
                            <div className="col-span-2">
                                <span className="text-muted-foreground">Family: </span>
                                <span className="text-foreground font-bold">{elementFamily}</span>
                            </div>
                        )}
                        {elementType && (
                            <div className="col-span-2">
                                <span className="text-muted-foreground">Type: </span>
                                <span className="text-foreground font-bold">{elementType}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Tabs */}
                <div className="grid grid-cols-3 border-b border-border">
                    {(
                        [
                            { id: "materials", label: "MATS", icon: Box },
                            { id: "carbon", label: "CO2e", icon: Activity },
                            { id: "docs", label: "DOCS", icon: Layers },
                        ] as const
                    ).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setLogActiveTab(tab.id)}
                            className={cn(
                                "flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-r border-border last:border-r-0",
                                logActiveTab === tab.id
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <tab.icon className="h-3 w-3" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-0">
                    {logActiveTab === "materials" && (
                        <>
                            <section>
                                <div className="p-3 bg-muted/5 border-b border-border">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Materials & Dimensions</span>
                                </div>
                                <div className="p-4 space-y-4">
                                    {/* Dimensions */}
                                    {(volume || area || length) && (
                                        <div>
                                            <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Dimensions</h4>
                                            <div className="space-y-1 text-xs font-mono">
                                                {volume && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Volume:</span>
                                                        <span className="text-foreground font-bold">{volume.toFixed(3)} {volumeUnits}</span>
                                                    </div>
                                                )}
                                                {area && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Area:</span>
                                                        <span className="text-foreground font-bold">{area.toFixed(3)} {areaUnits}</span>
                                                    </div>
                                                )}
                                                {length && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Length:</span>
                                                        <span className="text-foreground font-bold">{length.toFixed(1)} {lengthUnits}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Materials */}
                                    {materials.length > 0 && (
                                        <div>
                                            <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Material Composition</h4>
                                            <ul className="space-y-2">
                                                {materials.map((material, i) => (
                                                    <li key={i} className="border-l-2 border-primary pl-2">
                                                        <div className="text-xs font-bold text-foreground">{material.name}</div>
                                                        {material.materialClass && (
                                                            <div className="text-[10px] text-muted-foreground">Class: {material.materialClass}</div>
                                                        )}
                                                        {material.volume && (
                                                            <div className="text-[10px] text-muted-foreground">
                                                                Volume: {material.volume.toFixed(3)} {material.volumeUnits}
                                                            </div>
                                                        )}
                                                        {material.density && (
                                                            <div className="text-[10px] text-muted-foreground">
                                                                Density: {material.density} kg/m³
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {materials.length === 0 && !volume && !area && !length && (
                                        <div className="text-xs text-muted-foreground font-mono">
                                            No material or dimension data available.
                                        </div>
                                    )}
                                </div>
                            </section>
                            <section>
                                <div className="p-3 bg-muted/5 border-b border-border">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phasing</span>
                                </div>
                                <div className="p-4 space-y-4">
                                    {phases.dataTree && selectedElementData?.id && phases.dataTree.elementPhaseInfo[selectedElementData.id] ? (
                                        (() => {
                                            const elementPhaseInfo = phases.dataTree!.elementPhaseInfo[selectedElementData.id!]
                                            return (
                                                <div className="space-y-3">
                                                    {elementPhaseInfo.createdPhase && (
                                                        <div>
                                                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Created Phase</div>
                                                            <div className="text-xs font-mono text-foreground">{elementPhaseInfo.createdPhase}</div>
                                                        </div>
                                                    )}
                                                    {elementPhaseInfo.demolishedPhase && (
                                                        <div>
                                                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Demolished Phase</div>
                                                            <div className="text-xs font-mono text-foreground">{elementPhaseInfo.demolishedPhase}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })()
                                    ) : (
                                        <div className="text-xs text-muted-foreground font-mono">
                                            No phasing data available.
                                        </div>
                                    )}
                                </div>
                            </section>
                        </>
                    )}

                    {logActiveTab === "carbon" && (
                        <section>
                            <div className="p-3 bg-muted/5 border-b border-border">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Impact Analysis</span>
                            </div>
                            <div className="p-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold font-mono text-emerald-600">-120</span>
                                    <span className="text-xs font-bold uppercase text-muted-foreground">kgCO₂e</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {logActiveTab === "docs" && (
                        <section>
                            <div className="p-3 bg-muted/5 border-b border-border">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Documentation</span>
                            </div>
                            <div className="p-4 text-xs text-muted-foreground font-mono">
                                No documentation attached.
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer Stats */}
                <div className="mt-auto border-t border-border p-2 bg-muted/10 text-[10px] font-mono text-muted-foreground flex justify-between px-4 uppercase tracking-wider">
                    <span>ID: {selectedElementId?.substring(0, 8)}</span>
                    <span>SELECTED</span>
                </div>
            </div>
        </>
    )
}
