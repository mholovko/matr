import * as THREE from 'three'
import { BatchObject } from './batch-object'
import { DrawRanges, BatchUpdateRange, DrawGroup } from './draw-ranges'
import { MeshBVH, MeshBVHOptions } from 'three-mesh-bvh'

export class MeshBatch {
    public id: string
    public mesh: THREE.Mesh
    public batchObjects: BatchObject[] = []
    public materials: THREE.Material[] = []

    private drawRanges: DrawRanges
    private geometry: THREE.BufferGeometry

    constructor(id: string, geometry: THREE.BufferGeometry, materials: THREE.Material[], batchObjects: BatchObject[]) {
        this.id = id
        this.geometry = geometry
        this.materials = materials
        this.batchObjects = batchObjects
        this.drawRanges = new DrawRanges()

        // Create the mesh
        this.mesh = new THREE.Mesh(this.geometry, this.materials)
        this.mesh.userData = { batchId: id }

        // Initialize groups
        // Assuming the geometry was built with one group per material initially
        // But for now, let's assume one big group if not specified
        if (this.geometry.groups.length === 0) {
            this.geometry.addGroup(0, Infinity, 0)
        }
    }

    public setDrawRanges(ranges: BatchUpdateRange[]) {
        // Ensure all materials in ranges are in our materials array
        ranges.forEach(range => {
            if (range.material && !this.materials.includes(range.material)) {
                this.materials.push(range.material)
            }
        })

        // Update groups
        const currentGroups = this.geometry.groups.map(g => ({
            start: g.start,
            count: g.count,
            materialIndex: g.materialIndex || 0
        }))

        const newGroups = this.drawRanges.integrateRanges(currentGroups, this.materials, ranges)

        // Apply to geometry
        this.geometry.clearGroups()
        newGroups.forEach(g => {
            this.geometry.addGroup(g.start, g.count, g.materialIndex)
        })

        // Update mesh materials (Three.js needs this if array length changes)
        this.mesh.material = this.materials
    }

    public buildBVH() {
        // Use three-mesh-bvh to build acceleration structure for the merged mesh
        // This is crucial for raycasting performance
        // @ts-ignore
        this.geometry.boundsTree = new MeshBVH(this.geometry)
    }
}
