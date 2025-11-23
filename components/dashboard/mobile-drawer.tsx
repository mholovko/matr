"use client"

import { Drawer } from "vaul"
import { useAppStore } from "@/lib/store"
import { useState, useEffect } from "react"

import { cn } from "@/lib/utils"

export function MobileDrawer({ children }: { children: React.ReactNode }) {
    const setMobileDrawerSnap = useAppStore(state => state.setMobileDrawerSnap)
    const [snap, setSnap] = useState<number | string | null>(0.5)
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch and SSR errors
    useEffect(() => {
        setMounted(true)
    }, [])

    // Sync snap with store
    useEffect(() => {
        setMobileDrawerSnap(snap)
    }, [snap, setMobileDrawerSnap])

    if (!mounted) return null

    return (
        <div className="md:hidden">
            <Drawer.Root
                snapPoints={["100px", 0.5, 0.95]}
                activeSnapPoint={snap}
                setActiveSnapPoint={setSnap}
                modal={false}
                open={true}
                dismissible={false}
            >
                <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-background border-t border-border rounded-t-[10px] h-[96%] shadow-2xl outline-none pointer-events-auto">
                    {/* Handle */}
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted my-4 cursor-grab active:cursor-grabbing" />

                    <div
                        className="overflow-y-auto custom-scrollbar overscroll-contain touch-pan-y"
                        style={{
                            height: snap === "100px"
                                ? "calc(100px - 2.5rem)"
                                : typeof snap === "number"
                                    ? `calc(${snap * 100}vh - 2.5rem)`
                                    : "auto"
                        }}
                    >
                        {children}
                    </div>
                </Drawer.Content>
            </Drawer.Root>
        </div>
    )
}
