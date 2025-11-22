"use client"

import { RetrofitPanel } from "@/components/dashboard/retrofit-panel"
import { MobileDrawer } from "@/components/dashboard/mobile-drawer"
import { RetrofitContent } from "@/components/dashboard/retrofit-content"
import { useAppStore } from "@/lib/store"

export default function RetrofitPage() {
  const { selectedRetrofitScopeId, setSelectedRetrofitScope } = useAppStore()

  return (
    <>
      <RetrofitPanel />
      <MobileDrawer>
        <RetrofitContent
          selectedRetrofitScopeId={selectedRetrofitScopeId}
          setSelectedRetrofitScope={setSelectedRetrofitScope}
        />
      </MobileDrawer>
    </>
  )
}
