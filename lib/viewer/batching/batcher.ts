import * as THREE from 'three'
import { MeshBatch } from './mesh-batch'
import { BatchObject } from './batch-object'
import { RenderView } from '@/lib/viewer/converter'

export class Batcher {
    public batches: { [id: string]: MeshBatch } = {}
    private maxVertices = 500000 // Limit per batch
    private highlightMaterial: THREE.MeshStandardMaterial | null = null
    private defaultMaterial: THREE.MeshStandardMaterial | null = null
    private renderBackFaces: boolean = false

    // State Management
    private filteredOutElements: Set<string> = new Set()
    private highlightedElements: Set<string> = new Set()
    private phaseStatus: Map<string, 'created' | 'demolished' | 'existing'> = new Map()
    private phaseMaterials: {
        created: THREE.MeshStandardMaterial,
        demolished: THREE.MeshStandardMaterial,
        existing: THREE.MeshStandardMaterial
    } | null = null

    // Material Lookup
    private materialLookup: Map<string, string> = new Map()

    constructor() { }

    public makeBatches(renderViews: RenderView[], renderBackFaces: boolean = false) {
        console.log(`Batcher: Starting to batch ${renderViews.length} render views. Backfaces: ${renderBackFaces}`)

        // Initialize materials with backface setting
        this.renderBackFaces = renderBackFaces

        const batches: MeshBatch[] = []
        let currentVertices = 0
        let currentGeometries: THREE.BufferGeometry[] = []
        let currentBatchObjects: BatchObject[] = []

        // Initial material for batch creation (will be replaced by updateVisualState)
        let currentMaterial = new THREE.MeshStandardMaterial({
            color: 0xe2e8f0,
            side: renderBackFaces ? THREE.BackSide : THREE.DoubleSide
        })

        // Helper to flush current batch
        const flush = () => {
            if (currentGeometries.length === 0) return

            try {
                console.log(`Batcher: Flushing batch with ${currentGeometries.length} geometries`)

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
                        currentFaceIndex += idxCount / 3 // Each face has 3 indices
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

                const batchId = Math.random().toString(36).substring(7)
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
            const geometry = rv.geometry
            if (!geometry) {
                console.warn('Batcher: Skipping render view with no geometry', rv)
                return
            }

            const vertCount = geometry.attributes.position.count

            if (currentVertices + vertCount > this.maxVertices) {
                flush()
            }

            currentVertices += vertCount
            currentGeometries.push(geometry)

            const batchObj = new BatchObject(rv, 0)

            // Lookup and store material name for this mesh
            if (rv.meshId) {
                if (this.materialLookup.has(rv.meshId)) {
                    batchObj.materialName = this.materialLookup.get(rv.meshId)!
                    console.log(`✓ Mesh ${rv.meshId} → Material: ${batchObj.materialName}`)
                } else {
                    console.warn(`✗ Mesh ${rv.meshId} not found in material lookup`)
                }
            } else {
                console.warn('✗ RenderView has no meshId')
            }

            currentBatchObjects.push(batchObj)
        })

        flush() // Final flush
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

    public getMaterialForMesh(meshId: string): string | null {
        return this.materialLookup.get(meshId) || null
    }

    /**
     * Get all required materials
     */
    private getMaterials() {
        if (!this.highlightMaterial) {
            this.highlightMaterial = new THREE.MeshStandardMaterial({
                color: 0x3b82f6, // Blue
                emissive: 0x1e40af,
                emissiveIntensity: 0.3,
                metalness: 0.1,
                roughness: 0.8
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
            default: this.defaultMaterial,
            highlight: this.highlightMaterial,
            created: this.phaseMaterials.created,
            demolished: this.phaseMaterials.demolished,
            existing: this.phaseMaterials.existing,
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

        // Material Indices:
        // 0: Default
        // 1: Highlight
        // 2: Created
        // 3: Demolished
        // 4: Existing
        // 5: Hidden
        // 6: Room (Backfaces)
        const materialArray = [
            materials.default,
            highlightMat,
            materials.created,
            materials.demolished,
            materials.existing,
            materials.hidden,
            materials.room
        ]

        Object.values(this.batches).forEach(batch => {
            const groups: { start: number; count: number; materialIndex: number }[] = []

            batch.batchObjects.forEach(obj => {
                let materialIndex = 0 // Default

                // If rendering backfaces (Rooms), use Room material by default
                if (this.renderBackFaces) {
                    materialIndex = 6
                }

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
                    // Priority 3: Phase Status (Only if not in Room mode, or if we want phase colors on rooms)
                    // For now, let's assume Rooms don't have phases or we prioritize Room material
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
                batch.mesh.material = this.renderBackFaces ? materials.room : materials.default
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

    public applyPhaseColors(elementStatus: Map<string, 'created' | 'demolished' | 'existing'>) {
        this.phaseStatus = elementStatus
        this.updateVisualState()
    }

    public clearPhaseColors() {
        this.phaseStatus.clear()
        this.updateVisualState()
    }
}
