"use client"

import { Drawer } from "vaul"
import { useAppStore } from "@/lib/store"
import { useState, useEffect } from "react"
import { LogContent } from "./log-content"
import { FilterControls } from "./filter-controls"
import { cn } from "@/lib/utils"

export function MobileDrawer() {
    const { selectedElementId, selectedElementData, setSelectedElement, setMobileDrawerSnap } = useAppStore()
    const [activeTab, setActiveTab] = useState<"materials" | "carbon" | "docs">("materials")
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
                        className="overflow-y-auto custom-scrollbar"
                        style={{
                            height: snap === "100px"
                                ? "calc(100px - 2.5rem)"
                                : typeof snap === "number"
                                    ? `calc(${snap * 100}vh - 2.5rem)`
                                    : "auto"
                        }}
                    >
                        {selectedElementId ? (
                            <LogContent
                                selectedElementId={selectedElementId}
                                selectedElementData={selectedElementData}
                                setSelectedElement={setSelectedElement}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                            />
                        ) : (
                            <div className="p-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">
                                    Model Filters
                                </h3>
                                <FilterControls />
                            </div>
                        )}
                    </div>
                </Drawer.Content>
            </Drawer.Root>
        </div>
    )
}
