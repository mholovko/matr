import * as THREE from 'three'
import { SpeckleMesh, SpeckleObject } from './types'

/**
 * Converts a raw Speckle Mesh object into a THREE.BufferGeometry
 */
export function convertSpeckleMesh(data: SpeckleMesh): THREE.BufferGeometry | null {
    if (!data || !data.vertices || !data.faces) return null

    const geometry = new THREE.BufferGeometry()

    // 1. Vertices
    // Speckle vertices are a flat array [x, y, z, x, y, z...]
    const vertices = new Float32Array(data.vertices)
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))

    // 2. Indices (Faces)
    const indices: number[] = []
    let i = 0
    while (i < data.faces.length) {
        let arity = data.faces[i]
        i++ // skip arity

        // Handle legacy 0/1 flags if they exist (0=Triangle=3, 1=Quad=4)
        if (arity === 0) arity = 3
        else if (arity === 1) arity = 4

        if (arity < 3) {
            // Should not happen if it's a count, but safety check
            console.warn(`Invalid arity ${arity}, skipping`)
            i += arity // Try to skip? Or break?
            continue
        }

        // Triangulate N-gon (Fan method)
        // v0 is the pivot
        const v0 = data.faces[i]

        for (let k = 1; k < arity - 1; k++) {
            const v1 = data.faces[i + k]
            const v2 = data.faces[i + k + 1]
            indices.push(v0, v1, v2)
        }

        i += arity
    }

    if (indices.length === 0) {
        console.warn("Mesh has no valid faces (indices empty).")
        return null
    }

    console.log(`Converted Mesh: ${data.vertices.length / 3} vertices, ${indices.length / 3} triangles.`)

    geometry.setIndex(indices)
    geometry.computeVertexNormals()

    return geometry
}

/**
 * Recursively traverses a Speckle Object Tree and builds a THREE.Group
 */
export function convertSpeckleObject(obj: SpeckleObject): THREE.Object3D | null {
    // If it's a container (like a Revit Category), return a Group
    const group = new THREE.Group()
    group.userData = { ...obj } // Store metadata

    // 1. Does it have direct geometry? (Visual representation)
    if (obj.displayValue) {
        obj.displayValue.forEach((meshData) => {
            const geometry = convertSpeckleMesh(meshData)
            if (geometry) {
                const material = new THREE.MeshStandardMaterial({
                    color: 0xe2e8f0,
                    side: THREE.DoubleSide
                })
                const mesh = new THREE.Mesh(geometry, material)

                // Link back to the parent object ID for selection
                mesh.userData = {
                    parentId: obj.id, // The "Wall" ID, not the mesh ID
                    speckleType: obj.speckle_type,
                    properties: obj.properties || obj
                }
                group.add(mesh)
            }
        })
    }

    return group.children.length > 0 ? group : null
}