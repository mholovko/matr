'use client';

import React, { useState, memo, useMemo } from 'react';
import { Factory, DollarSign, MapPin, Leaf, Info, ShieldCheck, AlertTriangle, Truck, Recycle, Undo2, LucideIcon, Tractor, CalendarClock, Box, Thermometer, Check, Plus, CheckCircle2, Wrench, Weight } from 'lucide-react';
import { EnrichedMaterialPassport, Classification, ConditionRating } from '@/types/material-passport';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { CLASSIFICATION_COLORS, DEFAULT_MATERIAL_COLOR } from '@/lib/data/materials/ui-constants';
import { lifecycleMap } from '@/lib/data/phases';

// --- Helper Components ---
const CompactMetric = memo(({ icon: Icon, value, unit, highlight = false }: { icon: LucideIcon, value: string | number, unit?: string, highlight?: boolean }) => (
    <div className="flex items-center gap-2 mb-1.5 last:mb-0">
        <div className={cn("text-black/40", highlight && "text-primary/70")}>
            <Icon size={14} className="opacity-90" />
        </div>
        <span className={cn("text-sm font-semibold tracking-tight", highlight ? "text-primary" : "text-black")}>
            {value}{unit && <span className="ml-0.5 text-xs font-normal opacity-70">{unit}</span>}
        </span>
    </div>
));
CompactMetric.displayName = 'CompactMetric';

const DataPoint = memo(({ label, value, sub, highlight = false }: { label: string, value: string | number, sub?: string, highlight?: boolean }) => (
    <div className="flex flex-col justify-center">
        <span className="text-[8px] font-medium uppercase text-black/40 leading-none mb-1">{label}</span>
        <div className="flex items-baseline gap-0.5">
            <span className={cn("text-[10px] font-mono font-semibold leading-none", highlight ? 'text-black' : 'text-black/80')}>
                {value}
            </span>
            {sub && <span className="text-[8px] text-black/40 leading-none">{sub}</span>}
        </div>
    </div>
));
DataPoint.displayName = 'DataPoint';

