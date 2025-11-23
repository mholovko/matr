import * as THREE from 'three'

export type DollhouseSide = 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT' | 'TOP'

// TODO: Update these with actual group names from the model
export const DOLLHOUSE_CONFIG: Record<DollhouseSide, string[]> = {
    FRONT: ['Shared-Wall-1', 'Facade-Front'],
    BACK: ['Facade-Back'],
    LEFT: ['Ext-Wall-1', 'Facade-Left'],
    RIGHT: ['Ext-Wall-2', 'Facade-Right'],
    TOP: ['Roof', 'Ceiling-Level-2']
}

export function getSectorFromCamera(camera: THREE.Camera, target: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): DollhouseSide {
    const position = camera.position.clone().sub(target)

    // Check for Top view (high angle)
    // Y is Up in Three.js
    // If Y is significantly larger than horizontal distance (X/Z plane)
    const horizontalDistance = Math.sqrt(position.x * position.x + position.z * position.z)

    // If angle is > 45 degrees from horizontal, consider it TOP
    // tan(45) = 1.0
    if (position.y > horizontalDistance * 1.0) {
        return 'TOP'
    }

    // Determine quadrant based on X and Z
    // +Z = Front (0 degrees)
    // +X = Right (-90 degrees)
    // -Z = Back (180 degrees)
    // -X = Left (90 degrees)

    const angle = Math.atan2(position.x, position.z) // Returns -PI to PI
    const degrees = angle * (180 / Math.PI)

    // Sectors (45 degree offset)
    // Front (+Z): -45 to 45
    // Left (+X): 45 to 135  <-- Wait, atan2(x, z): x=1, z=0 -> 90 deg. x=0, z=1 -> 0 deg.
    // So:
    // 0 deg = +Z (Front)
    // 90 deg = +X (Right)
    // 180/-180 deg = -Z (Back)
    // -90 deg = -X (Left)

    if (degrees >= -45 && degrees < 45) return 'FRONT'
    if (degrees >= 45 && degrees < 135) return 'RIGHT'
    if (degrees >= -135 && degrees < -45) return 'LEFT'

    return 'BACK'
}
