import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Activity } from "@shared/schema";
import RouteMap from "./RouteMap";
import { ActivityBadge } from "./ui/activity-badge";
import { formatDistance, formatTime, formatPace } from "@/lib/utils/format";

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  // Calculate pace
  const pace = activity.duration / activity.distance;
  
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{activity.title}</h3>
            <p className="text-muted-foreground text-sm">
              {format(new Date(activity.date), "MMM d, yyyy · hh:mm a")}
            </p>
          </div>
          <ActivityBadge type={activity.type} />
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <p className="text-xs text-muted-foreground">DISTANCE</p>
            <p className="font-medium">{formatDistance(activity.distance)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">TIME</p>
            <p className="font-medium">{formatTime(activity.duration)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">PACE</p>
            <p className="font-medium">{formatPace(pace)}</p>
          </div>
        </div>
        
        {/* Map Preview */}
        <div className="w-full h-32 rounded overflow-hidden relative">
          <RouteMap 
            route={activity.route}
            isTracking={false}
            isFullscreen={false}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
