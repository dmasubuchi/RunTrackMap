import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Bell, Moon, Volume2, Ruler, Weight } from "lucide-react";
import { Settings } from "lucide-react";
import { UserPreferences } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

interface UserResponse {
  id: number;
  username: string;
  displayName: string;
  location: string;
  preferences: UserPreferences;
}

interface StatsResponse {
  totalActivities: number;
  totalDistance: number;
  totalDuration: number;
}

const ProfilePage = () => {
  const { toast } = useToast();
  
  const { data: user, isLoading: isLoadingUser } = useQuery<UserResponse>({
    queryKey: ['/api/users/me'],
  });
  
  const { data: stats, isLoading: isLoadingStats } = useQuery<StatsResponse>({
    queryKey: ['/api/stats'],
  });
  
  const updatePreferencesMutation = useMutation({
    mutationFn: (preferences: UserPreferences) => 
      apiRequest('PUT', '/api/users/preferences', preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      toast({
        title: "Preferences updated",
        description: "Your preferences have been saved."
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update preferences",
        variant: "destructive"
      });
    }
  });
  
  const handleToggleChange = (key: keyof UserPreferences, value: boolean) => {
    if (!user?.preferences) return;
    
    const newPreferences = {
      ...user.preferences,
      [key]: value
    };
    
    updatePreferencesMutation.mutate(newPreferences);
  };
  
  const handleSelectChange = (key: keyof UserPreferences, value: string) => {
    if (!user?.preferences) return;
    
    const newPreferences = {
      ...user.preferences,
      [key]: value
    };
    
    updatePreferencesMutation.mutate(newPreferences);
  };
  
  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      
      // Clear all queries
      queryClient.clear();
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      
      // Redirect to login page (would be implemented if we had one)
      // window.location.href = "/login";
    } catch (error) {
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "Failed to log out",
        variant: "destructive"
      });
    }
  };
  
  const isLoading = isLoadingUser || isLoadingStats;
  
  return (
    <div className="h-full pt-4 px-4 pb-20 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5 text-primary" />
        </Button>
      </div>
      
      {isLoading ? (
        <>
          {/* User Info Loading State */}
          <div className="flex items-center mb-6">
            <Skeleton className="w-20 h-20 rounded-full mr-4" />
            <div>
              <Skeleton className="h-7 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          
          {/* Stats Loading State */}
          <Skeleton className="h-24 w-full mb-6" />
          
          {/* Preferences Loading States */}
          <Skeleton className="h-48 w-full mb-6" />
          <Skeleton className="h-32 w-full mb-6" />
        </>
      ) : (
        <>
          {/* User Info */}
          {user && (
            <div className="flex items-center mb-6">
              <Avatar className="w-20 h-20 mr-4">
                <AvatarFallback>{user.displayName.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{user.displayName}</h2>
                <p className="text-muted-foreground">{user.location}</p>
              </div>
            </div>
          )}
          
          {/* Stats Summary */}
          {stats && (
            <Card className="mb-6">
              <CardContent className="grid grid-cols-3 gap-2 p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.totalActivities}</p>
                  <p className="text-xs text-muted-foreground">ACTIVITIES</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{Math.round(stats.totalDistance)}</p>
                  <p className="text-xs text-muted-foreground">KM</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{Math.round(stats.totalDuration / 3600)}</p>
                  <p className="text-xs text-muted-foreground">HOURS</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* User Preferences */}
          {user?.preferences && (
            <>
              <Card className="mb-6">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Preferences</h3>
                  <div className="space-y-3">
                    <ToggleSwitch
                      checked={user.preferences.notifications}
                      onCheckedChange={(checked) => handleToggleChange('notifications', checked)}
                      icon={<Bell className="h-4 w-4" />}
                      label="Notifications"
                    />
                    <ToggleSwitch
                      checked={user.preferences.darkMode}
                      onCheckedChange={(checked) => handleToggleChange('darkMode', checked)}
                      icon={<Moon className="h-4 w-4" />}
                      label="Dark Mode"
                    />
                    <ToggleSwitch
                      checked={user.preferences.voiceFeedback}
                      onCheckedChange={(checked) => handleToggleChange('voiceFeedback', checked)}
                      icon={<Volume2 className="h-4 w-4" />}
                      label="Voice Feedback"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Units</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Ruler className="w-6 h-6 text-muted-foreground mr-2" />
                        <span>Distance</span>
                      </div>
                      <Select
                        value={user.preferences.distanceUnit}
                        onValueChange={(value) => handleSelectChange('distanceUnit', value)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="km">Kilometers (km)</SelectItem>
                          <SelectItem value="mi">Miles (mi)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Weight className="w-6 h-6 text-muted-foreground mr-2" />
                        <span>Weight</span>
                      </div>
                      <Select
                        value={user.preferences.weightUnit}
                        onValueChange={(value) => handleSelectChange('weightUnit', value)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectItem value="lb">Pounds (lb)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          
          {/* Logout Button */}
          <Button
            variant="outline"
            className="w-full py-6 mb-6 font-medium"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
