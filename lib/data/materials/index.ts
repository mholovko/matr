import { structuralMaterials } from './material-cultures/structural';
import { insulationMaterials } from './material-cultures/insulation';
import { liningMaterials } from './material-cultures/lining';
import { flooringMaterials } from './material-cultures/flooring';
import { sheathingMaterials } from './material-cultures/sheathing';
import { finishesMaterials } from './material-cultures/finishes';
import { existingMaterials } from './existing/existing';


import { MaterialPassport, ExistingMaterialPassport } from '@/types/material-passport';

/**
 * All materials from material cultures combined
 */
export const allMaterials: MaterialPassport[] = [
    ...structuralMaterials,
    ...insulationMaterials,
    ...liningMaterials,
    ...flooringMaterials,
    ...sheathingMaterials,

    ...finishesMaterials,
];



export const combinedMaterials = [...allMaterials, ...existingMaterials];


// Re-export individual collections for specific use cases
export { structuralMaterials, insulationMaterials, liningMaterials, flooringMaterials, existingMaterials };

