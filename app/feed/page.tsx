"use client"

import { FeedPanel } from "@/components/dashboard/feed-panel"
import { MobileDrawer } from "@/components/dashboard/mobile-drawer"
import { FeedContent } from "@/components/dashboard/feed-content"
import { useState } from "react"
import { type FeedEvent, feedEvents } from "@/lib/data/feed"

export default function FeedPage() {
  const [filterType, setFilterType] = useState<FeedEvent['type'] | 'all'>('all')

  const filteredEvents = feedEvents.filter(event => {
    // Filter by type
    if (filterType !== 'all' && event.type !== filterType) return false
    return true
  })

  return (
    <>
      <FeedPanel />
      <MobileDrawer>
        <FeedContent
          filterType={filterType}
          setFilterType={setFilterType}
          filteredEvents={filteredEvents}
        />
      </MobileDrawer>
    </>
  )
}
