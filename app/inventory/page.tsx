import { Scene } from "@/components/canvas/scene"
import { LogPanel } from "@/components/dashboard/log-panel"

export default function InventoryPage() {
  return (
    <>
      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <Scene modelType="elements" />
      </div>

      {/* Floating Building Log Sidebar */}
      <LogPanel />
    </>
  )
}
