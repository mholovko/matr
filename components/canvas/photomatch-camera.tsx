"use client"

import { cameras } from "@/lib/data/photomatch"
import { useMemo } from "react"
import * as THREE from "three"
import { useTexture } from "@react-three/drei"

import { blenderToThreeQuaternion } from "@/lib/math"

export function PhotomatchCamera() {
    const cameraData = cameras["camera.001"]
    const texture = useTexture(cameraData.referenceImage)

    const { position, quaternion } = useMemo(() => {
        const [x, y, z] = cameraData.camera.position
        // Blender (Z-up) to Three.js (Y-up) conversion as requested: (x, z, -y)
        const pos = new THREE.Vector3(x, z, -y)
        const quat = blenderToThreeQuaternion(cameraData.camera.quaternion)
        return { position: pos, quaternion: quat }
    }, [cameraData])

    const aspect = cameraData.camera.aspect
    const distance = 2 // Distance from camera to image plate

    // Calculate height based on vertical FOV and distance
    // h = 2 * d * tan(fov / 2)
    const vFovRad = (cameraData.camera.fov * Math.PI) / 180
    const height = 2 * distance * Math.tan(vFovRad / 2)
    const width = height * aspect

    return (
        <group position={position} quaternion={quaternion}>
            <mesh position={[0, 0, -distance]}>
                <planeGeometry args={[width, height]} />
                <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent opacity={0.8} />
            </mesh>
            <axesHelper args={[2]} />
        </group>
    )
}
