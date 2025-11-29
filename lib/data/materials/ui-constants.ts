import { Classification } from "@/types/material-passport";

export const CLASSIFICATION_COLORS: Record<string, string> = {
    [Classification.STRUCTURAL_TIMBER]: "#C9E2CE",
    [Classification.MASONRY]: "#C9E2CE",
    [Classification.INSULATION]: "#DBF0EE",
    [Classification.SHEATHING]: "#F9F0DB",
    [Classification.LINING]: "#FCEFF2",
    [Classification.FINISH]: "#DBD9DF",
};

export const DEFAULT_MATERIAL_COLOR = "#F3F2EA";
