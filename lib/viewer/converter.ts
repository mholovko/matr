import * as THREE from 'three'
import { SpeckleObject } from '@/lib/speckle/types'
import { convertSpeckleMesh } from '@/lib/speckle/converter' // Reuse existing mesh conversion

export interface RenderView {
    id: string
    speckleType: string
    geometry: THREE.BufferGeometry | null
    transform: THREE.Matrix4
    properties: any
    aabb?: THREE.Box3
    meshId?: string  // Individual mesh ID for material lookup
}

export function convertToRenderViews(obj: SpeckleObject, parentTransform = new THREE.Matrix4()): RenderView[] {
    const views: RenderView[] = []

    // 1. Handle Geometry
    if (obj.displayValue) {
        obj.displayValue.forEach((meshData) => {
            const geometry = convertSpeckleMesh(meshData)
            if (geometry) {
                // Compute AABB for metadata
                geometry.computeBoundingBox()
                const aabb = geometry.boundingBox?.clone() || new THREE.Box3()

                views.push({
                    id: obj.id,
                    speckleType: obj.speckle_type,
                    geometry: geometry,
                    transform: parentTransform.clone(), // Store current transform
                    properties: obj.properties || obj,
                    aabb: aabb,
                    meshId: meshData.applicationId || meshData.id  // Store applicationId for material lookup (fallback to id)
                })
            }
        })
    }

    // 2. Handle Children & Transforms
    // Speckle objects can have a 'transform' property (array of 16 numbers)
    // We need to compose it with the parent transform
    let myTransform = parentTransform.clone()

    const children = obj.elements || obj['@elements'] || []

    if (Array.isArray(children)) {
        children.forEach(child => {
            views.push(...convertToRenderViews(child, myTransform))
        })
    } else {
        Object.values(obj).forEach(val => {
            if (Array.isArray(val) && val.length > 0 && (val[0] as SpeckleObject).id) {
                val.forEach((child: SpeckleObject) => {
                    views.push(...convertToRenderViews(child, myTransform))
                })
            }
        })
    }

    return views
}
