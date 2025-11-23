"use client"

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function CameraDebugUI() {
    const cameraDebugInfo = useAppStore(state => state.cameraDebugInfo)
    const [copied, setCopied] = useState(false)

    if (process.env.NODE_ENV !== 'development' || !cameraDebugInfo) return null

    const { position, target } = cameraDebugInfo

    const copyToClipboard = () => {
        const text = `cameraPosition: { x: ${position.x}, y: ${position.y}, z: ${position.z} },
markerPosition: { x: ${target.x}, y: ${target.y}, z: ${target.z} }`

        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-2 text-xs font-mono">
            <div className="font-bold text-yellow-600 mb-1 text-[10px] uppercase">📷 Camera Debug</div>
            <div className="space-y-1 text-[10px]">
                <div>
                    <span className="text-muted-foreground">Pos:</span>{' '}
                    <span className="text-foreground">
                        {position.x}, {position.y}, {position.z}
                    </span>
                </div>
                <div>
                    <span className="text-muted-foreground">Target:</span>{' '}
                    <span className="text-foreground">
                        {target.x}, {target.y}, {target.z}
                    </span>
                </div>
            </div>
            <button
                onClick={copyToClipboard}
                className="mt-2 w-full flex items-center justify-center gap-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-700 px-2 py-1 rounded text-[10px] font-bold transition-colors"
            >
                {copied ? (
                    <>
                        <Check className="h-3 w-3" />
                        Copied!
                    </>
                ) : (
                    <>
                        <Copy className="h-3 w-3" />
                        Copy for Scope
                    </>
                )}
            </button>
        </div>
    )
}
