import { SpeckleObject, SpeckleElementData } from './types'

export class SpeckleMetadata {
    static extract(obj: SpeckleObject): SpeckleElementData {
        const parameters: Record<string, any> = {}

        // Extract Revit parameters if available
        if (obj.parameters) {
            // Handle both dictionary and array formats if necessary, usually it's an object in Speckle 2.0
            for (const [key, val] of Object.entries(obj.parameters)) {
                parameters[key] = val.value !== undefined ? val.value : val
            }
        }

        // Extract common properties
        const data: SpeckleElementData = {
            id: obj.id,
            speckle_type: obj.speckle_type,
            parameters,
            // Try to find material info
            // This depends on how materials are attached (referenced object or property)
        }

        // Try to find volume
        if (parameters['Volume']) {
            data.volume = parseFloat(parameters['Volume'])
        } else if (obj.volume) {
            data.volume = obj.volume
        }

        // Try to find material
        // Often in obj['@material'] or parameters['Material']
        if (obj['@material']) {
            // It's a reference or object
            // We might need to resolve it, but for now just store ID
            data.materialId = obj['@material'].id || obj['@material']
        }

        return data
    }
}
