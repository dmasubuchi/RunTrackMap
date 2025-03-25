import { Activity, Achievement } from '../../shared/schema';

/**
 * Generates user achievements based on activity history
 * 
 * @param activities - Array of user activities
 * @returns Array of achievements
 */
export const generateAchievements = (activities: Activity[]): Achievement[] => {
  const achievements: Achievement[] = [];
  
  if (activities.length === 0) {
    return achievements;
  }
  
  // Find longest run
  const longestRun = activities
    .filter(a => a.type === "running")
    .sort((a, b) => b.distance - a.distance)[0];
    
  if (longestRun) {
    achievements.push({
      type: "longest_run",
      title: "Longest Run",
      description: `${longestRun.distance.toFixed(1)}km on ${new Date(longestRun.date).toLocaleDateString()}`,
      date: new Date(longestRun.date).toISOString(),
      icon: "trophy"
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
      description: `${minutes}'${seconds.toString().padStart(2, '0')}"/km on ${new Date(fastestPace.date).toLocaleDateString()}`,
      date: new Date(fastestPace.date).toISOString(),
      icon: "bolt"
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
      description: `${date.toLocaleDateString('en-US', { weekday: 'long' })}, ${date.toLocaleDateString()}`,
      date: date.toISOString(),
      icon: "calendar"
    });
  }
  
  return achievements;
};
