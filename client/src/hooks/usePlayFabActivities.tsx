import { useState } from 'react';
import { PlayFabClient, PlayFabError, PlayFabResult } from '../lib/playfab';
import { usePlayFabAuth } from './usePlayFabAuth';

// Define activity types based on the existing schema
interface GeoPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

interface Activity {
  id: string;
  userId: string;
  type: 'running' | 'walking';
  title: string;
  distance: number;
  duration: number;
  date: string;
  route: GeoPoint[];
  averagePace: number;
}

interface ActivityStats {
  totalActivities: number;
  totalDistance: number;
  totalDuration: number;
  runningStats: {
    count: number;
    distance: number;
    duration: number;
    averagePace: number;
  };
  walkingStats: {
    count: number;
    distance: number;
    duration: number;
    averagePace: number;
  };
}

export function usePlayFabActivities() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = usePlayFabAuth();

  // Get all activities for the current user
  const getActivities = async (): Promise<Activity[]> => {
    if (!user) {
      throw new Error('User must be authenticated to get activities');
    }

    setIsLoading(true);
    setError(null);
    
    return new Promise<Activity[]>((resolve, reject) => {
      PlayFabClient.GetUserData({
        Keys: ['activities']
      }, (error: PlayFabError | null, result: PlayFabResult<any> | null) => {
        setIsLoading(false);
        
        if (error) {
          setError(error.errorMessage);
          reject(error);
          return;
        }
        
        if (result && result.data && result.data.Data && result.data.Data.activities) {
          try {
            const activities = JSON.parse(result.data.Data.activities.Value) as Activity[];
            resolve(activities);
          } catch (e) {
            setError('Failed to parse activities data');
            reject(new Error('Failed to parse activities data'));
          }
        } else {
          // No activities found, return empty array
          resolve([]);
        }
      });
    });
  };
  
  // Create a new activity
  const createActivity = async (activityData: Omit<Activity, 'id' | 'userId'>): Promise<Activity> => {
    if (!user) {
      throw new Error('User must be authenticated to create an activity');
    }

    setIsLoading(true);
    setError(null);
    
    // First get existing activities
    try {
      const existingActivities = await getActivities();
      
      // Create new activity with ID and userId
      const newActivity: Activity = {
        ...activityData,
        id: `activity_${Date.now()}`,
        userId: user.id
      };
      
      // Add to existing activities
      const updatedActivities = [...existingActivities, newActivity];
      
      // Save updated activities
      return new Promise<Activity>((resolve, reject) => {
        PlayFabClient.UpdateUserData({
          Data: {
            activities: JSON.stringify(updatedActivities)
          }
        }, (error: PlayFabError | null, result: PlayFabResult<any> | null) => {
          setIsLoading(false);
          
          if (error) {
            setError(error.errorMessage);
            reject(error);
            return;
          }
          
          // Update statistics
          updateActivityStatistics(newActivity);
          
          resolve(newActivity);
        });
      });
    } catch (error) {
      setIsLoading(false);
      setError('Failed to create activity');
      throw error;
    }
  };
  
  // Update activity statistics
  const updateActivityStatistics = async (activity: Activity) => {
    try {
      // Get current statistics
      const stats = await getActivityStats();
      
      // Update statistics based on new activity
      const updatedStats: ActivityStats = {
        totalActivities: stats.totalActivities + 1,
        totalDistance: stats.totalDistance + activity.distance,
        totalDuration: stats.totalDuration + activity.duration,
        runningStats: {
          ...stats.runningStats,
          count: activity.type === 'running' ? stats.runningStats.count + 1 : stats.runningStats.count,
          distance: activity.type === 'running' ? stats.runningStats.distance + activity.distance : stats.runningStats.distance,
          duration: activity.type === 'running' ? stats.runningStats.duration + activity.duration : stats.runningStats.duration,
          averagePace: activity.type === 'running' ? 
            (stats.runningStats.duration + activity.duration) / (stats.runningStats.distance + activity.distance) : 
            stats.runningStats.averagePace
        },
        walkingStats: {
          ...stats.walkingStats,
          count: activity.type === 'walking' ? stats.walkingStats.count + 1 : stats.walkingStats.count,
          distance: activity.type === 'walking' ? stats.walkingStats.distance + activity.distance : stats.walkingStats.distance,
          duration: activity.type === 'walking' ? stats.walkingStats.duration + activity.duration : stats.walkingStats.duration,
          averagePace: activity.type === 'walking' ? 
            (stats.walkingStats.duration + activity.duration) / (stats.walkingStats.distance + activity.distance) : 
            stats.walkingStats.averagePace
        }
      };
      
      // Save updated statistics
      PlayFabClient.UpdateUserData({
        Data: {
          activityStats: JSON.stringify(updatedStats)
        }
      }, (error: PlayFabError | null) => {
        if (error) {
          console.error('Failed to update activity statistics:', error);
        }
      });
      
      // Update player statistics for achievements
      PlayFabClient.UpdatePlayerStatistics({
        Statistics: [
          {
            StatisticName: 'TotalActivities',
            Value: updatedStats.totalActivities
          },
          {
            StatisticName: 'TotalDistance',
            Value: Math.floor(updatedStats.totalDistance)
          },
          {
            StatisticName: 'TotalDuration',
            Value: Math.floor(updatedStats.totalDuration)
          }
        ]
      }, (error: PlayFabError | null) => {
        if (error) {
          console.error('Failed to update player statistics:', error);
        }
      });
    } catch (error) {
      console.error('Error updating activity statistics:', error);
    }
  };
  
  // Get activity statistics
  const getActivityStats = async (): Promise<ActivityStats> => {
    if (!user) {
      throw new Error('User must be authenticated to get activity statistics');
    }

    return new Promise<ActivityStats>((resolve, reject) => {
      PlayFabClient.GetUserData({
        Keys: ['activityStats']
      }, (error: PlayFabError | null, result: PlayFabResult<any> | null) => {
        if (error) {
          reject(error);
          return;
        }
        
        if (result && result.data && result.data.Data && result.data.Data.activityStats) {
          try {
            const stats = JSON.parse(result.data.Data.activityStats.Value) as ActivityStats;
            resolve(stats);
          } catch (e) {
            reject(new Error('Failed to parse activity statistics'));
          }
        } else {
          // No statistics found, return default values
          resolve({
            totalActivities: 0,
            totalDistance: 0,
            totalDuration: 0,
            runningStats: {
              count: 0,
              distance: 0,
              duration: 0,
              averagePace: 0
            },
            walkingStats: {
              count: 0,
              distance: 0,
              duration: 0,
              averagePace: 0
            }
          });
        }
      });
    });
  };
  
  // Delete an activity
  const deleteActivity = async (activityId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to delete an activity');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const activities = await getActivities();
      const activityToDelete = activities.find(a => a.id === activityId);
      
      if (!activityToDelete) {
        throw new Error('Activity not found');
      }
      
      const updatedActivities = activities.filter(a => a.id !== activityId);
      
      return new Promise<void>((resolve, reject) => {
        PlayFabClient.UpdateUserData({
          Data: {
            activities: JSON.stringify(updatedActivities)
          }
        }, (error: PlayFabError | null) => {
          setIsLoading(false);
          
          if (error) {
            setError(error.errorMessage);
            reject(error);
            return;
          }
          
          resolve();
        });
      });
    } catch (error) {
      setIsLoading(false);
      setError('Failed to delete activity');
      throw error;
    }
  };
  
  // Get weekly activity data
  const getWeeklyActivityData = async (): Promise<Record<string, number>> => {
    try {
      const activities = await getActivities();
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Filter activities from the last week
      const recentActivities = activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= oneWeekAgo && activityDate <= now;
      });
      
      // Group by day of week
      const dayMap: Record<string, number> = {
        'Sunday': 0,
        'Monday': 0,
        'Tuesday': 0,
        'Wednesday': 0,
        'Thursday': 0,
        'Friday': 0,
        'Saturday': 0
      };
      
      recentActivities.forEach(activity => {
        const date = new Date(activity.date);
        const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
        dayMap[day] += activity.distance;
      });
      
      return dayMap;
    } catch (error) {
      console.error('Error getting weekly activity data:', error);
      return {
        'Sunday': 0,
        'Monday': 0,
        'Tuesday': 0,
        'Wednesday': 0,
        'Thursday': 0,
        'Friday': 0,
        'Saturday': 0
      };
    }
  };
  
  return {
    getActivities,
    createActivity,
    deleteActivity,
    getActivityStats,
    getWeeklyActivityData,
    isLoading,
    error
  };
}
