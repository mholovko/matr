import { Scene } from "@/components/canvas/scene"
import { LogPanel } from "@/components/dashboard/log-panel"
import { StatsCard } from "@/components/dashboard/stats-card"

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden flex flex-col">
      {/* Header / Nav */}
      <header className="absolute top-0 left-0 z-10 w-full p-4 flex justify-between items-center bg-gradient-to-b from-white/80 to-transparent pointer-events-none">
        <h1 className="text-2xl font-bold text-slate-900 pointer-events-auto">
          Retrofit Pilot <span className="text-slate-500 text-sm font-normal">No. 33 Link Road</span>
        </h1>
        {/* <div className="flex gap-2 pointer-events-auto">
          <StatsCard label="Current Temp" value="18.4°C" unit="Live" />
          <StatsCard label="Embodied Carbon" value="4,250" unit="kgCO₂e" />
        </div> */}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex relative z-0 overflow-hidden">
        {/* 3D Viewport */}
        <div className="flex-1 relative">
          <Scene />
        </div>
      </div>

      {/* Floating Building Log Sidebar */}
      <LogPanel />
    </main>
  )
}