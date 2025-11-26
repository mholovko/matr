"use client"

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { useAppStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { fetchSpeckleData } from '@/lib/speckle/loader'
import { SpeckleObject } from '@/lib/speckle/types'
import { useThree, ThreeEvent, useFrame } from '@react-three/fiber'
import type { OrbitControls } from 'three-stdlib'
import { DOLLHOUSE_CONFIG, getSectorFromCamera, DollhouseSide } from '@/lib/dollhouse-config'
import { buildPhaseDataTree } from '@/lib/filters/phase-map'
import { phasesOrder } from '@/lib/data/phases'

interface SpeckleModelProps {
    projectId: string
    modelId: string
    visible?: boolean
    renderBackFaces?: boolean
    enableFiltering?: boolean
    enableSelection?: boolean
    isPrimaryModel?: boolean
}

export function SpeckleModel({ projectId, modelId, visible = true, renderBackFaces = false, enableFiltering = true, enableSelection = true, isPrimaryModel = true }: SpeckleModelProps) {
    const [sceneGroup, setSceneGroup] = useState<THREE.Group | null>(null)
    const [pointerDown, setPointerDown] = useState<{ x: number; y: number } | null>(null)
    const { setSelectedElement, setLoading, selectedElementId, setModelElements, filters, selectedAssemblyId, renderMode, setPhaseDataTree, phases, isInteracting, selectionMode, selectedMaterialName } = useAppStore(
        useShallow((state) => ({
            setSelectedElement: state.setSelectedElement,
            setLoading: state.setLoading,
            selectedElementId: state.selectedElementId,
            setModelElements: state.setModelElements,
            filters: state.filters,
            selectedAssemblyId: state.selectedAssemblyId,
            renderMode: state.renderMode,
            setPhaseDataTree: state.setPhaseDataTree,
            phases: state.phases,
            isInteracting: state.isInteracting,
            selectionMode: state.selectionMode,
            selectedMaterialName: state.selectedMaterialName,
        }))
    )
    const { controls, camera } = useThree()

    useEffect(() => {
        const load = async () => {
            setLoading(true, 0)
            try {
                // 1. Fetch Raw Data
                const root = await fetchSpeckleData(projectId, modelId) as SpeckleObject
                console.log("Speckle Root Object:", root)

                // 2. NEW: Convert to RenderViews instead of creating meshes
                const { convertToRenderViews } = await import('@/lib/viewer/converter')
                const renderViews = convertToRenderViews(root)
                console.log(`Converted ${renderViews.length} render views`)

                // 2.5. Extract material lookup map from renderMaterialProxies
                const materialLookup = new Map<string, string>() // meshId → materialName

                if (root.renderMaterialProxies && Array.isArray(root.renderMaterialProxies)) {
                    root.renderMaterialProxies.forEach((proxy: any) => {
                        const materialName = proxy.value?.name
                        const objectIds = proxy.objects || []

                        if (materialName && Array.isArray(objectIds)) {
                            objectIds.forEach((meshId: string) => {
                                materialLookup.set(meshId, materialName)
                            })
                        }
                    })
                }

                console.log(`Built material lookup map with ${materialLookup.size} mesh-material mappings`)

                // 3. Extract metadata for the store (still needed for filtering UI)
                const allElements: SpeckleObject[] = []
                const traverse = (obj: SpeckleObject) => {
                    if (obj.id && obj.properties) {
                        allElements.push(obj)
                    }
                    const children = obj.elements || obj['@elements'] || []
                    if (Array.isArray(children)) {
                        children.forEach(traverse)
                    } else {
                        Object.values(obj).forEach(val => {
                            if (Array.isArray(val) && val.length > 0 && (val[0] as SpeckleObject).id) {
                                val.forEach((child: SpeckleObject) => traverse(child))
                            }
                        })
                    }
                }
                traverse(root)
                console.log(`Collected ${allElements.length} building elements`)

                // 4. NEW: Create Batcher and build batches
                const { Batcher } = await import('@/lib/viewer/batching/batcher')
                const batcher = new Batcher()
                batcher.setMaterialLookup(materialLookup)
                batcher.makeBatches(renderViews, renderBackFaces)

                const batches = batcher.getBatches()
                console.log(`Created ${batches.length} batches (was ${allElements.length} individual meshes)`)

                // 5. Create container and add batched meshes
                const container = new THREE.Group()
                batches.forEach(batch => {
                    container.add(batch.mesh)
                })

                // Apply Revit Z-up rotation to the container
                container.rotation.x = -Math.PI / 2

                // Handle Units - Calculate bounds
                const box = new THREE.Box3().setFromObject(container)
                const size = box.getSize(new THREE.Vector3())
                const center = box.getCenter(new THREE.Vector3())

                console.log("=== MODEL BOUNDS ===")
                console.log("Size:", { x: size.x, y: size.y, z: size.z })
                console.log("Center:", { x: center.x, y: center.y, z: center.z })
                console.log("===================")

                // If the model is huge (>1000 units), scale from mm to m
                if (size.length() > 1000) {
                    console.log("Scaling model from mm to m (0.001)")
                    container.scale.set(0.001, 0.001, 0.001)
                }

                // Store all elements in the app state (ONLY if primary model)
                if (isPrimaryModel) {
                    setModelElements(allElements)
                    const phaseTree = buildPhaseDataTree(allElements, phasesOrder)
                    console.log('Phase tree created:', phaseTree)
                    setPhaseDataTree(phaseTree)
                    console.log('Default phase set to:', phaseTree?.phasesByOrder[phaseTree.phasesByOrder.length - 1])
                }

                // Store the batcher instance in userData for later access
                container.userData.batcher = batcher

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

    // Dollhouse Logic
    // Using ref instead of state to avoid re-renders on every frame
    const currentSectorRef = useRef<DollhouseSide[]>([])
    const { viewMode } = useAppStore(useShallow(state => ({ viewMode: state.viewMode })))

    // Unified Filtering Logic
    const applyFilters = useCallback(() => {
        const batcher = sceneGroup?.userData.batcher
        if (!batcher) return

        // If filtering is disabled, show all elements
        if (!enableFiltering) {
            batcher.setFilter(null)
            return
        }

        const state = useAppStore.getState()
        const filteredIds = state.getFilteredElementIds()
        const isDollhouse = state.viewMode === 'dollhouse' && currentSectorRef.current.length > 0 && !state.selectedAssemblyId

        if (!isDollhouse) {
            batcher.setFilter(filteredIds)
            return
        }

        // Dollhouse logic
        const visibleSet = new Set<string>()
        const sectors = currentSectorRef.current

        // Iterate all batches to determine visibility
        // This is necessary because we need to check groupName property for Dollhouse
        Object.values(batcher.batches).forEach((batch: any) => {
            batch.batchObjects.forEach((obj: any) => {
                // 1. Check Base Filters
                if (filteredIds && !filteredIds.has(obj.elementId)) return

                // 2. Check Dollhouse
                const groupName = obj.properties?.groupName
                let isHiddenByDollhouse = false
                if (groupName) {
                    for (const sector of sectors) {
                        const hiddenGroups = DOLLHOUSE_CONFIG[sector]
                        if (hiddenGroups && hiddenGroups.includes(groupName)) {
                            isHiddenByDollhouse = true
                            break
                        }
                    }
                }

                if (!isHiddenByDollhouse) {
                    visibleSet.add(obj.elementId)
                }
            })
        })

        batcher.setFilter(visibleSet)
    }, [sceneGroup, filters, phases.selectedPhase, phases.filterMode, viewMode, selectedAssemblyId, selectedMaterialName, enableFiltering]) // Added dependencies for useCallback

    // Trigger filters when state changes
    useEffect(() => {
        applyFilters()
    }, [filters, phases.selectedPhase, phases.filterMode, viewMode, selectedAssemblyId, selectedMaterialName, applyFilters])

    // Update sector based on camera position
    useFrame(({ camera }) => {
        if (viewMode !== 'dollhouse') return

        const orbitControls = controls as unknown as OrbitControls
        const target = orbitControls?.target || new THREE.Vector3(0, 0, 0)

        const newSector = getSectorFromCamera(camera, target)

        // Array comparison - only update ref if changed
        if (newSector.length !== currentSectorRef.current.length || !newSector.every((val, index) => val === currentSectorRef.current[index])) {
            currentSectorRef.current = newSector
            applyFilters() // Trigger filtering without re-render
        }
    })

    // Selection Highlighting
    useEffect(() => {
        const batcher = sceneGroup?.userData.batcher
        if (!batcher) return

        if (selectedElementId) {
            // Highlight the selected element
            batcher.highlight([selectedElementId])
        } else {
            // Clear highlighting
            batcher.clearHighlight()
        }
    }, [selectedElementId, sceneGroup])

    // Apply filters to show/hide elements AND handle backface rendering
    // Memoize phase filtered IDs to avoid redundant calculations
    const phaseFilteredIds = useMemo(() => {
        return phases.dataTree && phases.selectedPhase
            ? useAppStore.getState().getFilteredElementIds()
            : null
    }, [phases.dataTree, phases.selectedPhase, phases.filterMode])

    // Phase Coloring Logic
    useEffect(() => {
        const batcher = sceneGroup?.userData.batcher
        if (!batcher || !phases.dataTree || !phases.selectedPhase) return

        if (phases.filterMode === 'diff') {
            const phaseData = phases.dataTree.elementsByPhase[phases.selectedPhase]
            if (!phaseData) return

            const statusMap = new Map<string, 'created' | 'demolished' | 'existing'>()

            // Map Created
            phaseData.created.forEach(id => statusMap.set(id, 'created'))

            // Map Demolished
            phaseData.demolished.forEach(id => statusMap.set(id, 'demolished'))

            // Map Existing (Active but not Created)
            phaseData.active.forEach(id => {
                if (!phaseData.created.has(id)) {
                    statusMap.set(id, 'existing')
                }
            })

            batcher.applyPhaseColors(statusMap)
        } else {
            // For other modes, we clear phase colors (visibility handled separately)
            batcher.clearPhaseColors()
        }
    }, [phases.selectedPhase, phases.filterMode, phases.dataTree, sceneGroup])




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

            // Use BatchRaycaster for selection
            const batcher = sceneGroup?.userData.batcher
            if (!batcher) {
                console.warn('Batcher not found in scene userData')
                setPointerDown(null)
                return
            }

            // Get camera from component scope (from useThree hook)
            const threeCamera = camera

            // Import and use the raycaster
            import('@/lib/viewer/batch-raycaster').then(({ BatchRaycaster }) => {
                const raycaster = new BatchRaycaster()

                // Convert mouse position to normalized device coordinates
                const pointer = new THREE.Vector2(
                    (e.clientX / window.innerWidth) * 2 - 1,
                    -(e.clientY / window.innerHeight) * 2 + 1
                )

                const result = raycaster.intersect(threeCamera, pointer, batcher)

                if (result) {
                    const { batchObject } = result
                    console.log('Selected element:', batchObject.elementId)
                    console.log('Element properties:', batchObject.properties)

                    // Check for assembly/group logic
                    const groupName = batchObject.properties?.groupName
                    const { selectedAssemblyId, setSelectedAssembly } = useAppStore.getState()

                    if (selectionMode === 'elements') {
                        // Elements mode: always select the individual element
                        setSelectedElement(batchObject.elementId, {
                            id: batchObject.elementId,
                            speckle_type: batchObject.speckleType,
                            properties: batchObject.properties,
                            ...batchObject.properties
                        })
                        setSelectedAssembly(null)
                    } else if (selectionMode === 'material') {
                        // Material mode: filter by the specific mesh's material
                        const meshMaterialName = batchObject.materialName

                        if (meshMaterialName) {
                            // Use mesh-specific material
                            console.log(`Clicked mesh has material: "${meshMaterialName}"`)

                            const { selectedMaterialName, setSelectedMaterial } = useAppStore.getState()

                            if (selectedMaterialName === meshMaterialName) {
                                // Already viewing this material -> select the element
                                setSelectedElement(batchObject.elementId, {
                                    id: batchObject.elementId,
                                    speckle_type: batchObject.speckleType,
                                    properties: batchObject.properties,
                                    ...batchObject.properties
                                })
                            } else {
                                // Not viewing this material -> filter by it
                                console.log(`Material mode: Filtering by material "${meshMaterialName}"`)
                                setSelectedMaterial(meshMaterialName)
                                setSelectedElement(null, undefined)
                            }
                        } else {
                            // Mesh has no material mapping - fallback to element-level material
                            console.warn('No material mapping for clicked mesh, using element-level material')

                            const materialQuantities = batchObject.properties?.["Material Quantities"] || {}
                            const materialNames = Object.keys(materialQuantities)

                            if (materialNames.length > 0) {
                                const sortedMaterials = materialNames
                                    .map(name => ({
                                        name,
                                        volume: materialQuantities[name]?.volume?.value || 0
                                    }))
                                    .sort((a, b) => b.volume - a.volume)

                                const dominantMaterial = sortedMaterials[0].name
                                const { selectedMaterialName, setSelectedMaterial } = useAppStore.getState()

                                if (selectedMaterialName === dominantMaterial) {
                                    setSelectedElement(batchObject.elementId, {
                                        id: batchObject.elementId,
                                        speckle_type: batchObject.speckleType,
                                        properties: batchObject.properties,
                                        ...batchObject.properties
                                    })
                                } else {
                                    setSelectedMaterial(dominantMaterial)
                                    setSelectedElement(null, undefined)
                                }
                            } else {
                                // No materials at all
                                setSelectedElement(batchObject.elementId, {
                                    id: batchObject.elementId,
                                    speckle_type: batchObject.speckleType,
                                    properties: batchObject.properties,
                                    ...batchObject.properties
                                })
                                useAppStore.getState().setSelectedMaterial(null)
                            }
                        }
                    } else if (selectedAssemblyId === groupName) {
                        // Assembly mode: already viewing this assembly -> select the element
                        setSelectedElement(batchObject.elementId, {
                            id: batchObject.elementId,
                            speckle_type: batchObject.speckleType,
                            properties: batchObject.properties,
                            ...batchObject.properties
                        })
                    } else if (groupName) {
                        // Assembly mode: not viewing this assembly -> select the assembly
                        console.log(`Element belongs to group: ${groupName}. Selecting Assembly.`)
                        useAppStore.getState().clearFilters()
                        useAppStore.getState().toggleGroupFilter(groupName)
                        setSelectedAssembly(groupName)
                        setSelectedElement(null, undefined)
                    } else {
                        // No group -> standard element selection
                        setSelectedElement(batchObject.elementId, {
                            id: batchObject.elementId,
                            speckle_type: batchObject.speckleType,
                            properties: batchObject.properties,
                            ...batchObject.properties
                        })
                        setSelectedAssembly(null)
                    }
                } else {
                    // Clicked on empty space or hidden element - deselect
                    setSelectedElement(null, undefined)
                    const { selectedAssemblyId } = useAppStore.getState()
                    if (selectedAssemblyId) {
                        // Clear the group filter that was applied during assembly selection
                        useAppStore.getState().clearFilters()
                    }
                    useAppStore.getState().setSelectedAssembly(null)
                    useAppStore.getState().setSelectedMaterial(null)
                }
            })
        }

        setPointerDown(null)
    }

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