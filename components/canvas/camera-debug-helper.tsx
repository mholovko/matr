"use client"

import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import * as THREE from 'three'
import type { OrbitControls } from 'three-stdlib'

export function CameraDebugHelper() {
    const { camera, controls } = useThree()
    const setCameraDebugInfo = useAppStore(state => state.setCameraDebugInfo)

    useEffect(() => {
        const interval = setInterval(() => {
            const position = {
                x: parseFloat(camera.position.x.toFixed(2)),
                y: parseFloat(camera.position.y.toFixed(2)),
                z: parseFloat(camera.position.z.toFixed(2))
            }

            let target = { x: 0, y: 0, z: 0 }
            const orbitControls = controls as unknown as OrbitControls
            if (orbitControls && orbitControls.target) {
                const t = orbitControls.target
                target = {
                    x: parseFloat(t.x.toFixed(2)),
                    y: parseFloat(t.y.toFixed(2)),
                    z: parseFloat(t.z.toFixed(2))
                }
            }

            setCameraDebugInfo({ position, target })
        }, 100)

        return () => clearInterval(interval)
    }, [camera, controls, setCameraDebugInfo])

    return null // No UI rendered in the scene
}
