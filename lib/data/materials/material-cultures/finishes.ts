import { v4 as uuidv4 } from 'uuid';
import { MaterialPassport, Classification } from '@/types/material-passport';

// ------------------------------------------------------------------
// FINISHES MATERIALS (Page 90) https://materialcultures.org/2024-building-skills-report/
// ------------------------------------------------------------------

export const finishesMaterials: MaterialPassport[] = [

    // -- ROW 1 -------------------------------------------------------

    {
        id: uuidv4(),
        name: "Clay Plaster",
        manufacturer: "Clayworks",
        description: "This ancient vernacular material is normally obtained from a mixture of sand, clay and straw or other fibres and can be used in interior or exterior walls and ceilings. It is breathable and non-toxic and can be mixed with pigments or lime washes to produce a variety of hues. Clay plasters absorb air toxins as well as odours and sounds.",
        classification: Classification.FINISH,
        image: '/images/materials/material-cultures/finishes/Clay Plaster.jpg',
        matrixMetrics: {
            financialCost: { unitRate: 25.00, currency: 'GBP', unit: 'm2' }, // Assumed coverage rate
            provenance: {
                originLocation: "Cornwall, UK",
                distanceToSiteMiles: 240,
                transportMode: 'Diesel_Truck',
                isEcoregional: false
            },
            embodiedCarbon: {
                a1a3: 0.05,  // Very low energy (unfired)
                a4: 0.08,    // 240mi transport
                a5: 0.006,
                b1b5: 0,
                c1c4: 0.01,
                d: 0,
                biogenicStorage: 0, // Straw content negligible for storage calc in thin layer
                totalEmbodied: 0.136 // Book Net: 0.136 KgCO2eq
            }
        },
        circularity: {
            detachabilityIndex: 0.1, // Adhered to substrate
            recycledContent: 0,
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Reuse_Direct', // Can be wetted and reused
            expectedLifespan: 100
        },
        physics: {
            thermalConductivity: 0.85, // Standard clay plaster
            vaporResistivity: 8,       // Breathable
            density: 1600
        }
    },

    // -- ROW 2 -------------------------------------------------------

    {
        id: uuidv4(),
        name: "Lime Plaster",
        manufacturer: "Lime Green",
        description: "A mixture of lime, sand and water that is used to finish and strengthen interior and exterior walls and ceilings, lime plaster is used to provide thermal and acoustic insulation and water resistance. It is flexible, breathable and ensures good air quality and humidity regulation. It is highly adhesive and can be applied to a variety of substrates.",
        classification: Classification.FINISH,
        image: '/images/materials/material-cultures/finishes/Lime Plaster.jpg',
        matrixMetrics: {
            financialCost: { unitRate: 17.08, currency: 'GBP', unit: 'm2' },
            provenance: {
                originLocation: "West Midlands, UK",
                distanceToSiteMiles: 47,
                transportMode: 'EV_Van',
                isEcoregional: true // < 50 miles
            },
            embodiedCarbon: {
                a1a3: 0.20,  // Lime cycle (kiln fired)
                a4: 0.01,    // Local transport
                a5: 0.01,
                b1b5: 0,
                c1c4: 0.003,
                d: 0,
                biogenicStorage: 0, // Lime re-absorbs CO2 (carbonation) during B1, but A1-A3 is positive
                totalEmbodied: 0.223 // Book Net: 0.223 KgCO2eq
            }
        },
        circularity: {
            detachabilityIndex: 0.1,
            recycledContent: 0,
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Recycle', // Crushed as aggregate
            expectedLifespan: 100
        },
        physics: {
            thermalConductivity: 0.8,
            vaporResistivity: 10,
            density: 1700
        }
    },
    {
        id: uuidv4(),
        name: "Clay Paint",
        manufacturer: "Earthborn",
        description: "Clay paint is a matt, water-based, breathable, non-toxic alternative to synthetic coatings, made from clay and other minerals. It preserves the breathable properties of bio-based construction materials and helps regulate indoor humidity.",
        classification: Classification.FINISH,
        image: '/images/materials/material-cultures/finishes/Clay Paint.jpg',
        matrixMetrics: {
            financialCost: { unitRate: 9.80, currency: 'GBP', unit: 'kg' }, // Liter/Kg pricing typical for paint
            provenance: {
                originLocation: "Germany, EU",
                distanceToSiteMiles: 807,
                transportMode: 'Diesel_Truck',
                isEcoregional: false
            },
            embodiedCarbon: {
                // Book lists "-". Estimated based on transport and processing.
                a1a3: 0.4, // Mixing/Pigments
                a4: 0.2,   // High transport from Germany
                a5: 0.0,
                b1b5: 0.1, // Re-coat required eventually
                c1c4: 0.0,
                d: 0,
                biogenicStorage: 0,
                totalEmbodied: 0.7 // Estimated Net
            }
        },
        circularity: {
            detachabilityIndex: 0.0, // Cannot be removed
            recycledContent: 0,
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Compost', // Biodegradable on substrate
            expectedLifespan: 10 // Maintenance cycle
        },
        physics: {
            thermalConductivity: 0.5,
            vaporResistivity: 2, // Highly breathable
            density: 1200 // Wet density
        }
    },

    // -- ROW 3 -------------------------------------------------------

    {
        id: uuidv4(),
        name: "Breathaplasta",
        manufacturer: "Adaptavate",
        description: "Adaptavate Lime Plaster is a fast-setting lime plaster suitable for applications on most substrates. It can be used as both base and top coat. Like other lime-based plasters, it is breathable and regulates indoor humidity.",
        classification: Classification.FINISH,
        image: '/images/materials/material-cultures/finishes/Breathaplasta.jpg',
        matrixMetrics: {
            financialCost: { unitRate: 13.05, currency: 'GBP', unit: 'm2' },
            provenance: {
                originLocation: "Cornwall, UK",
                distanceToSiteMiles: 240,
                transportMode: 'Diesel_Truck',
                isEcoregional: false
            },
            embodiedCarbon: {
                // Book lists "-". 
                // Product contains bio-material (hemp shiv/fibers) which lowers the carbon compared to pure lime.
                a1a3: 0.25, // Lime binder
                a4: 0.08,
                a5: 0.01,
                b1b5: 0,
                c1c4: 0.01,
                d: 0,
                biogenicStorage: -0.15, // Bio-filler credit
                totalEmbodied: 0.20 // Net Estimate
            }
        },
        circularity: {
            detachabilityIndex: 0.1,
            recycledContent: 20, // Bio-fillers
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Compost', // If lime is hydrated and crushed
            expectedLifespan: 60
        },
        physics: {
            thermalConductivity: 0.27, // Insulating plaster
            vaporResistivity: 6,
            density: 900
        }
    },
    {
        id: uuidv4(),
        name: "Lime Hemp Plaster",
        manufacturer: "Ty-mawr",
        description: "Lime Hemp Plaster is made from a high-calcium lime mixed with hemp fibres. The addition of hemp gives it a better thermal performance than normal lime plaster. Lime hemp plaster can be applied in thicker coats, making it easier and quicker to use. It is extremely flexible and breathable.",
        classification: Classification.FINISH,
        image: '/images/materials/material-cultures/finishes/Lime Hemp Plaster.jpg',
        matrixMetrics: {
            financialCost: { unitRate: 8.36, currency: 'GBP', unit: 'm2' },
            provenance: {
                originLocation: "Wales, UK",
                distanceToSiteMiles: 93,
                transportMode: 'Diesel_Truck',
                isEcoregional: false
            },
            embodiedCarbon: {
                // Book lists "-".
                a1a3: 0.3, // Lime content
                a4: 0.03,
                a5: 0.01,
                b1b5: 0,
                c1c4: 0.01,
                d: -0.05,
                biogenicStorage: -0.2, // Hemp content
                totalEmbodied: 0.15 // Net Estimate
            }
        },
        circularity: {
            detachabilityIndex: 0.1,
            recycledContent: 0,
            materialHealth: 'Red_List_Free',
            endOfLifeStrategy: 'Compost',
            expectedLifespan: 60
        },
        physics: {
            thermalConductivity: 0.14, // Good insulator
            vaporResistivity: 5,
            density: 750
        }
    }
];