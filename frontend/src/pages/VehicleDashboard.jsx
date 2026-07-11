import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Car, ShieldAlert, Search, MapPin, Volume2, VolumeX } from 'lucide-react';
import Premium3DMap from '../components/Premium3DMap';
import { Marker, Source, Layer } from 'react-map-gl';

// Helper to calculate distance in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(1));
};

const VehicleDashboard = () => {
  const navigate = useNavigate();
  const [vehicleLocation, setVehicleLocation] = useState(null);
  const [locationName, setLocationName] = useState('Locating...');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [emergencyData, setEmergencyData] = useState(null);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [distanceToAmbulance, setDistanceToAmbulance] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [alarmAudio] = useState(new Audio('/alarm.wav'));

  const [viewState, setViewState] = useState({
    longitude: 80.2500,
    latitude: 13.0650,
    zoom: 14,
    pitch: 60,
    bearing: 0
  });

  const fetchLocationData = async (lat, lng) => {
    setVehicleLocation([lat, lng]);
    setViewState(prev => ({ ...prev, latitude: lat, longitude: lng }));
    setLocationName("Locating...");

    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const geoData = await geoRes.json();
      if (geoData && geoData.display_name) {
        const parts = geoData.display_name.split(',');
        setLocationName(parts.slice(0, 3).join(', '));
      } else {
        setLocationName("Location Set (Name unavailable)");
      }
    } catch (e) {
      console.error("Reverse geocoding failed", e);
      setLocationName("Location Set (Name unavailable)");
    }
  };

  // 1. Track Vehicle Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchLocationData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          fetchLocationData(13.0650, 80.2500); // Fallback mock
        }
      );
    } else {
      fetchLocationData(13.0650, 80.2500);
    }
  }, []);

  const handleManualLocationSearch = async (e) => {
    e.preventDefault();
    if (!locationSearchQuery.trim()) return;
    
    setLocationName("Searching location...");
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        fetchLocationData(lat, lon);
        setLocationSearchQuery('');
      } else {
        setLocationName("Location not found");
      }
    } catch (err) {
      console.error("Geocoding failed", err);
      setLocationName("Search failed");
    }
  };

  // 2. Listen for Real-Time Storage Events (Cross-Tab Communication)
  useEffect(() => {
    const checkEmergency = () => {
      const dataStr = localStorage.getItem('smart_ambulance_emergency');
      if (dataStr) {
        try {
          const data = JSON.parse(dataStr);
          if (data.active) {
            setEmergencyData(data);
          } else {
            setEmergencyData(null);
            setIsAlertActive(false);
          }
        } catch (e) {
          console.error("Failed to parse emergency data", e);
        }
      } else {
         setEmergencyData(null);
         setIsAlertActive(false);
      }
    };

    // Check immediately on mount
    checkEmergency();

    // Listen for changes from other tabs
    window.addEventListener('storage', checkEmergency);
    
    // Also poll every 2 seconds in case the same tab is used for testing via localStorage edits directly
    const interval = setInterval(checkEmergency, 2000);

    return () => {
      window.removeEventListener('storage', checkEmergency);
      clearInterval(interval);
    };
  }, []);

  // 3. Calculate Proximity
  useEffect(() => {
    if (vehicleLocation && emergencyData) {
      const dist = calculateDistance(
        vehicleLocation[0], vehicleLocation[1],
        emergencyData.lat, emergencyData.lng
      );
      setDistanceToAmbulance(dist);
      
      // If within broadcast radius, trigger alert
      if (dist <= emergencyData.radius) {
        setIsAlertActive(true);
      } else {
        setIsAlertActive(false);
      }
    }
  }, [vehicleLocation, emergencyData]);

  // 4. Handle Audio Alarm
  useEffect(() => {
    alarmAudio.loop = true;
    if (isAlertActive && !isMuted) {
      // Browsers require user interaction before playing audio
      alarmAudio.play().catch(e => console.log("Audio autoplay blocked by browser until user clicks the page."));
    } else {
      alarmAudio.pause();
    }
    
    // Cleanup on unmount
    return () => alarmAudio.pause();
  }, [isAlertActive, isMuted, alarmAudio]);

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FB] font-body text-textPrimary relative overflow-hidden">
      
      {/* Massive Overlay Alert */}
      {isAlertActive && (
        <div className="absolute inset-0 z-50 bg-red-600/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
          <div className="bg-red-700 p-8 rounded-full mb-8 animate-pulse shadow-[0_0_100px_rgba(255,0,0,0.5)]">
             <ShieldAlert className="w-32 h-32 text-white" />
          </div>
          <h1 className="text-6xl font-black text-white mb-6 uppercase tracking-wider drop-shadow-lg">
            Ambulance Approaching
          </h1>
          <p className="text-3xl text-red-100 font-bold mb-4 uppercase">
            Please Give Way Immediately
          </p>
          <div className="bg-white text-red-600 px-8 py-4 rounded-2xl font-bold text-2xl mt-8 shadow-xl inline-flex items-center">
            <Car className="w-8 h-8 mr-4" />
            Ambulance is {distanceToAmbulance} km away
          </div>
          
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="mt-12 bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-xl font-bold flex items-center transition-colors text-xl backdrop-blur-md border border-white/30"
          >
            {isMuted ? <VolumeX className="w-8 h-8 mr-3" /> : <Volume2 className="w-8 h-8 mr-3 animate-pulse" />}
            {isMuted ? 'Unmute Alarm Sound' : 'Mute Alarm Sound'}
          </button>
        </div>
      )}

      {/* Top Bar */}
      <header className="bg-white p-4 shadow-sm z-10 flex justify-between items-center px-8 border-b border-gray-100">
        <div className="flex items-center text-primary font-bold text-xl">
          <Car className="w-6 h-6 mr-3" />
          Vehicle Dashboard
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-sm font-semibold border border-gray-200">
             Listening for alerts...
          </div>
          <button onClick={() => navigate('/login')} className="text-gray-500 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex bg-[#E8EAED] relative p-8">
        
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Status Panel */}
          <div className="col-span-1 bg-white rounded-3xl p-8 shadow-sm flex flex-col items-center text-center justify-center">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-inner ${isAlertActive ? 'bg-red-100' : 'bg-green-50'}`}>
               <ShieldAlert className={`w-16 h-16 ${isAlertActive ? 'text-red-600 animate-pulse' : 'text-green-500'}`} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isAlertActive ? 'Emergency Alert' : 'No Emergency Nearby'}
            </h2>
            <p className="text-gray-500 mb-8 px-4">
              {isAlertActive 
                ? 'An ambulance is approaching your location. Please move your vehicle to the side.' 
                : 'Drive safely. We will alert you if an ambulance is approaching.'}
            </p>

            <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
               <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider block mb-2">Your Location</span>
               <div className="flex items-start">
                 <MapPin className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                 <span className="font-bold text-gray-900 text-left leading-tight">{locationName}</span>
               </div>
            </div>

            <form onSubmit={handleManualLocationSearch} className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Set location manually..." 
                value={locationSearchQuery}
                onChange={(e) => setLocationSearchQuery(e.target.value)}
                className="w-full pl-10 pr-20 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:text-primary/80">
                SEARCH
              </button>
            </form>
          </div>

          {/* Map Panel */}
          <div className="col-span-2 bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 flex flex-col relative z-0">
            {vehicleLocation ? (
              <Premium3DMap viewState={viewState} setViewState={setViewState}>
                
                {/* Vehicle Marker */}
                <Marker longitude={vehicleLocation[1]} latitude={vehicleLocation[0]}>
                  <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg text-xs" title="Your Vehicle">
                    🚘
                  </div>
                </Marker>

                {/* Ambulance Marker & Line (if active) */}
                {emergencyData && isAlertActive && (
                  <>
                    <Marker longitude={emergencyData.lng} latitude={emergencyData.lat}>
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-12 h-12 bg-red-500/30 rounded-full animate-ping"></div>
                        <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow-[0_0_20px_rgba(239,68,68,0.8)] flex items-center justify-center text-xs z-10">
                          🚑
                        </div>
                      </div>
                    </Marker>
                    <Source id="line" type="geojson" data={{
                      type: 'Feature',
                      geometry: {
                        type: 'LineString',
                        coordinates: [[vehicleLocation[1], vehicleLocation[0]], [emergencyData.lng, emergencyData.lat]]
                      }
                    }}>
                      <Layer
                        id="line-layer"
                        type="line"
                        paint={{ 'line-color': '#ef4444', 'line-width': 4, 'line-dasharray': [2, 2], 'line-opacity': 0.8 }}
                      />
                    </Source>
                  </>
                )}
              </Premium3DMap>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-0">
                <span className="text-gray-500 font-medium animate-pulse">Establishing GPS connection...</span>
              </div>
            )}
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
               <div className="bg-gray-900/80 backdrop-blur text-white px-4 py-2 rounded-full shadow-lg border border-gray-700 pointer-events-auto flex items-center">
                 <MapPin className="w-4 h-4 mr-2 text-primary" />
                 <span className="text-sm font-medium">Mapbox 3D Navigation active</span>
               </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default VehicleDashboard;
