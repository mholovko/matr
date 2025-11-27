import { v4 as uuidv4 } from 'uuid';
import { MaterialPassport, Classification } from '@/types/material-passport';

// ------------------------------------------------------------------
// SHEATHING MATERIALS (Page 88) https://materialcultures.org/2024-building-skills-report/
// ------------------------------------------------------------------

export const sheathingMaterials: MaterialPassport[] = [

    // -- ROW 1 -------------------------------------------------------

    {
        id: uuidv4(),
        name: "OSB (Oriented Strand Board)",
        manufacturer: "Kronospan",
        description: "OSB is a timber engineered panel made from wood strands that are bound together in cross-oriented layers with adhesives, heat, and pressure. OSB is similar in strength and performance to plywood.",
        classification: Classification.SHEATHING,
        image: "/images/materials/material-cultures/sheathing/OSB.jpg",
        matrixMetrics: {
            financialCost: { unitRate: 11.90, currency: 'GBP', unit: 'm2' },
            provenance: {
                originLocation: "Wales, UK",
                distanceToSiteMiles: 90,
                transportMode: 'Diesel_Truck',
                isEcoregional: false // > 50 miles
            },
            embodiedCarbon: {
                a1a3: 3.5,  // Production (Resins/Heat)
                a4: 0.15,   // Local transport
                a5: 0.3,    // Installation waste
                b1b5: 0,
                c1c4: 0.5,  // Disposal/Transport
                d: -2.0,    // Potential energy recovery
                // Book Net: -1.430 KgCO2eq. 
                // Biogenic storage must offset production (approx 4.45) to reach -1.430
                biogenicStorage: -5.88,
                totalEmbodied: 4.45 // Gross positive (A-C) excluding storage
            }
        },
        circularity: {
            detachabilityIndex: 0.5, // Nailed/Screwed
            recycledContent: 50,     // Often includes waste timber
            materialHealth: 'Contains_VOCs', // Formaldehyde resins
            endOfLifeStrategy: 'Incineration', // Biomass fuel
            expectedLifespan: 50
        },
        physics: {
            thermalConductivity: 0.13,
            vaporResistivity: 200, // Very high (Vapour Control Layer)
            density: 600
        }
    },
    {
        id: uuidv4(),
        name: "Bitroc Sheathing",
        manufacturer: "Hunton",
        description: "Bitroc is a high-performance sheathing board made from waste materials such as newspaper or sawmill waste and bitumen. It provides weather resistance and vapour permeability, is suitable for external sheathing of timber construction, and meets high standards of thermal efficiency.",
        classification: Classification.SHEATHING,
        image: "/images/materials/material-cultures/sheathing/Bitroc Sheathing.jpg",
        matrixMetrics: {
            financialCost: { unitRate: 12.20, currency: 'GBP', unit: 'm2' },
            provenance: {
                originLocation: "Europe. Norway",
                distanceToSiteMiles: 1272,
                transportMode: 'Ocean_Freight', // Inferred from Norway
                isEcoregional: false
            },
            embodiedCarbon: {
                a1a3: 2.8,  // Recycling process + Bitumen
                a4: 1.2,    // High transport (Norway)
                a5: 0.2,
                b1b5: 0,
                c1c4: 0.4,
                d: -1.5,
                // Book Net: -1.340 KgCO2eq. 
                // Gross A-C approx 4.6. Storage needs to be ~ -5.94
                biogenicStorage: -5.94,
                totalEmbodied: 4.6
            }
        },
        circularity: {
            detachabilityIndex: 0.6, // Nailed
            recycledContent: 80,     // Newspaper/Sawmill waste
            materialHealth: 'Contains_VOCs', // Bitumen content
            endOfLifeStrategy: 'Incineration',
            expectedLifespan: 60
        },
        physics: {
            thermalConductivity: 0.05, // Insulating sheathing
            vaporResistivity: 10,      // Permeable (breather membrane alternate)
            density: 250
        }
    },

    // -- ROW 2 -------------------------------------------------------

    {
        id: uuidv4(),
        name: "Insulating Sheathing Board",
        manufacturer: "Steico",
        description: "Wood fibre sheathing is external panelling produced from waste wood fibres, either through a wet process involving the compression of soaked fibres into boards that are then air dried, or through a dry process whereby the fibres are impregnated with synthetic binding agents such as polyurethane resin and compressed.",
        classification: Classification.SHEATHING,
        image: "/images/materials/material-cultures/sheathing/Insulating Sheathing Board.jpg",
        matrixMetrics: {
            financialCost: { unitRate: 10.10, currency: 'GBP', unit: 'm2' },
            provenance: {
                originLocation: "Poland, EU",
                distanceToSiteMiles: 965,
                transportMode: 'Diesel_Truck',
                isEcoregional: false
            },
            embodiedCarbon: {
                a1a3: 4.0,  // Process energy
                a4: 1.5,    // Poland transport
                a5: 0.3,
                b1b5: 0,
                c1c4: 0.5,
                d: -2.5,
                // Book Net: -0.613 KgCO2eq.
                // Gross A-C approx 6.3. Storage needs to be ~ -6.913
                biogenicStorage: -6.913,
                totalEmbodied: 6.3
            }
        },
        circularity: {
            detachabilityIndex: 0.7,
            recycledContent: 95, // Waste wood
            materialHealth: 'Red_List_Free', // If wet process used (assumed for higher quality)
            endOfLifeStrategy: 'Compost', // If wet process; Incineration if dry (PU)
            expectedLifespan: 60
        },
        physics: {
            thermalConductivity: 0.048,
            vaporResistivity: 5, // Highly breathable
            density: 270
        }
    }
];