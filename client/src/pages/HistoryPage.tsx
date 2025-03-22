import { useQuery } from "@tanstack/react-query";
import ActivityCard from "@/components/ActivityCard";
import { Activity } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const HistoryPage = () => {
  const { data: activities, isLoading, error } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });

  return (
    <div className="h-full pt-4 px-4 pb-20 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">Activity History</h1>
      
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <div>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <div>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
              
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      )}
      
      {error && (
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          <p>Error loading activities</p>
          <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      )}
      
      {activities && activities.length === 0 && (
        <div className="bg-muted p-8 rounded-lg text-center">
          <h3 className="font-semibold text-lg mb-2">No activities yet</h3>
          <p className="text-muted-foreground">
            Start tracking your runs and walks to see them here.
          </p>
        </div>
      )}
      
      {activities && activities.length > 0 && (
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
