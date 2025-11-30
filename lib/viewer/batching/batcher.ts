import * as THREE from 'three'
import { MeshBatch } from './mesh-batch'
import { BatchObject } from './batch-object'
import { RenderView } from '@/lib/viewer/converter'
import { MaterialManager } from '@/lib/viewer/materials/material-manager'

export class Batcher {
    public batches: { [id: string]: MeshBatch } = {}
    private maxVertices = 500000 // Vertex limit per batch
    private renderBackFaces: boolean = false

    // State Management
    private filteredOutElements: Set<string> = new Set()
    private highlightedElements: Set<string> = new Set()
    private hoveredElements: Set<string> = new Set()
    private raycastIgnoredElements: Set<string> = new Set()
    private phaseStatus: Map<string, 'created' | 'demolished' | 'existing'> = new Map()

    // Data Lookup
    private materialLookup: Map<string, string> = new Map()
    private materialDefinitions: Map<string, any> = new Map()

    // Dependencies
    private materialManager: MaterialManager

    constructor() {
        this.materialManager = new MaterialManager()
    }

    public makeBatches(renderViews: RenderView[], renderBackFaces: boolean = false) {
        console.log(`Batcher: Starting to batch ${renderViews.length} views. Backfaces: ${renderBackFaces}`)

        this.renderBackFaces = renderBackFaces
        this.batches = {} // Clear old batches

        // 1. Heuristic: Determine Unit Scale (Meters vs Millimeters)
        // If a bounding box dimension is huge (>200), we assume Millimeters.
        // We need UVs to be in Meters for the texture to tile correctly (1 tile ~= 1 meter).
        let uvScale = 1.0
        for (const rv of renderViews) {
            if (rv.geometry) {
                if (!rv.geometry.boundingBox) rv.geometry.computeBoundingBox()
                const box = rv.geometry.boundingBox
                if (box) {
                    const size = box.getSize(new THREE.Vector3())
                    // Threshold: 200 units. 200mm is small, 200m is huge. 
                    // Most building elements in MM will exceed 200.
                    if (Math.max(size.x, size.y, size.z) > 200) {
                        uvScale = 0.001
                        console.log('Batcher: Detected Millimeter units. Applying 0.001 UV scale.')
                    }
                }
                break // Only need to check one valid geometry
            }
        }

        // 2. Assign Material Names
        const renderViewsWithMaterials = renderViews
            .filter(rv => rv.geometry)
            .map(rv => {
                let matName = 'default'
                if (rv.meshId && this.materialLookup.has(rv.meshId)) {
                    matName = this.materialLookup.get(rv.meshId)!
                }
                return { ...rv, assignedMaterial: matName }
            })

        // 3. Group by Material
        const materialGroups = new Map<string, typeof renderViewsWithMaterials>()
        renderViewsWithMaterials.forEach(rv => {
            if (!materialGroups.has(rv.assignedMaterial)) {
                materialGroups.set(rv.assignedMaterial, [])
            }
            materialGroups.get(rv.assignedMaterial)!.push(rv)
        })

        // 4. Process Groups
        materialGroups.forEach((group, materialName) => {
            // We removed the isBrick check here. 
            // All materials will now go through the same pipeline with box mapping enabled.
            this.processMaterialGroup(materialName, group, uvScale)
        })

        console.log(`Batcher: Finished. Created ${Object.keys(this.batches).length} batches.`)
        this.updateVisualState()
    }

    private processMaterialGroup(
        materialName: string,
        renderViews: Array<RenderView & { assignedMaterial: string }>,
        uvScale: number
    ) {
        let currentVertices = 0
        let currentGeometries: THREE.BufferGeometry[] = []
        let currentBatchObjects: BatchObject[] = []

        const flush = () => {
            if (currentGeometries.length === 0) return
            try {
                this.createBatch(materialName, currentGeometries, currentBatchObjects, uvScale)
            } catch (e) {
                console.error(`Batcher: Failed to create batch for ${materialName}`, e)
            }
            currentVertices = 0
            currentGeometries = []
            currentBatchObjects = []
        }

        renderViews.forEach(rv => {
            const vCount = rv.geometry!.attributes.position.count

            if (currentVertices + vCount > this.maxVertices) {
                flush()
            }

            currentVertices += vCount
            currentGeometries.push(rv.geometry!)

            const batchObj = new BatchObject(rv, 0)
            batchObj.materialName = materialName
            currentBatchObjects.push(batchObj)
        })

        flush()
    }

