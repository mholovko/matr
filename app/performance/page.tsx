"use client"

import { PerformancePanel } from "@/components/dashboard/performance-panel"
import { MobileDrawer } from "@/components/dashboard/mobile-drawer"
import { PerformanceContent } from "@/components/dashboard/performance-content"
import { useState } from "react"
import { type RoomPerformanceData } from "@/lib/data/performance"

export default function PerformancePage() {
  const [selectedRoom, setSelectedRoom] = useState<RoomPerformanceData | null>(null)

  return (
    <>
      <PerformancePanel />
      <MobileDrawer>
        <PerformanceContent selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} />
      </MobileDrawer>
    </>
  )
}
