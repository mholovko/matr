"use client"

import { ChevronsRight, Activity, Wind, Droplets, Thermometer, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { roomPerformanceData, type RoomPerformanceData } from "@/lib/data/performance"

import { useAppStore } from "@/lib/store"

export function PerformanceContent() {
    const { performanceSelectedRoom, setPerformanceSelectedRoom } = useAppStore()
    const getStatusColor = (status: 'good' | 'moderate' | 'poor') => {
        switch (status) {
            case 'good': return 'bg-emerald-500'
            case 'moderate': return 'bg-amber-500'
            case 'poor': return 'bg-red-500'
        }
    }

    if (performanceSelectedRoom) {
        // SELECTED ROOM DETAILS
        return (
            <div>
                {/* CO2 Metric */}
                <section>
                    <div className="p-3 bg-muted/5 border-b border-border">
                        <button
                            onClick={() => setPerformanceSelectedRoom(null)}
                            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-3 group"
                        >
                            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
                            Back to Rooms
                        </button>
                        <div className="flex items-center gap-2">
                            <Activity className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Carbon</span>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold font-mono text-foreground">{performanceSelectedRoom.metrics.co2.value}</span>
                            <span className="text-xs font-bold uppercase text-muted-foreground">{performanceSelectedRoom.metrics.co2.unit}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", getStatusColor(performanceSelectedRoom.metrics.co2.status))} />
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{performanceSelectedRoom.metrics.co2.status}</span>
                        </div>
                    </div>
                </section>

                {/* Air Quality Metric */}
                <section>
                    <div className="p-3 bg-muted/5 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Wind className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Air Quality</span>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="space-y-2 font-mono text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">PM1:</span>
                                <span className="font-bold text-foreground">{performanceSelectedRoom.metrics.airQuality.pm1} {performanceSelectedRoom.metrics.airQuality.unit}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">PM2.5:</span>
                                <span className="font-bold text-foreground">{performanceSelectedRoom.metrics.airQuality.pm25} {performanceSelectedRoom.metrics.airQuality.unit}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">PM10:</span>
                                <span className="font-bold text-foreground">{performanceSelectedRoom.metrics.airQuality.pm10} {performanceSelectedRoom.metrics.airQuality.unit}</span>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", getStatusColor(performanceSelectedRoom.metrics.airQuality.status))} />
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{performanceSelectedRoom.metrics.airQuality.status}</span>
                        </div>
                    </div>
                </section>

                {/* Temperature Metric */}
                <section>
                    <div className="p-3 bg-muted/5 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Thermometer className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Temperature</span>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold font-mono text-foreground">{performanceSelectedRoom.metrics.temperature.value}</span>
                            <span className="text-xs font-bold uppercase text-muted-foreground">{performanceSelectedRoom.metrics.temperature.unit}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", getStatusColor(performanceSelectedRoom.metrics.temperature.status))} />
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{performanceSelectedRoom.metrics.temperature.status}</span>
                        </div>
                    </div>
                </section>

                {/* Humidity Metric */}
                <section>
                    <div className="p-3 bg-muted/5 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Droplets className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Humidity</span>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold font-mono text-foreground">{performanceSelectedRoom.metrics.humidity.value}</span>
                            <span className="text-xs font-bold uppercase text-muted-foreground">{performanceSelectedRoom.metrics.humidity.unit}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", getStatusColor(performanceSelectedRoom.metrics.humidity.status))} />
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{performanceSelectedRoom.metrics.humidity.status}</span>
                        </div>
                    </div>
                </section>

                {/* Last Updated */}
                <div className="p-4 border-t border-border">
                    <div className="text-[10px] text-muted-foreground font-mono text-center uppercase tracking-wider">
                        Last updated: {new Date(performanceSelectedRoom.lastUpdated).toLocaleString()}
                    </div>
                </div>
            </div>
        )
    }

    // ROOM LIST
    return (
        <div>
            <div className="p-3 bg-muted/5 border-b border-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select a Room</span>
            </div>
            <div className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground mb-4">Click a room in the 3D model or select from the list below</p>

                {roomPerformanceData.map((room) => (
                    <button
                        key={room.roomId}
                        onClick={() => setPerformanceSelectedRoom(room)}
                        className="w-full text-left p-3 hover:bg-muted/50 rounded border border-transparent hover:border-border transition-all group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{room.roomName}</div>
                            <ChevronsRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div className="flex items-center gap-1">
                                <div className={cn("w-1.5 h-1.5 rounded-full", getStatusColor(room.metrics.co2.status))} />
                                <span className="text-muted-foreground">CO₂:</span>
                                <span className="font-bold text-foreground">{room.metrics.co2.value}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className={cn("w-1.5 h-1.5 rounded-full", getStatusColor(room.metrics.temperature.status))} />
                                <span className="text-muted-foreground">Temp:</span>
                                <span className="font-bold text-foreground">{room.metrics.temperature.value}°C</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
