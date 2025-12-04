"use client"

import { cameras } from "@/lib/data/photomatch"
import { useAppStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"
import Image from "next/image"

export function PhotomatchGallery() {
    const { selectedPhotomatchCamera, setSelectedPhotomatchCamera } = useAppStore(
        useShallow((state) => ({
            selectedPhotomatchCamera: state.selectedPhotomatchCamera,
            setSelectedPhotomatchCamera: state.setSelectedPhotomatchCamera,
        }))
    )

    const cameraEntries = Object.entries(cameras)

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <div className="backdrop-blur-md bg-white/80 border border-gray-200/50 rounded-xl shadow-lg px-3 py-2">
                <div className="flex gap-2 items-end">
                    {cameraEntries.map(([id, camera]) => {
                        // Use the camera's aspect ratio (0.75 = 3:4 portrait)
                        const aspect = camera.camera.aspect
                        const height = 96 // h-24 (96px)
                        const width = height * aspect // 96 * 0.75 = 72px for portrait images

                        return (
                            <button
                                key={id}
                                onClick={() => setSelectedPhotomatchCamera(id)}
                                className={`
                                    relative rounded-lg overflow-hidden
                                    transition-all duration-200
                                    border-2
                                    ${selectedPhotomatchCamera === id
                                        ? 'border-blue-500 scale-105 shadow-md'
                                        : 'border-transparent hover:border-gray-300 hover:scale-102'
                                    }
                                `}
                                style={{
                                    width: `${width}px`,
                                    height: `${height}px`,
                                }}
                                title={camera.name}
                            >
                                <Image
                                    src={camera.referenceImage}
                                    alt={camera.name}
                                    fill
                                    className="object-cover"
                                    sizes={`${width}px`}
                                />
                                {selectedPhotomatchCamera === id && (
                                    <div className="absolute inset-0 bg-blue-500/20 pointer-events-none" />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
