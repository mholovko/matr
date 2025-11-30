import * as THREE from 'three'
import { Batcher } from './batching/batcher'
import { BatchObject } from './batching/batch-object'

export class BatchRaycaster {
    private raycaster: THREE.Raycaster

    constructor() {
        this.raycaster = new THREE.Raycaster()
    }

    /**
     * Cast a ray and find the intersected element
     * @param camera The camera
     * @param pointer Normalized device coordinates (-1 to 1)
     * @param batcher The batcher instance
     * @returns The intersected BatchObject or null
     */
    public intersect(
        camera: THREE.Camera,
        pointer: THREE.Vector2,
        batcher: Batcher
    ): { batchObject: BatchObject; point: THREE.Vector3 } | null {
        this.raycaster.setFromCamera(pointer, camera)

        const batches = batcher.getBatches()
        let closestIntersection: { batchObject: BatchObject; point: THREE.Vector3; distance: number } | null = null

        for (const batch of batches) {
            // Raycast against the batch mesh using standard Three.js raycasting
            // BVH is disabled to avoid UI freezing
            const intersects = this.raycaster.intersectObject(batch.mesh, false)

            // Iterate through all intersections to find the first visible one
            for (const intersection of intersects) {
                // Find which BatchObject this triangle belongs to
                // We need to map the face index back to the original object
                const faceIndex = intersection.faceIndex
                if (faceIndex === undefined) continue

                // Each BatchObject knows its index range in the merged geometry
                // Find which object contains this face (only returns if visible)
                const batchObject = this.findBatchObjectByFaceIndex(batch.batchObjects, faceIndex as number, batcher)

                if (batchObject) {
                    if (!closestIntersection || intersection.distance < closestIntersection.distance) {
                        closestIntersection = {
                            batchObject,
                            point: intersection.point,
                            distance: intersection.distance
                        }
                    }
                    // Continue checking other intersections to find the closest visible one
                }
            }
        }

        if (closestIntersection) {
            return {
                batchObject: closestIntersection.batchObject,
                point: closestIntersection.point
            }
        }

        return null
    }

    /**
     * Find which BatchObject a face index belongs to
     * Only returns visible objects. Hidden objects are skipped.
     */
    private findBatchObjectByFaceIndex(batchObjects: BatchObject[], faceIndex: number, batcher: Batcher): BatchObject | null {
        // Find the object whose face range contains this face index
        for (const obj of batchObjects) {
            if (faceIndex >= obj.startFaceIndex && faceIndex < obj.endFaceIndex) {
                // Only return if visible AND not ignored
                if (!obj.visible) return null
                if (batcher.isRaycastIgnored(obj.elementId)) return null

                return obj
            }
        }
        return null
    }
}
