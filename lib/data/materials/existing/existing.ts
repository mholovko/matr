import { Classification, ConditionRating, InterventionStrategy } from "@/types/material-passport";
import { ExistingMaterialPassport } from "@/types/material-passport";


export const existingMaterials: ExistingMaterialPassport[] = [{
    id: "MATR_PLAS_LimePlaster_Debonded",
    name: "Traditional Lime Plaster & Wallpaper",
    description: "Original 3-coat lime plaster applied over timber laths. Surface finished with multiple layers of historic wallpaper. Evidence of debonding (nib failure) from laths.",
    classification: Classification.LINING,
    image: "/images/survey/plaster-delam.jpg",

    auditData: {
        condition: ConditionRating.POOR, // 4 - Significant failure/delamination
        defects: [
            "Loss of Key (Nibs broken)",
            "Cracking",
            "Adhesion failure",
            "Wallpaper degradation"
        ],
        approximateAgeYear: 1900,
        isHazardous: false // *Note: Wallpaper paste should be tested for fungicides/lead*
    },

    resourceValue: {
        recoveryPotential: 0.05, // Negligible - difficult to separate from wallpaper/debris
        reclamationValue: 0,
        avoidedCarbon: 0 // Demolition is likely required due to condition
    },

    matrixMetrics: {
        financialCost: {
            sunkCost: true,
            demolitionCost: 25.00, // Cost to strip and bag
            repairCost: 90.00, // Very high skilled labor to patch-repair lath and plaster
            currency: 'GBP'
        },
        provenance: {
            originLocation: "IN_SITU",
            distanceToSiteMiles: 0,
            transportMode: 'EV_Van', // Placeholder for data consistency
            isEcoregional: true
        },
        embodiedCarbon: {
            a1a3: 0,
            a4: 0,
            a5: 0,
            b1b5: 0,
            c1c4: 15.0, // Dust and transport of heavy waste
            d: 0,
            totalEmbodied: 15.0,
            biogenicStorage: 0 // Plaster has no biogenic storage
        }
    },

    circularity: {
        detachabilityIndex: 0.8, // Easy to smash off, hard to remove intact
        recycledContent: 0,
        materialHealth: 'Red_List_Free',
        endOfLifeStrategy: 'Landfill', // Lime plaster is hard to recycle into new products
        expectedLifespan: 0 // Failed state
    },

    physics: {
        thermalConductivity: 0.50, // Standard lime plaster
        vaporResistivity: 10, // Breathable
        density: 1300
    }
},
{
    id: "MATR_WOOD_SoftwoodStud_Rough",
    name: "Vertical Timber Stud (4x2)",
    description: "Rough sawn structural timber post. Dark coloration suggests oxidation/age. Appears structurally sound within the cavity.",
    classification: Classification.STRUCTURAL_TIMBER,
    image: "/images/survey/internal-stud.jpg",

    auditData: {
        condition: ConditionRating.GOOD, // 2 - Protected environment, likely sound
        defects: ["None visible"],
        approximateAgeYear: 1900,
        isHazardous: false
    },

    resourceValue: {
        recoveryPotential: 0.9, // High - if carefully dismantled, this is high quality timber
        reclamationValue: 5.00, // Per meter for reclaimed vintage pine
        avoidedCarbon: 15.0 // High saving vs buying new C16 timber
    },

    matrixMetrics: {
        financialCost: {
            sunkCost: true,
            demolitionCost: 15.00,
            repairCost: 0,
            currency: 'GBP'
        },
        provenance: {
            originLocation: "IN_SITU",
            distanceToSiteMiles: 0,
            transportMode: 'EV_Van',
            isEcoregional: true
        },
        embodiedCarbon: {
            a1a3: 0,
            a4: 0,
            a5: 0,
            b1b5: 0,
            c1c4: 5.0,
            d: -15.0, // Reuse benefit
            totalEmbodied: 5.0,
            biogenicStorage: -25.0 // Significant carbon storage
        }
    },

    circularity: {
        detachabilityIndex: 0.6, // Nailed, but large cross section makes it salvageable
        recycledContent: 0,
        materialHealth: 'Red_List_Free',
        endOfLifeStrategy: 'Reuse_Direct', // Reclaim
        expectedLifespan: 50
    },

    physics: {
        thermalConductivity: 0.13,
        vaporResistivity: 50,
        density: 550 // Likely denser old-growth pine
    }
},
{
    id: "MATR_WOOD_TimberLath_Brittle",
    name: "Sawn Softwood Laths",
    description: "Horizontal Riven/Sawn timber laths nailed to vertical studs. Provides the substrate for the plaster keys.",
    classification: Classification.SHEATHING,
    image: "/images/survey/lath-structure.jpg",

    auditData: {
        condition: ConditionRating.FAIR, // 3 - Brittle but functional
        defects: ["Mechanical damage from probe", "Minor woodworm flight holes visible"],
        approximateAgeYear: 1900,
        isHazardous: false
    },

    resourceValue: {
        recoveryPotential: 0.2, // Low - too fragile to de-nail and reuse
        reclamationValue: 0,
        avoidedCarbon: 2.0 // Biomass energy recovery potential
    },

    matrixMetrics: {
        financialCost: {
            sunkCost: true,
            demolitionCost: 10.00,
            repairCost: 40.00, // Cost to patch in new laths
            currency: 'GBP'
        },
        provenance: {
            originLocation: "IN_SITU",
            distanceToSiteMiles: 0,
            transportMode: 'EV_Van',
            isEcoregional: true
        },
        embodiedCarbon: {
            a1a3: 0,
            a4: 0,
            a5: 0,
            b1b5: 0,
            c1c4: 2.0,
            d: -5.0, // Energy recovery via incineration
            totalEmbodied: 2.0,
            biogenicStorage: -5.0 // Carbon still stored in the wood
        }
    },

    circularity: {
        detachabilityIndex: 0.4, // Nailed - hard to remove without breaking
        recycledContent: 0,
        materialHealth: 'Red_List_Free',
        endOfLifeStrategy: 'Incineration', // Likely energy from waste
        expectedLifespan: 25 // If left undisturbed
    },

    physics: {
        thermalConductivity: 0.13,
        vaporResistivity: 50,
        density: 450
    }
},

{
    id: "MATR_WOOD_PineFloor_Painted",
    name: "Original Softwood Floorboards (150mm)",
    description: "Original suspended timber floorboards running perpendicular to joists. Surface is heavily stained/painted but test patch (Photo 2) reveals sound timber underneath. Gaps present between boards.",
    classification: Classification.FLOORING,
    image: "/images/survey/floor-sanding-patch.jpg", // Link to Image 2

    auditData: {
        condition: ConditionRating.FAIR, // 3 - Structurally sound but aesthetically poor
        defects: [
            "Surface contamination (paint/bitumen)",
            "Gapping (Draft risk)",
            "Minor cupping",
            "Nail heads protruding"
        ],
        approximateAgeYear: 1900,
        isHazardous: false,
        recommendedStrategy: InterventionStrategy.REPAIR_REFURBISH // Sand & Seal
    },

    resourceValue: {
        recoveryPotential: 0.95, // Very High - sanding restores it to 'new' look
        reclamationValue: 45.00, // £45/m2 is typical for reclaimed pine
        avoidedCarbon: 12.0 // kgCO2e/m2 vs new engineered oak
    },

    matrixMetrics: {
        financialCost: {
            sunkCost: true,
            demolitionCost: 15.00, // Labor to lift
            repairCost: 35.00, // Professional sanding and sealing per m2
            currency: 'GBP'
        },
        provenance: {
            originLocation: "IN_SITU",
            distanceToSiteMiles: 0,
            transportMode: 'None',
            isEcoregional: true
        },
        embodiedCarbon: {
            a1a3: 0, // Historic
            a4: 0,
            a5: 0,
            b1b5: 0, // Maintenance
            c1c4: 2.5, // Transport if removed
            d: -10.0, // Biomass recovery
            totalEmbodied: 2.5,
            biogenicStorage: -28.0 // Significant carbon stored in the wood mass
        }
    },

    circularity: {
        detachabilityIndex: 0.7, // Nailed down - requires care to lift without splitting
        recycledContent: 0,
        materialHealth: 'Red_List_Free', // Assuming no lead paint
        endOfLifeStrategy: 'Reuse_Direct', // Reclaim yards
        expectedLifespan: 60 // Once restored
    },

    physics: {
        thermalConductivity: 0.13, // Standard Softwood
        density: 500, // kg/m3
        moistureContent: 10 // Appears dry
    }
},
{
    id: "MATR_MASO_BrickSolid_ReclaimedRed",
    name: "Solid Brickwork",
    description: "Exposed solid masonry wall following plaster removal. Visual evidence of a rough relieving arch indicates a former fireplace opening that has been infilled.",
    classification: Classification.MASONRY,
    image: "/images/survey/brick-arch-detail.jpg", // Link to Image 3

    auditData: {
        condition: ConditionRating.FAIR, // 3 - Structurally stable but needs surface repair
        defects: [
            "Mortar erosion (repointing required)",
            "Residual gypsum plaster adhesion",
            "Soot contamination risk (hygroscopic salts)",
            "Uneven coursing in infill area"
        ],
        approximateAgeYear: 1900, // Original structure
        isHazardous: false, // *Check: Soot deposits can be carcinogenic if disturbed*
        recommendedStrategy: InterventionStrategy.REPAIR_REFURBISH // Clean & Point (Feature) or Re-plaster
    },

    resourceValue: {
        recoveryPotential: 0.85, // High - Bricks laid in lime mortar clean up easily
        reclamationValue: 1.20, // £1.20 per brick (standard reclaimed common)
        avoidedCarbon: 32.0 // kgCO2e/m2 (High embodied carbon in firing clay)
    },

    matrixMetrics: {
        financialCost: {
            sunkCost: true,
            demolitionCost: 60.00, // High labour to dismantle chimney breast safely
            repairCost: 45.00, // Cost to abrasive clean and lime point per m2
            currency: 'GBP'
        },
        provenance: {
            originLocation: "IN_SITU",
            distanceToSiteMiles: 0,
            transportMode: 'None',
            isEcoregional: true
        },
        embodiedCarbon: {
            a1a3: 0,
            a4: 0,
            a5: 0,
            b1b5: 0,
            c1c4: 18.0, // Heavy transport cost for rubble
            d: -25.0, // Significant credit if bricks are salvaged
            totalEmbodied: 18.0,
            biogenicStorage: 0
        }
    },

    circularity: {
        detachabilityIndex: 0.9, // Bricks are modular and easy to separate
        recycledContent: 0, // Virgin clay (historic)
        materialHealth: 'Red_List_Free',
        endOfLifeStrategy: 'Reuse_Direct', // Reclamation yard
        expectedLifespan: 100 // Indefinite if kept dry
    },

    physics: {
        thermalConductivity: 0.77, // Standard solid brick (Poor insulator)
        density: 1700, // High thermal mass (Good for regulating temp)
        moistureContent: 5 // Visuals look dry, but soot can hold moisture
    }
},
{
    id: "MATR_MASO_BrickFace_RedRubber",
    name: "Red Clay Facing Brick",
    description: "External solid masonry wall laid in Flemish Bond. High-quality red clay 'Rubbers' or smooth facing bricks with very tight mortar joints. Vertical separation crack visible at the window reveal junction.",
    classification: Classification.MASONRY,
    image: "/images/survey/brick-flemish-bond.jpg", // Link to your uploaded image

    auditData: {
        condition: ConditionRating.GOOD, // 2 - Bricks are sound, defect is localized
        defects: [
            "Vertical separation crack (structural movement or debonding)",
            "Minor surface weathering",
            "Thermal bridging (Solid wall construction)"
        ],
        approximateAgeYear: 1900,
        isHazardous: false,
        recommendedStrategy: InterventionStrategy.REPAIR_REFURBISH // Stitch crack & repoint
    },

    resourceValue: {
        recoveryPotential: 0.90, // Very High - These are premium bricks likely set in lime
        reclamationValue: 1.50, // £1.50+ per brick. These are high-value facings.
        avoidedCarbon: 38.0 // kgCO2e/m2 (Keeping solid walls is a huge carbon save)
    },

    matrixMetrics: {
        financialCost: {
            sunkCost: true,
            demolitionCost: 50.00, // Labor intensive to salvage intact
            repairCost: 30.00, // Cost to helical stitch the crack
            currency: 'GBP'
        },
        provenance: {
            originLocation: "IN_SITU",
            distanceToSiteMiles: 0,
            transportMode: 'None',
            isEcoregional: true
        },
        embodiedCarbon: {
            a1a3: 0,
            a4: 0,
            a5: 0,
            b1b5: 0,
            c1c4: 15.0, // Transport
            d: -30.0, // High negative value (Credit) for salvaging these bricks
            totalEmbodied: 15.0,
            biogenicStorage: 0
        }
    },

    circularity: {
        detachabilityIndex: 0.8, // Good - likely lime mortar, easy to clean off
        recycledContent: 0,
        materialHealth: 'Red_List_Free',
        endOfLifeStrategy: 'Reuse_Direct', // High value reclamation
        expectedLifespan: 100 // Indefinite if pointed correctly
    },

    physics: {
        thermalConductivity: 0.84, // Solid brick allows heat transfer
        density: 1950, // High density facing brick
        moistureContent: 5 // Appears dry on face
    }
}
]