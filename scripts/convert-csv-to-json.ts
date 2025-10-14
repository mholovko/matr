import { readFileSync, writeFileSync } from "fs";
import { parse } from "csv-parse/sync";

interface Material {
  material_id: string;
  name: string;
  category: string;
  subcategory: string;
  density_kg_per_m3: number;
  carbon_data: CarbonData;
  life_cycle_data: LifeCycleData;
}

interface CarbonData {
  a1_a3: number; // kgCO2e/kg
  a4_percent: number; // decimal percentage of A1-A3
  a5_percent: number; // decimal percentage of A1-A3
  c1_c4_percent: number; // decimal percentage of A1-A3
}

interface LifeCycleData {
  service_life_years: number;
  replacements_60yr: number;
  waste_factor: number; // decimal (0.05 = 5%)
}

interface MatRGenericDatabase {
  metadata: {
    library_name: string;
    version: string;
    date_created: string;
    source: string;
    purpose: string;
    units: {
      carbon: string;
      density: string;
      waste_rate: string;
      coefficients: string;
    };
    linking_key: string;
    notes: string;
  };
  materials: Material[];
}

function convertCsvToMatRDatabase(): void {
  try {
    // Read CSV file
    const csvContent = readFileSync("./data/H-BERT.csv", "utf-8");

    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`Found ${records.length} materials to convert`);

    // Convert records to Material objects
    const materials: Material[] = records.map((record: any, index: number) => {
      // Extract category and subcategory from material name
      const materialName = record["Material: Name"];
      const nameParts = materialName.replace("HBA_", "").split(" - ");
      const category = nameParts[0] || "General";
      const subcategory = nameParts[1] || "";

      // Generate material_id by replacing spaces and special characters
      const material_id = `MatR_${materialName
        .replace("HBA_", "")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "")}`;

      // Convert density from ton/m3 to kg/m3
      const densityTonPerM3 =
        parseFloat(record["Material: Density (ton/m3)"]) || 0;
      const density_kg_per_m3 = densityTonPerM3 * 1000;

      // Convert embodied carbon from tonCO2/ton to kgCO2e/kg (1:1 ratio since both numerator and denominator scale equally)
      const embodiedCarbonTonCO2PerTon =
        parseFloat(record["Material: Embodied Carbon (tonCO2/ton)"]) || 0;
      const a1_a3_kgCO2ePerKg = embodiedCarbonTonCO2PerTon; // Direct conversion: tonCO2/ton = kgCO2e/kg

      // Extract waste rate (already in decimal format but listed as %)
      const wasteRatePercent =
        parseFloat(record["Material: Waste rate (%)"]) || 0;
      const waste_factor = wasteRatePercent; // Keep as decimal (0.125 = 12.5%)

      // Extract coefficients (already in decimal format)
      const a4_percent =
        parseFloat(record["Material: Transport coefficient (%)"]) || 0;
      const a5_percent =
        parseFloat(record["Material: Construction coefficient (%)"]) || 0;
      const c1_c4_percent =
        parseFloat(record["Material: End of life coefficient (%)"]) || 0;

      // Extract replacements
      const replacements_60yr =
        parseInt(record["Material: Replacements over 60 years"]) || 0;

      // Calculate service life (60 years divided by replacements + 1)
      const service_life_years =
        replacements_60yr === 0 ? 60 : Math.floor(60 / (replacements_60yr + 1));

      const material: Material = {
        material_id,
        name: materialName,
        category,
        subcategory,
        density_kg_per_m3,
        carbon_data: {
          a1_a3: a1_a3_kgCO2ePerKg,
          a4_percent,
          a5_percent,
          c1_c4_percent,
        },
        life_cycle_data: {
          service_life_years,
          replacements_60yr,
          waste_factor,
        },
      };

      return material;
    });

    // Create the complete database object
    const database: MatRGenericDatabase = {
      metadata: {
        library_name: "Material Registry - Generic Carbon Database",
        version: "1.0",
        date_created: "2025-10-14",
        source: "H/BERT Embodied Carbon Library",
        purpose:
          "Generic coefficient library for early design and PowerBI calculations",
        units: {
          carbon: "kgCO2e/kg",
          density: "kg/m³",
          waste_rate: "decimal (0.05 = 5%)",
          coefficients: "decimal percentage of A1-A3",
        },
        linking_key: "material_id",
        notes:
          "Use material_id to link materials from Revit. All material names prefixed with MatR_ for Material Registry.",
      },
      materials,
    };

    // Write JSON file
    const outputPath = "./data/MatR_GenericDatabase.json";
    writeFileSync(outputPath, JSON.stringify(database, null, 2));

    console.log(`✅ Successfully converted ${materials.length} materials`);
    console.log(`📄 Output written to: ${outputPath}`);
    console.log(`📊 Sample material IDs:`);
    materials.slice(0, 5).forEach((material) => {
      console.log(`   - ${material.material_id}: ${material.name}`);
    });
  } catch (error) {
    console.error("❌ Error converting CSV to JSON:", error);
    process.exit(1);
  }
}

// Run the conversion
convertCsvToMatRDatabase();
