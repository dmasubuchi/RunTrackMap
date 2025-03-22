import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertActivitySchema, loginSchema, userPreferencesSchema } from "@shared/schema";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // User routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      if (req.session) {
        req.session.userId = user.id;
      }
      
      res.status(201).json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        location: user.location,
        preferences: user.preferences
      });
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(err).message });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(credentials.username);
      
      if (!user || user.password !== credentials.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (req.session) {
        req.session.userId = user.id;
      }
      
      res.status(200).json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        location: user.location,
        preferences: user.preferences
      });
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(err).message });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Logout failed" });
        }
        res.status(200).json({ message: "Logged out successfully" });
      });
    } else {
      res.status(200).json({ message: "Already logged out" });
    }
  });

  app.get("/api/users/me", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      const user = await storage.getUser(userId as number);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        location: user.location,
        preferences: user.preferences
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/users/preferences", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId as number;
      const preferences = userPreferencesSchema.parse(req.body);
      
      const success = await storage.updateUserPreferences(userId, preferences);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ message: "Preferences updated successfully" });
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(err).message });
      }
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Activity routes
  app.get("/api/activities", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId as number;
      const activities = await storage.getActivities(userId);
      
      res.status(200).json(activities);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId as number;
      const activityData = insertActivitySchema.parse({
        ...req.body,
        userId
      });
      
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(err).message });
      }
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  app.get("/api/activities/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId as number;
      const activityId = parseInt(req.params.id);
      
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      
      const activity = await storage.getActivity(activityId);
      
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      if (activity.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to activity" });
      }
      
      res.status(200).json(activity);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId as number;
      const stats = await storage.getUserStats(userId);
      const weeklyActivity = await storage.getWeeklyActivity(userId);
      
      // Generate achievements based on activities
      const activities = await storage.getActivities(userId);
      const achievements = [];
      
      if (activities.length > 0) {
        // Find longest run
        const longestRun = activities
          .filter(a => a.type === "running")
          .sort((a, b) => b.distance - a.distance)[0];
          
        if (longestRun) {
          achievements.push({
            type: "longest_run",
            title: "Longest Run",
            description: `${longestRun.distance.toFixed(1)}km on ${new Date(longestRun.date).toLocaleDateString()}`
          });
        }
        
        // Find fastest pace
        const fastestPace = activities
          .filter(a => a.type === "running" && a.averagePace && a.averagePace > 0)
          .sort((a, b) => (a.averagePace || 0) - (b.averagePace || 0))[0];
          
        if (fastestPace) {
          const pace = fastestPace.averagePace || 0;
          const minutes = Math.floor(pace / 60);
          const seconds = Math.floor(pace % 60);
          achievements.push({
            type: "fastest_pace",
            title: "Fastest Pace",
            description: `${minutes}'${seconds.toString().padStart(2, '0')}"/km on ${new Date(fastestPace.date).toLocaleDateString()}`
          });
        }
        
        // Find most active day
        const activityByDay = new Map<string, number>();
        activities.forEach(a => {
          const date = new Date(a.date).toLocaleDateString();
          activityByDay.set(date, (activityByDay.get(date) || 0) + a.distance);
        });
        
        let mostActiveDay = "";
        let maxActivity = 0;
        
        activityByDay.forEach((dist, date) => {
          if (dist > maxActivity) {
            maxActivity = dist;
            mostActiveDay = date;
          }
        });
        
        if (mostActiveDay) {
          const date = new Date(mostActiveDay);
          achievements.push({
            type: "most_active_day",
            title: "Most Active Day",
            description: `${date.toLocaleDateString('en-US', { weekday: 'long' })}, ${date.toLocaleDateString()}`
          });
        }
      }
      
      res.status(200).json({
        ...stats,
        weeklyActivity,
        achievements
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
