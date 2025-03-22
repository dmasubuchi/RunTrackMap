import { useState, useEffect } from "react";

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

interface GeolocationState {
  position: GeolocationPosition | null;
  error: GeolocationError | null;
}

export function useGeolocation(options: PositionOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setState({
        position: null,
        error: {
          code: 0,
          message: "Geolocation not supported",
        },
      });
      return;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 27000,
    };

    // Merge default options with provided options
    const geoOptions = {
      ...defaultOptions,
      ...options,
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          position,
          error: null,
        });
      },
      (error) => {
        setState({
          position: null,
          error,
        });
      },
      geoOptions
    );

    // Watch position
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          position,
          error: null,
        });
      },
      (error) => {
        setState({
          position: null,
          error,
        });
      },
      geoOptions
    );

    // Cleanup
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [options]);

  return state;
}
