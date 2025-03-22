import { pgTable, text, serial, integer, timestamp, doublePrecision, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  location: text("location"),
  preferences: json("preferences").$type<UserPreferences>().default({}),
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

// Types
export type GeoPoint = {
  lat: number;
  lng: number;
  timestamp: number;
};

export type UserPreferences = {
  notifications: boolean;
  darkMode: boolean;
  voiceFeedback: boolean;
  distanceUnit: "km" | "mi";
  weightUnit: "kg" | "lb";
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

// Type for client-side activity state
export type CurrentActivity = {
  isTracking: boolean;
  isPaused: boolean;
  distance: number;
  duration: number;
  route: GeoPoint[];
  type: "running" | "walking";
  startTime?: number;
  lastUpdate?: number;
};

// Type for statistics
export type ActivityStats = {
  totalDistance: number;
  totalDuration: number;
  totalActivities: number;
  runningDistance: number;
  walkingDistance: number;
  averageRunningPace: number;
  averageWalkingPace: number;
  achievements: Achievement[];
  weeklyActivity: WeeklyActivity[];
};

export type Achievement = {
  type: string;
  title: string;
  description: string;
  date: string;
  icon: string;
};

export type WeeklyActivity = {
  day: string;
  running: number;
  walking: number;
};
