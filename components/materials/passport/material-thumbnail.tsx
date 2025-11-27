'use client';

import React, { memo } from 'react';
import { EnrichedMaterialPassport, Classification } from '@/types/material-passport';
import { Factory, Leaf, DollarSign, MapPin, Tractor, Truck, Box } from 'lucide-react';
import { SortOption } from '@/types/materials-filters';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const CLASSIFICATION_COLORS: Record<string, string> = {
    [Classification.STRUCTURAL_TIMBER]: "#C9E2CE", // Muted Green
    [Classification.MASONRY]: "#C9E2CE",           // Muted Green
    [Classification.INSULATION]: "#DBF0EE",        // Muted Aqua
    [Classification.SHEATHING]: "#F9F0DB",         // Muted Yellow
    [Classification.LINING]: "#FCEFF2",            // Muted Pink
    [Classification.FINISH]: "#DBD9DF",            // Muted Purple
};

const DEFAULT_COLOR = "#F3F2EA";

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

interface ThumbnailProps {
    material: EnrichedMaterialPassport;
    sortBy: SortOption;
}

export const MaterialThumbnail = memo(({ material, sortBy }: ThumbnailProps) => {
    const router = useRouter();
    const setMaterialFilter = useAppStore(state => state.setMaterialFilter);

    const getPrimaryMetric = () => {
        if (sortBy.includes('PRICE')) {
            const price = 'unitRate' in material.matrixMetrics.financialCost
                ? material.matrixMetrics.financialCost.unitRate
                : material.matrixMetrics.financialCost.repairCost;
            return { icon: DollarSign, value: price > 0 ? price.toFixed(2) : '-', unit: '', prefix: '£' };
        }
        if (sortBy.includes('DISTANCE')) {
            return { icon: MapPin, value: material.matrixMetrics.provenance.distanceToSiteMiles, unit: 'mi', prefix: '' };
        }
        if (sortBy.includes('VOLUME')) {
            return { icon: Box, value: material.volume.toFixed(2), unit: ' m³', prefix: '' };
        }
        const netCarbon = (material.matrixMetrics.embodiedCarbon.totalEmbodied + material.matrixMetrics.embodiedCarbon.biogenicStorage).toFixed(2);
        return { icon: Leaf, value: netCarbon, unit: ' kgCO₂e', prefix: '' };
    };

    const metric = getPrimaryMetric();
    const ProvenanceIcon = material.matrixMetrics.provenance.transportMode === 'EV_Van' ? Truck : Tractor;

    // Dynamic Background Color
    const bgColor = CLASSIFICATION_COLORS[material.classification] || DEFAULT_COLOR;

    const manufacturer = 'manufacturer' in material ? material.manufacturer : 'Existing Stock';

    const handleCheckInInventory = () => {
        setMaterialFilter(material.name);
        router.push('/inventory');
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div className="flex flex-col h-full group cursor-pointer select-none relative">
                    {material.isUsed && (
                        <div className="absolute top-0 right-0 z-20 bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                            USED
                        </div>
                    )}

                    {/* Text Block */}
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
                        <div className="text-2xl font-medium text-black tracking-tight -ml-0.5">
                            <span className="text-lg align-top mr-0.5 font-normal">{metric.prefix}</span>
                            {metric.value}
                            <span className="text-sm font-normal text-black/60 ml-1">{metric.unit}</span>
                        </div>
                    </div>

                    {/* IMAGE BLOCK (Dynamic Background) */}
                    <div
                        className="mt-auto relative w-full aspect-square flex items-center justify-center p-4 transition-all duration-300 group-hover:brightness-95 overflow-hidden"
                        style={{ backgroundColor: bgColor }}
                    >
                        {/* Icon */}
                        {/* <div className="absolute top-2 left-2 text-black/80 z-10">
                    <ProvenanceIcon size={12} />
                </div> */}

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
});


