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

    // 1. UPDATED: Fetch 'selectedElementIds' (plural) from store
    const {
        setSelectedElement,
        setLoading,
        selectedElementId,
        selectedElementIds, // <--- Added this
        setModelElements,
        filters,
        selectedAssemblyId,
        renderMode,
        setPhaseDataTree,
        phases,
        isInteracting,
        selectionMode,
        searchTerm,
        hoveredElementIds
    } = useAppStore(
        useShallow((state) => ({
            setSelectedElement: state.setSelectedElement,
            setLoading: state.setLoading,
            selectedElementId: state.selectedElementId,
            selectedElementIds: state.selectedElementIds, // <--- Added this
            setModelElements: state.setModelElements,
            filters: state.filters,
            selectedAssemblyId: state.selectedAssemblyId,
            renderMode: state.renderMode,
            setPhaseDataTree: state.setPhaseDataTree,
            phases: state.phases,
            isInteracting: state.isInteracting,
            selectionMode: state.selectionMode,
            searchTerm: state.searchTerm,
            hoveredElementIds: state.hoveredElementIds
        }))
    )
    const { controls, camera } = useThree()

    // ... [Loading Logic remains exactly the same] ...
    useEffect(() => {
        const load = async () => {
            setLoading(true, 0)
            try {
                const root = await fetchSpeckleData(projectId, modelId) as SpeckleObject
                const { convertToRenderViews } = await import('@/lib/viewer/converter')
                const renderViews = convertToRenderViews(root)

                const materialLookup = new Map<string, string>()
                const materialDefinitions = new Map<string, any>()

                if (root.renderMaterialProxies && Array.isArray(root.renderMaterialProxies)) {
                    root.renderMaterialProxies.forEach((proxy: any) => {
                        const materialName = proxy.value?.name
                        const materialProps = proxy.value
                        const objectIds = proxy.objects || []

                        if (materialName && Array.isArray(objectIds)) {
                            if (!materialDefinitions.has(materialName)) {
                                materialDefinitions.set(materialName, materialProps)
                            }
                            objectIds.forEach((meshId: string) => {
                                materialLookup.set(meshId, materialName)
                            })
                        }
                    })
                }

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

                const { Batcher } = await import('@/lib/viewer/batching/batcher')
                const batcher = new Batcher()
                batcher.setMaterialLookup(materialLookup)
                batcher.setMaterialDefinitions(materialDefinitions)
                batcher.makeBatches(renderViews, renderBackFaces)

                const batches = batcher.getBatches()
                const container = new THREE.Group()
                batches.forEach(batch => {
                    container.add(batch.mesh)
                })

                container.rotation.x = -Math.PI / 2
                const box = new THREE.Box3().setFromObject(container)
                const size = box.getSize(new THREE.Vector3())

                if (size.length() > 1000) {
                    container.scale.set(0.001, 0.001, 0.001)
                }

                if (isPrimaryModel) {
                    setModelElements(allElements)
                    const phaseTree = buildPhaseDataTree(allElements, phasesOrder)
                    setPhaseDataTree(phaseTree)
                }

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

    useEffect(() => {
        if (!sceneGroup) return
        sceneGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.raycast = THREE.Mesh.prototype.raycast
            }
        })
    }, [sceneGroup])

    // Dollhouse Logic
    const currentSectorRef = useRef<DollhouseSide[]>([])
    const { viewMode } = useAppStore(useShallow(state => ({ viewMode: state.viewMode })))

    const applyFilters = useCallback(() => {
        const batcher = sceneGroup?.userData.batcher
        if (!batcher) return

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

        const visibleSet = new Set<string>()
        const sectors = currentSectorRef.current

        Object.values(batcher.batches).forEach((batch: any) => {
            batch.batchObjects.forEach((obj: any) => {
                if (filteredIds && !filteredIds.has(obj.elementId)) return

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
    }, [sceneGroup, filters, phases.selectedPhase, phases.filterMode, viewMode, selectedAssemblyId, enableFiltering, searchTerm])

    useEffect(() => {
        applyFilters()
    }, [filters, phases.selectedPhase, phases.filterMode, viewMode, selectedAssemblyId, applyFilters, searchTerm])

    useFrame(({ camera }) => {
        if (viewMode !== 'dollhouse') return

        const orbitControls = controls as unknown as OrbitControls
        const target = orbitControls?.target || new THREE.Vector3(0, 0, 0)
        const newSector = getSectorFromCamera(camera, target)

        if (newSector.length !== currentSectorRef.current.length || !newSector.every((val, index) => val === currentSectorRef.current[index])) {
            currentSectorRef.current = newSector
            applyFilters()
        }
    })

    // 2. UPDATED: Selection Highlighting
    // Changed dependency from selectedElementId to selectedElementIds
    useEffect(() => {
        const batcher = sceneGroup?.userData.batcher
        if (!batcher) return

        // We use the plural array to allow multi-selection
        if (selectedElementIds && selectedElementIds.length > 0) {
            batcher.highlight(selectedElementIds)
        } else {
            batcher.clearHighlight()
        }
    }, [selectedElementIds, sceneGroup]) // <--- Dependency updated

    // Hover Highlighting
    useEffect(() => {
        const batcher = sceneGroup?.userData.batcher
        if (!batcher) return

        if (hoveredElementIds && hoveredElementIds.length > 0) {
            batcher.hover(hoveredElementIds)
        } else {
            batcher.clearHover()
        }
    }, [hoveredElementIds, sceneGroup])

    // Phase Coloring Logic
    useEffect(() => {
        const batcher = sceneGroup?.userData.batcher
        if (!batcher || !phases.dataTree || !phases.selectedPhase) return

        if (phases.filterMode === 'diff') {
            const phaseData = phases.dataTree.elementsByPhase[phases.selectedPhase]
            if (!phaseData) return

            const statusMap = new Map<string, 'created' | 'demolished' | 'existing'>()
            phaseData.created.forEach(id => statusMap.set(id, 'created'))
            phaseData.demolished.forEach(id => statusMap.set(id, 'demolished'))
            phaseData.active.forEach(id => {
                if (!phaseData.created.has(id)) {
                    statusMap.set(id, 'existing')
                }
            })
            batcher.applyPhaseColors(statusMap)
        } else {
            batcher.clearPhaseColors()
        }
    }, [phases.selectedPhase, phases.filterMode, phases.dataTree, sceneGroup])

    const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
        setPointerDown({ x: e.clientX, y: e.clientY })
    }

    const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
        if (!pointerDown || !enableSelection) return

        const deltaX = Math.abs(e.clientX - pointerDown.x)
        const deltaY = Math.abs(e.clientY - pointerDown.y)
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

        if (distance < 5) {
            e.stopPropagation()

            const batcher = sceneGroup?.userData.batcher
            if (!batcher) {
                setPointerDown(null)
                return
            }

            const threeCamera = camera
            import('@/lib/viewer/batch-raycaster').then(({ BatchRaycaster }) => {
                const raycaster = new BatchRaycaster()
                const pointer = new THREE.Vector2(
                    (e.clientX / window.innerWidth) * 2 - 1,
                    -(e.clientY / window.innerHeight) * 2 + 1
                )

                const result = raycaster.intersect(threeCamera, pointer, batcher)

                if (result) {
                    const { batchObject } = result
                    const groupName = batchObject.properties?.groupName
                    const { selectedAssemblyId, setSelectedAssembly } = useAppStore.getState()

                    if (selectionMode === 'elements') {
                        const { setHighlights, toggleElementSelection, selectedElementIds } = useAppStore.getState()
                        const isMultiSelect = e.ctrlKey || e.metaKey

                        if (isMultiSelect) {
                            // Toggle selection
                            toggleElementSelection(batchObject.elementId, {
                                id: batchObject.elementId,
                                speckle_type: batchObject.speckleType,
                                properties: batchObject.properties,
                                ...batchObject.properties
                            })

                            // We don't need to manually call setHighlights here anymore because 
                            // the useEffect above will react to changes in selectedElementIds 
                            // and update the batcher automatically.
                        } else {
                            // Single select
                            setSelectedElement(batchObject.elementId, {
                                id: batchObject.elementId,
                                speckle_type: batchObject.speckleType,
                                properties: batchObject.properties,
                                ...batchObject.properties
                            })

                            // For visual clarity in filters (optional)
                            setHighlights({
                                type: 'element',
                                values: [batchObject.elementId]
                            })
                        }
                        setSelectedAssembly(null)

                    } else if (selectionMode === 'material') {
                        // ... [Existing Material Logic remains the same] ...
                        const meshMaterialName = batchObject.materialName
                        const { filters, setMaterialFilter, setHighlights } = useAppStore.getState()

                        if (meshMaterialName && !filters.materials.includes(meshMaterialName)) {
                            setMaterialFilter(meshMaterialName)
                            setHighlights({ type: 'material', values: [meshMaterialName] })
                            setSelectedElement(null, undefined)
                        } else {
                            // Fallback to selecting the element if material is already active
                            setSelectedElement(batchObject.elementId, {
                                id: batchObject.elementId,
                                speckle_type: batchObject.speckleType,
                                properties: batchObject.properties,
                                ...batchObject.properties
                            })
                        }

                    } else if (selectedAssemblyId === groupName) {
                        // Select element inside assembly
                        setSelectedElement(batchObject.elementId, {
                            id: batchObject.elementId,
                            speckle_type: batchObject.speckleType,
                            properties: batchObject.properties,
                            ...batchObject.properties
                        })
                    } else if (groupName) {
                        // Select Assembly
                        useAppStore.getState().toggleGroupFilter(groupName)
                        setSelectedAssembly(groupName)
                        setSelectedElement(null, undefined)
                    } else {
                        // Default
                        setSelectedElement(batchObject.elementId, {
                            id: batchObject.elementId,
                            speckle_type: batchObject.speckleType,
                            properties: batchObject.properties,
                            ...batchObject.properties
                        })
                        setSelectedAssembly(null)
                    }
                } else {
                    // Clicked empty space
                    setSelectedElement(null, undefined)
                    const { selectedAssemblyId, clearAllFilters, clearHighlights } = useAppStore.getState()
                    clearAllFilters()
                    clearHighlights()
                    if (selectedAssemblyId) {
                        useAppStore.getState().setSelectedAssembly(null)
                    }
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