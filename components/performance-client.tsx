"use client"

import { PerformancePanel } from "@/components/dashboard/performance/performance-panel"
import { MobileDrawer } from "@/components/dashboard/mobile-drawer"
import { PerformanceContent } from "@/components/dashboard/performance/performance-content"

export function PerformanceClient() {
    return (
        <>
            <PerformancePanel />
            <MobileDrawer>
                <PerformanceContent />
            </MobileDrawer>
        </>
    )
}