    private createBatch(
        materialName: string,
        geometries: THREE.BufferGeometry[],
        batchObjects: BatchObject[],
        uvScale: number
    ) {
        // 1. Calculate buffer sizes
        let totalPos = 0
        let totalIndex = 0
        geometries.forEach(g => {
            totalPos += g.attributes.position.count
            totalIndex += g.index ? g.index.count : 0
        })

        // 2. Allocate Arrays
        const positions = new Float32Array(totalPos * 3)
        const uvs = new Float32Array(totalPos * 2) // Allocated, but filled later by BoxMapping
        const indices = new Uint32Array(totalIndex)

        // 3. Merge Loop
        let posOffset = 0
        // let uvOffset = 0 // Not needed inside loop anymore
        let indexOffset = 0
        let currentFaceIndex = 0
        const v = new THREE.Vector3()

        geometries.forEach((g, i) => {
            const batchObj = batchObjects[i]
            const pos = g.attributes.position.array as Float32Array
            const count = g.attributes.position.count

            const transform = batchObj.renderView.transform || new THREE.Matrix4()

            // Note: We ignore source UVs now because we are forcing Box Mapping later

            for (let k = 0; k < count; k++) {
                // Transform Position
                v.set(pos[k * 3], pos[k * 3 + 1], pos[k * 3 + 2])
                v.applyMatrix4(transform)

                positions[posOffset + k * 3] = v.x
                positions[posOffset + k * 3 + 1] = v.y
                positions[posOffset + k * 3 + 2] = v.z

                // UVs are skipped here, will be calculated via normals in step 5
            }

            // Copy Indices
            const startFace = currentFaceIndex
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

            batchObj.batchIndex = indexOffset
            batchObj.startFaceIndex = startFace
            batchObj.endFaceIndex = endFace

            posOffset += count * 3
            // uvOffset += count * 2
        })

        // 4. Create Geometry
        const mergedGeometry = new THREE.BufferGeometry()
        mergedGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        mergedGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
        mergedGeometry.setIndex(new THREE.BufferAttribute(indices, 1))

        // Compute Normals (Needed for lighting AND Box Mapping)
        mergedGeometry.computeVertexNormals()

        // 5. Apply Box Mapping (Tri-planar) 
        // ALWAYS applied now, regardless of material type
        this.applyBoxMapping(mergedGeometry, uvScale)

        // 6. Create Material
        const materialDef = this.materialDefinitions.get(materialName) || {}
        const currentMaterial = this.materialManager.create(materialName, materialDef, this.renderBackFaces)
        if (!currentMaterial.name) currentMaterial.name = materialName

        // 7. Finalize Batch
        const batchId = `${materialName}_${Math.random().toString(36).substring(7)}`
        const batch = new MeshBatch(batchId, mergedGeometry, [currentMaterial], batchObjects)

        this.batches[batchId] = batch
    }

    /**
     * Projects UVs based on face normals (Box Mapping)
     * Ensures textures align on X, Y, and Z planes.
     */
    private applyBoxMapping(geometry: THREE.BufferGeometry, scale: number) {
        const posAttr = geometry.attributes.position
        const normAttr = geometry.attributes.normal
        const uvAttr = geometry.attributes.uv

        if (!posAttr || !normAttr || !uvAttr) return

        const count = posAttr.count

        for (let i = 0; i < count; i++) {
            const nx = normAttr.getX(i)
            const ny = normAttr.getY(i)
            const nz = normAttr.getZ(i)

            const px = posAttr.getX(i)
            const py = posAttr.getY(i)
            const pz = posAttr.getZ(i)

            let u = 0, v = 0

            const ax = Math.abs(nx)
            const ay = Math.abs(ny)
            const az = Math.abs(nz)

            // Z-UP Coordinate System Logic
            if (az > ax && az > ay) {
                // Floor/Roof (Z Dominant) -> Map XY
                u = px
                v = py
            } else if (ax >= ay && ax >= az) {
                // Wall facing X -> Map YZ (Horizontal Y, Vertical Z)
                u = py
                v = pz
            } else {
                // Wall facing Y -> Map XZ (Horizontal X, Vertical Z)
                u = px
                v = pz
            }

            uvAttr.setXY(i, u * scale, v * scale)
        }

        uvAttr.needsUpdate = true
    }

    private updateVisualState() {
        // Fetch standard palette from Manager
        const materials = this.materialManager.getVisualStateMaterials()
        const highlightMat = this.renderBackFaces ? materials.roomHighlight : materials.highlight

        Object.values(this.batches).forEach(batch => {
            const batchBaseMaterial = batch.materials[0] || materials.default

            // Construct the multi-material array
            const materialArray = [
                batchBaseMaterial,      // 0: Base
                highlightMat,           // 1: Highlight
                materials.created,      // 2: Created
                materials.demolished,   // 3: Demolished
                materials.existing,     // 4: Existing
                materials.hidden,       // 5: Hidden
                materials.hover         // 6: Hover
            ]

            const groups: { start: number; count: number; materialIndex: number }[] = []

            batch.batchObjects.forEach(obj => {
                let materialIndex = 0

                if (this.filteredOutElements.has(obj.elementId)) {
                    materialIndex = 5
                    obj.visible = false
                } else {
                    obj.visible = true

                    if (this.highlightedElements.has(obj.elementId)) {
                        materialIndex = 1
                    }
                    else if (this.hoveredElements.has(obj.elementId)) {
                        materialIndex = 6
                    }
                    else if (this.phaseStatus.has(obj.elementId) && !this.renderBackFaces) {
                        const status = this.phaseStatus.get(obj.elementId)
                        if (status === 'created') materialIndex = 2
                        else if (status === 'demolished') materialIndex = 3
                        else if (status === 'existing') materialIndex = 4
                    }
                }

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

            // Apply Groups
            if (groups.length > 0) {
                batch.mesh.material = materialArray
                batch.mesh.geometry.clearGroups()
                groups.forEach(g => {
                    batch.mesh.geometry.addGroup(g.start, g.count, g.materialIndex)
                })
            } else {
                batch.mesh.material = batchBaseMaterial
                batch.mesh.geometry.clearGroups()
                // Default group for entire mesh
                batch.mesh.geometry.addGroup(0, batch.mesh.geometry.index!.count, 0)
            }
        })
    }

    // ========================================================================
    // PUBLIC API
    // ========================================================================

    public getBatches() { return Object.values(this.batches) }

    public setMaterialLookup(lookup: Map<string, string>) { this.materialLookup = lookup }

    public setMaterialDefinitions(definitions: Map<string, any>) { this.materialDefinitions = definitions }

    public getMaterialForMesh(meshId: string): string | null { return this.materialLookup.get(meshId) || null }

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

    public setRaycastIgnore(ids: Set<string>) {
        this.raycastIgnoredElements = ids
    }

    public isRaycastIgnored(id: string): boolean {
        return this.raycastIgnoredElements.has(id)
    }
}