import { v4 as uuidv4 } from 'uuid';
import { MaterialPassport, Classification } from '@/types/material-passport';

// ------------------------------------------------------------------
// INSULATION MATERIALS (Pages 78-79) https://materialcultures.org/2024-building-skills-report/
// ------------------------------------------------------------------

export const insulationMaterials: MaterialPassport[] = [

  // -- ROW 1 -------------------------------------------------------

  {
    id: "MC_INSU_SisalWool_Sisaltech",
    name: "Sisalwool Batt",
    manufacturer: "Sisaltech",
    description: "Pre-cut batts made from compressed sisal fibres mixed with wool. Suitable for use between rafters, joists, stud walls and in loft spaces, it is renewable and biodegradable and provides excellent thermal and acoustic insulation as well as vapour permeability.",
    classification: Classification.INSULATION,
    image: '/images/materials/material-cultures/insulation/Sisalwool Batt.jpg',

    itemDefinition: {
      name: "Sisalwool Batt",
      unit: "batt",
      dimensions: { length: 1200, width: 570, depth: 50 },
      spacing: 10
    },

    matrixMetrics: {
      financialCost: { unitRate: 188.00, currency: 'GBP', unit: 'm3' },
      provenance: {
        originLocation: "Scotland, UK",
        distanceToSiteMiles: 278,
        transportMode: 'Diesel_Truck',
        isEcoregional: false
      },
      embodiedCarbon: {
        a1a3: 5.0,  // Estimated processing energy
        a4: 0.5,
        a5: 0.1,
        b1b5: 0,
        c1c4: 0.5,
        d: -1.0,
        // Book Net: 0.900 KgCO2eq (Positive). 
        // Likely means the biogenic sequestration was not fully counted or processing is higher.
        biogenicStorage: -4.1,
        totalEmbodied: 6.1 // Gross A-C before Net calc
      }
    },
    circularity: {
      detachabilityIndex: 1.0, // Friction fit
      recycledContent: 50,     // Recycled wool/sisal mix
      materialHealth: 'Red_List_Free',
      endOfLifeStrategy: 'Compost',
      expectedLifespan: 50
    },
    physics: {
      thermalConductivity: 0.036,
      vaporResistivity: 1, // Highly breathable
      density: 35 // Estimated
    }
  },
  {
    id: "MC_INSU_SemiRigidHemp_BioWall",
    name: "Semi Rigid Hemp - Bio Wall",
    manufacturer: "Hemspan",
    description: "Semi-rigid hemp bio walls are insulation panels made from compressed hemp fibres that can be used for internal or external wall insulation. They offer high thermal and acoustic insulation, are renewable, biodegradable, and breathable.",
    classification: Classification.INSULATION,
    image: '/images/materials/material-cultures/insulation/Semi Rigid Hemp - Bio Wall.jpg',
    matrixMetrics: {
      financialCost: { unitRate: 272.00, currency: 'GBP', unit: 'm3' },
      provenance: {
        originLocation: "Czech Republic, EU",
        distanceToSiteMiles: 922,
        transportMode: 'Diesel_Truck',
        isEcoregional: false
      },
      embodiedCarbon: {
        a1a3: 8.0,
        a4: 2.5,   // Long distance transport
        a5: 0.1,
        b1b5: 0,
        c1c4: 1.0,
        d: -2.0,
        biogenicStorage: -12.857, // Resulting in Book Net: -1.257 KgCO2eq
        totalEmbodied: 11.6
      }
    },
    circularity: {
      detachabilityIndex: 0.9,
      recycledContent: 0,
      materialHealth: 'Red_List_Free',
      endOfLifeStrategy: 'Compost',
      expectedLifespan: 60
    },
    physics: {
      thermalConductivity: 0.038,
      vaporResistivity: 2,
      density: 40
    }
  },

  // -- ROW 2 -------------------------------------------------------

  {
    id: "MC_INSU_WoodFibreBatt",
    name: "Wood Fibre Batt",
    manufacturer: "Pavatex",
    description: "Primarily made from waste residual wood and non-sawable thinnings produced in the production of construction grade timber, providing either a rigid or flexible insulation for floors and roofs between studs and rafters. It can be treated with a water repellant for use below a rainscreen cladding.",
    classification: Classification.INSULATION,
    image: '/images/materials/material-cultures/insulation/Wood Fibre Batt.jpg',
    matrixMetrics: {
      financialCost: { unitRate: 807.00, currency: 'GBP', unit: 'm3' }, // High cost per m3
      provenance: {
        originLocation: "Germany, EU",
        distanceToSiteMiles: 807,
        transportMode: 'Diesel_Truck',
        isEcoregional: false
      },
      embodiedCarbon: {
        a1a3: 15.0, // Processing waste wood
        a4: 2.2,
        a5: 0.5,
        b1b5: 0,
        c1c4: 2.0,
        d: -5.0,
        biogenicStorage: -19.673, // Resulting in Book Net: 0.027 KgCO2eq (Positive, near neutral)
        totalEmbodied: 19.7
      }
    },
    circularity: {
      detachabilityIndex: 0.8,
      recycledContent: 95, // Waste wood
      materialHealth: 'Red_List_Free',
      endOfLifeStrategy: 'Incineration', // Biomass fuel
      expectedLifespan: 60
    },
    physics: {
      thermalConductivity: 0.038,
      vaporResistivity: 5,
      density: 160 // Rigid batts are dense
    }
  },
  {
    id: "MC_INSU_ExpandedCorkBoards",
    name: "Expanded Cork Boards",
    manufacturer: "Amorim",
    description: "Cork panels or blocks are the outer bark of cork oak trees to deliver efficient thermal insulation properties. Its distinctive cellular structure, replete with air pockets, confers remarkable acoustic insulation and it naturally resists combustion and acts as a fire retardant. Indigenous to Spain and Portugal.",
    classification: Classification.INSULATION,
    image: '/images/materials/material-cultures/insulation/Expanded Cork Boards.jpg',
    matrixMetrics: {
      financialCost: { unitRate: 573.00, currency: 'GBP', unit: 'm3' },
      provenance: {
        originLocation: "Portugal, EU",
        distanceToSiteMiles: 1360,
        transportMode: 'Diesel_Truck', // Or Ocean freight, assuming Truck based on miles
        isEcoregional: false
      },
      embodiedCarbon: {
        a1a3: 12.0, // Steam expansion process
        a4: 4.5,    // High transport
        a5: 0.5,
        b1b5: 0,
        c1c4: 1.0,
        d: 0,
        biogenicStorage: -19.08, // Resulting in Book Net: -1.080 KgCO2eq
        totalEmbodied: 18.0
      }
    },
    circularity: {
      detachabilityIndex: 0.7, // Often glued
      recycledContent: 0, // Regenerative harvest
      materialHealth: 'Red_List_Free',
      endOfLifeStrategy: 'Recycle', // Granulated for filler
      expectedLifespan: 60
    },
    physics: {
      thermalConductivity: 0.039,
      vaporResistivity: 10,
      density: 120
    }
  },

  // -- ROW 3 -------------------------------------------------------

  {
    id: "MC_INSU_HempBatt_BioFlex",
    name: "Hemp Batt - Bio Flex",
    manufacturer: "Hemspan",
    description: "A pre-cut flexible material made from technical hemp fibres that can be used for internal, thermal or acoustic insulation. Made from organically grown hemp, it is breathable and carbon-negative.",
    classification: Classification.INSULATION,
    image: '/images/materials/material-cultures/insulation/Hemp Batt - Bio Flex.jpg',
    matrixMetrics: {
      financialCost: { unitRate: 145.00, currency: 'GBP', unit: 'm3' },
      provenance: {
        originLocation: "Czech Republic, EU",
        distanceToSiteMiles: 922,
        transportMode: 'Diesel_Truck',
        isEcoregional: false
      },
      embodiedCarbon: {
        a1a3: 6.0,
        a4: 2.5,
        a5: 0.1,
        b1b5: 0,
        c1c4: 0.5,
        d: -1.0,
        biogenicStorage: -9.477, // Resulting in Book Net: -0.377 KgCO2eq
        totalEmbodied: 9.1
      }
    },
    circularity: {
      detachabilityIndex: 1.0, // Flexible friction fit
      recycledContent: 10,     // Binding fibres
      materialHealth: 'Red_List_Free',
      endOfLifeStrategy: 'Compost',
      expectedLifespan: 50
    },
    physics: {
      thermalConductivity: 0.039,
      vaporResistivity: 2,
      density: 35
    }
  },
  {
    id: "MC_INSU_RecycledDenimBatt",
    name: "Recycled Denim Batt",
    manufacturer: "InnoTherm",
    description: "Denim insulation is house insulation made from recycled jeans and can be used in walls, ceilings, floors, attics, and other internal spaces. The processing material results in a finished product made up of 80-85% recycled denim.",
    classification: Classification.INSULATION,
    image: '/images/materials/material-cultures/insulation/Recycled Denim Batt.jpg',
    matrixMetrics: {
      financialCost: { unitRate: 106.50, currency: 'GBP', unit: 'm3' },
      provenance: {
        originLocation: "France, EU",
        distanceToSiteMiles: 355,
        transportMode: 'Diesel_Truck',
        isEcoregional: false
      },
      embodiedCarbon: {
        a1a3: 2.48, // Book Net: 2.480 KgCO2eq (Positive - Processing cotton is energy intensive)
        a4: 0.8,
        a5: 0.1,
        b1b5: 0,
        c1c4: 0.5,
        d: 0,
        biogenicStorage: -0.5, // Small credit for cotton content
        totalEmbodied: 3.88
      }
    },
    circularity: {
      detachabilityIndex: 1.0,
      recycledContent: 85,
      materialHealth: 'Red_List_Free',
      endOfLifeStrategy: 'Recycle',
      expectedLifespan: 50
    },
    physics: {
      thermalConductivity: 0.039,
      vaporResistivity: 2,
      density: 45
    }
  },

  // -- ROW 4 -------------------------------------------------------

  {
    id: "MC_INSU_HempcreteBlocks",
    name: "Hempcrete Blocks",
    manufacturer: "Isohemp",
    description: "Hempcrete blocks are more thermally efficient than concrete blocks. They are non loadbearing, ideally suited to doubling existing walls from the inside or the outside. They help to regulate humidity and internal temperature.",
    classification: Classification.INSULATION, // Acts as insulation but is a block
    image: '/images/materials/material-cultures/insulation/Hempcrete Blocks.jpg',
    matrixMetrics: {
      financialCost: { unitRate: 405.00, currency: 'GBP', unit: 'm3' },
      provenance: {
        originLocation: "Belgium, EU",
        distanceToSiteMiles: 395,
        transportMode: 'Diesel_Truck',
        isEcoregional: false
      },
      embodiedCarbon: {
        a1a3: 5.0,
        a4: 1.0,
        a5: 0.5,
        b1b5: 0,
        c1c4: 0.5,
        d: -2.0,
        biogenicStorage: -7.29, // Resulting in Book Net: -0.290 KgCO2eq
        totalEmbodied: 7.0
      }
    },
    circularity: {
      detachabilityIndex: 1.0, // Lime mortar
      recycledContent: 0,
      materialHealth: 'Red_List_Free',
      endOfLifeStrategy: 'Compost', // Crushed to soil
      expectedLifespan: 100
    },
    physics: {
      thermalConductivity: 0.076, // Higher than batts, but structural
      vaporResistivity: 3,
      density: 350
    }
  },
  {
    id: "MC_INSU_CompressedSheepswoolBatt",
    name: "Compressed Sheepswool Batt",
    manufacturer: "Thermafleece",
    description: "Manufactured by Thermafleece in Yorkshire using British wool, a great proportion of it is sourced from grazing land in Yorkshire, using 75% British Wool and 25% recycled polyester.",
    classification: Classification.INSULATION,
    image: '/images/materials/material-cultures/insulation/Compressed Sheepswool Batt.jpg',
    matrixMetrics: {
      financialCost: { unitRate: 124.00, currency: 'GBP', unit: 'm3' },
      provenance: {
        originLocation: "Leeds, UK",
        distanceToSiteMiles: 115,
        transportMode: 'Diesel_Truck',
        isEcoregional: false // > 50 miles
      },
      embodiedCarbon: {
        a1a3: 1.5,
        a4: 0.3,
        a5: 0.1,
        b1b5: 0,
        c1c4: 0.2,
        d: -0.5,
        biogenicStorage: -2.05, // Resulting in Book Net: 0.050 KgCO2eq (Positive)
        totalEmbodied: 2.1
      }
    },
    circularity: {
      detachabilityIndex: 1.0,
      recycledContent: 25, // Polyester content
      materialHealth: 'Red_List_Free',
      endOfLifeStrategy: 'Recycle', // Polyester separation difficult
      expectedLifespan: 50
    },
    physics: {
      thermalConductivity: 0.039,
      vaporResistivity: 1,
      density: 25
    }
  },

  // -- ROW 5 -------------------------------------------------------

  {
    id: "MC_INSU_WoodFibre_AirInjected",
    name: "Wood Fibre Air injected",
    manufacturer: "Steico",
    description: "Waste wood fibres are dried and combined with a fire retardant and sold loose for application with a high pressure air pump. Air injection of wood fibre insulation can also be used in prefabricated panels.",
    classification: Classification.INSULATION,
    image: '/images/materials/material-cultures/insulation/Wood Fibre Air injected.jpg',
    matrixMetrics: {
      financialCost: { unitRate: 50.00, currency: 'GBP', unit: 'm3' }, // Much cheaper than batts
      provenance: {
        originLocation: "Poland, EU",
        distanceToSiteMiles: 964,
        transportMode: 'Diesel_Truck',
        isEcoregional: false
      },
      embodiedCarbon: {
        // Book Net: 9.630 KgCO2eq. 
        // This is significantly higher than the batt. Likely due to lack of biogenic credit in this specific calculation or high energy blowing agents.
        a1a3: 9.63,
        a4: 2.5,
        a5: 0.5,
        b1b5: 0,
        c1c4: 1.0,
        d: 0,
        biogenicStorage: 0, // Assuming no credit taken in book figure
        totalEmbodied: 13.63
      }
    },
    circularity: {
      detachabilityIndex: 0.3, // Blown in - hard to remove cleanly
      recycledContent: 95,
      materialHealth: 'Red_List_Free',
      endOfLifeStrategy: 'Incineration',
      expectedLifespan: 60
    },
    physics: {
      thermalConductivity: 0.038,
      vaporResistivity: 5,
      density: 45 // Loose fill density
    }
  },
  {
    id: "MC_INSU_Strawbale_Insitu",
    name: "In-situ Strawbale",
    manufacturer: "Local",
    description: "When compacted, straw bales can be used as external wall insulation: they are highly insulative and low in embodied energy. They are commonly paired with a timber structural frame and lime (rendered both internally and externally).",
    classification: Classification.INSULATION,
    image: '/images/materials/material-cultures/insulation/In-situ Strawbale.jpg',
    matrixMetrics: {
      financialCost: { unitRate: 30.00, currency: 'GBP', unit: 'm3' }, // Very cheap
      provenance: {
        originLocation: "Location", // "Local"
        distanceToSiteMiles: 200,   // Book says 200mi - perhaps distance to specific farm?
        transportMode: 'Diesel_Truck',
        isEcoregional: false
      },
      embodiedCarbon: {
        a1a3: 1.0,  // Harvesting energy
        a4: 0.5,
        a5: 0.1,
        b1b5: 0,
        c1c4: 0.5,
        d: -5.0,
        biogenicStorage: -3.258, // Resulting in Book Net: -1.158 KgCO2eq
        totalEmbodied: 2.1
      }
    },
    circularity: {
      detachabilityIndex: 0.6, // Rendered over
      recycledContent: 100, // Ag waste
      materialHealth: 'Red_List_Free',
      endOfLifeStrategy: 'Compost',
      expectedLifespan: 50
    },
    physics: {
      thermalConductivity: 0.052,
      vaporResistivity: 2,
      density: 100
    }
  }
];