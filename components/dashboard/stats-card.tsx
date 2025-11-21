import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
    label: string
    value: string | number
    unit?: string
    className?: string
    trend?: "up" | "down" | "neutral"
}

export function StatsCard({
    label,
    value,
    unit,
    className,
    trend
}: StatsCardProps) {
    return (
        <Card className={cn(
            "w-fit min-w-[140px] border-slate-200/60 shadow-sm",
            "bg-white/80 backdrop-blur-md", // Glass effect
            className
        )}>
            <CardContent className="p-3">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                    {label}
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-slate-900">
                        {value}
                    </span>
                    {unit && (
                        <span className="text-xs font-medium text-slate-400">
                            {unit}
                        </span>
                    )}
                </div>

                {/* Optional: Indicator dot for "Live" status */}
                {unit === "Live" && (
                    <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
            </CardContent>
        </Card>
    )
}