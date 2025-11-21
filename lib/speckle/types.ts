export interface SpeckleMesh {
    id: string
    speckle_type: string
    units: string
    vertices: number[]
    faces: number[]
    colors?: number[]
}

export type SpeckleParameter = { value?: any } | any

export interface SpeckleObject {
    id: string
    speckle_type: string
    displayValue?: SpeckleMesh[] // Most BIM objects (walls) store geometry here
    properties?: Record<string, any>
    parameters?: Record<string, SpeckleParameter>
    [key: string]: any
}

export interface SpeckleElementData {
    id: string
    speckle_type: string
    parameters: Record<string, any>
    volume?: number
    materialId?: string
}