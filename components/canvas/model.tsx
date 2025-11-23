"use client"

import { useRef, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import * as THREE from 'three'

export function Model() {
    const { setSelectedElement, selectedElementId } = useAppStore(useShallow(state => ({
        setSelectedElement: state.setSelectedElement,
        selectedElementId: state.selectedElementId
    })))

    // Mocking a Wall Element
    return (
        <group>
            {/* Example: External Wall 1 */}
            <mesh
                position={[0, 1.5, 0]}
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedElement("element-wall-01")
                }}
            >
                <boxGeometry args={[4, 3, 0.3]} />
                <meshStandardMaterial
                    color={selectedElementId === "element-wall-01" ? "#3b82f6" : "#e2e8f0"}
                />
            </mesh>

            {/* Example: External Wall 2 (Perpendicular) */}
            <mesh
                position={[2.15, 1.5, 2]}
                rotation={[0, -Math.PI / 2, 0]}
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedElement("element-wall-02")
                }}
            >
                <boxGeometry args={[4, 3, 0.3]} />
                <meshStandardMaterial
                    color={selectedElementId === "element-wall-02" ? "#3b82f6" : "#cbd5e1"}
                />
            </mesh>

            {/* Example: Roof */}
            <mesh
                position={[0, 3.5, 0]}
                rotation={[0, 0, Math.PI / 4]}
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedElement("element-roof-01")
                }}
            >
                <coneGeometry args={[3.5, 2, 4]} />
                <meshStandardMaterial
                    color={selectedElementId === "element-roof-01" ? "#ef4444" : "#475569"}
                />
            </mesh>

            {/* Example: Window */}
            <mesh
                position={[1, 2, 0.2]}
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedElement("element-window-01")
                }}
            >
                <boxGeometry args={[1, 1, 0.1]} />
                <meshStandardMaterial
                    color={selectedElementId === "element-window-01" ? "#3b82f6" : "#93c5fd"}
                    transparent
                    opacity={0.7}
                />
            </mesh>

            {/* Example: Door */}
            <mesh
                position={[-1, 1, 0.2]}
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedElement("element-door-01")
                }}
            >
                <boxGeometry args={[1, 2, 0.1]} />
                <meshStandardMaterial
                    color={selectedElementId === "element-door-01" ? "#3b82f6" : "#78350f"}
                />
            </mesh>

            {/* Example: Floor Joist */}
            <mesh
                position={[0, 0.1, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedElement("element-floor-01")
                }}
            >
                <planeGeometry args={[8, 8]} />
                <meshStandardMaterial color="#94a3b8" />
            </mesh>
        </group>
    )
}