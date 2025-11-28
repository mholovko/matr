'use client';

import React, { useState, memo } from 'react';
import { Factory, DollarSign, MapPin, Leaf, Info, ShieldCheck, AlertTriangle, Truck, Recycle, Undo2, LucideIcon, Tractor } from 'lucide-react';
import { EnrichedMaterialPassport } from '@/types/material-passport';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Sub-component for the list of metrics in the footer
const CompactMetric = memo(({ icon: Icon, value, unit }: { icon: LucideIcon, value: string | number, unit?: string }) => (
    <div className="flex items-center gap-2 mb-1.5 last:mb-0">
        <div className="text-black/40">
            <Icon size={14} className="opacity-90" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-black">
            {value}{unit && <span className="ml-0.5 text-xs font-normal opacity-70">{unit}</span>}
        </span>
    </div>
));
CompactMetric.displayName = 'CompactMetric';

// Sub-component for the data grid on the back
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

export const MaterialCardCompact = memo(({ material }: { material: EnrichedMaterialPassport }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const netCarbon = (material.matrixMetrics.embodiedCarbon.totalEmbodied + material.matrixMetrics.embodiedCarbon.biogenicStorage).toFixed(2);
    const isNetNegative = parseFloat(netCarbon) < 0;

    // Determine Icon based on transport mode (matching Thumbnail logic)
    const ProvenanceIcon = material.matrixMetrics.provenance.transportMode === 'EV_Van' ? Truck : Tractor;

    const manufacturer = 'manufacturer' in material ? material.manufacturer : 'Existing Stock';
    const cost = 'unitRate' in material.matrixMetrics.financialCost
        ? material.matrixMetrics.financialCost.unitRate
        : material.matrixMetrics.financialCost.repairCost;

    return (
        <div className={cn(
            "relative h-96 bg-white border border-gray-200 perspective-1000 group hover:border-black/30 transition-colors duration-300",
            material.isUsed && "ring-2 ring-green-500/50 border-green-500/50"
        )}>
            {material.isUsed && (
                <div className="absolute -top-2 -right-2 z-20 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    USED: {material.volume.toFixed(2)}m³
                </div>
            )}
            <div
                className="relative w-full h-full transition-transform duration-500 ease-out"
                style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
                {/* === FRONT FACE === */}
                <div className="absolute inset-0 bg-white flex flex-col p-6 backface-hidden" style={{ backfaceVisibility: 'hidden' }}>

                    {/* 1. Header Section (Matches Thumbnail Style) */}
                    <div className="flex flex-col mb-3 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                            <h3
                                className="text-lg font-bold text-black leading-tight line-clamp-2"
                                title={material.name}
                            >
                                {material.name}
                            </h3>
                            {/* Origin Location (Top Right) */}
                            <span className="text-[10px] font-medium text-black/40 text-right shrink-0 mt-1">
                                {material.matrixMetrics.provenance.originLocation}
                            </span>
                        </div>
                        <span className="text-[10px] text-black/60 uppercase tracking-wider truncate mt-1">
                            {manufacturer}
                        </span>

                        {/* Phases List */}
                        {material.phases && material.phases.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {material.phases.map(phase => (
                                    <span key={phase} className="text-[8px] font-mono font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 uppercase tracking-tight">
                                        {phase}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. The Signature Black Divider */}
                    <div className="w-full border-b border-black mb-4" />

                    {/* 3. Description Body */}
                    <div className="mb-6 flex-grow overflow-hidden">
                        <p className="text-xs leading-relaxed text-black/70 line-clamp-4 text-justify">
                            {material.description}
                        </p>
                    </div>

                    {/* 4. Footer: Image Box + Metrics */}
                    <div className="flex items-end gap-5 mt-auto">

                        {/* Image Box: Cream background + Icon Overlay (Matches Thumbnail) */}
                        <div className="relative w-32 h-32 flex-none bg-[#F3F2EA] flex items-center justify-center p-2 transition-all duration-300 group-hover:brightness-95">
                            {/* Icon Overlay */}
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
                                    className="w-full h-full object-contain mix-blend-multiply filter contrast-110 transition-all duration-500"
                                />
                            ) : (
                                <Factory size={24} className="text-black/10" />
                            )}
                        </div>

                        {/* Metrics Column */}
                        <div className="flex flex-col justify-end pb-0.5 space-y-1">
                            <CompactMetric icon={DollarSign} value={cost > 0 ? `${cost}` : '-'} unit=" GBP" />
                            <CompactMetric icon={MapPin} value={material.matrixMetrics.provenance.distanceToSiteMiles} unit=" mi" />
                            <CompactMetric icon={Leaf} value={netCarbon} unit=" kgCO₂e" />
                        </div>
                    </div>


                    {/* Flip Trigger */}
                    <button
                        onClick={() => setIsFlipped(true)}
                        className="absolute bottom-3 right-3 p-2 text-black/20 hover:text-black hover:bg-black/5 rounded-full transition-all"
                        aria-label="View Details"
                    >
                        <Info size={18} />
                    </button>
                </div>

                {/* === BACK FACE (Unchanged Logic, consistent styling) === */}
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
                                <DataPoint label="Store" value={material.matrixMetrics.embodiedCarbon.biogenicStorage.toFixed(1)} />
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

                        {/* Transport Footer */}
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
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsFlipped(false);
                        }}
                        className="absolute top-4 right-4 p-2 text-black/20 hover:text-black hover:bg-black/5 rounded-full transition-all z-20"
                        aria-label="Back to Overview"
                    >
                        <Undo2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
});
