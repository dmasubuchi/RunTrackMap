import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ChartBar } from "@/components/ui/chart-bar";
import { Medal, Zap, CalendarCheck } from "lucide-react";
import { formatDistance, formatTime, formatPace } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsResponse {
  totalActivities: number;
  totalDistance: number;
  totalDuration: number;
  runningStats: { distance: number; duration: number; avgPace: number };
  walkingStats: { distance: number; duration: number; avgPace: number };
  weeklyActivity: { day: string; running: number; walking: number }[];
  achievements: { type: string; title: string; description: string }[];
}

const StatsPage = () => {
  const { data: stats, isLoading, error } = useQuery<StatsResponse>({
    queryKey: ['/api/stats'],
  });

  // Find the maximum value in the weekly activity data for scaling
  const maxActivity = stats?.weeklyActivity
    ? Math.max(
        ...stats.weeklyActivity.map(
          (day) => Math.max(day.running, day.walking)
        )
      )
    : 0;

  return (
    <div className="h-full pt-4 px-4 pb-20 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">Your Statistics</h1>
      
      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full mb-6" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      )}
      
      {error && (
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          <p>Error loading statistics</p>
          <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      )}
      
      {stats && (
        <>
          {/* Weekly Summary */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">This Week</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">TOTAL DISTANCE</p>
                  <p className="text-2xl font-bold">
                    {formatDistance(stats.totalDistance, false)} <span className="text-sm font-normal">km</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">TOTAL TIME</p>
                  <p className="text-2xl font-bold">
                    {formatTime(stats.totalDuration, true)} <span className="text-sm font-normal">h</span>
                  </p>
                </div>
              </div>
              
              {/* Activity Bar Chart */}
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">DAILY ACTIVITY</p>
                <div className="flex justify-between items-end h-28">
                  {stats.weeklyActivity.map((day, index) => (
                    <div key={index} className="flex flex-col items-center w-1/7">
                      <div className="flex flex-col items-center space-y-1">
                        <ChartBar
                          value={day.running}
                          maxValue={maxActivity}
                          color="bg-primary"
                        />
                        <ChartBar
                          value={day.walking}
                          maxValue={maxActivity}
                          color="bg-green-500 bg-opacity-70"
                        />
                      </div>
                      <p className="text-xs mt-1">{day.day}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-2">
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 rounded-sm bg-primary mr-1"></div>
                    <span className="text-xs">Running</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-sm bg-green-500 bg-opacity-70 mr-1"></div>
                    <span className="text-xs">Walking</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Activity Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center text-primary mb-2">
                  <Medal className="mr-2 h-4 w-4" />
                  <h3 className="font-medium">Running</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">THIS MONTH</p>
                    <p className="font-bold">{formatDistance(stats.runningStats.distance)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">AVG PACE</p>
                    <p className="font-bold">{formatPace(stats.runningStats.avgPace)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center text-green-600 mb-2">
                  <Medal className="mr-2 h-4 w-4" />
                  <h3 className="font-medium">Walking</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">THIS MONTH</p>
                    <p className="font-bold">{formatDistance(stats.walkingStats.distance)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">AVG PACE</p>
                    <p className="font-bold">{formatPace(stats.walkingStats.avgPace)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Achievements */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">Recent Achievements</h2>
              
              {stats.achievements.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Complete activities to earn achievements
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.achievements.map((achievement, index) => {
                    let icon;
                    let bgColor;
                    let textColor;
                    
                    switch (achievement.type) {
                      case "longest_run":
                        icon = <Medal />;
                        bgColor = "bg-primary bg-opacity-10";
                        textColor = "text-primary";
                        break;
                      case "fastest_pace":
                        icon = <Zap />;
                        bgColor = "bg-blue-100";
                        textColor = "text-blue-700";
                        break;
                      case "most_active_day":
                        icon = <CalendarCheck />;
                        bgColor = "bg-green-100";
                        textColor = "text-green-700";
                        break;
                      default:
                        icon = <Medal />;
                        bgColor = "bg-primary bg-opacity-10";
                        textColor = "text-primary";
                    }
                    
                    return (
                      <div key={index} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center ${textColor} mr-3`}>
                          {icon}
                        </div>
                        <div>
                          <p className="font-medium">{achievement.title}</p>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default StatsPage;
