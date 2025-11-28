export enum Classification {
    STRUCTURAL_TIMBER = "STRUCTURAL_TIMBER",
    MASONRY = "MASONRY",
    INSULATION = "INSULATION",
    LINING = "LINING",
    SHEATHING = "SHEATHING",
    FINISH = "FINISH",
    FLOORING = "FLOORING",
}

export interface CarbonBreakdown {
    // Upfront Carbon (A1-A5)
    a1a3: number; // Production (Extraction, Transport to factory, Mfg)
    a4: number; // Transport to Site (The "Distance" metric)
    a5_1?: number; // Pre-construction demolition (Retrofit specific)
    a5: number; // Construction installation process

    // In-Use (B1-B7)
    b1b5: number; // Maintenance, Repair, Replacement over 60 years
    b6?: number; // Operational Energy (optional link to PHPP/SAP)

    // End of Life (C1-C4)
    c1c4: number; // Deconstruction, Transport, Disposal

    // Beyond Lifecycle (D)
    d: number; // Reuse/Recovery potential (Negative values = benefit)

    // Totals
    totalEmbodied: number; // A1-A5 + B1-B5 + C1-C4
    biogenicStorage: number; // Sequestered carbon (Negative value for Straw/Timber)
}

// ------------------------------------------------------------------
// DOMAIN 1: THE MATERIAL PASSPORT (MatR)
// ------------------------------------------------------------------

export interface MaterialPassport {
    id: string;
    name: string;
    manufacturer: string;
    description: string;
    classification: Classification;
    image?: string;

    /**
     * The Material Matrix: Core Decision Framework
     * Based on the 3 axes defined in the Building Skills Report
     */
    matrixMetrics: {
        financialCost: {
            unitRate: number;
            currency: 'GBP';
            unit: 'm3' | 'm2' | 'kg'; // Volume (m3) preferred for insulation comparison
        };
        provenance: {
            originLocation: string;
            distanceToSiteMiles: number; // "Distance" Axis
            transportMode: 'EV_Van' | 'Diesel_Truck' | 'Rail' | 'Canal_Barge' | 'Ocean_Freight'
            isEcoregional: boolean; // True if within West Midlands (~50 mile radius)
        };
        embodiedCarbon: CarbonBreakdown; // "GWP" Axis
    };

    /**
     * Circularity & Health (BAMB / Madaster alignment)
     */
    circularity: {
        detachabilityIndex: number; // 0.0 (Glued) to 1.0 (Dry joint/Bolted)
        recycledContent: number; // Percentage
        materialHealth: 'Red_List_Free' | 'Contains_VOCs';
        endOfLifeStrategy: 'Compost' | 'Reuse_Direct' | 'Recycle' | 'Landfill' | 'Incineration';
        expectedLifespan: number; // Years
    };

    /**
     * Physics 
     */
    physics: {
        thermalConductivity: number; // Lambda (W/mK)
        vaporResistivity: number; // Mu value (Breathability - low is good for IWI)
        density: number; //  kg/m3  (Thermal mass/Decrement delay)
    };
}


// ------------------------------------------------------------------
// ENUMS: CONDITION & STRATEGY
// ------------------------------------------------------------------

export enum ConditionRating {
    EXCELLENT = 1, // Like new, no action required
    GOOD = 2,      // Minor cosmetic wear, standard maintenance
    FAIR = 3,      // Functional, requires repair (e.g., repointing, patch)
    POOR = 4,      // Significant failure, requires major intervention or replacement
    HAZARDOUS = 5  // Asbestos, lead paint, dry rot, structural failure
}

export enum InterventionStrategy {
    RETAIN_PROTECT = "RETAIN_PROTECT",       // Keep in situ
    REPAIR_REFURBISH = "REPAIR_REFURBISH",   // Fix defects in situ
    RECLAIM_ON_SITE = "RECLAIM_ON_SITE",     // Dismantle and re-install elsewhere in project
    RECLAIM_OFF_SITE = "RECLAIM_OFF_SITE",   // Dismantle and sell/donate to external stock
    RECYCLE = "RECYCLE",                     // Process into new material (e.g. woodchip)
    DISPOSAL = "DISPOSAL"                    // Landfill
}

// ------------------------------------------------------------------
// DOMAIN 2: EXISTING STOCK PASSPORT
// ------------------------------------------------------------------

export interface ExistingMaterialPassport {
    id: string;
    name: string;
    description: string;
    classification: Classification;
    image?: string; // Survey photo URL

    /**
     * Audit Data: The physical state of the material found on site.
     * Derived from visual inspection or destructive probes.
     */
    auditData: {
        condition: ConditionRating;
        defects: string[]; // e.g. ["Rising Damp", "Woodworm", "Spalling", "Debonding"]
        approximateAgeYear: number; // e.g., 1900
        isHazardous: boolean; // Triggers H&S protocols
        recommendedStrategy?: InterventionStrategy;
    };

    /**
     * The "Bank" Value: What is this material worth as an asset?
     */
    resourceValue: {
        /**
         * 0.0 to 1.0. The likelihood of retrieving this material intact.
         * e.g., Bricks (lime mortar) = 0.85, Plaster = 0.05
         */
        recoveryPotential: number;

        /**
         * Estimated resale price (£/unit) if reclaimed.
         */
        reclamationValue: number;

        /**
         * kgCO2e saved by keeping this vs buying a standard new equivalent.
         */
        avoidedCarbon: number;
    };

    /**
     * Matrix Metrics: Adapted for Existing Stock
     */
    matrixMetrics: {
        financialCost: {
            sunkCost: true; // Always true. We already own it.
            demolitionCost: number; // Cost to remove (£/unit)
            repairCost: number; // Cost to restore to Condition 1 (£/unit)
            currency: 'GBP';
        };

        provenance: {
            originLocation: "IN_SITU";
            distanceToSiteMiles: 0; // Existing materials travel 0 miles
            transportMode: string; // usually "None" or placeholder
            isEcoregional: true;
        };

        /**
         * Carbon Profile for Existing Stock
         * A1-A3 is historically spent (0).
         * Focus is on Biogenic Storage and End of Life impact.
         */
        embodiedCarbon: CarbonBreakdown;
    };

    /**
     * Circularity Profile
     */
    circularity: {
        detachabilityIndex: number; // Ease of disassembly
        recycledContent: number; // Usually 0 for historic materials
        materialHealth: 'Red_List_Free' | 'Contains_VOCs' | 'Hazardous';
        endOfLifeStrategy: 'Compost' | 'Reuse_Direct' | 'Recycle' | 'Landfill' | 'Incineration';
        expectedLifespan: number; // Remaining years if strategy is RETAIN
    };

    /**
     * Physics: Existing Performance
     * Often derived from CIBSE Guide A for historic materials
     */
    physics: {
        thermalConductivity: number; // Lambda (W/mK)
        vaporResistivity?: number; // Mu value
        density: number; // kg/m3
        moistureContent?: number; // % (measured via probe)
    };
}

export type UnifiedMaterialPassport = MaterialPassport | ExistingMaterialPassport;

export type EnrichedMaterialPassport = UnifiedMaterialPassport & {
    isUsed: boolean;
    volume: number;
    phases: string[];
};