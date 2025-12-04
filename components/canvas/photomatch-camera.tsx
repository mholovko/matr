"use client"

import { cameras } from "@/lib/data/photomatch"
import { useMemo } from "react"
import * as THREE from "three"
import { useTexture } from "@react-three/drei"
import { blenderToThreeQuaternion } from "@/lib/math"
import { useAppStore } from "@/lib/store"

export function PhotomatchCamera() {
    const selectedPhotomatchCamera = useAppStore((state) => state.selectedPhotomatchCamera)
    const cameraKey = (selectedPhotomatchCamera || "camera.001") as keyof typeof cameras
    const cameraData = cameras[cameraKey]
    const texture = useTexture(cameraData.referenceImage)

    const { position, quaternion } = useMemo(() => {
        const [x, y, z] = cameraData.camera.position
        // Blender (Z-up) to Three.js (Y-up) conversion as requested: (x, z, -y)
        const pos = new THREE.Vector3(x, z, -y)
        const quat = blenderToThreeQuaternion(cameraData.camera.quaternion)
        return { position: pos, quaternion: quat }
    }, [cameraData])

    const aspect = cameraData.camera.aspect
    const distance = .5 // Distance from camera to image plane

    // Calculate vertical FOV based on sensor fit mode
    let vFovRad: number
    if (cameraData.camera.sensorFit === "VERTICAL") {
        // FOV is already vertical, use directly
        vFovRad = (cameraData.camera.fov * Math.PI) / 180
    } else {
        // FOV is horizontal, convert to vertical: vFov = 2 * atan(tan(hFov/2) / aspect)
        const hFovRad = (cameraData.camera.fov * Math.PI) / 180
        vFovRad = 2 * Math.atan(Math.tan(hFovRad / 2) / aspect)
    }

    // Calculate plane dimensions based on vertical FOV and distance
    // h = 2 * d * tan(vFov / 2)
    const height = 2 * distance * Math.tan(vFovRad / 2)
    const width = height * aspect

    return (
        <group position={position} quaternion={quaternion}>
            <mesh position={[0, 0, -distance]}>
                <planeGeometry args={[width, height]} />
                <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent opacity={1} />
            </mesh>
            <axesHelper args={[2]} />
        </group>
    )
}
