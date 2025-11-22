import { LogPanel } from "@/components/dashboard/log-panel"
import { StatsCard } from "@/components/dashboard/stats-card"


export default function Home() {
  return (
    <main className="relative h-full w-full pointer-events-none">
      {/* Floating Building Log Sidebar */}
      <LogPanel />
    </main>
  )
}