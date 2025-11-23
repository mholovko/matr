import * as THREE from 'three'

export type DollhouseSide = 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT' | 'TOP'

// TODO: Update these with actual group names from the model
export const DOLLHOUSE_CONFIG: Record<DollhouseSide, string[]> = {
    FRONT: ['Shared-Wall-1'],
    BACK: [],
    LEFT: ['Ext-Wall-1'],
    RIGHT: ['Ext-Wall-2'],
    TOP: ['Roof']
}

export function getSectorFromCamera(camera: THREE.Camera, target: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): DollhouseSide[] {
    const position = camera.position.clone().sub(target)

    // Check for Top view (high angle)
    // Y is Up in Three.js
    // If Y is significantly larger than horizontal distance (X/Z plane)
    const horizontalDistance = Math.sqrt(position.x * position.x + position.z * position.z)

    // If angle is > 45 degrees from horizontal, consider it TOP
    // tan(45) = 1.0
    if (position.y > horizontalDistance * 1.0) {
        return ['TOP']
    }

    // Determine quadrant based on X and Z
    // +Z = Front (0 degrees)
    // +X = Right (90 degrees)
    // -Z = Back (180 degrees)
    // -X = Left (-90 degrees)

    const angle = Math.atan2(position.x, position.z) // Returns -PI to PI
    const degrees = angle * (180 / Math.PI)

    // 8-way split (45 degrees each sector)
    // Front: -22.5 to 22.5
    // Front-Right: 22.5 to 67.5
    // Right: 67.5 to 112.5
    // Back-Right: 112.5 to 157.5
    // Back: 157.5 to 180 OR -180 to -157.5
    // Back-Left: -157.5 to -112.5
    // Left: -112.5 to -67.5
    // Front-Left: -67.5 to -22.5

    if (degrees >= -22.5 && degrees < 22.5) return ['FRONT']
    if (degrees >= 22.5 && degrees < 67.5) return ['FRONT', 'RIGHT']
    if (degrees >= 67.5 && degrees < 112.5) return ['RIGHT']
    if (degrees >= 112.5 && degrees < 157.5) return ['BACK', 'RIGHT']
    if (degrees >= 157.5 || degrees < -157.5) return ['BACK']
    if (degrees >= -157.5 && degrees < -112.5) return ['BACK', 'LEFT']
    if (degrees >= -112.5 && degrees < -67.5) return ['LEFT']
    if (degrees >= -67.5 && degrees < -22.5) return ['FRONT', 'LEFT']

    return ['BACK'] // Fallback
}
