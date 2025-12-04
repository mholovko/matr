import * as THREE from 'three'
import { generatePineFloorTexture, generateReclaimedBrickTextures } from './textures/procedural-textures'
import { generateRedRubberBrickTextures } from './textures/procedural-textures-realistic'


export class MaterialManager {
    // Cache for procedural textures
    // Now stores an object with optional maps
    private textureCache: Map<string, { map: THREE.Texture, roughnessMap?: THREE.Texture, bumpMap?: THREE.Texture, normalMap?: THREE.Texture }> = new Map()

    // Persistent standard materials (omitted implementation for brevity, same as your original code)
    private highlightMat: THREE.MeshStandardMaterial | null = null
    private hoverMat: THREE.MeshStandardMaterial | null = null
    private defaultMat: THREE.MeshStandardMaterial | null = null
    private phaseMats: any | null = null;

    constructor() { }

    /**
     * Checks for specific material name and injects texture, otherwise converts Speckle props
     */
    public create(materialName: string, materialProps: any, backfaces: boolean = false): THREE.MeshStandardMaterial {
        const params: THREE.MeshStandardMaterialParameters = {
            side: backfaces ? THREE.BackSide : THREE.DoubleSide,
            // Default to standard props if specific ones aren't set later
            metalness: materialProps.metalness ?? 0.0,
            roughness: materialProps.roughness ?? 0.9,
            color: new THREE.Color(0xffffff) // Default white so textures show correctly
        }

        let textures: { map: THREE.Texture, roughnessMap?: THREE.Texture, bumpMap?: THREE.Texture, normalMap?: THREE.Texture } | undefined;

        // --- SPECIFIC MATERIAL LOGIC BASED ON ID ---
        switch (materialName) {

            case 'MATR_WOOD_PineFloor_Painted':
                // Check cache
                textures = this.textureCache.get(materialName);
                if (!textures) {
                    const map = generatePineFloorTexture();
                    textures = { map, bumpMap: map }; // Reuse map for bump
                    this.textureCache.set(materialName, textures);
                }

                // Apply texture parameters
                params.map = textures.map;
                params.bumpMap = textures.bumpMap;
                params.bumpScale = 0.015;

                // Material properties based on description:
                params.roughness = 0.85;
                params.metalness = 0.0;
                break;


            case 'MATR_MASO_BrickSolid_ReclaimedRed':
                // Check cache
                textures = this.textureCache.get(materialName);
                if (!textures) {
                    textures = generateReclaimedBrickTextures();
                    this.textureCache.set(materialName, textures);
                }

                // Apply texture parameters
                params.map = textures.map;
                params.roughnessMap = textures.roughnessMap;
                params.bumpMap = textures.bumpMap;
                params.normalMap = textures.normalMap;

                params.bumpScale = 0.02;
                params.normalScale = new THREE.Vector2(1, 1);

                // We rely on the roughness map now, so base roughness can be 1.0 (multiplied by map)
                params.roughness = 1.0;
                params.metalness = 0.0;
                break;

            case 'MATR_MASO_BrickFace_RedRubber':
                // Check cache
                textures = this.textureCache.get(materialName);
                if (!textures) {
                    textures = generateRedRubberBrickTextures();
                    this.textureCache.set(materialName, textures);
                }

                // Apply texture parameters
                params.map = textures.map;
                params.roughnessMap = textures.roughnessMap;
                params.bumpMap = textures.bumpMap;
                params.normalMap = textures.normalMap;

                params.bumpScale = 0.015; // Fine joints
                params.normalScale = new THREE.Vector2(1, 1);

                params.roughness = 1.0;
                params.metalness = 0.0;
                break;

            case 'Transparent':
                // Room material: solid white backface
                // Ignore any transparency settings from render material proxy
                params.color = new THREE.Color(0xFFFFFF);
                params.side = THREE.BackSide;
                params.transparent = false;
                params.opacity = 1.0;
                params.metalness = 0.0;
                params.roughness = 1.0;
                params.depthWrite = true;
                break;

            // --- STANDARD/FALLBACK LOGIC ---
            default:
                // If the ID doesn't match our procedural ones, revert to standard color parsing
                this.applyStandardColor(params, materialProps);
                // Reset roughness to whatever came in props
                params.roughness = materialProps.roughness ?? 1.0;
                break;
        }


        // --- SHARED PROPERTIES ---
        // Skip transparency for Transparent material (handled explicitly in case above)
        if (materialName !== 'Transparent') {
            this.applyTransparency(params, materialProps);
        }
        this.applyEmissive(params, materialProps)

        const material = new THREE.MeshStandardMaterial(params)
        material.name = materialName

        // IMPORTANT: Ensure textures are updated when first created
        if (material.map) material.map.needsUpdate = true;
        if (material.bumpMap) material.bumpMap.needsUpdate = true;
        if (material.roughnessMap) material.roughnessMap.needsUpdate = true;
        if (material.normalMap) material.normalMap.needsUpdate = true;

        return material
    }


