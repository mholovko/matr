import * as THREE from 'three'
import { MeshBatch } from './mesh-batch'
import { BatchObject } from './batch-object'
import { RenderView } from '@/lib/viewer/converter'

export class Batcher {
    public batches: { [id: string]: MeshBatch } = {}
    private maxVertices = 500000 // Limit per batch
    private highlightMaterial: THREE.MeshStandardMaterial | null = null
    private hoverMaterial: THREE.MeshStandardMaterial | null = null
    private defaultMaterial: THREE.MeshStandardMaterial | null = null
    private renderBackFaces: boolean = false

    // State Management
    private filteredOutElements: Set<string> = new Set()
    private highlightedElements: Set<string> = new Set()
    private hoveredElements: Set<string> = new Set()
    private phaseStatus: Map<string, 'created' | 'demolished' | 'existing'> = new Map()
    private phaseMaterials: {
        created: THREE.MeshStandardMaterial,
        demolished: THREE.MeshStandardMaterial,
        existing: THREE.MeshStandardMaterial
    } | null = null

    // Material Lookup
    private materialLookup: Map<string, string> = new Map()
    private materialDefinitions: Map<string, any> = new Map()

    constructor() { }

    public makeBatches(renderViews: RenderView[], renderBackFaces: boolean = false) {
        console.log(`Batcher: Starting to batch ${renderViews.length} render views. Backfaces: ${renderBackFaces}`)

        // Initialize materials with backface setting
        this.renderBackFaces = renderBackFaces

        // First pass: Assign material names to all RenderViews
        const renderViewsWithMaterials: Array<RenderView & { assignedMaterial: string }> = []

        renderViews.forEach(rv => {
            if (!rv.geometry) {
                console.warn('Batcher: Skipping render view with no geometry', rv)
                return
            }

            // Lookup material name for this mesh
            let materialName = 'default'
            if (rv.meshId && this.materialLookup.has(rv.meshId)) {
                materialName = this.materialLookup.get(rv.meshId)!
            }

            renderViewsWithMaterials.push({
                ...rv,
                assignedMaterial: materialName
            })
        })

        // Group RenderViews by material
        const materialGroups = new Map<string, typeof renderViewsWithMaterials>()
        renderViewsWithMaterials.forEach(rv => {
            const materialName = rv.assignedMaterial
            if (!materialGroups.has(materialName)) {
                materialGroups.set(materialName, [])
            }
            materialGroups.get(materialName)!.push(rv)
        })

        console.log(`Batcher: Grouped into ${materialGroups.size} material groups`)

        // Create one batch per material group
        materialGroups.forEach((renderViews, materialName) => {
            console.log(`Batcher: Creating batch for material "${materialName}" with ${renderViews.length} meshes`)

            // Split large material groups into sub-batches if needed (vertex limit)
            let currentVertices = 0
            let currentGeometries: THREE.BufferGeometry[] = []
            let currentBatchObjects: BatchObject[] = []

            const flush = () => {
                if (currentGeometries.length === 0) return

                try {
                    const mergedGeometry = new THREE.BufferGeometry()

                    // Calculate total size
                    let totalPos = 0
                    let totalIndex = 0

                    currentGeometries.forEach(g => {
                        totalPos += g.attributes.position.count
                        totalIndex += g.index ? g.index.count : 0
                    })

                    const positions = new Float32Array(totalPos * 3)
                    const indices = new Uint32Array(totalIndex)

                    let posOffset = 0
                    let indexOffset = 0
                    let currentFaceIndex = 0

                    currentGeometries.forEach((g, i) => {
                        const batchObj = currentBatchObjects[i]

                        // Apply transform to positions
                        const pos = g.attributes.position.array as Float32Array
                        const count = g.attributes.position.count
                        const transform = batchObj.renderView.transform || new THREE.Matrix4()

                        const v = new THREE.Vector3()
                        for (let k = 0; k < count; k++) {
                            v.set(pos[k * 3], pos[k * 3 + 1], pos[k * 3 + 2])
                            v.applyMatrix4(transform)
                            positions[posOffset + k * 3] = v.x
                            positions[posOffset + k * 3 + 1] = v.y
                            positions[posOffset + k * 3 + 2] = v.z
                        }

                        // Track face range for raycasting
                        const startFace = currentFaceIndex

                        // Copy indices with offset
                        if (g.index) {
                            const idx = g.index.array
                            const idxCount = g.index.count
                            for (let k = 0; k < idxCount; k++) {
                                indices[indexOffset + k] = idx[k] + (posOffset / 3)
                            }
                            indexOffset += idxCount
                            currentFaceIndex += idxCount / 3
                        }

                        const endFace = currentFaceIndex

                        // Update BatchObject metadata with face range
                        batchObj.batchIndex = indexOffset
                        batchObj.startFaceIndex = startFace
                        batchObj.endFaceIndex = endFace

                        posOffset += count * 3
                    })

                    mergedGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
                    mergedGeometry.setIndex(new THREE.BufferAttribute(indices, 1))
                    mergedGeometry.computeVertexNormals()

                    // Use material name as batch ID (with suffix for sub-batches)
                    const batchId = `${materialName}_${Math.random().toString(36).substring(7)}`

                    // Create material from Speckle definition
                    let currentMaterial: THREE.MeshStandardMaterial
                    const materialDef = this.materialDefinitions.get(materialName)
                    if (materialDef) {
                        currentMaterial = this.createMaterialFromSpeckle(materialName, materialDef, renderBackFaces)
                        console.log(`Batcher: Created material "${materialName}" with color ${currentMaterial.color.getHexString()}, opacity ${currentMaterial.opacity}`)
                    } else {
                        // Fallback to default material
                        currentMaterial = new THREE.MeshStandardMaterial({
                            color: 0xe2e8f0,
                            side: renderBackFaces ? THREE.BackSide : THREE.DoubleSide
                        })
                        currentMaterial.name = materialName
                    }

                    const batch = new MeshBatch(batchId, mergedGeometry, [currentMaterial], currentBatchObjects)

                    this.batches[batchId] = batch
                    console.log(`Batcher: Created batch ${batchId} with ${currentBatchObjects.length} objects`)

                    // Reset
                    currentVertices = 0
                    currentGeometries = []
                    currentBatchObjects = []
                } catch (error) {
                    console.error('Batcher: Error during flush:', error)
                    throw error
                }
            }

            renderViews.forEach(rv => {
                const vertCount = rv.geometry!.attributes.position.count

                if (currentVertices + vertCount > this.maxVertices) {
                    flush()
                }

                currentVertices += vertCount
                currentGeometries.push(rv.geometry!)

                const batchObj = new BatchObject(rv, 0)
                batchObj.materialName = rv.assignedMaterial

                currentBatchObjects.push(batchObj)
            })

            flush() // Flush remaining for this material
        })

        console.log(`Batcher: Finished batching. Created ${Object.keys(this.batches).length} batches`)

        // Ensure visual state is updated with correct materials
        this.updateVisualState()
    }

