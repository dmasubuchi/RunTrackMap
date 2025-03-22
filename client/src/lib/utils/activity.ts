import { CurrentActivity, GeoPoint } from "@shared/schema";

// Helper to create a new empty activity
export function getCurrentActivity(): CurrentActivity {
  return {
    isTracking: false,
    isPaused: false,
    distance: 0,
    duration: 0,
    route: [],
    type: "running",
  };
}

// Calculate distance between two points using Haversine formula
function getDistanceFromLatLngInKm(point1: GeoPoint, point2: GeoPoint): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(point2.lat - point1.lat);
  const dLng = deg2rad(point2.lng - point1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1.lat)) *
      Math.cos(deg2rad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Calculate total distance of a route
export function calculateDistance(route: GeoPoint[]): number {
  if (route.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < route.length; i++) {
    totalDistance += getDistanceFromLatLngInKm(route[i - 1], route[i]);
  }

  return totalDistance;
}

// Calculate pace in seconds per kilometer
export function calculatePace(distanceKm: number, durationSeconds: number): number {
  if (distanceKm <= 0) return 0;
  return durationSeconds / distanceKm;
}

// Check if an activity is valid for saving
export function isActivityValid(activity: CurrentActivity): boolean {
  return (
    activity.distance > 0 &&
    activity.duration > 0 &&
    activity.route.length >= 2
  );
}
