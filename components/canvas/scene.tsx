"use client"

import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Bounds, BakeShadows } from '@react-three/drei'
import { EffectComposer, N8AO, SMAA, ToneMapping, TiltShift2 } from '@react-three/postprocessing'
import { Model } from './model'
import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { retrofitScopes } from '@/lib/data/scopes'
import { ScopeMarker } from './scope-marker'
import { usePathname } from 'next/navigation'
import { CameraDebugHelper } from './camera-debug-helper'
import { CameraAnimator } from './camera-animator'
import { ErrorBoundary } from '@/components/error-boundary'

const SpeckleModel = dynamic(() => import('./speckle-model').then(mod => mod.SpeckleModel), {
    ssr: false
})

import { useAppStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'

interface SceneProps {
    modelType: 'elements' | 'rooms'
    enableFiltering?: boolean
    enableSelection?: boolean
}

// CameraAnimator extracted to ./camera-animator.tsx

export function Scene({ modelType = 'elements', enableFiltering = true, enableSelection = true }: SceneProps) {
    const { setSelectedElement, selectedRetrofitScopeId, setSelectedRetrofitScope, renderMode, setIsInteracting, isInteracting } = useAppStore(
        useShallow((state) => ({
            setSelectedElement: state.setSelectedElement,
            selectedRetrofitScopeId: state.selectedRetrofitScopeId,
            setSelectedRetrofitScope: state.setSelectedRetrofitScope,
            renderMode: state.renderMode,
            setIsInteracting: state.setIsInteracting,
            isInteracting: state.isInteracting,
        }))
    )
    const pathname = usePathname()
    const dragStart = useRef({ x: 0, y: 0 })

    const projectId = process.env.NEXT_PUBLIC_SPECKLE_PROJECT_ID
    const elementsModelId = process.env.NEXT_PUBLIC_SPECKLE_MODEL_ID
    const roomsModelId = process.env.NEXT_PUBLIC_SPECKLE_ROOMS_MODEL_ID

    const modelId = modelType === 'rooms' ? roomsModelId : elementsModelId

    return (
        <div
            className="h-full w-full bg-white"
            onPointerDown={(e) => {
                dragStart.current = { x: e.clientX, y: e.clientY }
            }}
        >
            <ErrorBoundary>
                <Canvas
                    shadows
                    camera={{ position: [-10, 10, 10], fov: 45 }}
                    onPointerMissed={(e) => {
                        // Prevent deselection if:
                        // 1. It's not a left click (e.g. right click pan)
                        // 2. The mouse moved significantly (drag/pan/rotate)
                        if (e.button !== 0) return

                        const deltaX = Math.abs(e.clientX - dragStart.current.x)
                        const deltaY = Math.abs(e.clientY - dragStart.current.y)
                        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

                        if (distance > 5) return

                        const state = useAppStore.getState()

                        // 1. If Element is selected, deselect it but keep Assembly (Back to Assembly View)
                        if (state.selectedElementId) {
                            setSelectedElement(null)
                            return
                        }

                        // 2. If no Element is selected, deselect Assembly and clear filters (Back to Inventory)
                        state.setSelectedAssembly(null)
                        state.clearFilters()

                        // Also deselect retrofit scope when clicking outside on Retrofit page
                        if (pathname === '/retrofit') {
                            setSelectedRetrofitScope(null)
                        }
                    }}
                >
                    <color attach="background" args={['#ffffff']} />

                    {renderMode === 'rendered' ? (
                        <>
                            {/* Rendered Mode Lighting (Arctic/Rhino) */}
                            {/* Mimicking Speckle Viewer: Sun + IBL */}

                            {/* Sun Light - Strong Directional Light */}
                            <directionalLight
                                position={[10, 20, 10]}
                                intensity={2.0}
                                castShadow
                                shadow-bias={-0.0001}
                                shadow-mapSize={[2048, 2048]}
                            />

                            <ambientLight intensity={0.2} />

                            <Environment
                                preset="warehouse"
                                environmentIntensity={0.5}
                                environmentRotation={[0, THREE.MathUtils.degToRad(-120), 0]}
                            />
                        </>
                    ) : renderMode === 'technical' ? (
                        <>
                            {/* Technical Mode (Pen/CAD) */}
                            <ambientLight intensity={1.0} />
                        </>
                    ) : (
                        <>
                            {/* Shaded Mode Lighting (Original) */}
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} intensity={1} />
                            <Environment preset="city" />
                        </>
                    )}

                    {projectId && (
                        <>
                            {/* Elements Model */}
                            {elementsModelId && (
                                <SpeckleModel
                                    projectId={projectId}
                                    modelId={elementsModelId}
                                    visible={modelType === 'elements'}
                                    enableFiltering={enableFiltering}
                                    enableSelection={enableSelection && modelType === 'elements'}
                                />
                            )}

                            {/* Rooms Model */}
                            {roomsModelId && (
                                <SpeckleModel
                                    projectId={projectId}
                                    modelId={roomsModelId}
                                    visible={modelType === 'rooms'}
                                    renderBackFaces={true}
                                    enableFiltering={enableFiltering}
                                    enableSelection={enableSelection && modelType === 'rooms'}
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


                    {/* Optimization: Disable ContactShadows during interaction or in technical mode */}
                    {!isInteracting && renderMode !== 'technical' && (
                        <ContactShadows
                            resolution={1024}
                            scale={50}
                            blur={2}
                            opacity={renderMode === 'rendered' ? 0.1 : 0.4}
                            far={10}
                            color="#000000"
                        />
                    )}
                    <BakeShadows />

                    {/* Optimization: Disable AO during interaction */}
                    {renderMode === 'rendered' && !isInteracting && (
                        <EffectComposer multisampling={8}>
                            <N8AO
                                aoRadius={20}
                                distanceFalloff={0.2}
                                intensity={2}
                                screenSpaceRadius
                                halfRes
                            />
                        </EffectComposer>
                    )}

                    <OrbitControls
                        makeDefault
                        onStart={() => setIsInteracting(true)}
                        onEnd={() => setIsInteracting(false)}
                    />
                </Canvas>
            </ErrorBoundary>
        </div>
    )
}