    public getBatches() {
        return Object.values(this.batches)
    }

    public setMaterialLookup(lookup: Map<string, string>) {
        this.materialLookup = lookup
        console.log(`Batcher: Set material lookup with ${lookup.size} mesh-material mappings`)
    }

    public setMaterialDefinitions(definitions: Map<string, any>) {
        this.materialDefinitions = definitions
        console.log(`Batcher: Set ${definitions.size} material definitions`)
    }

    public getMaterialForMesh(meshId: string): string | null {
        return this.materialLookup.get(meshId) || null
    }

    /**
     * Create a THREE.js material from Speckle material properties
     */
    private createMaterialFromSpeckle(materialName: string, materialProps: any, backfaces: boolean = false): THREE.MeshStandardMaterial {
        // Default material properties
        const params: THREE.MeshStandardMaterialParameters = {
            side: backfaces ? THREE.BackSide : THREE.DoubleSide,
            metalness: materialProps.metalness ?? 0.0,
            roughness: materialProps.roughness ?? 1.0,
        }

        // Convert Speckle color (ARGB integer) to THREE.js color
        if (materialProps.diffuse !== undefined) {
            const argb = materialProps.diffuse
            const r = ((argb >> 16) & 0xFF) / 255
            const g = ((argb >> 8) & 0xFF) / 255
            const b = (argb & 0xFF) / 255
            params.color = new THREE.Color(r, g, b)
        } else {
            params.color = 0xe2e8f0 // Default gray
        }

        // Opacity/Transparency
        if (materialProps.opacity !== undefined && materialProps.opacity < 1.0) {
            params.transparent = true
            params.opacity = materialProps.opacity
            params.depthWrite = false // Prevent z-fighting with transparent materials
        }

        // Emissive color
        if (materialProps.emissive !== undefined) {
            const argb = materialProps.emissive
            const r = ((argb >> 16) & 0xFF) / 255
            const g = ((argb >> 8) & 0xFF) / 255
            const b = (argb & 0xFF) / 255
            params.emissive = new THREE.Color(r, g, b)
        }

        const material = new THREE.MeshStandardMaterial(params)
        material.name = materialName

        return material
    }

