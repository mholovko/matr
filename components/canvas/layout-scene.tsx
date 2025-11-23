"use client"

import { Scene } from "@/components/canvas/scene"
import { usePathname } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { useEffect, useState } from "react"

export function LayoutScene() {
    const pathname = usePathname()
    const mobileDrawerSnap = useAppStore(state => state.mobileDrawerSnap)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768) // md breakpoint
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const modelType = pathname === '/performance' ? 'rooms' : 'elements'
    const enableFiltering = pathname === '/' || pathname === '/inventory'
    const enableSelection = pathname === '/' || pathname === '/inventory' || pathname === '/performance'

    // Calculate bottom offset based on drawer snap
    // Default to 0 (desktop)
    let bottomOffset = "0px"

    // Only apply on mobile
    if (isMobile) {
        // Add a buffer to ensure overlap and prevent gaps (especially with rounded corners)
        const buffer = "40px"

        if (mobileDrawerSnap === "100px") {
            bottomOffset = `calc(100px - ${buffer})`
        } else if (typeof mobileDrawerSnap === "number") {
            const percentage = mobileDrawerSnap
            if (percentage <= 0.5) {
                bottomOffset = `calc(${percentage * 100}% - ${buffer})`
            } else {
                bottomOffset = `calc(50% - ${buffer})`
            }
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
