import { Box3, Matrix4, Vector3 } from 'three'
import { SpeckleObject } from '@/lib/speckle/types'

export class BatchObject {
    public renderView: any // We'll define a proper interface for this later
    public batchIndex: number
    public transform: Matrix4
    public transformInv: Matrix4

    // Metadata
    public elementId: string
    public speckleType: string
    public properties: any

    // State
    public visible: boolean = true

    // Material
    public materialName: string | null = null

    // Face range in the merged geometry (for raycasting)
    public startFaceIndex: number = 0
    public endFaceIndex: number = 0

    constructor(renderView: any, batchIndex: number) {
        this.renderView = renderView
        this.batchIndex = batchIndex
        this.transform = new Matrix4().identity()
        this.transformInv = new Matrix4().identity()

        this.elementId = renderView.id
        this.speckleType = renderView.speckleType
        this.properties = renderView.properties
    }

    public get aabb(): Box3 {
        // Return the bounding box from the render view (transformed)
        if (this.renderView.aabb) {
            const box = new Box3().copy(this.renderView.aabb)
            box.applyMatrix4(this.transform)
            return box
        }
        return new Box3()
    }
}
