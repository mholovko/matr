'use client';

import React, { memo, useMemo } from 'react';
import { EnrichedMaterialPassport, Classification } from '@/types/material-passport';
import { Factory, Leaf, DollarSign, MapPin, Tractor, Truck, Box, CalendarClock, Thermometer, Recycle, Check, Plus } from 'lucide-react';
import { SortOption } from '@/types/materials-filters';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"

// --- Constants ---
import { CLASSIFICATION_COLORS, DEFAULT_MATERIAL_COLOR } from '@/lib/data/materials/ui-constants';

import { DisplayMode } from '@/types/materials-filters';

interface ThumbnailProps {
    material: EnrichedMaterialPassport;
    sortBy: SortOption;
    isSelected?: boolean;
    onToggle?: () => void;
    viewMode?: string;
}

export const MaterialThumbnail = memo(({ material, sortBy, isSelected = false, onToggle, viewMode }: ThumbnailProps) => {
    const router = useRouter();

    // --- STORE CONNECTION ---
    const { setMaterialFilter } = useAppStore();

    // --- DERIVED DATA ---
    const itemData = useMemo(() => {
        if (!sortBy.includes('VOLUME') || !material.itemDefinition || material.volume <= 0) return null;
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
    }, [material.volume, material.itemDefinition, sortBy]);

    const getPrimaryMetric = () => {
        if (sortBy.includes('AGE') && material.age) {
            return { icon: CalendarClock, value: material.age.label.split(' ')[0], unit: ' ' + material.age.label.split(' ')[1], prefix: '' };
        }
        if (sortBy.includes('CIRCULARITY')) {
            return { icon: Recycle, value: material.circularity.detachabilityIndex.toFixed(1), unit: ' Idx', prefix: '' };
        }
        if (sortBy.includes('THERMAL')) {
            return { icon: Thermometer, value: material.physics.thermalConductivity.toFixed(2), unit: ' W/mK', prefix: '' };
        }
        if (sortBy.includes('PRICE')) {
            const price = 'unitRate' in material.matrixMetrics.financialCost ? material.matrixMetrics.financialCost.unitRate : material.matrixMetrics.financialCost.repairCost;
            return { icon: DollarSign, value: price > 0 ? price.toFixed(2) : '-', unit: '', prefix: '£' };
        }
        if (sortBy.includes('DISTANCE')) {
            return { icon: MapPin, value: material.matrixMetrics.provenance.distanceToSiteMiles, unit: ' mi', prefix: '' };
        }
        if (sortBy.includes('VOLUME')) {
            return { icon: Box, value: material.volume.toFixed(2), unit: ' m³', prefix: '' };
        }
        const netCarbon = (material.matrixMetrics.embodiedCarbon.totalEmbodied + material.matrixMetrics.embodiedCarbon.biogenicStorage).toFixed(2);
        return { icon: Leaf, value: netCarbon, unit: ' kgCO₂e', prefix: '' };
    };

    const metric = getPrimaryMetric();
    const bgColor = CLASSIFICATION_COLORS[material.classification] || DEFAULT_MATERIAL_COLOR;
    const manufacturer = 'manufacturer' in material ? material.manufacturer : 'Existing Stock';

    // --- HANDLERS ---
    const handleClick = (e: React.MouseEvent) => {
        if (viewMode === 'PLANNING' && onToggle) {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
        }
    };

    const handleCheckInInventory = () => {
        setMaterialFilter(material.id);
        router.push('/inventory');
    };

    const ThumbnailContent = (
        <div
            className={cn(
                "flex flex-col h-full group cursor-pointer select-none relative transition-all duration-200",
                viewMode === 'PLANNING' && isSelected && "transform scale-95 opacity-100"
            )}
            onClick={handleClick}
        >
            {/* PLANNING MODE SELECTION INDICATOR */}
            {viewMode === 'PLANNING' && (
                <div className={cn(
                    "absolute -top-2 -right-2 z-30 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 shadow-sm",
                    isSelected
                        ? "bg-primary border-primary text-primary-foreground scale-100"
                        : "bg-white border-gray-300 text-gray-300 group-hover:border-primary group-hover:text-primary scale-90 opacity-0 group-hover:opacity-100"
                )}>
                    {isSelected ? <Check size={12} strokeWidth={3} /> : <Plus size={14} />}
                </div>
            )}

            {/* TEXT CONTENT */}
            <div className="flex flex-col min-w-0 mb-4">
                <div className="flex flex-col mb-2">
                    <span className="text-xs font-bold text-black leading-tight truncate" title={material.name}>
                        {material.name}
                    </span>
                    <span className="text-[10px] text-black/60 uppercase tracking-wider truncate mt-0.5">
                        {manufacturer}
                    </span>
                </div>
                <div className="w-full border-b border-black mb-1" />
                <div className="flex flex-row justify-between items-center">
                    <div className="text-2xl font-medium text-black tracking-tight -ml-0.5 leading-none">
                        <span className="text-lg align-top mr-0.5 font-normal">{metric.prefix}</span>
                        {metric.value}
                        <span className="text-sm font-normal text-black/60 ml-1">{metric.unit}</span>
                    </div>
                    {itemData && (
                        <div className="text-[10px] font-mono text-black/40 mt-1 font-medium">
                            ~{itemData.count.toLocaleString()} {itemData.label}
                        </div>
                    )}
                </div>
            </div>

            {/* IMAGE BLOCK */}
            <div
                className={cn(
                    "mt-auto relative w-full aspect-square flex items-center justify-center p-4 transition-all duration-300 group-hover:brightness-95 overflow-hidden",
                    viewMode === 'PLANNING' && isSelected ? "ring-2 ring-primary ring-offset-2" : ""
                )}
                style={{ backgroundColor: bgColor }}
            >
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
        </div>
    );

    // Conditional Context Menu based on View Mode
    if (viewMode === 'BANK') {
        return (
            <ContextMenu>
                <ContextMenuTrigger>
                    {ThumbnailContent}
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

    return ThumbnailContent;
});