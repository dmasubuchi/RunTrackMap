import { activities, users, type User, type InsertUser, type Activity, type InsertActivity, type UserPreferences } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(userId: number, preferences: UserPreferences): Promise<boolean>;
  
  // Activity operations
  getActivities(userId: number): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getUserStats(userId: number): Promise<{
    totalActivities: number;
    totalDistance: number;
    totalDuration: number;
    runningStats: { distance: number; duration: number; avgPace: number };
    walkingStats: { distance: number; duration: number; avgPace: number };
  }>;
  getWeeklyActivity(userId: number): Promise<{ day: string; running: number; walking: number }[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private activities: Map<number, Activity>;
  private userIdCounter: number;
  private activityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.activities = new Map();
    this.userIdCounter = 1;
    this.activityIdCounter = 1;
    
    // Add a demo user
    this.createUser({
      username: "demo",
      password: "password",
      displayName: "Emily Johnson",
      location: "Tokyo, Japan",
      preferences: {
        notifications: true,
        darkMode: false,
        voiceFeedback: true,
        distanceUnit: "km",
        weightUnit: "kg"
      }
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUserPreferences(userId: number, preferences: UserPreferences): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    user.preferences = preferences;
    this.users.set(userId, user);
    return true;
  }

  // Activity methods
  async getActivities(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const activity: Activity = { 
      ...insertActivity,
      id,
      date: insertActivity.date || new Date()
    };
    
    this.activities.set(id, activity);
    return activity;
  }

  async getUserStats(userId: number): Promise<{
    totalActivities: number;
    totalDistance: number;
    totalDuration: number;
    runningStats: { distance: number; duration: number; avgPace: number };
    walkingStats: { distance: number; duration: number; avgPace: number };
  }> {
    const userActivities = await this.getActivities(userId);
    
    const totalActivities = userActivities.length;
    const totalDistance = userActivities.reduce((sum, act) => sum + act.distance, 0);
    const totalDuration = userActivities.reduce((sum, act) => sum + act.duration, 0);
    
    const runningActivities = userActivities.filter(act => act.type === "running");
    const walkingActivities = userActivities.filter(act => act.type === "walking");
    
    const runningDistance = runningActivities.reduce((sum, act) => sum + act.distance, 0);
    const runningDuration = runningActivities.reduce((sum, act) => sum + act.duration, 0);
    const runningAvgPace = runningDistance > 0 ? runningDuration / runningDistance : 0;
    
    const walkingDistance = walkingActivities.reduce((sum, act) => sum + act.distance, 0);
    const walkingDuration = walkingActivities.reduce((sum, act) => sum + act.duration, 0);
    const walkingAvgPace = walkingDistance > 0 ? walkingDuration / walkingDistance : 0;
    
    return {
      totalActivities,
      totalDistance,
      totalDuration,
      runningStats: {
        distance: runningDistance,
        duration: runningDuration,
        avgPace: runningAvgPace
      },
      walkingStats: {
        distance: walkingDistance,
        duration: walkingDuration,
        avgPace: walkingAvgPace
      }
    };
  }

  async getWeeklyActivity(userId: number): Promise<{ day: string; running: number; walking: number }[]> {
    const userActivities = await this.getActivities(userId);
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    // Initialize daily data
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const weeklyData = days.map((day, index) => ({
      day,
      running: 0,
      walking: 0
    }));
    
    // Fill in activity data
    userActivities.forEach(activity => {
      const actDate = new Date(activity.date);
      if (actDate >= weekStart && actDate <= today) {
        const dayIndex = actDate.getDay();
        if (activity.type === 'running') {
          weeklyData[dayIndex].running += activity.distance;
        } else {
          weeklyData[dayIndex].walking += activity.distance;
        }
      }
    });
    
    return weeklyData;
  }
}

export const storage = new MemStorage();
