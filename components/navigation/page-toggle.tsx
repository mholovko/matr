"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const pages = [
  { id: 'inventory', label: 'Inventory', path: '/inventory' },
  { id: 'performance', label: 'Performance', path: '/performance' },
  { id: 'retrofit', label: 'Retrofit', path: '/retrofit' },
  { id: 'feed', label: 'Feed', path: '/feed' },
] as const

export function PageToggle() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-1 shadow-lg">
        {pages.map((page) => {
          const isActive = pathname === page.path
          return (
            <button
              key={page.id}
              onClick={() => router.push(page.path)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {page.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
