"use client"

import { useState } from 'react'
import { Html } from '@react-three/drei'
import { type RetrofitScope } from '@/lib/data/scopes'

interface ScopeMarkerProps {
    position: { x: number; y: number; z: number }
    scope: RetrofitScope
    isSelected: boolean
    onClick: () => void
}

export function ScopeMarker({ position, scope, isSelected, onClick }: ScopeMarkerProps) {
    const [isHovered, setIsHovered] = useState(false)

    const getStatusColor = (status: RetrofitScope['status']) => {
        switch (status) {
            case 'completed': return '#10b981' // emerald-500
            case 'in-progress': return '#f59e0b' // amber-500
            case 'planning': return '#3b82f6' // blue-500
        }
    }

    const color = getStatusColor(scope.status)

    return (
        <group position={[position.x, position.y, position.z]}>
            {/* HTML Circle Marker */}
            <Html
                center
                style={{
                    pointerEvents: 'auto',
                }}
            >
                <div
                    onClick={(e) => {
                        e.stopPropagation()
                        onClick()
                    }}
                    onMouseEnter={() => {
                        setIsHovered(true)
                        document.body.style.cursor = 'pointer'
                    }}
                    onMouseLeave={() => {
                        setIsHovered(false)
                        document.body.style.cursor = 'default'
                    }}
                    className="relative"
                >
                    {/* Main circle */}
                    <div
                        className="w-2 h-2 rounded-full transition-all duration-200"
                        style={{
                            backgroundColor: color,
                            boxShadow: isSelected
                                ? `0 0 0 4px ${color}40, 0 0 20px ${color}80`
                                : `0 0 10px ${color}60`,
                            transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                        }}
                    />

                    {/* Pulsing ring when selected */}
                    {isSelected && (
                        <div
                            className="absolute inset-0 rounded-full animate-ping"
                            style={{
                                backgroundColor: color,
                                opacity: 0.3,
                            }}
                        />
                    )}
                </div>

                {/* Label - only show on hover */}
                {isHovered && (
                    <div
                        className="absolute left-1/2 -translate-x-1/2 top-12 bg-background/90 backdrop-blur-sm border border-border rounded-md px-2 py-1 shadow-lg whitespace-nowrap"
                        style={{ pointerEvents: 'none' }}
                    >
                        <div className="text-xs font-bold text-foreground">
                            {scope.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground capitalize">
                            {scope.status.replace('-', ' ')}
                        </div>
                    </div>
                )}
            </Html>
        </group>
    )
}
