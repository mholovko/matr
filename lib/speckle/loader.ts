import ObjectLoader from '@speckle/objectloader'

const API_URL = 'https://app.speckle.systems/graphql'

/**
 * Step 1: Resolve the Model ID (Branch) to the latest Commit's Object ID
 */
async function getObjectIdFromModel(projectId: string, modelId: string, token?: string) {
    // GraphQL query to get the latest version from a specific model
    const query = `
    query Project($projectId: String!, $modelId: String!) {
      project(id: $projectId) {
        model(id: $modelId) {
          versions(limit: 1) {
            items {
              referencedObject
              id
            }
          }
        }
      }
    }
  `

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
            query,
            variables: { projectId, modelId }
        })
    })

    const json = await response.json()

    // Safety checks
    if (json.errors) throw new Error(json.errors[0].message)
    const model = json.data?.project?.model

    if (!model) throw new Error("Model not found. Check your Project ID and Model ID.")
    if (model.versions.items.length === 0) throw new Error("This model has no versions uploaded yet.")

    // Return the actual Geometry Hash (referencedObject)
    return model.versions.items[0].referencedObject
}

/**
 * Step 2: Load the Geometry
 */
export async function fetchSpeckleData(
    projectId: string,
    identifier: string, // Can be Object ID or Model ID
    token?: string
) {
    let objectId = identifier

    // Minimal heuristic: Model IDs are short (10 chars), Object IDs are long hashes (32+ chars)
    // If it looks short, we assume it's a Model ID and resolve it first.
    if (identifier.length < 20) {
        objectId = await getObjectIdFromModel(projectId, identifier, token)
    }

    const loader = new ObjectLoader({
        serverUrl: 'https://app.speckle.systems',
        streamId: projectId,
        objectId: objectId,
        options: { enableCaching: true, excludeProps: [] },
        token: token
    })

    // Fetch!
    const rootObject = await loader.getAndConstructObject(() => {
        // Progress handler (optional)
    })

    return rootObject
}