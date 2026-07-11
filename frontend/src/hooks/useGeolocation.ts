import { useState, useEffect, useCallback } from 'react';
import type { GpsCoordinates } from '@/types/location';

interface GeolocationState {
  position: GpsCoordinates | null;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  error: string | null;
  isTracking: boolean;
}

export function useGeolocation(enabled: boolean = true) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    speed: null,
    heading: null,
    accuracy: null,
    error: null,
    isTracking: false,
  });

  useEffect(() => {
    if (!enabled || !navigator.geolocation) {
      if (!navigator.geolocation) {
        setState((prev) => ({ ...prev, error: 'Geolocation not supported' }));
      }
      return;
    }

    setState((prev) => ({ ...prev, isTracking: true }));

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          position: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          speed: pos.coords.speed ? pos.coords.speed * 3.6 : null, // m/s to km/h
          heading: pos.coords.heading,
          accuracy: pos.coords.accuracy,
          error: null,
          isTracking: true,
        });
      },
      (err) => {
        setState((prev) => ({
          ...prev,
          error: err.message,
          isTracking: false,
        }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setState((prev) => ({ ...prev, isTracking: false }));
    };
  }, [enabled]);

  return state;
}
