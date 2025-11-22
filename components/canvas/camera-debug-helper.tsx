"use client"

import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import * as THREE from 'three'

export function CameraDebugHelper() {
    const { camera, controls } = useThree()
    const { setCameraDebugInfo } = useAppStore()

    useEffect(() => {
        const interval = setInterval(() => {
            const position = {
                x: parseFloat(camera.position.x.toFixed(2)),
                y: parseFloat(camera.position.y.toFixed(2)),
                z: parseFloat(camera.position.z.toFixed(2))
            }

            let target = { x: 0, y: 0, z: 0 }
            if (controls && (controls as any).target) {
                const t = (controls as any).target as THREE.Vector3
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
