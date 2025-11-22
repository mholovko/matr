import { Scene } from "@/components/canvas/scene"
import { RetrofitPanel } from "@/components/dashboard/retrofit-panel"

export default function RetrofitPage() {
  return (
    <>
      {/* 3D Viewport - Elements Model */}
      <div className="flex-1 relative">
        <Scene modelType="elements" />
      </div>

      {/* Retrofit Scopes Panel */}
      <RetrofitPanel />
    </>
  )
}
