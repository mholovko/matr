"use client"

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { Model } from './model'
import dynamic from 'next/dynamic'

const SpeckleModel = dynamic(() => import('./speckle-model').then(mod => mod.SpeckleModel), {
    ssr: false
})

import { useAppStore } from '@/lib/store'

export function Scene() {
    const { setSelectedElement } = useAppStore()

    const projectId = process.env.NEXT_PUBLIC_SPECKLE_PROJECT_ID
    const modelId = process.env.NEXT_PUBLIC_SPECKLE_MODEL_ID
    const token = process.env.SPECKLE_TOKEN

    return (
        <div className="h-full w-full bg-slate-50">
            <Canvas
                camera={{ position: [10, 10, 10], fov: 50 }}
                onPointerMissed={() => setSelectedElement(null)}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                {projectId && modelId ? (
                    <SpeckleModel projectId={projectId} modelId={modelId} />
                ) : (
                    <Model />
                )}


                <ContactShadows opacity={0.4} scale={40} blur={2} far={4.5} />
                <Environment preset="city" />
                <OrbitControls makeDefault />
            </Canvas>
        </div>
    )
}