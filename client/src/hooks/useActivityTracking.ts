import { useState, useCallback } from "react";
import { getCurrentActivity, calculateDistance } from "@/lib/utils/activity";
import { CurrentActivity, GeoPoint } from "@shared/schema";

// Initial state for a new activity
const initialActivity: CurrentActivity = {
  isTracking: false,
  isPaused: false,
  distance: 0,
  duration: 0,
  route: [],
  type: "running",
};

export function useActivityTracking() {
  const [currentActivity, setCurrentActivity] = useState<CurrentActivity>(initialActivity);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  
  // Start or resume tracking
  const startTracking = useCallback((point?: GeoPoint) => {
    setCurrentActivity(prev => {
      const now = Date.now();
      
      // If we're not already tracking, start a new activity
      if (!prev.isTracking) {
        const newActivity = {
          ...prev,
          isTracking: true,
          isPaused: false,
          startTime: now,
          lastUpdate: now,
          route: point ? [point] : []
        };
        
        // Start timer to update duration
        const id = window.setInterval(() => {
          setCurrentActivity(current => {
            if (!current.isTracking || current.isPaused) return current;
            
            const currentTime = Date.now();
            const additionalDuration = current.lastUpdate 
              ? Math.floor((currentTime - current.lastUpdate) / 1000)
              : 0;
              
            return {
              ...current,
              duration: current.duration + additionalDuration,
              lastUpdate: currentTime
            };
          });
        }, 1000);
        
        setIntervalId(id);
        return newActivity;
      }
      
      // If we're resuming from paused state
      if (prev.isPaused) {
        return {
          ...prev,
          isPaused: false,
          lastUpdate: now
        };
      }
      
      // If we're already tracking and received a new point
      if (point) {
        const newRoute = [...prev.route, point];
        const newDistance = calculateDistance(newRoute);
        
        return {
          ...prev,
          route: newRoute,
          distance: newDistance
        };
      }
      
      return prev;
    });
  }, []);
  
  // Pause tracking
  const pauseTracking = useCallback(() => {
    setCurrentActivity(prev => ({
      ...prev,
      isPaused: true
    }));
  }, []);
  
  // Stop tracking
  const stopTracking = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    // Keep the current activity data but set tracking to false
    setCurrentActivity(prev => ({
      ...prev,
      isTracking: false,
      isPaused: false
    }));
  }, [intervalId]);
  
  // Reset activity data
  const resetActivity = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    setCurrentActivity(initialActivity);
  }, [intervalId]);
  
  return {
    currentActivity,
    isTracking: currentActivity.isTracking,
    isPaused: currentActivity.isPaused,
    startTracking,
    pauseTracking,
    stopTracking,
    resetActivity
  };
}
