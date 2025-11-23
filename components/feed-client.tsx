"use client"

import { FeedPanel } from "@/components/dashboard/feed-panel"
import { MobileDrawer } from "@/components/dashboard/mobile-drawer"
import { FeedContent } from "@/components/dashboard/feed-content"

export function FeedClient() {
    return (
        <>
            <FeedPanel />
            <MobileDrawer>
                <FeedContent />
            </MobileDrawer>
        </>
    )
}
