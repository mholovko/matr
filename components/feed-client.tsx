"use client"

import { FeedPanel } from "@/components/dashboard/feed/feed-panel"
import { MobileDrawer } from "@/components/dashboard/mobile-drawer"
import { FeedContent } from "@/components/dashboard/feed/feed-content"

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
