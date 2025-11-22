"use client"

import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { Model } from './model'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import * as THREE from 'three'
import { retrofitScopes } from '@/lib/data/scopes'
import { ScopeMarker } from './scope-marker'
import { usePathname } from 'next/navigation'
import { CameraDebugHelper } from './camera-debug-helper'
import { CameraAnimator } from './camera-animator'

const SpeckleModel = dynamic(() => import('./speckle-model').then(mod => mod.SpeckleModel), {
    ssr: false
})

import { useAppStore } from '@/lib/store'

interface SceneProps {
    modelType: 'elements' | 'rooms'
    enableFiltering?: boolean
    enableSelection?: boolean
}

// CameraAnimator extracted to ./camera-animator.tsx

export function Scene({ modelType = 'elements', enableFiltering = true, enableSelection = true }: SceneProps) {
    const { setSelectedElement, selectedRetrofitScopeId, setSelectedRetrofitScope } = useAppStore()
    const pathname = usePathname()

    const projectId = process.env.NEXT_PUBLIC_SPECKLE_PROJECT_ID
    const elementsModelId = process.env.NEXT_PUBLIC_SPECKLE_MODEL_ID
    const roomsModelId = process.env.NEXT_PUBLIC_SPECKLE_ROOMS_MODEL_ID || 'dd0ee2f53f'

    const modelId = modelType === 'rooms' ? roomsModelId : elementsModelId

    return (
        <div className="h-full w-full bg-slate-50">
            <Canvas
                camera={{ position: [10, 10, 10], fov: 50 }}
                onPointerMissed={() => {
                    setSelectedElement(null)
                    // Also deselect retrofit scope when clicking outside on Retrofit page
                    if (pathname === '/retrofit') {
                        setSelectedRetrofitScope(null)
                    }
                }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                {projectId && (
                    <>
                        {/* Elements Model */}
                        {elementsModelId && (
                            <SpeckleModel
                                projectId={projectId}
                                modelId={elementsModelId}
                                visible={modelType === 'elements'}
                                enableFiltering={enableFiltering}
                                enableSelection={enableSelection}
                            />
                        )}

                        {/* Rooms Model */}
                        {roomsModelId && (
                            <SpeckleModel
                                projectId={projectId}
                                modelId={roomsModelId}
                                visible={modelType === 'rooms'}
                                renderBackFaces={true}
                                enableSelection={enableSelection}
                            />
                        )}
                    </>
                )}

                {/* Scope Markers - only on retrofit page */}
                {pathname === '/retrofit' && retrofitScopes.map(scope => {
                    if (!scope.markerPosition) return null
                    return (
                        <ScopeMarker
                            key={scope.id}
                            position={scope.markerPosition}
                            scope={scope}
                            isSelected={selectedRetrofitScopeId === scope.id}
                            onClick={() => setSelectedRetrofitScope(scope.id)}
                        />
                    )
                })}

                {/* Camera animator */}
                <CameraAnimator selectedScopeId={selectedRetrofitScopeId} />

                {/* Camera debug helper - only on retrofit page */}
                {pathname === '/retrofit' && <CameraDebugHelper />}


                <ContactShadows opacity={0.4} scale={40} blur={2} far={4.5} />
                <Environment preset="city" />
                <OrbitControls makeDefault />
            </Canvas>
        </div>
    )
}