"use client"

import { RetrofitPanel } from "@/components/dashboard/retrofit/retrofit-panel"
import { MobileDrawer } from "@/components/dashboard/mobile-drawer"
import { RetrofitContent } from "@/components/dashboard/retrofit/retrofit-content"

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
