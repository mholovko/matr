"use client"

import { useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'
import { useAppStore } from '@/lib/store'
import { fetchSpeckleData } from '@/lib/speckle/loader'
import { convertSpeckleObject } from '@/lib/speckle/converter'
import { SpeckleObject } from '@/lib/speckle/types'
import { useThree, ThreeEvent } from '@react-three/fiber'
import type { OrbitControls } from 'three-stdlib'

interface SpeckleModelProps {
    projectId: string
    modelId: string
}

export function SpeckleModel({ projectId, modelId }: SpeckleModelProps) {
    const [sceneGroup, setSceneGroup] = useState<THREE.Group | null>(null)
    const { setSelectedElement, setLoading, selectedElementId } = useAppStore()
    const { camera, controls } = useThree()

    useEffect(() => {
        const load = async () => {
            setLoading(true, 0)
            try {
                // 1. Fetch Raw Data
                const root = await fetchSpeckleData(projectId, modelId) as SpeckleObject
                console.log("Speckle Root Object:", root)

                // 2. Traverse & Convert
                const container = new THREE.Group()
                let meshCount = 0

                // Helper to recursively parse the tree
                const traverse = (obj: any) => {
                    // Convert current object if it has display geometry
                    const meshGroup = convertSpeckleObject(obj)
                    if (meshGroup) {
                        container.add(meshGroup)
                        meshCount++
                    }

                    // Check for children (Speckle structures vary: usually 'elements', '@elements', or array props)
                    // Also check for specific Revit categories which might be direct properties
                    const children = obj.elements || obj['@elements'] || []

                    if (Array.isArray(children)) {
                        children.forEach(traverse)
                    } else {
                        // Fallback: iterate over all keys to find arrays of objects (common in some Speckle converters)
                        Object.values(obj).forEach(val => {
                            if (Array.isArray(val) && val.length > 0 && (val[0] as any).id) {
                                val.forEach((child: any) => traverse(child))
                            }
                        })
                    }
                }

                traverse(root)
                console.log(`Created ${meshCount} mesh groups. Container has ${container.children.length} children.`)

                // Handle Units (Simple heuristic for now)
                // Calculate initial bounds to check size
                const box = new THREE.Box3().setFromObject(container)
                const size = box.getSize(new THREE.Vector3())

                // If the model is huge (>1000 units), assume it's Millimeters and scale to Meters
                if (size.length() > 1000) {
                    console.log("Scaling model from mm to m (0.001)")
                    container.scale.set(0.001, 0.001, 0.001)
                }

                setSceneGroup(container)

            } catch (err) {
                console.error("Failed to load Speckle model", err)
            } finally {
                setLoading(false, 100)
            }
        }

        load()
    }, [projectId, modelId, setLoading])

    // Camera Fitting Effect
    useEffect(() => {
        if (!sceneGroup || !controls) return

        // Give a small delay to ensure everything is rendered/updated
        const timer = setTimeout(() => {
            // Recalculate box after scaling/rendering
            const box = new THREE.Box3().setFromObject(sceneGroup)
            const size = box.getSize(new THREE.Vector3())
            const center = box.getCenter(new THREE.Vector3())
            const sphere = new THREE.Sphere()
            box.getBoundingSphere(sphere)

            console.log("Fitting Camera to Model:", { size, center, radius: sphere.radius })

            // Adjust camera to fit the sphere
            const dist = sphere.radius * 2.5 // Zoom factor
            const viewDir = new THREE.Vector3(1, 1, 1).normalize() // Isometric-ish view
            const target = sphere.center // Use actual model center
            const newPos = target.clone().add(viewDir.multiplyScalar(dist))

            camera.position.copy(newPos)
            camera.lookAt(target)

            const orbitControls = controls as unknown as OrbitControls
            if (orbitControls.target) {
                orbitControls.target.copy(target)
                orbitControls.update()
            }
        }, 100)

        return () => clearTimeout(timer)
    }, [sceneGroup, controls, camera])

    // Interaction Handler
    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        // We attached metadata to userData in the converter
        const data = e.object.userData

        // If we clicked a mesh, we want its PARENT (the Wall), not the mesh itself
        const elementId = data.parentId || data.id

        setSelectedElement(elementId, data.properties)
    }


    // Selection Highlight Logic
    // Re-color meshes based on selection
    useMemo(() => {
        if (!sceneGroup) return
        sceneGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const isSelected = child.userData.parentId === selectedElementId
                    // Reset color or highlight
                    ; (child.material as THREE.MeshStandardMaterial).color.set(
                        isSelected ? '#3b82f6' : '#e2e8f0'
                    )
            }
        })
    }, [selectedElementId, sceneGroup])

    if (!sceneGroup) return null

    return (
        <primitive
            object={sceneGroup}
            onClick={handleClick}
            rotation={[-Math.PI / 2, 0, 0]} // Revit Z-up adjustment
        />
    )
}