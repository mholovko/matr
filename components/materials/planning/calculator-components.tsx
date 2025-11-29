import { EnrichedMaterialPassport } from "@/types/material-passport"
import { Calculator, DollarSign, Leaf, X, Box, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Image from "next/image"

// --- HEADER ---
interface CalculatorHeaderProps {
    onClear: () => void
}

export function CalculatorHeader({ onClear }: CalculatorHeaderProps) {
    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/10 bg-primary text-primary-foreground shrink-0">
            <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Calculator</span>
            </div>
            <button
                onClick={onClear}
                className="text-[9px] font-mono uppercase hover:underline opacity-80 hover:opacity-100 transition-opacity"
            >
                Clear All
            </button>
        </div>
    )
}

// --- TOTALS ---
interface CalculatorTotalsProps {
    totals: {
        cost: number
        carbon: number
    }
}

export function CalculatorTotals({ totals }: CalculatorTotalsProps) {
    return (
        <div className="grid grid-cols-2 gap-px bg-foreground/10 border-b border-foreground/10 shrink-0">
            <div className="bg-background p-3 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <DollarSign className="w-3 h-3" />
                    <span className="text-[9px] font-mono uppercase">Est. Cost</span>
                </div>
                <span className="text-sm font-mono font-bold">
                    £{totals.cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
            </div>
            <div className="bg-background p-3 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Leaf className="w-3 h-3" />
                    <span className="text-[9px] font-mono uppercase">Net Carbon</span>
                </div>
                <span className={cn("text-sm font-mono font-bold", totals.carbon < 0 ? "text-green-600" : "text-foreground")}>
                    {totals.carbon.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    <span className="text-[9px] font-normal text-muted-foreground ml-1">kgCO₂e</span>
                </span>
            </div>
        </div>
    )
}

// --- ITEM ---
interface CalculatorItemProps {
    item: EnrichedMaterialPassport
    volume: number
    onUpdateQuantity: (id: string, quantity: number) => void
    onRemove: (id: string) => void
}

export function CalculatorItem({ item, volume, onUpdateQuantity, onRemove }: CalculatorItemProps) {
    const carbonPerUnit = item.matrixMetrics.embodiedCarbon.totalEmbodied + item.matrixMetrics.embodiedCarbon.biogenicStorage

    return (
        <div className="p-3 border-b border-foreground/5 bg-background hover:bg-muted/20 transition-colors group flex gap-3">
            {/* THUMBNAIL */}
            <div className="w-10 h-10 shrink-0 rounded-sm border border-foreground/10 bg-muted/10 overflow-hidden relative flex items-center justify-center">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="40px"
                        className="object-contain p-0.5 mix-blend-multiply"
                    />
                ) : (
                    <Box className="w-4 h-4 text-muted-foreground/30" />
                )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
                {/* Top Row: Name & Remove */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-[10px] font-bold uppercase leading-tight truncate" title={item.name}>
                            {item.name}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-mono truncate">
                            {'manufacturer' in item ? item.manufacturer : 'Existing Stock'}
                        </span>
                    </div>
                    <button
                        onClick={() => onRemove(item.id)}
                        className="text-muted-foreground/40 hover:text-red-500 transition-colors"
                    >
                        <X size={12} />
                    </button>
                </div>

                {/* Bottom Row: Inputs & Metrics */}
                <div className="flex items-end justify-between gap-3">

                    {/* Volume Input */}
                    <div className="w-16">
                        <Input
                            type="number"
                            min={0}
                            step={0.1}
                            value={volume || ''}
                            onChange={(e) => onUpdateQuantity(item.id, parseFloat(e.target.value) || 0)}
                            className="h-6 text-[10px] font-mono rounded-none border-foreground/20 bg-muted/10 focus:bg-background px-1.5 py-0"
                            placeholder="m³"
                        />
                    </div>

                    {/* Metrics */}
                    <div className="flex flex-col items-end text-[9px] font-mono text-muted-foreground">
                        <div className="flex items-center gap-1" title="Total Carbon">
                            <Leaf size={10} className={carbonPerUnit < 0 ? "text-green-600" : "text-muted-foreground"} />
                            <span className={carbonPerUnit < 0 ? "text-green-700 font-medium" : ""}>
                                {(carbonPerUnit * volume).toFixed(1)} kg
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- FOOTER ---
interface CalculatorFooterProps {
    avgDistance: number
}

export function CalculatorFooter({ avgDistance }: CalculatorFooterProps) {
    return (
        <div className="p-3 bg-background border-t border-foreground/10 text-[9px] font-mono text-muted-foreground flex justify-between items-center shrink-0">
            <span title="Volume-weighted average distance">Avg Distance: {avgDistance.toFixed(0)} mi</span>
            <span className="flex items-center gap-1"><Info size={10} /> Excl. Labour</span>
        </div>
    )
}

// --- EMPTY STATE ---
export function CalculatorEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center bg-muted/5">
            <Calculator className="w-8 h-8 mb-3 opacity-20" />
            <p className="text-[10px] font-mono uppercase tracking-widest opacity-60">Select materials from the grid to begin calculation</p>
        </div>
    )
}
