import { formatDistance, formatTime, formatPace } from "@/lib/utils/format";

interface ActivityStatsOverlayProps {
  distance: number;
  duration: number;
  pace: number;
}

const ActivityStatsOverlay = ({ distance, duration, pace }: ActivityStatsOverlayProps) => {
  return (
    <div className="absolute top-4 left-4 right-4 bg-white bg-opacity-90 rounded-lg p-4 shadow-md">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs uppercase text-muted-foreground">Distance</p>
          <p className="text-xl font-medium">{formatDistance(distance)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs uppercase text-muted-foreground">Time</p>
          <p className="text-xl font-medium">{formatTime(duration)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs uppercase text-muted-foreground">Pace</p>
          <p className="text-xl font-medium">{formatPace(pace)}</p>
        </div>
      </div>
    </div>
  );
};

export default ActivityStatsOverlay;
