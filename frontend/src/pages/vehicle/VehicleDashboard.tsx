import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/context/WebSocketContext';
import { useLocationBroadcast } from '@/hooks/useLocationBroadcast';
import api from '@/services/api';
import { toast } from 'sonner';
import { Car, Navigation, Shield, CheckCircle } from 'lucide-react';
import LiveMap from '@/components/ui/LiveMap';
import AlertBadge from '@/components/ui/AlertBadge';
import type { AlertMessage } from '@/types/alert';
import type { LocationResponse } from '@/types/location';

export default function VehicleDashboard() {
  const { user } = useAuth();
  const { subscribe } = useWebSocket();
  const [alert, setAlert] = useState<AlertMessage | null>(null);
  const [ambulances, setAmbulances] = useState<LocationResponse[]>([]);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  // Broadcast location continuously
  const { position } = useLocationBroadcast(user?.userId);

  // Fetch live ambulances periodically to show on map
  useEffect(() => {
    const fetchAmbulances = async () => {
      try {
        const res = await api.get('/admin/live-ambulances');
        setAmbulances(res.data.data);
      } catch (err) {
        // Ignore
      }
    };
    fetchAmbulances();
    const interval = setInterval(fetchAmbulances, 5000);
    return () => clearInterval(interval);
  }, []);

  // Listen for alerts and clear events
  useEffect(() => {
    if (user?.userId) {
      const unsubAlerts = subscribe(`/topic/alerts/${user.userId}`, (msg: AlertMessage) => {
        setAlert(msg);
        setHasAcknowledged(false);
      });

      // Also listen if a mission clears
      const unsubClears = subscribe(`/topic/mission/*/clear`, (msg: any) => {
        if (alert && msg.missionId === alert.missionId) {
          setAlert(null);
          setHasAcknowledged(false);
          toast.success('Ambulance has passed or mission completed. Traffic cleared.');
        }
      });

      return () => {
        if (unsubAlerts) unsubAlerts();
        if (unsubClears) unsubClears();
      };
    }
  }, [user?.userId, subscribe, alert]);

  const handleAcknowledge = async () => {
    if (!alert || !user) return;
    try {
      await api.post('/vehicle/acknowledge', {
        alertId: alert.alertId,
        missionId: alert.missionId,
        vehicleId: user.userId, // backend resolves actual vehicle via driver ID
        message: 'I have given way safely',
      });
      setHasAcknowledged(true);
      toast.success('Acknowledgement sent to ambulance');
    } catch (error) {
      toast.error('Failed to send acknowledgement');
    }
  };

  const center: [number, number] = position 
    ? [position.latitude, position.longitude] 
    : [18.5204, 73.8567];

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
          <Car className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Vehicle Dashboard</h1>
          <p className="text-dark-500">{user?.vehicleNumber}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card p-2">
          <LiveMap 
            center={center}
            vehicles={position ? [{ 
              userId: user!.userId, userName: user!.name, role: 'VEHICLE_DRIVER', 
              latitude: position.latitude, longitude: position.longitude, speed: position.speed || 0, online: true, lastUpdate: '' 
            }] : []}
            ambulances={ambulances}
            activeMission={alert ? {
              id: alert.missionId,
              startLat: alert.ambulanceLat,
              startLng: alert.ambulanceLng,
              endLat: alert.destinationLat,
              endLng: alert.destinationLng,
              alertRadiusMeters: 500,
              status: 'ACTIVE',
              ambulanceId: alert.ambulanceId,
              ambulanceNumber: alert.ambulanceNumber,
              driverName: '',
              startTime: '',
            } : null}
            height="500px" 
            zoom={15}
          />
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Navigation className="w-5 h-5 text-primary-500" />
              GPS Status
            </h3>
            {position ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-success-500">
                  <div className="live-dot" />
                  <span className="font-semibold text-sm">Tracking Active</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dark-50 dark:bg-dark-800 p-3 rounded-xl">
                    <p className="text-xs text-dark-500 uppercase font-bold mb-1">Speed</p>
                    <p className="text-lg font-mono font-bold">{Math.round(position.speed || 0)} <span className="text-sm font-sans">km/h</span></p>
                  </div>
                  <div className="bg-dark-50 dark:bg-dark-800 p-3 rounded-xl">
                    <p className="text-xs text-dark-500 uppercase font-bold mb-1">Accuracy</p>
                    <p className="text-lg font-mono font-bold">{Math.round(position.accuracy || 0)} <span className="text-sm font-sans">m</span></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-dark-500 text-sm">
                Waiting for GPS fix... Please ensure location services are enabled.
              </div>
            )}
          </div>

          <div className="card p-6 border-primary-500/30 bg-primary-50/50 dark:bg-primary-900/10">
            <h3 className="font-bold flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary-600" />
              Smart Alert System
            </h3>
            <p className="text-sm text-dark-600 dark:text-dark-400 leading-relaxed">
              You are connected to the Smart Ambulance network. If an emergency vehicle approaches your location, you will receive real-time alerts and directions to clear the path.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Alert Badge */}
      {alert && (
        <AlertBadge 
          severity={alert.severity}
          direction={alert.direction}
          distance={alert.distanceMeters}
          message={alert.instruction}
        />
      )}

      {/* Acknowledgement Action (appears when alerted) */}
      {alert && !hasAcknowledged && alert.severity !== 'CLEAR' && (
        <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 z-40 animate-slide-up">
          <button onClick={handleAcknowledge} className="btn-success shadow-neon-green text-lg py-4 px-8 rounded-full border-2 border-white/20">
            <CheckCircle className="w-6 h-6 mr-2" />
            I HAVE GIVEN WAY
          </button>
        </div>
      )}
    </div>
  );
}
