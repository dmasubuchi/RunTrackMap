import { Button } from "@/components/ui/button";
import { Play, Pause, Square } from "lucide-react";

interface ActivityTrackerProps {
  isTracking: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}

const ActivityTracker = ({
  isTracking,
  isPaused,
  onStart,
  onPause,
  onStop,
}: ActivityTrackerProps) => {
  return (
    <div className="absolute bottom-20 left-0 right-0 flex justify-center">
      <div className="bg-white rounded-full shadow-lg p-2 flex items-center space-x-4">
        {!isTracking || isPaused ? (
          <Button
            variant="default"
            size="icon"
            className="h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center shadow"
            onClick={onStart}
          >
            <Play className="h-6 w-6" />
          </Button>
        ) : (
          <>
            <Button
              variant="default"
              size="icon"
              className="h-14 w-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow"
              onClick={onPause}
            >
              <Pause className="h-6 w-6" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="h-14 w-14 rounded-full bg-destructive text-white flex items-center justify-center shadow"
              onClick={onStop}
            >
              <Square className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityTracker;
