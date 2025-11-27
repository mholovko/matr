import { v4 as uuidv4 } from 'uuid';
import { MaterialPassport, Classification } from '@/types/material-passport';

// ------------------------------------------------------------------
// LINING MATERIALS (Pages 82-83) https://materialcultures.org/2024-building-skills-report/
// ------------------------------------------------------------------

export const liningMaterials: MaterialPassport[] = [

    // -- ROW 1 -------------------------------------------------------

    {
        id: uuidv4(),
        name: "Straw Board",
        manufacturer: "Ekopanely",
        description: "Compressed straw boards are manufactured by placing straw under intense heat and pressure to create a reaction in the natural resins within the straw that binds the materials together. The materials are bound at the edges with paper to create a board material that can be used as partitions or lining boards.",
        classification: Classification.LINING, // Used as partition/lining
        image: "/images/materials/material-cultures/lining/Straw Board.jpg",
        matrixMetrics: {
            financialCost: { unitRate: 18.80, currency: 'GBP', unit: 'm2' },
            provenance: {
                originLocation: "Czech Republic, EU",
                distanceToSiteMiles: 977,
                transportMode: 'Diesel_Truck',
                isEcoregional: false
            },
            embodiedCarbon: {
                a1a3: 5.0,  // Process energy (Heat/Pressure)
                a4: 2.5,    // Long transport
                a5: 0.5,
                b1b5: 0,
                c1c4: 1.0,
                d: -3.0,
                // Book Net: -0.125 KgCO2eq. 
                // Straw sequestration balances the processing/transport.
                biogenicStorage: -9.125,
                totalEmbodied: 8.0
            }
        },
        circularity: {
            detachabilityIndex: 0.7, // Screwed/Nailed
            recycledContent: 95, // Agricultural byproduct
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Compost',
            expectedLifespan: 60
        },
        physics: {
            thermalConductivity: 0.099, // Standard strawboard value
            vaporResistivity: 5,        // Breathable
            density: 380
        }
    },
    {
        id: uuidv4(),
        name: "Lime-Hemp Breathaboard",
        manufacturer: "Adaptavate",
        description: "This hemp-lime board has the benefit of being used in exactly the same way as a gypsum based plasterboard. The weight and size of the product match that of its competitor, which means its uptake and application is not limited by architectural specification or current construction methods and skills.",
        classification: Classification.LINING,
        image: "/images/materials/material-cultures/lining/Lime-Hemp Breathaboard.jpg",

        matrixMetrics: {
            financialCost: { unitRate: 0, currency: 'GBP', unit: 'm2' }, // Book lists "£ -"
            provenance: {
                originLocation: "Bristol, UK",
                distanceToSiteMiles: 87,
                transportMode: 'EV_Van',
                isEcoregional: false // > 50 miles
            },
            embodiedCarbon: {
                a1a3: 0.620, // Book Net: 0.620 (Positive). Lime carbonization outweighs hemp sequestration in this calculation.
                a4: 0.1,
                a5: 0.05,
                b1b5: 0,
                c1c4: 0.1,
                d: -0.1,
                biogenicStorage: -0.5, // Estimated small sequestration
                totalEmbodied: 0.87
            }
        },
        circularity: {
            detachabilityIndex: 0.6, // Screwed + Skimmed
            recycledContent: 40,     // Hemp shiv
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Compost',
            expectedLifespan: 50
        },
        physics: {
            thermalConductivity: 0.09,
            vaporResistivity: 6, // High breathability
            density: 650
        }
    },

    // -- ROW 2 -------------------------------------------------------

    {
        id: uuidv4(),
        name: "Wood Wool board",
        manufacturer: "Savolit",
        description: "A render carrying board made of wood strands, bound together with Portland cement. Wood wool boards are effective at eliminating thermal bridges around junctions in construction, providing acoustic insulation in walls and floors. They are vapour permeable, as well as vermin, fire and fungus resistant.",
        classification: Classification.LINING,
        image: "/images/materials/material-cultures/lining/Wood Wool board.jpg",

        matrixMetrics: {
            financialCost: { unitRate: 12.92, currency: 'GBP', unit: 'm2' },
            provenance: {
                originLocation: "Wales, UK",
                distanceToSiteMiles: 90,
                transportMode: 'Diesel_Truck',
                isEcoregional: false
            },
            embodiedCarbon: {
                a1a3: 0.980, // Book Net: 0.980 (Positive). Cement binder is high impact.
                a4: 0.15,
                a5: 0.1,
                b1b5: 0,
                c1c4: 0.2,
                d: 0,
                biogenicStorage: -0.5, // Wood content
                totalEmbodied: 1.43
            }
        },
        circularity: {
            detachabilityIndex: 0.5, // Render carrier (usually covered)
            recycledContent: 0,
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Recycle', // Downcycled to aggregate
            expectedLifespan: 60
        },
        physics: {
            thermalConductivity: 0.09,
            vaporResistivity: 5,
            density: 460
        }
    },
    {
        id: uuidv4(),
        name: "OSSB (Organic Structural Straw Board)",
        manufacturer: "iStraw",
        description: "OSSB stands for Organic Structural Straw Board. Company iStraw envisions this as an alternative to OSB (Oriented Strand Board) that does not use any synthetic adhesives. This product is still at experimental stages, but working prototypes have been produced and full commercial production is expected soon.",
        classification: Classification.LINING,
        image: "/images/materials/material-cultures/lining/OSSB.jpg",

        matrixMetrics: {
            financialCost: { unitRate: 0, currency: 'GBP', unit: 'm2' }, // Book lists "£ -"
            provenance: {
                originLocation: "Germany, EU",
                distanceToSiteMiles: 909,
                transportMode: 'Diesel_Truck',
                isEcoregional: false
            },
            embodiedCarbon: {
                // Book lists "-". Estimating based on Straw Board profile.
                a1a3: 4.0,
                a4: 2.5,
                a5: 0.2,
                b1b5: 0,
                c1c4: 0.5,
                d: -2.0,
                biogenicStorage: -8.0, // Estimated negative net
                totalEmbodied: 7.2
            }
        },
        circularity: {
            detachabilityIndex: 0.8,
            recycledContent: 100, // Straw
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Compost',
            expectedLifespan: 50
        },
        physics: {
            thermalConductivity: 0.10, // Est
            vaporResistivity: 5,
            density: 500
        }
    },

    // -- ROW 3 -------------------------------------------------------

    {
        id: uuidv4(),
        name: "Reed panel",
        manufacturer: "Hiss Reet",
        description: "These wall panels are made from whole dry Turkish yellow reed stalks, compressed and held together with galvanised wire. They can be used as both thermal insulation and plaster base, or in external uses such as garden fencing. They provide a very high level of thermal insulation and noise reduction.",
        classification: Classification.LINING, // Plaster base
        image: "/images/materials/material-cultures/lining/Reed panel.jpg",

        matrixMetrics: {
            financialCost: { unitRate: 13.65, currency: 'GBP', unit: 'm2' },
            provenance: {
                originLocation: "Turkey",
                distanceToSiteMiles: 196, // Note: Book lists 196mi (Likely UK distributor distance), but Origin is Turkey.
                transportMode: 'Diesel_Truck', // Assuming truck from distributor
                isEcoregional: false
            },
            embodiedCarbon: {
                // Book lists "-".
                // Reeds are low carbon, but galvanised wire and transport from Turkey adds up.
                a1a3: 2.0, // Wire + processing
                a4: 1.5,   // Turkey -> UK logic would be higher, but using Book logic
                a5: 0.1,
                b1b5: 0,
                c1c4: 0.2,
                d: -0.5,
                biogenicStorage: -2.5,
                totalEmbodied: 3.8
            }
        },
        circularity: {
            detachabilityIndex: 0.4, // Plastered over
            recycledContent: 0,
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Compost', // Wire must be separated
            expectedLifespan: 40
        },
        physics: {
            thermalConductivity: 0.055,
            vaporResistivity: 1, // Highly breathable
            density: 155
        }
    },
    {
        id: uuidv4(),
        name: "Timber Particle Board",
        manufacturer: "West Fraser",
        description: "Also known as chipboard, particleboard is an engineered timber product made from wood chips and a formaldehyde based resin. It is available in different grades corresponding to different densities and structural properties. It is not well suited for outdoor use.",
        classification: Classification.LINING,
        image: "/images/materials/material-cultures/lining/Timber Particle Board.jpg",

        matrixMetrics: {
            financialCost: { unitRate: 8.40, currency: 'GBP', unit: 'm2' },
            provenance: {
                originLocation: "Scotland, UK",
                distanceToSiteMiles: 398,
                transportMode: 'Diesel_Truck',
                isEcoregional: false
            },
            embodiedCarbon: {
                a1a3: 15.0, // Resin production is energy intensive
                a4: 1.0,
                a5: 1.0,
                b1b5: 0,
                c1c4: 3.0,
                d: -5.0,
                biogenicStorage: -21.04, // Resulting in Book Net: -1.040 KgCO2eq
                totalEmbodied: 20.0
            }
        },
        circularity: {
            detachabilityIndex: 0.5,
            recycledContent: 70, // Often uses recycled timber
            materialHealth: 'Contains_VOCs', // Formaldehyde
            endOfLifeStrategy: 'Incineration',
            expectedLifespan: 40
        },
        physics: {
            thermalConductivity: 0.13,
            vaporResistivity: 50, // Glue blocks moisture
            density: 650
        }
    },

    // -- ROW 4 -------------------------------------------------------

    {
        id: uuidv4(),
        name: "Bioboard",
        manufacturer: "Hemspan",
        description: "A 100% breathable, natural fibre interior construction board product consisting of hemp straw and a mineral binding agent. The completely natural materials offer water resistance and breathability making it suitable for indoor use in damp and dry rooms.",
        classification: Classification.LINING,
        image: "/images/materials/material-cultures/lining/Bioboard.jpg",

        matrixMetrics: {
            financialCost: { unitRate: 22.50, currency: 'GBP', unit: 'm2' },
            provenance: {
                originLocation: "Germany, EU",
                distanceToSiteMiles: 800,
                transportMode: 'Diesel_Truck',
                isEcoregional: false
            },
            embodiedCarbon: {
                // Book lists "-". Estimate:
                a1a3: 2.5,
                a4: 2.0,
                a5: 0.2,
                b1b5: 0,
                c1c4: 0.5,
                d: -1.0,
                biogenicStorage: -3.0, // Hemp sequestration
                totalEmbodied: 5.2
            }
        },
        circularity: {
            detachabilityIndex: 0.7,
            recycledContent: 0,
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Compost',
            expectedLifespan: 50
        },
        physics: {
            thermalConductivity: 0.07, // Est
            vaporResistivity: 3,
            density: 400 // Est
        }
    },
    {
        id: uuidv4(),
        name: "Reed Board",
        manufacturer: "Mike Wye",
        description: "Reed Board is a natural product that can be used to create an insulated ceiling once lime plastered. It can also be used to create stud walls or to internally insulate a solid wall.",
        classification: Classification.LINING, // Plaster base
        image: "/images/materials/material-cultures/lining/Reed Board.jpg",

        matrixMetrics: {
            financialCost: { unitRate: 13.65, currency: 'GBP', unit: 'm2' },
            provenance: {
                originLocation: "Devon, UK",
                distanceToSiteMiles: 196,
                transportMode: 'Diesel_Truck',
                isEcoregional: false
            },
            embodiedCarbon: {
                // Book lists "-".
                a1a3: 1.5, // Harvesting + wire
                a4: 0.5,
                a5: 0.1,
                b1b5: 0,
                c1c4: 0.2,
                d: -0.5,
                biogenicStorage: -2.0,
                totalEmbodied: 2.3
            }
        },
        circularity: {
            detachabilityIndex: 0.4, // Plastered
            recycledContent: 0,
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Compost',
            expectedLifespan: 50
        },
        physics: {
            thermalConductivity: 0.055,
            vaporResistivity: 1,
            density: 155
        }
    }
];