import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import RouteMap from "@/components/RouteMap";
import ActivityTracker from "@/components/ActivityTracker";
import ActivityStatsOverlay from "@/components/ActivityStatsOverlay";
import { useActivityTracking } from "@/hooks/useActivityTracking";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const saveSchema = z.object({
  title: z.string().min(1, "Please provide a title"),
  type: z.enum(["running", "walking"])
});

type SaveFormData = z.infer<typeof saveSchema>;

const HomePage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { position, error: locationError } = useGeolocation();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  
  const {
    startTracking,
    pauseTracking,
    stopTracking,
    currentActivity,
    isTracking,
    isPaused
  } = useActivityTracking();
  
  const form = useForm<SaveFormData>({
    resolver: zodResolver(saveSchema),
    defaultValues: {
      title: "",
      type: "running"
    }
  });
  
  // Start tracking when we get a position fix
  useEffect(() => {
    if (locationError) {
      toast({
        title: "Location Error",
        description: locationError.message,
        variant: "destructive"
      });
    }
  }, [locationError, toast]);
  
  // Add location to route when tracking
  useEffect(() => {
    if (isTracking && !isPaused && position) {
      const now = Date.now();
      const point = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        timestamp: now
      };
      
      // Add the point to the route
      // This will update the distance calculation too
      startTracking(point);
    }
  }, [position, isTracking, isPaused, startTracking]);
  
  // Calculate pace (seconds per km)
  const pace = currentActivity.distance > 0
    ? currentActivity.duration / currentActivity.distance
    : 0;
  
  const handleStop = () => {
    stopTracking();
    setSaveDialogOpen(true);
  };
  
  const handleSave = async (data: SaveFormData) => {
    try {
      if (currentActivity.route.length < 2) {
        toast({
          title: "Cannot save activity",
          description: "Not enough tracking data to save the activity.",
          variant: "destructive"
        });
        return;
      }
      
      // Prepare activity data
      const activity = {
        type: data.type,
        title: data.title,
        distance: currentActivity.distance,
        duration: currentActivity.duration,
        route: currentActivity.route,
        averagePace: pace
      };
      
      await apiRequest('POST', '/api/activities', activity);
      
      // Invalidate queries to refresh the activities list
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Activity saved",
        description: "Your activity has been saved successfully!",
      });
      
      // Close dialog and reset form
      setSaveDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save activity",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="relative h-full">
      {/* Map View */}
      <div className="h-[calc(100vh-4rem)]">
        <RouteMap 
          route={currentActivity.route}
          currentPosition={position ? {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: Date.now()
          } : undefined}
          isTracking={isTracking && !isPaused}
        />
        
        {/* Activity Stats Overlay */}
        <ActivityStatsOverlay 
          distance={currentActivity.distance}
          duration={currentActivity.duration}
          pace={pace}
        />
        
        {/* Activity Tracker Controls */}
        <ActivityTracker
          isTracking={isTracking}
          isPaused={isPaused}
          onStart={() => startTracking()}
          onPause={pauseTracking}
          onStop={handleStop}
        />
      </div>
      
      {/* Save Activity Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Activity</DialogTitle>
            <DialogDescription>
              Give your activity a title and choose the type.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleSave)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Activity Title</Label>
                <Input
                  id="title"
                  placeholder="Morning Run"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label>Activity Type</Label>
                <RadioGroup 
                  defaultValue="running"
                  onValueChange={(value) => form.setValue("type", value as "running" | "walking")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="running" id="running" />
                    <Label htmlFor="running">Running</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="walking" id="walking" />
                    <Label htmlFor="walking">Walking</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;
