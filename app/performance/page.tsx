import { Scene } from "@/components/canvas/scene"
import { PerformancePanel } from "@/components/dashboard/performance-panel"

export default function PerformancePage() {
  return (
    <>
      {/* 3D Viewport - Rooms Model */}
      <div className="flex-1 relative">
        <Scene modelType="rooms" />
      </div>

      {/* Performance Data Panel */}
      <PerformancePanel />
    </>
  )
}
