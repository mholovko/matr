"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const pages = [
  { id: 'inventory', label: 'Inventory', path: '/inventory' },
  { id: 'performance', label: 'Performance', path: '/performance' },
  { id: 'retrofit', label: 'Retrofit', path: '/retrofit' },
  { id: 'feed', label: 'Feed', path: '/feed' },
  { id: 'materials', label: 'Materials', path: '/materials' },
] as const

export function PageToggle() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="fixed top-1 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center bg-white rounded-none">
        {pages.map((page, index) => {
          const isActive = pathname === page.path
          return (
            <button
              key={page.id}
              onClick={() => router.push(page.path)}
              className={cn(
                "relative px-6 py-2.5 text-sm transition-colors duration-200 hover:text-black focus:outline-none",
                isActive ? "text-black" : "text-neutral-500"
              )}
            >
              <div className="grid place-items-center">
                <span className="invisible font-bold col-start-1 row-start-1" aria-hidden="true">
                  {page.label}
                </span>
                <span className={cn("col-start-1 row-start-1", isActive ? "font-bold" : "font-normal")}>
                  {page.label}
                </span>
              </div>

              {index < pages.length - 1 && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-neutral-300 text-sm select-none pointer-events-none">
                  |
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}