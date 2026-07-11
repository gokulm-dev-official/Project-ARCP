import { useEffect, useRef } from 'react';
import { useGeolocation } from './useGeolocation';
import { useWebSocket } from '@/context/WebSocketContext';
import type { LocationUpdate } from '@/types/location';

/**
 * Combines geolocation + WebSocket to continuously broadcast GPS to backend.
 * Sends location every 2 seconds.
 */
export function useLocationBroadcast(userId: number | undefined, missionId?: number) {
  const geo = useGeolocation(!!userId);
  const { send, isConnected } = useWebSocket();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!userId || !geo.position || !isConnected) return;

    // Send immediately
    const sendUpdate = () => {
      if (!geo.position) return;
      const update: LocationUpdate = {
        userId,
        latitude: geo.position.latitude,
        longitude: geo.position.longitude,
        speed: geo.speed ?? undefined,
        heading: geo.heading ?? undefined,
        accuracy: geo.accuracy ?? undefined,
        missionId,
      };
      send('/app/location.update', update);
    };

    sendUpdate();

    // Then every 2 seconds
    intervalRef.current = window.setInterval(sendUpdate, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId, geo.position?.latitude, geo.position?.longitude, isConnected, missionId]);

  return geo;
}
