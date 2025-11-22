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
    const [pointerDown, setPointerDown] = useState<{ x: number; y: number } | null>(null)
    const { setSelectedElement, setLoading, selectedElementId, setModelElements, filters } = useAppStore()
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
                const allElements: SpeckleObject[] = []
                let meshCount = 0

                // Helper to recursively parse the tree
                const traverse = (obj: any) => {
                    // Collect element if it has properties (is a building element)
                    if (obj.id && obj.properties) {
                        allElements.push(obj)
                    }

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
                console.log(`Collected ${allElements.length} building elements`)

                // Store all elements in the app state
                setModelElements(allElements)

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
    }, [projectId, modelId, setLoading, setModelElements])

    // Enable pointer events on meshes after scene is loaded
    useEffect(() => {
        if (!sceneGroup) return

        sceneGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // Enable raycasting for this mesh
                child.raycast = THREE.Mesh.prototype.raycast
            }
        })
    }, [sceneGroup])

    // Apply filters to show/hide elements
    useEffect(() => {
        if (!sceneGroup) return

        const hasFilters = filters.categories.length > 0 || filters.levels.length > 0 || filters.groups.length > 0

        console.log("Applying filters:", filters)
        console.log("Has filters:", hasFilters)

        let visibleCount = 0
        let hiddenCount = 0

        sceneGroup.traverse((child) => {
            // Check if this is a Group with element data (not a mesh)
            if (child instanceof THREE.Group && child.userData.id && child.userData.properties) {
                const element = child.userData

                // Get element category, level, and group
                const category = element.category || element.properties?.builtInCategory?.replace("OST_", "")
                const level = element.level || element.properties?.Parameters?.["Instance Parameters"]?.Constraints?.["Base Constraint"]?.value
                const groupName = element.properties?.groupName

                // If no filters active, show everything
                if (!hasFilters) {
                    child.visible = true
                    // Enable raycasting for all meshes in this group
                    child.traverse((c) => {
                        if (c instanceof THREE.Mesh) {
                            c.raycast = THREE.Mesh.prototype.raycast
                        }
                    })
                    visibleCount++
                    return
                }

                // Check if element matches filters
                let matchesCategory = filters.categories.length === 0 || filters.categories.includes(category)
                let matchesLevel = filters.levels.length === 0 || filters.levels.includes(level)
                let matchesGroup = filters.groups.length === 0 || filters.groups.includes(groupName)

                // Element is visible if it matches all active filter types
                child.visible = matchesCategory && matchesLevel && matchesGroup

                // Disable/enable raycasting based on visibility
                child.traverse((c) => {
                    if (c instanceof THREE.Mesh) {
                        if (child.visible) {
                            c.raycast = THREE.Mesh.prototype.raycast
                        } else {
                            // Disable raycasting for invisible elements
                            c.raycast = () => { }
                        }
                    }
                })

                if (child.visible) {
                    visibleCount++
                } else {
                    hiddenCount++
                }
            }
        })

        console.log(`Filtering complete: ${visibleCount} visible, ${hiddenCount} hidden`)
    }, [sceneGroup, filters])

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

    // Interaction Handlers - distinguish between click and drag
    const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
        setPointerDown({ x: e.clientX, y: e.clientY })
    }

    const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
        if (!pointerDown) return

        // Calculate how much the pointer moved
        const deltaX = Math.abs(e.clientX - pointerDown.x)
        const deltaY = Math.abs(e.clientY - pointerDown.y)
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

        // Only treat as a click if movement is less than 5 pixels
        if (distance < 5) {
            e.stopPropagation()

            // Debug logging
            console.log("=== SELECTED MESH ===")
            console.log("Mesh object:", e.object)
            console.log("Mesh userData:", e.object.userData)
            console.log("Full event:", e)

            // We attached metadata to userData in the converter
            const data = e.object.userData

            // If we clicked a mesh, we want its PARENT (the Wall), not the mesh itself
            const elementId = data.parentId || data.id

            // Reconstruct the full element object from userData
            const fullElement = data.fullElement || {
                id: elementId,
                speckle_type: data.speckleType,
                properties: data.properties,
                ...data
            }

            console.log("Full element being passed to store:", fullElement)

            // Pass the complete element data
            setSelectedElement(elementId, fullElement)
        }

        setPointerDown(null)
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
        <group
            rotation={[-Math.PI / 2, 0, 0]} // Revit Z-up adjustment
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
        >
            <primitive object={sceneGroup} />
        </group>
    )
}