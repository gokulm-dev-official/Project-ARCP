import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { missionService } from '@/services/missionService';
import api from '@/services/api';
import { useLocationBroadcast } from '@/hooks/useLocationBroadcast';
import StatCard from '@/components/ui/StatCard';
import LiveMap from '@/components/ui/LiveMap';
import { Link } from 'react-router-dom';
import { Navigation, Activity, Clock, MapPin, ArrowRight } from 'lucide-react';
import type { Mission } from '@/types/mission';
import type { LocationResponse } from '@/types/location';

export default function AmbulanceDashboard() {
  const { user } = useAuth();
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [vehicles, setVehicles] = useState<LocationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Broadcast location continuously
  const { position } = useLocationBroadcast(user?.userId, activeMission?.id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [missionRes, vehiclesRes] = await Promise.all([
          missionService.getActiveMission(),
          api.get('/ambulance/nearby-vehicles'),
        ]);
        setActiveMission(missionRes);
        setVehicles(vehiclesRes.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const center: [number, number] = position 
    ? [position.latitude, position.longitude] 
    : [18.5204, 73.8567]; // Default Pune, India

  if (loading) {
    return <div className="flex items-center justify-center h-[calc(100vh-4rem)]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Ambulance Dashboard</h1>
          <p className="text-dark-500 mt-1">Vehicle: {user?.vehicleNumber}</p>
        </div>
        {!activeMission && (
          <Link to="/ambulance/mission" className="btn-primary">
            Start Mission <Navigation className="w-4 h-4 ml-2" />
          </Link>
        )}
      </div>

      {activeMission ? (
        <div className="card border-emergency-500/30 bg-emergency-50/50 dark:bg-emergency-900/10 p-6 flex justify-between items-center relative overflow-hidden">
          <div className="emergency-bg absolute inset-0 opacity-10" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 bg-emergency-100 dark:bg-emergency-900 rounded-full flex items-center justify-center animate-pulse-emergency">
              <Activity className="w-8 h-8 text-emergency-600 dark:text-emergency-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emergency-700 dark:text-emergency-400">ACTIVE EMERGENCY MISSION</h2>
              <p className="text-dark-600 dark:text-dark-300 font-medium mt-1">Destination: {activeMission.destinationName}</p>
            </div>
          </div>
          <Link to="/ambulance/mission" className="btn-danger relative z-10">
            Open Mission Control <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      ) : (
        <div className="card p-6 border-success-500/30 bg-success-50/50 dark:bg-success-900/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-success-500 rounded-full animate-ping-slow" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-success-700 dark:text-success-400">Standby Mode</h2>
            <p className="text-dark-600 dark:text-dark-300">Ready for emergency dispatch. Live location is being broadcasted.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Nearby Vehicles" value={vehicles.length} icon={Car} color="blue" />
        <StatCard title="Alerts Triggered" value={activeMission?.totalAlertsTriggered || 0} icon={Activity} color="red" />
        <StatCard title="Acknowledgements" value={activeMission?.totalAcknowledgements || 0} icon={MapPin} color="green" />
      </div>

      <div className="card p-1">
        <LiveMap 
          center={center} 
          ambulances={position ? [{ 
            userId: user!.userId, userName: user!.name, role: 'AMBULANCE_DRIVER', 
            latitude: position.latitude, longitude: position.longitude, speed: 0, online: true, lastUpdate: '' 
          }] : []}
          vehicles={vehicles}
          activeMission={activeMission}
          height="500px" 
        />
      </div>
    </div>
  );
}
