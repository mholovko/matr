"use client"

import { useThree } from '@react-three/fiber'
import { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { cameras } from '@/lib/data/photomatch'
import { blenderToThreeQuaternion } from '@/lib/math'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useAppStore } from '@/lib/store'

/**
 * Controls the camera position and FOV to match the virtual photomatch camera
 */
export function PhotomatchCameraController() {
    const { camera, controls } = useThree()
    const selectedPhotomatchCamera = useAppStore((state) => state.selectedPhotomatchCamera)
    const cameraKey = (selectedPhotomatchCamera || "camera.001") as keyof typeof cameras
    const cameraData = cameras[cameraKey]

    // Calculate target camera state
    const targetState = useMemo(() => {
        const [x, y, z] = cameraData.camera.position
        const pos = new THREE.Vector3(x, z, -y) // Blender to Three.js conversion
        const quat = blenderToThreeQuaternion(cameraData.camera.quaternion)

        // Calculate FOV
        let vFov: number
        if (cameraData.camera.sensorFit === "VERTICAL") {
            vFov = cameraData.camera.fov
        } else {
            const hFovRad = (cameraData.camera.fov * Math.PI) / 180
            const aspect = cameraData.camera.aspect
            const vFovRad = 2 * Math.atan(Math.tan(hFovRad / 2) / aspect)
            vFov = (vFovRad * 180) / Math.PI
        }
        const wideFov = vFov * 1.5

        // Calculate look-at target
        const lookDirection = new THREE.Vector3(0, 0, -1)
        lookDirection.applyQuaternion(quat)
        const target = pos.clone().add(lookDirection.multiplyScalar(10))

        return { position: pos, quaternion: quat, fov: wideFov, target }
    }, [selectedPhotomatchCamera, cameraData])

    // Animate camera when selection changes
    useEffect(() => {
        if (!camera || !controls) return

        // Capture start state from current camera position
        const startPos = camera.position.clone()
        const startFov = (camera as THREE.PerspectiveCamera).fov
        const orbitControls = controls as unknown as OrbitControlsImpl
        const startTarget = orbitControls.target.clone()

        // Animation parameters
        const duration = 1000 // ms
        const startTime = Date.now()

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease out cubic for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3)

            // Interpolate OrbitControls target first
            const currentTarget = new THREE.Vector3()
            currentTarget.lerpVectors(startTarget, targetState.target, eased)
            orbitControls.target.copy(currentTarget)

            // Calculate horizontal orbit path (spherical interpolation around Y-axis)
            // Convert start and end positions to spherical coordinates relative to target
            const startRelative = startPos.clone().sub(currentTarget)
            const endRelative = targetState.position.clone().sub(currentTarget)

            // Get spherical coordinates (radius, theta=horizontal angle, phi=vertical angle)
            const startRadius = startRelative.length()
            const endRadius = endRelative.length()

            const startTheta = Math.atan2(startRelative.x, startRelative.z)
            const endTheta = Math.atan2(endRelative.x, endRelative.z)

            const startPhi = Math.acos(startRelative.y / startRadius)
            const endPhi = Math.acos(endRelative.y / endRadius)

            // Interpolate in spherical space
            const currentRadius = THREE.MathUtils.lerp(startRadius, endRadius, eased)

            // Handle angle wrapping for shortest horizontal path
            let deltaTheta = endTheta - startTheta
            if (deltaTheta > Math.PI) deltaTheta -= 2 * Math.PI
            if (deltaTheta < -Math.PI) deltaTheta += 2 * Math.PI
            const currentTheta = startTheta + deltaTheta * eased

            const currentPhi = THREE.MathUtils.lerp(startPhi, endPhi, eased)

            // Convert back to Cartesian coordinates
            const currentPos = new THREE.Vector3(
                currentRadius * Math.sin(currentPhi) * Math.sin(currentTheta),
                currentRadius * Math.cos(currentPhi),
                currentRadius * Math.sin(currentPhi) * Math.cos(currentTheta)
            )
            currentPos.add(currentTarget)

            camera.position.copy(currentPos)

            if (camera instanceof THREE.PerspectiveCamera) {
                camera.fov = THREE.MathUtils.lerp(startFov, targetState.fov, eased)
                camera.updateProjectionMatrix()
            }

            // Make camera look at the interpolated target (maintains proper orientation)
            camera.lookAt(currentTarget)

            orbitControls.update()

            // Continue animation until complete
            if (progress < 1) {
                requestAnimationFrame(animate)
            }
            // When complete, animation naturally stops
            // OrbitControls remains enabled for user interaction
        }

        animate()
    }, [selectedPhotomatchCamera, camera, controls, targetState])

    return null
}
