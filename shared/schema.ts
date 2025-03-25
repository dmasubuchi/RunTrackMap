import { pgTable, text, serial, integer, timestamp, doublePrecision, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  location: text("location"),
  preferences: json("preferences").$type<UserPreferences>().default({
    notifications: false,
    darkMode: false,
    voiceFeedback: false,
    distanceUnit: "km",
    weightUnit: "kg"
  } as UserPreferences),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type", { enum: ["running", "walking"] }).notNull(),
  title: text("title").notNull(),
  distance: doublePrecision("distance").notNull(), // in kilometers
  duration: integer("duration").notNull(), // in seconds
  date: timestamp("date").notNull().defaultNow(),
  route: json("route").$type<GeoPoint[]>().notNull(),
  averagePace: doublePrecision("average_pace"), // in seconds per kilometer
});

/**
 * Represents a geographic point with latitude, longitude, and timestamp
 * Used for tracking route coordinates during activities
 */
export type GeoPoint = {
  lat: number;      // Latitude coordinate
  lng: number;      // Longitude coordinate
  timestamp: number; // Unix timestamp in milliseconds
};

/**
 * User preferences for application settings
 * Controls display and behavior options for the user interface
 */
export type UserPreferences = {
  notifications: boolean;     // Whether to show notifications
  darkMode: boolean;          // Whether to use dark theme
  voiceFeedback: boolean;     // Whether to provide audio feedback
  distanceUnit: "km" | "mi";  // Unit for displaying distances
  weightUnit: "kg" | "lb";    // Unit for displaying weights
};

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

// Additional schemas for validation
export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

export const userPreferencesSchema = z.object({
  notifications: z.boolean(),
  darkMode: z.boolean(),
  voiceFeedback: z.boolean(),
  distanceUnit: z.enum(["km", "mi"]),
  weightUnit: z.enum(["kg", "lb"]),
});

// Types for insertion and selection
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

/**
 * Represents the current activity being tracked in real-time
 * Used for managing the state of an ongoing activity tracking session
 */
export type CurrentActivity = {
  isTracking: boolean;         // Whether tracking is active
  isPaused: boolean;           // Whether tracking is temporarily paused
  distance: number;            // Current distance in kilometers
  duration: number;            // Current duration in seconds
  route: GeoPoint[];           // Array of GPS coordinates
  type: "running" | "walking"; // Type of activity
  startTime?: number;          // Timestamp when tracking started
  lastUpdate?: number;         // Timestamp of last update
};

/**
 * Aggregated statistics for user activities
 * Used for displaying summary metrics and achievements
 */
export type ActivityStats = {
  totalDistance: number;      // Total distance in kilometers
  totalDuration: number;      // Total duration in seconds
  totalActivities: number;    // Count of all activities
  runningDistance: number;    // Total running distance in kilometers
  walkingDistance: number;    // Total walking distance in kilometers
  averageRunningPace: number; // Average running pace in seconds per kilometer
  averageWalkingPace: number; // Average walking pace in seconds per kilometer
  achievements: Achievement[]; // List of user achievements
  weeklyActivity: WeeklyActivity[]; // Activity data grouped by day of week
};

/**
 * Represents a user achievement based on activity milestones
 * Used for displaying accomplishments in the user interface
 */
export type Achievement = {
  type: string;       // Unique identifier for achievement type
  title: string;      // Display title for the achievement
  description: string; // Detailed description of the achievement
  date: string;       // ISO date string when achievement was earned
  icon: string;       // Icon identifier for visual representation
};

/**
 * Activity data grouped by day of the week
 * Used for displaying weekly activity charts
 */
export type WeeklyActivity = {
  day: string;    // Day of the week (e.g., "Monday", "Tuesday")
  running: number; // Running distance for that day in kilometers
  walking: number; // Walking distance for that day in kilometers
};
