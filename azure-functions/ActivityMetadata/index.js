const { CosmosClient } = require('@azure/cosmos');

module.exports = async function (context, req) {
  // Get PlayFab authentication from request headers
  const playfabId = req.headers['x-playfab-id'];
  const sessionTicket = req.headers['x-playfab-session-ticket'];
  
  // Validate authentication
  if (!playfabId || !sessionTicket) {
    context.res = {
      status: 401,
      body: { error: "Authentication required" }
    };
    return;
  }
  
  try {
    // Handle different HTTP methods
    switch (req.method) {
      case 'POST':
        await handleCreate(context, req, playfabId);
        break;
      case 'GET':
        await handleGet(context, req, playfabId);
        break;
      default:
        context.res = {
          status: 405,
          body: { error: "Method not allowed" }
        };
    }
  }
  catch (error) {
    context.log.error(`Error processing request: ${error.message}`);
    context.res = {
      status: 500,
      body: { error: "Internal server error", message: error.message }
    };
  }
};

// Handle creation of activity metadata
async function handleCreate(context, req, playfabId) {
  const { activityId, metadata } = req.body;
  
  if (!activityId || !metadata) {
    context.res = {
      status: 400,
      body: { error: "Missing required fields" }
    };
    return;
  }
  
  // Create the metadata document
  const item = {
    id: `${playfabId}_${activityId}`,
    activityId,
    userId: playfabId,
    metadata,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Store in CosmosDB
  context.bindings.activityMetadataOutput = item;
  
  context.res = {
    status: 201,
    body: { 
      success: true, 
      id: item.id,
      message: "Activity metadata created successfully" 
    }
  };
}

// Handle retrieval of activity metadata
async function handleGet(context, req, playfabId) {
  const activityId = req.query.activityId;
  
  // If activityId is provided, get specific activity metadata
  if (activityId) {
    const documentId = `${playfabId}_${activityId}`;
    
    // Query for the specific document
    const client = new CosmosClient({
      endpoint: process.env.COSMOSDB_ENDPOINT,
      key: process.env.COSMOSDB_KEY
    });
    
    const database = client.database(process.env.COSMOSDB_DATABASE || "RunTrackMap");
    const container = database.container(process.env.COSMOSDB_CONTAINER || "ActivityMetadata");
    
    try {
      const { resource } = await container.item(documentId).read();
      
      if (!resource) {
        context.res = {
          status: 404,
          body: { error: "Activity metadata not found" }
        };
        return;
      }
      
      context.res = {
        status: 200,
        body: resource
      };
    } catch (error) {
      if (error.code === 404) {
        context.res = {
          status: 404,
          body: { error: "Activity metadata not found" }
        };
      } else {
        throw error;
      }
    }
  } 
  // Otherwise, get all activity metadata for the user
  else {
    // Use the input binding to get all activities for this user
    const activities = context.bindings.activityMetadataInput || [];
    
    context.res = {
      status: 200,
      body: activities
    };
  }
}
