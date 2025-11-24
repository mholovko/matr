import * as THREE from "three"

/**
 * Transform Blender quaternion (WXYZ) to Three.js quaternion
 */
export function blenderToThreeQuaternion(
    quaternion: readonly [number, number, number, number]
): THREE.Quaternion {
    const [w, x, y, z] = quaternion

    // Create quaternion in Blender space
    const blenderQuat = new THREE.Quaternion(x, y, z, w)

    // Create transformation matrix for coordinate system change
    const transformMatrix = new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler(-Math.PI / 2, 0, 0, "XYZ")
    )

    // Apply transformation
    const threeQuat = blenderQuat.clone()
    threeQuat.premultiply(
        new THREE.Quaternion().setFromRotationMatrix(transformMatrix)
    )

    return threeQuat
}
