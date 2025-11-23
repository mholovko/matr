"use client"

import { RetrofitPanel } from "@/components/dashboard/retrofit-panel"
import { MobileDrawer } from "@/components/dashboard/mobile-drawer"
import { RetrofitContent } from "@/components/dashboard/retrofit-content"

export function RetrofitClient() {
    return (
        <>
            <RetrofitPanel />
            <MobileDrawer>
                <RetrofitContent />
            </MobileDrawer>
        </>
    )
}
