"use client"

import { Scene } from "@/components/canvas/scene"
import { usePathname } from "next/navigation"

export function LayoutScene() {
    const pathname = usePathname()
    const modelType = pathname === '/performance' ? 'rooms' : 'elements'

    return (
        <div className="absolute inset-0 z-0">
            <Scene modelType={modelType} />
        </div>
    )
}
