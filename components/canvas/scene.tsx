"use client"

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { Model } from './model'

import { useAppStore } from '@/lib/store'

export function Scene() {
    const { setSelectedElement } = useAppStore()

    return (
        <div className="h-full w-full bg-slate-50">
            <Canvas
                camera={{ position: [10, 10, 10], fov: 50 }}
                onPointerMissed={() => setSelectedElement(null)}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                {/* This is where the Retrofit House goes */}
                <Model />

                <ContactShadows opacity={0.4} scale={40} blur={2} far={4.5} />
                <Environment preset="city" />
                <OrbitControls makeDefault />
            </Canvas>
        </div>
    )
}