"use client"

import { useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { retrofitScopes } from '@/lib/data/scopes'
import type { OrbitControls } from 'three-stdlib'
import { useAppStore } from '@/lib/store'

interface CameraAnimatorProps {
    selectedScopeId: string | null
}

export function CameraAnimator({ selectedScopeId }: CameraAnimatorProps) {
    const { camera, controls } = useThree()
    const setViewMode = useAppStore(state => state.setViewMode)

    useEffect(() => {
        if (!controls) return

        let targetPos: THREE.Vector3
        let targetLookAt: THREE.Vector3

        if (selectedScopeId) {
            // Zoom to specific scope
            const scope = retrofitScopes.find(s => s.id === selectedScopeId)
            if (!scope?.cameraPosition || !scope?.markerPosition) return

            // Set Dollhouse mode based on scope configuration
            // If enableDollhouse is not set, default to false (disable dollhouse)
            setViewMode(scope.enableDollhouse === true ? 'dollhouse' : 'standard')

            targetPos = new THREE.Vector3(
                scope.cameraPosition.x,
                scope.cameraPosition.y,
                scope.cameraPosition.z
            )
            targetLookAt = new THREE.Vector3(
                scope.markerPosition.x,
                scope.markerPosition.y,
                scope.markerPosition.z
            )
        } else {
            // Reset to standard mode when no scope is selected
            setViewMode('standard')

            // Zoom to fit all markers
            const markersWithPositions = retrofitScopes.filter(s => s.markerPosition)
            if (markersWithPositions.length === 0) return

            // Calculate bounding box of all markers
            const positions = markersWithPositions.map(s => s.markerPosition!)
            const minX = Math.min(...positions.map(p => p.x))
            const maxX = Math.max(...positions.map(p => p.x))
            const minY = Math.min(...positions.map(p => p.y))
            const maxY = Math.max(...positions.map(p => p.y))
            const minZ = Math.min(...positions.map(p => p.z))
            const maxZ = Math.max(...positions.map(p => p.z))

            // Center of all markers
            const centerX = (minX + maxX) / 2
            const centerY = (minY + maxY) / 2
            const centerZ = (minZ + maxZ) / 2

            // Size of bounding box
            const sizeX = maxX - minX
            const sizeY = maxY - minY
            const sizeZ = maxZ - minZ
            const maxSize = Math.max(sizeX, sizeY, sizeZ)

            // Camera position: offset from center
            const distance = maxSize * 3 // Adjust multiplier for desired zoom level
            targetPos = new THREE.Vector3(
                centerX + -distance * 0.5,
                centerY + distance * 0.5,
                centerZ + distance * 0.5
            )
            targetLookAt = new THREE.Vector3(centerX, centerY, centerZ)
        }

        // Smooth camera animation
        const startPos = camera.position.clone()
        const orbitControls = controls as unknown as OrbitControls
        const startTarget = orbitControls.target.clone()
        const duration = 1000 // ms
        const startTime = Date.now()

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)

            camera.position.lerpVectors(startPos, targetPos, eased)
            orbitControls.target.lerpVectors(startTarget, targetLookAt, eased)
            orbitControls.update()

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        animate()
    }, [selectedScopeId, camera, controls, setViewMode])

    return null
}
