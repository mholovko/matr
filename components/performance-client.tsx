"use client"

import { PerformancePanel } from "@/components/dashboard/performance-panel"
import { MobileDrawer } from "@/components/dashboard/mobile-drawer"
import { PerformanceContent } from "@/components/dashboard/performance-content"

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
