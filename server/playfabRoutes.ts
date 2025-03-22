import { type Express, type Request, type Response } from "express";
import { validateSessionTicket, storeActivityMetadata, getActivityMetadata } from "./playfab";

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        playFabId: string;
        displayName: string;
      };
    }
  }
}

// Middleware to check if user is authenticated with PlayFab
export const requirePlayFabAuth = async (req: Request, res: Response, next: Function) => {
  const sessionTicket = req.headers['x-playfab-session-ticket'] as string;
  
  if (!sessionTicket) {
    return res.status(401).json({ message: "Unauthorized: Missing PlayFab session ticket" });
  }
  
  try {
    // Validate PlayFab session ticket
    const userInfo = await validateSessionTicket(sessionTicket);
    
    // Attach user info to request
    req.user = {
      playFabId: userInfo.PlayFabId,
      displayName: userInfo.TitleInfo?.DisplayName || userInfo.PlayFabId
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: "Unauthorized: Invalid PlayFab session ticket" });
  }
};

// Register PlayFab routes
export function registerPlayFabRoutes(app: Express) {
  // Activity metadata routes
  app.post("/api/playfab/activity-metadata", requirePlayFabAuth, async (req: Request, res: Response) => {
    try {
      const { activityId, metadata } = req.body;
      
      if (!activityId || !metadata) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Store metadata in CosmosDB via Azure Function
      const result = await storeActivityMetadata(req.user!.playFabId, activityId, metadata);
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Error storing activity metadata:', error);
      res.status(500).json({ message: "Failed to store activity metadata" });
    }
  });
  
  app.get("/api/playfab/activity-metadata/:activityId?", requirePlayFabAuth, async (req: Request, res: Response) => {
    try {
      const activityId = req.params.activityId;
      
      // Get metadata from CosmosDB via Azure Function
      const result = await getActivityMetadata(req.user!.playFabId, activityId);
      
      res.json(result);
    } catch (error) {
      console.error('Error getting activity metadata:', error);
      res.status(500).json({ message: "Failed to get activity metadata" });
    }
  });
}
