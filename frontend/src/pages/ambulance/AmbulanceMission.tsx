import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/context/WebSocketContext';
import { useLocationBroadcast } from '@/hooks/useLocationBroadcast';
import { missionService } from '@/services/missionService';
import { toast } from 'sonner';
import { Play, Square, MapPin, Activity, CheckCircle, ShieldAlert } from 'lucide-react';
import type { Mission, MissionRequest } from '@/types/mission';
import type { AcknowledgementResponse } from '@/types/alert';

export default function AmbulanceMission() {
  const { user } = useAuth();
  const { subscribe } = useWebSocket();
  const navigate = useNavigate();
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [acks, setAcks] = useState<AcknowledgementResponse[]>([]);
  const [form, setForm] = useState<MissionRequest>({
    startLat: 0, startLng: 0, endLat: 0, endLng: 0, destinationName: '', alertRadiusMeters: 500,
  });

  const { position } = useLocationBroadcast(user?.userId, mission?.id);

  useEffect(() => {
    if (position && form.startLat === 0) {
      setForm(prev => ({ ...prev, startLat: position.latitude, startLng: position.longitude }));
    }
  }, [position]);

  useEffect(() => {
    loadMission();
  }, []);

  useEffect(() => {
    if (mission) {
      const unsub = subscribe(`/topic/acknowledgements/${mission.id}`, (ack: AcknowledgementResponse) => {
        setAcks(prev => [ack, ...prev]);
        toast.success(`${ack.vehicleNumber} has given way!`);
      });
      return unsub;
    }
  }, [mission, subscribe]);

  const loadMission = async () => {
    try {
      const active = await missionService.getActiveMission();
      setMission(active);
    } catch (error) {
      toast.error('Failed to load mission data');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) {
      toast.error('Waiting for GPS location...');
      return;
    }
    try {
      const newMission = await missionService.startMission({
        ...form,
        startLat: position.latitude,
        startLng: position.longitude,
      });
      setMission(newMission);
      toast.success('Emergency mission started');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start mission');
    }
  };

  const handleStop = async () => {
    try {
      await missionService.stopMission();
      setMission(null);
      setAcks([]);
      toast.success('Mission completed');
      navigate('/ambulance');
    } catch (error) {
      toast.error('Failed to stop mission');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mission Control</h1>
        <p className="text-dark-500 mt-1">Manage active emergency broadcasts</p>
      </div>

      {!mission ? (
        <div className="card p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
              <ShieldAlert className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Start New Mission</h2>
              <p className="text-dark-500">Configure emergency parameters</p>
            </div>
          </div>

          <form onSubmit={handleStart} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Destination Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={form.destinationName}
                  onChange={(e) => setForm({ ...form, destinationName: e.target.value })}
                  placeholder="e.g. City General Hospital"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Alert Radius (meters)</label>
                <input
                  type="number"
                  required
                  min="100"
                  max="2000"
                  className="input"
                  value={form.alertRadiusMeters}
                  onChange={(e) => setForm({ ...form, alertRadiusMeters: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <button type="submit" className="btn-danger w-full text-lg py-4">
              <Play className="w-6 h-6 mr-2" />
              INITIATE EMERGENCY BROADCAST
            </button>
          </form>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="card border-emergency-500 p-8 emergency-bg text-white shadow-neon-red">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-black tracking-tight">ACTIVE MISSION</h2>
                  <p className="text-emergency-100 font-medium opacity-90 mt-1">Broadcasting alerts to nearby vehicles</p>
                </div>
                <Activity className="w-12 h-12 animate-pulse" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-black/20 p-4 rounded-xl backdrop-blur-md">
                  <p className="text-emergency-200 text-sm font-bold uppercase mb-1">Destination</p>
                  <p className="font-bold text-xl">{mission.destinationName || 'Not specified'}</p>
                </div>
                <div className="bg-black/20 p-4 rounded-xl backdrop-blur-md">
                  <p className="text-emergency-200 text-sm font-bold uppercase mb-1">Radius</p>
                  <p className="font-bold text-xl">{mission.alertRadiusMeters}m</p>
                </div>
              </div>

              <button onClick={handleStop} className="w-full bg-white text-emergency-600 font-bold text-lg py-4 rounded-xl hover:bg-emergency-50 transition-colors flex items-center justify-center">
                <Square className="w-6 h-6 mr-2 fill-current" />
                END MISSION & CLEAR TRAFFIC
              </button>
            </div>
          </div>

          <div className="card p-6 flex flex-col h-full">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-success-500" />
              Acknowledgements ({acks.length})
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3">
              {acks.length === 0 ? (
                <div className="text-center text-dark-500 py-8">
                  Waiting for vehicle responses...
                </div>
              ) : (
                acks.map((ack, i) => (
                  <div key={i} className="p-3 bg-dark-50 dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 animate-slide-in-right">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-primary-600 dark:text-primary-400">{ack.vehicleNumber}</span>
                      <span className="text-xs text-dark-400">Just now</span>
                    </div>
                    <p className="text-sm font-medium mt-1">{ack.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