// --- Main Component ---
export const MaterialCardCompact = memo(({ material }: { material: EnrichedMaterialPassport }) => {
    const router = useRouter();
    const [isFlipped, setIsFlipped] = useState(false);

    // Store State
    const { viewMode, planningSelection, filters } = useAppStore(state => state.materialsUI);
    const { togglePlanningSelection, setMaterialFilter } = useAppStore();

    const isSelected = !!planningSelection[material.id];
    const sortBy = filters.sort;

    // --- Derived Metrics ---
    const netCarbon = (material.matrixMetrics.embodiedCarbon.totalEmbodied + material.matrixMetrics.embodiedCarbon.biogenicStorage).toFixed(2);
    const isNetNegative = parseFloat(netCarbon) < 0;
    const ProvenanceIcon = material.matrixMetrics.provenance.transportMode === 'EV_Van' ? Truck : Tractor;
    const manufacturer = 'manufacturer' in material ? material.manufacturer : 'Existing Stock';

    // Dynamic Cost Calculation
    const cost = 'unitRate' in material.matrixMetrics.financialCost
        ? material.matrixMetrics.financialCost.unitRate
        : material.matrixMetrics.financialCost.repairCost;

    // --- Item Data Calculation ---
    const itemData = useMemo(() => {
        if (!material.itemDefinition || material.volume <= 0) return null;
        const { length, width, depth } = material.itemDefinition.dimensions;
        const spacing = material.itemDefinition.spacing || 0;
        const l_m = (length + spacing) / 1000;
        const w_m = (width + spacing) / 1000;
        const d_m = depth / 1000;
        const singleItemVolume = l_m * w_m * d_m;
        if (singleItemVolume === 0) return null;
        const count = Math.round(material.volume / singleItemVolume);
        const unitName = material.itemDefinition.unit + 's';
        return { count, label: unitName };
    }, [material.volume, material.itemDefinition]);

    // Context-Aware Primary Metric (Matches Thumbnail Logic)
    const getPrimaryMetric = () => {
        // Existing Material Logic
        if ('auditData' in material) {
            const condition = ConditionRating[material.auditData.condition];
            return { icon: ShieldCheck, value: condition, unit: '', highlight: true };
        }

        // Standard Logic
        if (sortBy.includes('AGE') && material.age) return { icon: CalendarClock, value: material.age.label, unit: '' };
        if (sortBy.includes('PRICE')) return { icon: DollarSign, value: cost.toFixed(2), unit: ' GBP', highlight: true };
        if (sortBy.includes('DISTANCE')) return { icon: MapPin, value: material.matrixMetrics.provenance.distanceToSiteMiles, unit: ' mi', highlight: true };
        return { icon: Leaf, value: netCarbon, unit: ' kgCO₂e', highlight: true }; // Default
    };
    const primaryMetric = getPrimaryMetric();

    // --- Handlers ---
    const handleCardClick = (e: React.MouseEvent) => {
        if (isFlipped) return; // Don't select if looking at back
        if (viewMode === 'PLANNING') {
            e.stopPropagation();
            togglePlanningSelection(material.id);
        }
    };

    const handleFlip = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFlipped(!isFlipped);
    };

    const handleCheckInInventory = () => {
        setMaterialFilter(material.id);
        router.push('/inventory');
    };

    const CardContent = (
        <div
            className={cn(
                "relative h-[28rem] bg-white border border-gray-200 perspective-1000 group transition-all duration-300",
                viewMode === 'PLANNING'
                    ? (isSelected ? "ring-2 ring-primary ring-offset-2 border-primary" : "hover:border-primary/50 cursor-pointer")
                    : "hover:border-black/30"
            )}
            onClick={handleCardClick}
        >
            {/* --- Planning Mode Indicator --- */}
            {viewMode === 'PLANNING' && (
                <div className={cn(
                    "absolute -top-2 -right-2 z-30 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 shadow-sm",
                    isSelected
                        ? "bg-primary border-primary text-primary-foreground scale-100"
                        : "bg-white border-gray-300 text-gray-300 group-hover:border-primary group-hover:text-primary scale-100"
                )}>
                    {isSelected ? <Check size={12} strokeWidth={3} /> : <Plus size={14} />}
                </div>
            )}

            {/* --- Bank Mode "Used" Badge --- */}
            {/* Removed as per user request */}

            {/* Manufacturer Badge (Top Right) - Removed as per user request */}

            <div
                className="relative w-full h-full transition-transform duration-500 ease-out"
                style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
                {/* === FRONT FACE === */}
                <div className="absolute inset-0 bg-white flex flex-col p-6 backface-hidden" style={{ backfaceVisibility: 'hidden' }}>

                    {/* Header */}
                    <div className="flex flex-col mb-3 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                            <h3 className="text-md font-bold text-black leading-tight line-clamp-2" title={material.name}>
                                {material.name}
                            </h3>
                            {material.matrixMetrics.provenance.originLocation && (
                                <span className="text-[10px] text-black/40 font-mono uppercase tracking-widest whitespace-nowrap pt-1 shrink-0">
                                    {material.matrixMetrics.provenance.originLocation}
                                </span>
                            )}
                        </div>

                        {'manufacturer' in material && (
                            <span className="text-[10px] text-black/40 font-mono uppercase tracking-widest whitespace-nowrap pt-1 shrink-0">
                                {material.manufacturer}
                            </span>
                        )}
                        {/* Installed Date */}


                        {material.phases && material.phases.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {material.phases.slice(0, 1).map(phaseId => {
                                    const phase = lifecycleMap[phaseId];
                                    const construction = phase?.history.find(h => h.stage === '5_Construction');
                                    const date = construction?.dates?.end || construction?.dates?.start;
                                    const year = date ? date.split('-')[0] : null;

                                    if (!year) return null;

                                    return (
                                        <span key={phaseId} className="text-[10px] font-mono font-medium text-black/40 uppercase tracking-tight">
                                            Installed: {year}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="w-full border-b border-black mb-4" />

                    {/* Description */}
                    <div className="mb-6 flex-grow overflow-hidden">
                        <p className={cn(
                            "text-xs leading-relaxed text-black/70 text-justify",
                            viewMode === 'BANK' ? "line-clamp-6" : "line-clamp-9"
                        )}>
                            {material.description}
                        </p>
                    </div>

                    {/* Footer: Image + Metrics */}
                    <div className="flex items-end gap-5 mt-auto">
                        {/* Image Box */}
                        <div
                            className={cn(
                                "relative w-32 h-32 flex-none flex items-center justify-center p-2 transition-all duration-300",
                                viewMode === 'PLANNING' && !isSelected && "group-hover:brightness-95"
                            )}
                            style={{ backgroundColor: CLASSIFICATION_COLORS[material.classification] || DEFAULT_MATERIAL_COLOR }}
                        >
                            <div className="absolute top-1.5 left-1.5 text-black/80 z-10">
                                <ProvenanceIcon size={12} />
                            </div>
                            {material.image ? (
                                <Image
                                    src={material.image}
                                    alt={material.name}
                                    width={100}
                                    height={100}
                                    loading="lazy"
                                    className="w-full h-full object-contain mix-blend-multiply filter contrast-110"
                                />
                            ) : (
                                <Factory size={24} className="text-black/10" />
                            )}
                        </div>

                        {/* Metrics Column */}
                        <div className="flex flex-col justify-end pb-0.5 space-y-1">
                            {/* Primary Metric (Highlighted) */}
                            <CompactMetric
                                icon={primaryMetric.icon}
                                value={primaryMetric.value}
                                unit={primaryMetric.unit}
                                highlight={true}
                            />
                            {viewMode === 'BANK' && material.age && (
                                <CompactMetric icon={CalendarClock} value={material.age.label} />
                            )}

                            {/* Secondary Metrics */}
                            {'auditData' in material && (
                                <>
                                    <CompactMetric icon={Recycle} value={(material.resourceValue.recoveryPotential * 100).toFixed(0)} unit="% Recov." />
                                </>
                            )}

                            {viewMode === 'PLANNING' && (
                                <>
                                    {!sortBy.includes('PRICE') && (
                                        <CompactMetric icon={DollarSign} value={cost > 0 ? `${cost}` : '-'} unit=" GBP" />
                                    )}
                                    {!sortBy.includes('DISTANCE') && (
                                        <CompactMetric icon={MapPin} value={material.matrixMetrics.provenance.distanceToSiteMiles} unit=" mi" />
                                    )}
                                    {!sortBy.includes('CARBON') && (
                                        <CompactMetric icon={Leaf} value={netCarbon} unit=" kgCO₂e" />
                                    )}
                                </>
                            )}

                            {/* Additional Info: Age, Volume, Items (Bank Mode Only) */}
                            {viewMode === 'BANK' && (
                                <>

                                    {/* Volume */}
                                    <CompactMetric icon={Box} value={material.volume.toFixed(2)} unit=" m³" />

                                    {/* Item Count */}
                                    {itemData && (
                                        <CompactMetric icon={Factory} value={`~${itemData.count.toLocaleString()}`} unit={` ${itemData.label}`} />
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Flip Button */}
                    <button
                        onClick={handleFlip}
                        className="absolute bottom-3 right-3 p-2 text-black/20 hover:text-black hover:bg-black/5 rounded-full transition-all z-20"
                        title="View Tech Passport"
                    >
                        <Info size={18} />
                    </button>
                </div>

                {/* === BACK FACE === */}
                <div
                    className="absolute inset-0 bg-white flex flex-col backface-hidden p-6"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <div className="flex justify-between items-center pb-4 border-b border-black/5 mb-5">
                        <h4 className="font-bold text-[10px] uppercase tracking-widest text-black/60">Tech Passport</h4>
                        <span className="text-[10px] font-mono text-black/30">ID:{material.id.slice(0, 4)}</span>
                    </div>

                    <div className="flex-grow flex flex-col gap-6">
                        {/* Carbon Table */}
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-[9px] font-bold uppercase text-black/40">Carbon Lifecycle</span>
                                <span className={cn("text-xs font-mono font-bold", isNetNegative ? 'text-green-600' : 'text-black')}>
                                    NET: {netCarbon}
                                </span>
                            </div>
                            <div className="bg-gray-50 rounded p-4 flex justify-between">
                                <DataPoint label="A1-A3" value={material.matrixMetrics.embodiedCarbon.a1a3.toFixed(1)} />
                                <DataPoint label="A4" value={material.matrixMetrics.embodiedCarbon.a4.toFixed(1)} />
                                <DataPoint label="A5" value={material.matrixMetrics.embodiedCarbon.a5.toFixed(1)} />
                                <DataPoint label="Seq" value={material.matrixMetrics.embodiedCarbon.biogenicStorage.toFixed(1)} />
                            </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                                <span className="text-[9px] font-bold uppercase text-black/40 block mb-3 border-b border-black/5 pb-1">Physics</span>
                                <div className="space-y-4">
                                    <DataPoint label="Thermal Cond." value={material.physics.thermalConductivity} sub="W/mK" />
                                    <DataPoint label="Density" value={material.physics.density} sub="kg/m³" />
                                </div>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold uppercase text-black/40 block mb-3 border-b border-black/5 pb-1">Circularity</span>
                                <div className="space-y-4">
                                    <DataPoint label="Recycled Content" value={`${material.circularity.recycledContent}%`} />
                                    <div className="flex flex-col justify-center">
                                        <span className="text-[8px] font-medium uppercase text-black/40 leading-none mb-1">Health</span>
                                        <div className="flex items-center gap-1.5">
                                            {material.circularity.materialHealth === 'Red_List_Free' ? (
                                                <ShieldCheck size={12} className="text-green-600" />
                                            ) : (
                                                <AlertTriangle size={12} className="text-orange-400" />
                                            )}
                                            <span className="text-[10px] font-semibold leading-none text-black/80">
                                                {material.circularity.materialHealth === 'Red_List_Free' ? 'Safe' : 'VOCs'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-auto pt-4 border-t border-black/5 flex justify-between items-end">
                            <div>
                                <span className="text-[8px] font-medium uppercase text-black/40 block mb-1">Transport</span>
                                <div className="flex items-center gap-1.5">
                                    <Truck size={12} className="text-black/30" />
                                    <span className="text-[10px] font-mono font-medium text-black/70 truncate max-w-[80px]">
                                        {material.matrixMetrics.provenance.transportMode.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[8px] font-medium uppercase text-black/40 block mb-1">End of Life</span>
                                <div className="flex items-center gap-1.5 justify-end">
                                    <Recycle size={12} className="text-black/30" />
                                    <span className="text-[10px] font-mono font-medium text-black/70 uppercase truncate max-w-[80px]">
                                        {material.circularity.endOfLifeStrategy.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleFlip}
                        className="absolute top-4 right-4 p-2 text-black/20 hover:text-black hover:bg-black/5 rounded-full transition-all z-20"
                        title="Back to Overview"
                    >
                        <Undo2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );

    // Bank Mode Context Menu
    if (viewMode === 'BANK') {
        return (
            <ContextMenu>
                <ContextMenuTrigger>
                    {CardContent}
                </ContextMenuTrigger>
                {material.isUsed && (
                    <ContextMenuContent>
                        <ContextMenuItem onClick={handleCheckInInventory}>
                            Check in Inventory
                        </ContextMenuItem>
                    </ContextMenuContent>
                )}
            </ContextMenu>
        );
    }

    return CardContent;
});