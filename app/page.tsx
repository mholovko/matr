import { LogPanel } from "@/components/dashboard/log-panel"
import { StatsCard } from "@/components/dashboard/stats-card"
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/feed')
}