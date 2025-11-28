/**
 * Context: 33 Link Road, Ladywood
 */

export type RIBAStage =
    | '0_Strategic' | '1_Preparation' | '2_Concept' | '3_Spatial'
    | '4_Technical' | '5_Construction' | '6_Handover' | '7_Use';

export type StageStatus = 'COMPLETED' | 'ACTIVE' | 'PLANNED' | 'PAUSED' | 'ARCHIVED';
export type InterventionCategory = 'structure' | 'insulation' | 'finishes' | 'windows' | 'systems' | 'roof';

// --- 1. CIRCULARITY & RESILIENCE ---

export interface MaterialLifecycle {
    expectedLifespan: number;       // Years (Design Life)
    maintenanceFreq: number;        // Years (How often does it need repair?)

    // The "End of Life" Strategy
    endOfLifeStrategy: 'Reuse' | 'Reuse_Direct' | 'Recycle' | 'Compost' | 'Landfill' | 'Incineration';

    // 0.0 = Glued/Composite (Impossible to separate)
    // 1.0 = Mechanically fixed/Modular (Easy to disassemble)
    disassemblyFactor: number;

    // Description of the reclamation process (e.g., "Labor intensive mortar chiseling")
    recoveryMethod?: string;
}

// --- 2. ECONOMICS (Financial Payback) ---

export interface EconomicMetrics {
    capex: number;               // Upfront Cost (£)
    annualEnergySaving: number;  // Estimated reduction in bills (£/yr)
    maintenanceCost: number;     // Estimated upkeep (£/yr)
    paybackPeriod: number;       // Years (Calculated: Capex / Savings)
    subsidyAvailable?: boolean;  // e.g., BUS Grant / ECO4
}

// --- 3. CARBON (Carbon Payback) ---

export interface CarbonMetrics {
    embodied: number;            // A1-A3: Production (kgCO2e) positive number
    sequestered: number;         // stored in material (kgCO2e) negative impact
    transport: number;           // A4: Transport to site

    // Operational
    annualCarbonSaving: number;  // kgCO2e saved per year via thermal efficiency

    // Derived Metrics
    carbonPaybackYears: number;  // Years to offset embodied carbon
    netZeroDate: string;         // Projected date the intervention becomes carbon neutral
}

// --- 4. DESIGN OPTIONS ---

export interface DesignOption {
    id: string;
    name: string;
    description: string;
    materiality: 'bio-based' | 'mineral' | 'petrochemical' | 'hybrid';

    // The 3 Pillars of Decision Making
    economics: EconomicMetrics;
    carbon: CarbonMetrics;
    circularity: MaterialLifecycle;

    performance: {
        uValue?: number;
        breathability?: 'vapor-open' | 'vapor-closed';
    };

    pros: string[];
    cons: string[];
}

// --- 5. STAGE STRUCTURES  ---

interface BaseStage {
    stage: RIBAStage;
    status: StageStatus;
    dates: { start: string; end?: string };
    linkedEventIds?: string[];
    notes?: string;
}

interface StrategicStage extends BaseStage {
    stage: '0_Strategic';
    driver?: string;
    baselineData?: {
        issueDetected: string;
        evidenceRef: string;
    };
}

interface ConceptStage extends BaseStage {
    stage: '2_Concept';
    designOptions: DesignOption[]; // NOW USES THE NEW INTERFACE
    decision?: {
        selectedOptionId: string;
        decidedBy: string;
        rationale: string;
        date: string;
    };
}

interface ConstructionStage extends BaseStage {
    stage: '5_Construction';
    contractor: string;
    completionPercentage: number;
}

// ... (Other stages generic for this example)
interface GenericStage extends BaseStage {
    stage: Exclude<RIBAStage, '0_Strategic' | '2_Concept' | '5_Construction'>;
}

export type LifecycleStage = StrategicStage | ConceptStage | GenericStage | ConstructionStage;

// --- 6. MASTER OBJECT ---

export interface AssetLifecycle {
    revitPhaseId: string;
    displayName: string;
    category: InterventionCategory;
    currentStage: RIBAStage;
    history: LifecycleStage[];

    // Viewpoint data
    viewpoint?: {
        camera: { x: number; y: number; z: number };
        target: { x: number; y: number; z: number };
    };
}