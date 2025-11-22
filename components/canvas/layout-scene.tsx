"use client"

import { Scene } from "@/components/canvas/scene"
import { usePathname } from "next/navigation"
import { useAppStore } from "@/lib/store"

export function LayoutScene() {
    const pathname = usePathname()
    const { mobileDrawerSnap } = useAppStore()

    const modelType = pathname === '/performance' ? 'rooms' : 'elements'
    const enableFiltering = pathname === '/' || pathname === '/inventory'
    const enableSelection = pathname === '/' || pathname === '/inventory' || pathname === '/performance'

    // Calculate bottom offset based on drawer snap
    // Default to 0 (desktop)
    let bottomOffset = "0px"

    // Only apply on mobile (we can check window width or just rely on the fact that drawer only updates snap on mobile)
    // But since snap is null/undefined initially or on desktop, we should be careful.
    // However, the requirement is "only between 100px and 50%".

    // Add a buffer to ensure overlap and prevent gaps (especially with rounded corners)
    const buffer = "40px"

    if (mobileDrawerSnap === "100px") {
        bottomOffset = `calc(100px - ${buffer})`
    } else if (typeof mobileDrawerSnap === "number") {
        // If 0.5 (50%), set bottom to 50% - buffer
        // If 0.95 (95%), keep it at 50% - buffer
        // Or maybe the user meant "don't resize further than 50%"?
        // "only between 100px and 50%" implies:
        // 100px -> bottom: 100px
        // 50% -> bottom: 50%
        // 95% -> bottom: 50% (capped)

        const percentage = mobileDrawerSnap
        if (percentage <= 0.5) {
            bottomOffset = `calc(${percentage * 100}% - ${buffer})`
        } else {
            bottomOffset = `calc(50% - ${buffer})`
        }
    }

    return (
        <div
            className="absolute inset-x-0 top-0 z-0 transition-all duration-300 ease-in-out"
            style={{ bottom: bottomOffset }}
        >
            <Scene modelType={modelType} enableFiltering={enableFiltering} enableSelection={enableSelection} />
        </div>
    )
}
