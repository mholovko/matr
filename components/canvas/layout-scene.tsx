"use client"

import { Scene } from "@/components/canvas/scene"
import { usePathname } from "next/navigation"

export function LayoutScene() {
    const pathname = usePathname()
    const modelType = pathname === '/performance' ? 'rooms' : 'elements'
    const enableFiltering = pathname === '/' || pathname === '/inventory'

    return (
        <div className="absolute inset-0 z-0">
            <Scene modelType={modelType} enableFiltering={enableFiltering} />
        </div>
    )
}
