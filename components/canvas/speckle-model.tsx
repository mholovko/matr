"use client"

import { useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'
import { useAppStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { fetchSpeckleData } from '@/lib/speckle/loader'
import { convertSpeckleObject } from '@/lib/speckle/converter'
import { SpeckleObject } from '@/lib/speckle/types'
import { useThree, ThreeEvent, useFrame } from '@react-three/fiber'
import type { OrbitControls } from 'three-stdlib'
import { DOLLHOUSE_CONFIG, getSectorFromCamera, DollhouseSide } from '@/lib/dollhouse-config'

interface SpeckleModelProps {
    projectId: string
    modelId: string
    visible?: boolean
    renderBackFaces?: boolean
    enableFiltering?: boolean
    enableSelection?: boolean
}

export function SpeckleModel({ projectId, modelId, visible = true, renderBackFaces = false, enableFiltering = true, enableSelection = true }: SpeckleModelProps) {
    const [sceneGroup, setSceneGroup] = useState<THREE.Group | null>(null)
    const [pointerDown, setPointerDown] = useState<{ x: number; y: number } | null>(null)
    const { setSelectedElement, setLoading, selectedElementId, setModelElements, filters, selectedAssemblyId } = useAppStore(
        useShallow((state) => ({
            setSelectedElement: state.setSelectedElement,
            setLoading: state.setLoading,
            selectedElementId: state.selectedElementId,
            setModelElements: state.setModelElements,
            filters: state.filters,
            selectedAssemblyId: state.selectedAssemblyId,
        }))
    )
    const { controls } = useThree()

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
                const traverse = (obj: SpeckleObject) => {
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
                            if (Array.isArray(val) && val.length > 0 && (val[0] as SpeckleObject).id) {
                                val.forEach((child: SpeckleObject) => traverse(child))
                            }
                        })
                    }
                }

                traverse(root)
                console.log(`Created ${meshCount} mesh groups. Container has ${container.children.length} children.`)
                console.log(`Collected ${allElements.length} building elements`)

                // Apply Revit Z-up rotation to the container immediately
                container.rotation.x = -Math.PI / 2

                // Store all elements in the app state ONLY if visible
                if (visible) {
                    setModelElements(allElements)
                }

                // Handle Units (Simple heuristic for now)
                // Calculate initial bounds to check size
                const box = new THREE.Box3().setFromObject(container)
                const size = box.getSize(new THREE.Vector3())
                const center = box.getCenter(new THREE.Vector3())
                const min = box.min
                const max = box.max

                console.log("=== MODEL BOUNDS ===")
                console.log("Size:", { x: size.x, y: size.y, z: size.z })
                console.log("Center:", { x: center.x, y: center.y, z: center.z })
                console.log("Min:", { x: min.x, y: min.y, z: min.z })
                console.log("Max:", { x: max.x, y: max.y, z: max.z })
                console.log("===================")

                // If the model is huge (>1000 units), assume it's Millimeters and scale to Meters
                if (size.length() > 1000) {
                    console.log("Scaling model from mm to m (0.001)")
                    container.scale.set(0.001, 0.001, 0.001)

                    // Recalculate bounds after scaling
                    const scaledBox = new THREE.Box3().setFromObject(container)
                    const scaledSize = scaledBox.getSize(new THREE.Vector3())
                    const scaledCenter = scaledBox.getCenter(new THREE.Vector3())
                    console.log("=== SCALED MODEL BOUNDS ===")
                    console.log("Scaled Size:", { x: scaledSize.x, y: scaledSize.y, z: scaledSize.z })
                    console.log("Scaled Center:", { x: scaledCenter.x, y: scaledCenter.y, z: scaledCenter.z })
                    console.log("===========================")
                }

                setSceneGroup(container)

            } catch (err) {
                console.error("Failed to load Speckle model", err)
            } finally {
                setLoading(false, 100)
            }
        }

        load()
    }, [projectId, modelId, setLoading, setModelElements]) // Removed visible from dependency to avoid reloading on toggle

    // Update store when visibility changes
    useEffect(() => {
        if (visible && sceneGroup) {
            const allElements: SpeckleObject[] = []
            sceneGroup.traverse((obj) => {
                if (obj.userData.id && obj.userData.properties) {
                    allElements.push(obj.userData as SpeckleObject)
                }
            })
            setModelElements(allElements)
        }
    }, [visible, sceneGroup, setModelElements])

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

    // Dollhouse Logic
    const [currentSector, setCurrentSector] = useState<DollhouseSide[]>([])
    const { viewMode } = useAppStore(useShallow(state => ({ viewMode: state.viewMode })))

    // Update sector based on camera position
    useFrame(({ camera }) => {
        if (viewMode !== 'dollhouse') return

        const orbitControls = controls as unknown as OrbitControls
        const target = orbitControls?.target || new THREE.Vector3(0, 0, 0)

        // Simple throttling or check every frame? 
        // For smoothness, every frame is fine, but state update only on change
        const newSector = getSectorFromCamera(camera, target)

        // Array comparison
        if (newSector.length !== currentSector.length || !newSector.every((val, index) => val === currentSector[index])) {
            setCurrentSector(newSector)
        }
    })

    // Apply filters to show/hide elements AND handle backface rendering
    useEffect(() => {
        if (!sceneGroup) return

        // Apply backface rendering if enabled
        if (renderBackFaces) {
            sceneGroup.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const material = child.material as THREE.MeshStandardMaterial
                    material.side = THREE.BackSide
                    material.needsUpdate = true
                }
            })
        }

        const hasFilters = filters.categories.length > 0 || filters.levels.length > 0 || filters.groups.length > 0
        const isDollhouse = viewMode === 'dollhouse' && currentSector.length > 0 && !selectedAssemblyId

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

                const isHidden = element.properties?.isHidden // Check for explicit hidden state if we add that later

                // DOLLHOUSE VISIBILITY CHECK
                let isHiddenByDollhouse = false
                if (isDollhouse && groupName) {
                    // Check if group is hidden in ANY of the current sectors
                    for (const sector of currentSector) {
                        const hiddenGroups = DOLLHOUSE_CONFIG[sector]
                        if (hiddenGroups.includes(groupName)) {
                            isHiddenByDollhouse = true
                            break
                        }
                    }
                }

                // If no filters active OR filtering is disabled, show everything (unless hidden by dollhouse)
                if ((!hasFilters || !enableFiltering) && !isHiddenByDollhouse) {
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

                // Element is visible if it matches all active filter types AND is not hidden by dollhouse
                child.visible = matchesCategory && matchesLevel && matchesGroup && !isHiddenByDollhouse

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
    }, [sceneGroup, filters, renderBackFaces, enableFiltering, viewMode, currentSector, selectedAssemblyId])

    // Removed automatic camera fitting - rely on OrbitControls default behavior
    // The initial camera position from Canvas props is sufficient

    // Interaction Handlers - distinguish between click and drag
    const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
        setPointerDown({ x: e.clientX, y: e.clientY })
    }

    const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
        if (!pointerDown || !enableSelection) return

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

            // Check for groupName
            const groupName = fullElement.properties?.groupName
            const { selectedAssemblyId, setSelectedAssembly } = useAppStore.getState()

            // LOGIC:
            // 1. If we are already viewing this assembly, we can select individual elements within it.
            // 2. If we are NOT viewing it (or clicked a different group), clicking a grouped element selects the ASSEMBLY first.

            if (selectedAssemblyId === groupName) {
                // We are already viewing this assembly -> Select the element
                setSelectedElement(elementId, fullElement)
            } else if (groupName) {
                // We are NOT viewing this assembly -> Select the ASSEMBLY
                console.log(`Element belongs to group: ${groupName}. Selecting Assembly.`)

                // 1. Clear existing filters
                useAppStore.getState().clearFilters()

                // 2. Set the group filter (Isolate)
                useAppStore.getState().toggleGroupFilter(groupName)

                // 3. Set Assembly Selection
                setSelectedAssembly(groupName)
                setSelectedElement(null) // Clear element selection to show assembly view
            } else {
                // No group -> Standard Element Selection
                setSelectedElement(elementId, fullElement)
                setSelectedAssembly(null)
            }
        }

        setPointerDown(null)
    }


    // Selection Highlight Logic & Raycasting Control
    // Re-color meshes based on selection and disable raycasting if selection is disabled
    useEffect(() => {
        if (!sceneGroup) return
        sceneGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // Raycasting control: make mesh "transparent" to clicks if selection is disabled OR if parent is hidden
                // This allows clicks to pass through to the canvas onPointerMissed event
                // And prevents hidden/filtered elements from blocking clicks on visible ones
                const isParentVisible = child.parent ? child.parent.visible : true

                if (enableSelection && isParentVisible) {
                    child.raycast = THREE.Mesh.prototype.raycast
                } else {
                    child.raycast = () => { }
                }

                // Only highlight if selection is enabled AND it matches the selected ID
                const isSelected = enableSelection && child.userData.parentId === selectedElementId
                    // Reset color or highlight
                    ; (child.material as THREE.MeshStandardMaterial).color.set(
                        isSelected ? '#3b82f6' : '#e2e8f0'
                    )
            }
        })
    }, [selectedElementId, sceneGroup, enableSelection])

    if (!sceneGroup) return null

    return (
        <group
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            visible={visible}
        >
            <primitive object={sceneGroup} />
        </group>
    )
}