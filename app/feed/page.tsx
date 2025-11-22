import { Scene } from "@/components/canvas/scene"
import { FeedPanel } from "@/components/dashboard/feed-panel"

export default function FeedPage() {
  return (
    <>
      {/* 3D Viewport - Elements Model */}
      <div className="flex-1 relative">
        <Scene modelType="elements" />
      </div>

      {/* Feed Timeline Panel */}
      <FeedPanel />
    </>
  )
}
