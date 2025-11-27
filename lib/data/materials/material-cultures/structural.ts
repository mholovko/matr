import { v4 as uuidv4 } from 'uuid';
import { MaterialPassport, Classification } from '@/types/material-passport';

// ------------------------------------------------------------------
// STRUCTURAL MATERIALS (Pages 74-75) https://materialcultures.org/2024-building-skills-report/
// ------------------------------------------------------------------

export const structuralMaterials: MaterialPassport[] = [

    // -- ROW 1 -------------------------------------------------------

    {
        id: uuidv4(),
        name: "Sawn Softwood",
        manufacturer: "Davies Timber",
        description: "Sawn softwood is timber from coniferous trees that is cut into boards and strength graded when used for construction. It is lightweight, strong, easy to work with, renewable and biodegradable. Durability can be improved through good design (e.g. overhang's over cladding), chemical or thermal modification treatment, or regularly maintained coatings.",
        classification: Classification.STRUCTURAL_TIMBER,
        image: "/images/materials/material-cultures/structural/Sawn Softwood.jpg",
        matrixMetrics: {
            financialCost: { unitRate: 18.00, currency: 'GBP', unit: 'm3' },
            provenance: {
                originLocation: "Birmingham, UK",
                distanceToSiteMiles: 14,
                transportMode: 'EV_Van',
                isEcoregional: true // < 50 miles
            },
            embodiedCarbon: {
                a1a3: 40.0,   // Production energy (Positive)
                a4: 0.5,      // Short transport
                a5: 5.0,
                b1b5: 0,
                c1c4: 8.0,
                d: -25.0,
                biogenicStorage: -41.01, // Large negative to result in Book Net: -1.010 KgCO2eq
                totalEmbodied: 53.5 // (A1-A5 + C) before biogenic subtraction
            }
        },
        circularity: {
            detachabilityIndex: 0.9,
            recycledContent: 0,
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Reuse_Direct',
            expectedLifespan: 60
        },
        physics: {
            thermalConductivity: 0.13,
            vaporResistivity: 1, // Breathable
            density: 500
        }
    },
    {
        id: uuidv4(),
        name: "I joist James Jones",
        manufacturer: "James Jones",
        description: "I joists are engineered joists that are more dimensionally stable and carry greater loads using smaller amounts of material than conventional timber joists. They are more vulnerable to fire and normally use synthetic glues. Most i-joists use imported timber in the flanges due to improved strength properties of the material.",
        classification: Classification.STRUCTURAL_TIMBER,
        image: "/images/materials/material-cultures/structural/I joist James Jones.jpg",
        matrixMetrics: {
            financialCost: { unitRate: 10.30, currency: 'GBP', unit: 'm3' }, // Note: Unit likely linear meter in reality, but listed as standard cost here
            provenance: {
                originLocation: "Scotland, UK",
                distanceToSiteMiles: 298,
                transportMode: 'Diesel_Truck',
                isEcoregional: false
            },
            embodiedCarbon: {
                a1a3: 80.0,   // Higher processing than sawn
                a4: 15.0,
                a5: 5.0,
                b1b5: 0,
                c1c4: 10.0,
                d: -20.0,
                biogenicStorage: -80.01, // Resulting in Book Net: -0.010 KgCO2eq
                totalEmbodied: 110.0
            }
        },
        circularity: {
            detachabilityIndex: 0.7,
            recycledContent: 10,
            materialHealth: 'Contains_VOCs', // Glues
            endOfLifeStrategy: 'Incineration',
            expectedLifespan: 60
        },
        physics: {
            thermalConductivity: 0.15,
            vaporResistivity: 15,
            density: 450
        }
    },

    // -- ROW 2 -------------------------------------------------------

    {
        id: uuidv4(),
        name: "Cross-laminated Timber (CLT)",
        manufacturer: "KLH",
        description: "CLT is an engineered wood product made by stacking timber boards in alternating directions and glueing them together to make strong beams. CLT has great structural properties and is fire resistant, although the use of adhesives limits its biodegradability.",
        classification: Classification.STRUCTURAL_TIMBER,
        image: "/images/materials/material-cultures/structural/Cross-laminated Timber.jpg",
        matrixMetrics: {
            financialCost: { unitRate: 30.00, currency: 'GBP', unit: 'm3' },
            provenance: {
                originLocation: "Austria, EU",
                distanceToSiteMiles: 1019,
                transportMode: 'Diesel_Truck',
                isEcoregional: false
            },
            embodiedCarbon: {
                a1a3: 150.0,
                a4: 85.0,   // High transport impact
                a5: 15.0,
                b1b5: 0,
                c1c4: 20.0,
                d: -50.0,
                biogenicStorage: -151.38, // Resulting in Book Net: -1.380 KgCO2eq
                totalEmbodied: 270.0
            }
        },
        circularity: {
            detachabilityIndex: 0.6,
            recycledContent: 0,
            materialHealth: 'Contains_VOCs',
            endOfLifeStrategy: 'Recycle', // Downcycling
            expectedLifespan: 60
        },
        physics: {
            thermalConductivity: 0.13,
            vaporResistivity: 30, // Glue layers
            density: 500
        }
    },
    {
        id: uuidv4(),
        name: "Strock",
        manufacturer: "HGM",
        description: "Strocks are structural blocks made from compressed clay-rich earth, straw and lime. They can typically be used in load-bearing walls in buildings up to three storeys high. Strocks offer excellent thermal insulation and are both renewable and biodegradable.",
        classification: Classification.MASONRY,
        image: "/images/materials/material-cultures/structural/Strock.jpg",
        matrixMetrics: {
            financialCost: { unitRate: 2.95, currency: 'GBP', unit: 'kg' }, // Per block implied
            provenance: {
                originLocation: "South East, UK",
                distanceToSiteMiles: 87,
                transportMode: 'Diesel_Truck',
                isEcoregional: false
            },
            embodiedCarbon: {
                a1a3: 0.05,
                a4: 0.02,
                a5: 0.01,
                b1b5: 0,
                c1c4: 0.01,
                d: 0,
                biogenicStorage: -0.038, // Straw content balances the lime. Book Net: 0.012 (Positive)
                totalEmbodied: 0.09
            }
        },
        circularity: {
            detachabilityIndex: 1.0, // Lime mortar
            recycledContent: 0,
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Compost', // Earth/Straw return to ground
            expectedLifespan: 100
        },
        physics: {
            thermalConductivity: 0.25, // Insulating block
            vaporResistivity: 3,       // Highly breathable
            density: 1600
        }
    },

    // -- ROW 3 -------------------------------------------------------

    {
        id: uuidv4(),
        name: "Portland Stone Brick",
        manufacturer: "Albion Stone",
        description: "Portland stone bricks are made from limestone extracted in the Isle of Portland in the English Channel. Portland Stone Bricks have attractive colouring and texture, and have traditionally been viewed as a luxury material. Portland Stone Bricks have extremely low levels of embodied carbon compared to fired clay bricks.",
        classification: Classification.MASONRY,
        image: "/images/materials/material-cultures/structural/Portland Stone Brick.jpg",
        matrixMetrics: {
            financialCost: { unitRate: 2.50, currency: 'GBP', unit: 'kg' }, // Per brick implied
            provenance: {
                originLocation: "Dorset, UK",
                distanceToSiteMiles: 156,
                transportMode: 'Diesel_Truck',
                isEcoregional: false
            },
            embodiedCarbon: {
                a1a3: 0.044, // Book Net: 0.044 (Purely extraction)
                a4: 0.03,
                a5: 0.01,
                b1b5: 0,
                c1c4: 0.01,
                d: 0,
                biogenicStorage: 0,
                totalEmbodied: 0.094
            }
        },
        circularity: {
            detachabilityIndex: 1.0,
            recycledContent: 0,
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Reuse_Direct',
            expectedLifespan: 150
        },
        physics: {
            thermalConductivity: 1.5,
            vaporResistivity: 200,
            density: 2200
        }
    },
    {
        id: uuidv4(),
        name: "Fired Brick",
        manufacturer: "Ibstock",
        description: "Fired bricks are structural building units made with clay, sand and small amounts of admixture. They are either mould-formed or extruded and wire cut, and fired in a kiln at temperatures between 700 and 1100 degrees.",
        classification: Classification.MASONRY,
        image: "/images/materials/material-cultures/structural/Fired Brick.jpg",
        matrixMetrics: {
            financialCost: { unitRate: 1.50, currency: 'GBP', unit: 'kg' }, // Per brick
            provenance: {
                originLocation: "Birmingham, UK",
                distanceToSiteMiles: 15,
                transportMode: 'EV_Van',
                isEcoregional: true
            },
            embodiedCarbon: {
                a1a3: 0.453, // Book Net: 0.453 (Kiln firing)
                a4: 0.01,
                a5: 0.02,
                b1b5: 0,
                c1c4: 0.02,
                d: 0,
                biogenicStorage: 0,
                totalEmbodied: 0.503
            }
        },
        circularity: {
            detachabilityIndex: 1.0, // If lime mortar used
            recycledContent: 0,
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Reuse_Direct',
            expectedLifespan: 150
        },
        physics: {
            thermalConductivity: 0.77,
            vaporResistivity: 15,
            density: 1900
        }
    },

    // -- ROW 4 -------------------------------------------------------

    {
        id: uuidv4(),
        name: "Prefab Straw Panel – Loadbearing",
        manufacturer: "Ecococon",
        description: "Prefab straw panels are modular wall elements made from compressed straw encased in a breathable frame. They provide excellent insulation and are highly renewable and biodegradable, and made from materials that are readily available in the UK. Prefab straw panels have low embodied energy and can store important quantities of carbon.",
        classification: Classification.STRUCTURAL_TIMBER, // Composite Timber/Straw
        image: "/images/materials/material-cultures/structural/Prefab Straw Panel – Loadbearing.jpg",
        matrixMetrics: {
            financialCost: { unitRate: 0, currency: 'GBP', unit: 'm2' }, // Book lists "£ -"
            provenance: {
                originLocation: "Lithuania, EU",
                distanceToSiteMiles: 1375,
                transportMode: 'Diesel_Truck',
                isEcoregional: false
            },
            embodiedCarbon: {
                a1a3: 15.0,
                a4: 60.0,    // High transport impact
                a5: 5.0,
                b1b5: 0,
                c1c4: 5.0,
                d: -10.0,
                biogenicStorage: -15.99, // Resulting in Book Net: -0.990 KgCO2eq
                totalEmbodied: 85.0
            }
        },
        circularity: {
            detachabilityIndex: 0.9,
            recycledContent: 98, // Agricultural byproduct
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Compost',
            expectedLifespan: 60
        },
        physics: {
            thermalConductivity: 0.056, // Insulating structural element
            vaporResistivity: 2,        // Breathable
            density: 110
        }
    },
    {
        id: uuidv4(),
        name: "Plywood",
        manufacturer: "Skeljka",
        description: "Plywood is an engineered wood product made from thin layers of veneers bound together with synthetic adhesives. We do not manufacture plywood in the UK and therefore the industry is reliant on importing plywood, and any hardwood veneer trees if valuable will be sold to the continent. Alternative board products manufactured in the UK include OSB and chipboard.",
        classification: Classification.STRUCTURAL_TIMBER,
        image: "/images/materials/material-cultures/structural/Plywood.jpg",
        matrixMetrics: {
            financialCost: { unitRate: 0, currency: 'GBP', unit: 'm2' }, // Book lists "£ -"
            provenance: {
                originLocation: "Poland, EU",
                distanceToSiteMiles: 1038,
                transportMode: 'Diesel_Truck',
                isEcoregional: false
            },
            embodiedCarbon: {
                a1a3: 60.0,
                a4: 45.0,
                a5: 5.0,
                b1b5: 0,
                c1c4: 10.0,
                d: -10.0,
                biogenicStorage: -60.5, // Resulting in Book Net: -0.500 KgCO2eq
                totalEmbodied: 120.0
            }
        },
        circularity: {
            detachabilityIndex: 0.5,
            recycledContent: 0,
            materialHealth: 'Contains_VOCs', // Glues
            endOfLifeStrategy: 'Incineration',
            expectedLifespan: 50
        },
        physics: {
            thermalConductivity: 0.13,
            vaporResistivity: 200, // Glues increase resistance
            density: 600
        }
    },

    // -- ROW 5 -------------------------------------------------------

    {
        id: uuidv4(),
        name: "Fired Brick",
        manufacturer: "Ketley",
        description: "Fired bricks are structural building units made with clay, sand without the inclusion of admixture. They are either mould-formed or extruded and wire cut, and fired in a kiln at temperatures between 700 and 1100 degrees.",
        classification: Classification.MASONRY,
        image: "/images/materials/material-cultures/structural/Fired Brick Ketley.jpg",
        matrixMetrics: {
            financialCost: { unitRate: 1.80, currency: 'GBP', unit: 'kg' },
            provenance: {
                originLocation: "Birmingham, UK",
                distanceToSiteMiles: 11,
                transportMode: 'EV_Van',
                isEcoregional: true
            },
            embodiedCarbon: {
                a1a3: 0.453, // Book Net: 0.453
                a4: 0.01,
                a5: 0.02,
                b1b5: 0,
                c1c4: 0.02,
                d: 0,
                biogenicStorage: 0,
                totalEmbodied: 0.503
            }
        },
        circularity: {
            detachabilityIndex: 1.0,
            recycledContent: 0,
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Reuse_Direct',
            expectedLifespan: 150
        },
        physics: {
            thermalConductivity: 0.77,
            vaporResistivity: 15,
            density: 2000 // Staffordshire blue is dense
        }
    },
    {
        id: uuidv4(),
        name: "Engineered Brick",
        manufacturer: "Weinerberger",
        description: "Engineered bricks are produced to achieve higher strength, humidity and acid resistance than conventional bricks. Manufactured with precise control over composition and firing, they are used in non-visual applications, such as building areas with high contact with water or in the lower levels of brick buildings, requiring a high load-bearing capacity.",
        classification: Classification.MASONRY,
        image: "/images/materials/material-cultures/structural/Engineered Brick.jpg",
        matrixMetrics: {
            financialCost: { unitRate: 3.00, currency: 'GBP', unit: 'kg' },
            provenance: {
                originLocation: "Czech Republic, EU",
                distanceToSiteMiles: 922,
                transportMode: 'Diesel_Truck',
                isEcoregional: false
            },
            embodiedCarbon: {
                a1a3: 1.140, // Book Net: 1.140 (Very high energy)
                a4: 0.40,    // High transport
                a5: 0.05,
                b1b5: 0,
                c1c4: 0.05,
                d: 0,
                biogenicStorage: 0,
                totalEmbodied: 1.64
            }
        },
        circularity: {
            detachabilityIndex: 0.8, // Cement mortar likely used for engineered strength
            recycledContent: 0,
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Recycle', // Hardcore
            expectedLifespan: 100
        },
        physics: {
            thermalConductivity: 0.9,
            vaporResistivity: 100, // Very low porosity
            density: 2300
        }
    }
];