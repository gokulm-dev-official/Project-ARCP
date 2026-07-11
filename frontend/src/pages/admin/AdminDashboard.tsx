import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import StatCard from '@/components/ui/StatCard';
import LiveMap from '@/components/ui/LiveMap';
import { Users, Ambulance, Car, Activity, ShieldCheck, Clock, MapPin, Map } from 'lucide-react';
import type { LocationResponse } from '@/types/location';
import type { Mission } from '@/types/mission';

interface DashboardStats {
  totalUsers: number;
  activeAmbulances: number;
  activeVehicles: number;
  onlineMissions: number;
  todayMissions: number;
  completedMissions: number;
  totalAlerts: number;
  todayAlerts: number;
  totalAcknowledgements: number;
  averageResponseTimeSeconds: number;
  connectedUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ambulances, setAmbulances] = useState<LocationResponse[]>([]);
  const [vehicles, setVehicles] = useState<LocationResponse[]>([]);
  const [activeMissions, setActiveMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, ambRes, vehRes, missRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/live-ambulances'),
          api.get('/admin/live-vehicles'),
          api.get('/admin/missions/active'),
        ]);
        
        setStats(statsRes.data.data);
        setAmbulances(ambRes.data.data);
        setVehicles(vehRes.data.data);
        setActiveMissions(missRes.data.data);
      } catch (error) {
        console.error('Failed to load admin dashboard', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000); // 5s refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Overview</h1>
        <p className="text-dark-500 mt-1">Live monitoring and analytics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Active Missions" value={stats?.onlineMissions || 0} icon={Activity} color="red" />
        <StatCard title="Connected Vehicles" value={stats?.activeVehicles || 0} icon={Car} color="blue" />
        <StatCard title="Alerts Today" value={stats?.todayAlerts || 0} icon={ShieldCheck} color="amber" />
        <StatCard title="Avg Response Time" value={`${Math.round((stats?.averageResponseTimeSeconds || 0) / 60)}m`} icon={Clock} color="green" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card p-2">
          <div className="px-4 py-3 border-b border-dark-200 dark:border-dark-700 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><Map className="w-5 h-5" /> Live City Map</h3>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1 text-emergency-500"><div className="w-2 h-2 rounded-full bg-emergency-500" /> Ambulances ({ambulances.length})</span>
              <span className="flex items-center gap-1 text-primary-500"><div className="w-2 h-2 rounded-full bg-primary-500" /> Vehicles ({vehicles.length})</span>
            </div>
          </div>
          <LiveMap 
            center={[18.5204, 73.8567]} // Pune
            ambulances={ambulances}
            vehicles={vehicles}
            activeMission={activeMissions[0]} // Just showing the first active mission's radius for now
            height="500px" 
            zoom={12}
          />
        </div>

        <div className="space-y-6 flex flex-col">
          <div className="card p-6 flex-1">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5" /> Active Emergencies</h3>
            <div className="space-y-4">
              {activeMissions.length === 0 ? (
                <p className="text-dark-500 text-sm">No active emergencies</p>
              ) : (
                activeMissions.map((m) => (
                  <div key={m.id} className="p-4 rounded-xl border border-emergency-200 dark:border-emergency-900 bg-emergency-50 dark:bg-emergency-900/10">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-emergency-700 dark:text-emergency-400">{m.ambulanceNumber}</span>
                      <span className="text-xs px-2 py-1 bg-emergency-100 text-emergency-700 rounded-full font-bold animate-pulse">LIVE</span>
                    </div>
                    <p className="text-sm font-medium">{m.destinationName}</p>
                    <div className="mt-3 flex gap-4 text-xs text-dark-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {m.alertRadiusMeters}m radius</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4 bg-dark-50 dark:bg-dark-800 border-none text-center">
              <p className="text-xs font-bold text-dark-500 uppercase mb-1">Total Users</p>
              <p className="text-2xl font-black">{stats?.totalUsers}</p>
            </div>
            <div className="card p-4 bg-dark-50 dark:bg-dark-800 border-none text-center">
              <p className="text-xs font-bold text-dark-500 uppercase mb-1">Total Acks</p>
              <p className="text-2xl font-black">{stats?.totalAcknowledgements}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
