import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { GeoPoint } from "@shared/schema";

interface RouteMapProps {
  route: GeoPoint[];
  currentPosition?: GeoPoint;
  isTracking: boolean;
  isFullscreen?: boolean;
  className?: string;
}

const RouteMap = ({
  route,
  currentPosition,
  isTracking,
  isFullscreen = true,
  className = "",
}: RouteMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (mapRef.current && !leafletMapRef.current) {
      // Initialize map
      leafletMapRef.current = L.map(mapRef.current).setView([35.6895, 139.6917], 13);

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(leafletMapRef.current);

      // Create route layer
      routeLayerRef.current = L.polyline([], {
        color: "hsl(var(--primary))",
        weight: 4,
      }).addTo(leafletMapRef.current);

      // Create location marker with custom icon
      const icon = L.divIcon({
        className: "current-location-marker",
        html: `
          <div class="h-4 w-4 bg-primary rounded-full animate-pulse"></div>
          <div class="h-12 w-12 bg-primary bg-opacity-30 rounded-full absolute -top-4 -left-4"></div>
        `,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      markerRef.current = L.marker([0, 0], { icon }).addTo(leafletMapRef.current);
    }
    
    // Clean up on unmount
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update route on map
  useEffect(() => {
    if (leafletMapRef.current && routeLayerRef.current && route.length > 0) {
      const latLngs = route.map(point => [point.lat, point.lng] as L.LatLngExpression);
      routeLayerRef.current.setLatLngs(latLngs);
      
      // Fit map to route bounds if we have points
      if (latLngs.length > 0) {
        leafletMapRef.current.fitBounds(L.latLngBounds(latLngs));
      }
    }
  }, [route]);

  // Update current position marker
  useEffect(() => {
    if (leafletMapRef.current && markerRef.current && currentPosition) {
      markerRef.current.setLatLng([currentPosition.lat, currentPosition.lng]);
      
      // If tracking, center map on current position
      if (isTracking) {
        leafletMapRef.current.setView([currentPosition.lat, currentPosition.lng]);
      }
    }
  }, [currentPosition, isTracking]);

  return (
    <div 
      ref={mapRef} 
      className={`${isFullscreen ? 'h-[calc(100vh-4rem)]' : 'h-32'} w-full ${className}`}
    />
  );
};

export default RouteMap;
