import { useState } from "react"
import { ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { type RoomPerformanceData } from "@/lib/data/performance"
import { PerformanceContent } from "./performance-content"

import { useAppStore } from "@/lib/store"

export function PerformancePanel() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const performanceSelectedRoom = useAppStore(state => state.performanceSelectedRoom)

    return (
        <aside
            className={cn(
                "hidden md:flex fixed right-0 top-0 h-screen flex-col shadow-2xl z-50 transition-all duration-300 ease-in-out",
                "border-l border-border bg-background/95 backdrop-blur-sm",
                isCollapsed ? "w-12" : "w-[400px]"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border bg-muted/10">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary animate-pulse" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                            {performanceSelectedRoom ? performanceSelectedRoom.roomName : "Room Performance"}
                        </h3>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "h-6 w-6 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors",
                        isCollapsed && "mx-auto"
                    )}
                >
                    <ChevronsRight className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                </button>
            </div>

            {!isCollapsed && (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <PerformanceContent />
                </div>
            )}
        </aside>
    )
}