    // --- HELPER METHODS (Same as your original code) ---

    private applyStandardColor(params: THREE.MeshStandardMaterialParameters, props: any) {
        if (props.diffuse !== undefined) {
            const argb = props.diffuse
            // Simple RGB extraction (assuming alpha is 255 or handled by opacity prop)
            const r = ((argb >> 16) & 0xFF) / 255
            const g = ((argb >> 8) & 0xFF) / 255
            const b = (argb & 0xFF) / 255
            params.color = new THREE.Color(r, g, b)
        } else {
            params.color = new THREE.Color(0xe2e8f0)
        }
    }

    private applyTransparency(params: THREE.MeshStandardMaterialParameters, props: any) {
        if (props.opacity !== undefined && props.opacity < 1.0) {
            params.transparent = true
            params.opacity = props.opacity
            // Often better to turn off depthWrite for transparent objects to avoid sorting issues
            params.depthWrite = false
        }
    }

    private applyEmissive(params: THREE.MeshStandardMaterialParameters, props: any) {
        if (props.emissive !== undefined) {
            const argb = props.emissive
            const r = ((argb >> 16) & 0xFF) / 255
            const g = ((argb >> 8) & 0xFF) / 255
            const b = (argb & 0xFF) / 255
            params.emissive = new THREE.Color(r, g, b)
        }
    }
    // --- VISUAL STATES ---

    public getVisualStateMaterials() {
        if (!this.highlightMat) {
            this.highlightMat = new THREE.MeshStandardMaterial({
                color: 0x2563eb,
                emissive: 0x1e3a8a,
                emissiveIntensity: 0.4,
                metalness: 0.2,
                roughness: 0.5
            })
        }
        if (!this.hoverMat) {
            this.hoverMat = new THREE.MeshStandardMaterial({
                color: 0x60a5fa,
                emissive: 0x000000,
                emissiveIntensity: 0.0,
                metalness: 0.1,
                roughness: 0.2
            })
        }
        if (!this.defaultMat) {
            this.defaultMat = new THREE.MeshStandardMaterial({
                color: 0xe2e8f0,
                metalness: 0.0,
                roughness: 1.0
            })
        }
        if (!this.phaseMats) {
            this.phaseMats = {
                created: new THREE.MeshStandardMaterial({
                    color: 0x22c55e,
                    metalness: 0.1,
                    roughness: 0.8
                }),
                demolished: new THREE.MeshStandardMaterial({
                    color: 0xef4444,
                    metalness: 0.1,
                    roughness: 0.8,
                    transparent: true,
                    opacity: 0.7
                }),
                existing: new THREE.MeshStandardMaterial({
                    color: 0xFFFFFF,
                    transparent: true,
                    opacity: 0.05,
                    depthWrite: false,
                    metalness: 0.0,
                    roughness: 1.0
                })
            }
        }

        const roomMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            side: THREE.BackSide,
            transparent: false,
            opacity: 1.0,
            metalness: 0.0,
            roughness: 1.0,
            depthWrite: true
        })

        const roomHighlightMaterial = new THREE.MeshStandardMaterial({
            color: 0x3b82f6,
            emissive: 0x1e40af,
            emissiveIntensity: 0.3,
            metalness: 0.1,
            roughness: 0.8,
            side: THREE.BackSide
        })

        const hiddenMaterial = new THREE.MeshStandardMaterial({ visible: false })

        return {
            default: this.defaultMat!,
            highlight: this.highlightMat!,
            hover: this.hoverMat!,
            created: this.phaseMats!.created,
            demolished: this.phaseMats!.demolished,
            existing: this.phaseMats!.existing,
            hidden: hiddenMaterial,
            room: roomMaterial,
            roomHighlight: roomHighlightMaterial
        }
    }
}