    /**
     * Get all required materials
     */
    private getMaterials() {
        // 1. Highlight Material (Selection) - Strong Blue with Glow
        if (!this.highlightMaterial) {
            this.highlightMaterial = new THREE.MeshStandardMaterial({
                color: 0x2563eb,        // Blue-600
                emissive: 0x1e3a8a,     // Dark Blue Glow
                emissiveIntensity: 0.4, // Moderate glow
                metalness: 0.2,
                roughness: 0.5
            })
        }

        // 2. Hover Material - Light Sky Blue, No Glow (Distinct from Selection)
        if (!this.hoverMaterial) {
            this.hoverMaterial = new THREE.MeshStandardMaterial({
                color: 0x60a5fa,        // Blue-400
                emissive: 0x000000,     // No Emissive (Flat look)
                emissiveIntensity: 0.0,
                metalness: 0.1,
                roughness: 0.2          // Slightly shiny
            })
        }

        if (!this.defaultMaterial) {
            this.defaultMaterial = new THREE.MeshStandardMaterial({
                color: 0xe2e8f0,
                metalness: 0.0,
                roughness: 1.0
            })
        }

        if (!this.phaseMaterials) {
            this.phaseMaterials = {
                created: new THREE.MeshStandardMaterial({
                    color: 0x22c55e, // Green-500
                    metalness: 0.1,
                    roughness: 0.8
                }),
                demolished: new THREE.MeshStandardMaterial({
                    color: 0xef4444, // Red-500
                    metalness: 0.1,
                    roughness: 0.8,
                    transparent: true,
                    opacity: 0.7
                }),
                existing: new THREE.MeshStandardMaterial({
                    color: 0xFFFFFF, // White
                    transparent: true,
                    opacity: 0.05, // Ghosted
                    depthWrite: false,
                    metalness: 0.0,
                    roughness: 1.0
                })
            }
        }

        // Dedicated Room Material
        const roomMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF, // White
            side: THREE.BackSide,
            transparent: false,
            opacity: 1.0,
            metalness: 0.0,
            roughness: 1.0,
            depthWrite: true
        })

        // Dedicated Room Highlight Material
        const roomHighlightMaterial = new THREE.MeshStandardMaterial({
            color: 0x3b82f6, // Blue
            emissive: 0x1e40af,
            emissiveIntensity: 0.3,
            metalness: 0.1,
            roughness: 0.8,
            side: THREE.BackSide
        })

        // Hidden material (not rendered)
        const hiddenMaterial = new THREE.MeshStandardMaterial({ visible: false })

        return {
            default: this.defaultMaterial!,
            highlight: this.highlightMaterial!,
            hover: this.hoverMaterial!,
            created: this.phaseMaterials!.created,
            demolished: this.phaseMaterials!.demolished,
            existing: this.phaseMaterials!.existing,
            hidden: hiddenMaterial,
            room: roomMaterial,
            roomHighlight: roomHighlightMaterial
        }
    }

    /**
     * Update the visual state of all batches based on current filters, selection, and phases
     */
    private updateVisualState() {
        const materials = this.getMaterials()

        // Select appropriate highlight material based on mode
        const highlightMat = this.renderBackFaces ? materials.roomHighlight : materials.highlight

        Object.values(this.batches).forEach(batch => {
            // Get the original material for this batch (created from Speckle definition)
            const batchBaseMaterial = batch.materials[0] || materials.default

            // Material Indices:
            // 0: Batch Base Material (from Speckle)
            // 1: Highlight
            // 2: Created
            // 3: Demolished
            // 4: Existing
            // 5: Hidden
            // 6: Hover
            const materialArray = [
                batchBaseMaterial,
                highlightMat,
                materials.created,
                materials.demolished,
                materials.existing,
                materials.hidden,
                materials.hover
            ]

            const groups: { start: number; count: number; materialIndex: number }[] = []

            batch.batchObjects.forEach(obj => {
                let materialIndex = 0 // Use batch's base material by default

                // Priority 1: Hidden (Filtered Out)
                if (this.filteredOutElements.has(obj.elementId)) {
                    materialIndex = 5
                    obj.visible = false
                } else {
                    obj.visible = true

                    // Priority 2: Highlighted (Selected)
                    if (this.highlightedElements.has(obj.elementId)) {
                        materialIndex = 1
                    }
                    // Priority 3: Hovered
                    else if (this.hoveredElements.has(obj.elementId)) {
                        materialIndex = 6 // Hover material index
                    }
                    // Priority 4: Phase Status
                    else if (this.phaseStatus.has(obj.elementId) && !this.renderBackFaces) {
                        const status = this.phaseStatus.get(obj.elementId)
                        if (status === 'created') materialIndex = 2
                        else if (status === 'demolished') materialIndex = 3
                        else if (status === 'existing') materialIndex = 4
                    }
                }

                // Calculate the index range for this object
                const startIndex = obj.startFaceIndex * 3
                const count = (obj.endFaceIndex - obj.startFaceIndex) * 3

                if (count > 0) {
                    groups.push({
                        start: startIndex,
                        count: count,
                        materialIndex: materialIndex
                    })
                }
            })

            // Apply materials and groups
            if (groups.length > 0) {
                batch.mesh.material = materialArray
                batch.mesh.geometry.clearGroups()
                groups.forEach(g => {
                    batch.mesh.geometry.addGroup(g.start, g.count, g.materialIndex)
                })
            } else {
                batch.mesh.material = batchBaseMaterial
                batch.mesh.geometry.clearGroups()
            }
        })
    }

    /**
     * Set the list of visible element IDs. All others will be hidden.
     * @param visibleIds Set of IDs to show. If null, show all.
     */
    public setFilter(visibleIds: Set<string> | null) {
        this.filteredOutElements.clear()

        if (visibleIds) {
            Object.values(this.batches).forEach(batch => {
                batch.batchObjects.forEach(obj => {
                    if (!visibleIds.has(obj.elementId)) {
                        this.filteredOutElements.add(obj.elementId)
                    }
                })
            })
        }

        this.updateVisualState()
    }

    public highlight(elementIds: string[]) {
        this.highlightedElements.clear()
        elementIds.forEach(id => this.highlightedElements.add(id))
        this.updateVisualState()
    }

    public clearHighlight() {
        this.highlightedElements.clear()
        this.updateVisualState()
    }

    public hover(elementIds: string[]) {
        this.hoveredElements.clear()
        elementIds.forEach(id => this.hoveredElements.add(id))
        this.updateVisualState()
    }

    public clearHover() {
        this.hoveredElements.clear()
        this.updateVisualState()
    }

    public applyPhaseColors(elementStatus: Map<string, 'created' | 'demolished' | 'existing'>) {
        this.phaseStatus = elementStatus
        this.updateVisualState()
    }

    public clearPhaseColors() {
        this.phaseStatus.clear()
        this.updateVisualState()
    }
}