import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertActivitySchema, loginSchema, userPreferencesSchema } from "@shared/schema";
import { z } from "zod";
import session from 'express-session';
import { handleApiError } from './utils/errorHandler';
import { hashPassword, comparePasswords } from './utils/auth';
import { setupCsrf, validateCsrf } from './middleware/csrf';
import { generateAchievements } from './utils/achievements';

// Extend the session interface to include userId
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

/**
 * Registers all API routes for the application
 * 
 * @param app - Express application instance
 * @returns Promise resolving to HTTP server instance
 */
export async function registerRoutes(app: Express): Promise<Server> {
  /**
   * Authentication middleware
   * Verifies that the user is logged in before allowing access to protected routes
   * 
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // User routes
  // Apply CSRF middleware to all routes
  app.use(setupCsrf);
  app.use(validateCsrf);

  /**
   * Register a new user
   * 
   * @route POST /api/auth/register
   * @param {Object} req.body - User registration data
   * @returns {Object} User object with session
   * @throws {400} If username already exists or validation fails
   */
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash the password before storing
      const hashedPassword = await hashPassword(userData.password);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
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
      handleApiError(err, res, "Failed to create user");
    }
  });

  /**
   * Authenticate a user and create a session
   * 
   * @route POST /api/auth/login
   * @param {Object} req.body - User login credentials
   * @returns {Object} User object with session
   * @throws {401} If credentials are invalid
   */
  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(credentials.username);
      
      if (!user || !(await comparePasswords(credentials.password, user.password))) {
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
      handleApiError(err, res, "Login failed");
    }
  });

  /**
   * End user session and log out
   * 
   * @route POST /api/auth/logout
   * @returns {Object} Success message
   */
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

  /**
   * Get current authenticated user profile
   * 
   * @route GET /api/users/me
   * @returns {Object} User profile data
   * @throws {404} If user not found
   */
  app.get("/api/users/me", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (typeof userId !== 'number') {
        return res.status(400).json({ message: "Invalid user session" });
      }
      
      const user = await storage.getUser(userId);
      
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

  /**
   * Update user preferences
   * 
   * @route PUT /api/users/preferences
   * @param {Object} req.body - User preference settings
   * @returns {Object} Success message
   * @throws {404} If user not found
   */
  app.put("/api/users/preferences", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (typeof userId !== 'number') {
        return res.status(400).json({ message: "Invalid user session" });
      }
      
      const preferences = userPreferencesSchema.parse(req.body);
      
      const success = await storage.updateUserPreferences(userId, preferences);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ message: "Preferences updated successfully" });
    } catch (err) {
      handleApiError(err, res, "Failed to update preferences");
    }
  });

  // Activity routes
  /**
   * Get all activities for the current user
   * 
   * @route GET /api/activities
   * @returns {Array<Activity>} List of user activities
   */
  app.get("/api/activities", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (typeof userId !== 'number') {
        return res.status(400).json({ message: "Invalid user session" });
      }
      
      const activities = await storage.getActivities(userId);
      
      res.status(200).json(activities);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  /**
   * Create a new activity
   * 
   * @route POST /api/activities
   * @param {Object} req.body - Activity data
   * @returns {Activity} Created activity object
   */
  app.post("/api/activities", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (typeof userId !== 'number') {
        return res.status(400).json({ message: "Invalid user session" });
      }
      
      const activityData = insertActivitySchema.parse({
        ...req.body,
        userId
      });
      
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (err) {
      handleApiError(err, res, "Failed to create activity");
    }
  });

  /**
   * Get a specific activity by ID
   * 
   * @route GET /api/activities/:id
   * @param {string} req.params.id - Activity ID
   * @returns {Activity} Activity object
   * @throws {404} If activity not found
   * @throws {403} If user doesn't own the activity
   */
  app.get("/api/activities/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (typeof userId !== 'number') {
        return res.status(400).json({ message: "Invalid user session" });
      }
      
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

  /**
   * Get user statistics and achievements
   * 
   * @route GET /api/stats
   * @returns {Object} User statistics, achievements, and weekly activity data
   */
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (typeof userId !== 'number') {
        return res.status(400).json({ message: "Invalid user session" });
      }
      
      const stats = await storage.getUserStats(userId);
      const weeklyActivity = await storage.getWeeklyActivity(userId);
      
      // Generate achievements using utility function
      const activities = await storage.getActivities(userId);
      const achievements = generateAchievements(activities);
      
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
