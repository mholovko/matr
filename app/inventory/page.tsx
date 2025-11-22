import { LogPanel } from "@/components/dashboard/log-panel"
import { MobileDrawer } from "@/components/dashboard/mobile-drawer"

export default function InventoryPage() {
  return (
    <>
      {/* Floating Building Log Sidebar (Desktop) */}
      <LogPanel />

      {/* Mobile Drawer (Mobile) */}
      <MobileDrawer />
    </>
  )
}
