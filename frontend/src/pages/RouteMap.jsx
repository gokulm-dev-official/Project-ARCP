import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Car, Clock, Navigation, Activity } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RouteMap = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  
  // Use passed data or fallback to defaults
  const currentPos = state.currentLocation || [13.0604, 80.2496];
  const hospitalPos = state.hospital ? [state.hospital.lat, state.hospital.lng] : [13.0827, 80.2707];
  const hospital = state.hospital || { name: 'Government Mohan Kumaramangalam', distance: 5.2, eta: '12 min' };

  const [routePositions, setRoutePositions] = useState([currentPos, hospitalPos]); // fallback straight line
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Fetch actual road geometry from OSRM
    const fetchRoute = async () => {
      try {
        // OSRM expects coordinates in lng,lat format
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${currentPos[1]},${currentPos[0]};${hospitalPos[1]},${hospitalPos[0]}?overview=full&geometries=geojson`);
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          // OSRM returns geojson geometries as [lng, lat], Leaflet expects [lat, lng]
          const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRoutePositions(coordinates);
        }
      } catch (error) {
        console.error("Failed to fetch OSRM route", error);
      }
    };
    fetchRoute();
  }, [currentPos, hospitalPos]);

  const handleStartNavigation = () => {
    setIsNavigating(!isNavigating);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FB] font-body text-textPrimary overflow-hidden">
      
      {/* Top Bar */}
      <header className="bg-white p-4 shadow-sm z-10 flex justify-between items-center px-8 border-b border-gray-100">
        <button 
          onClick={() => navigate('/ambulance-dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 font-semibold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold border border-green-200 shadow-sm">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
          <span>Live Tracking</span>
        </div>
      </header>

      {/* Main Map Area */}
      <main className="flex-1 relative bg-[#E8EAED]">
          <MapContainer 
            center={currentPos} // Center point
            zoom={14} 
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={currentPos}>
              <Popup>Ambulance Current Location</Popup>
            </Marker>
            <Marker position={hospitalPos}>
              <Popup>{hospital.name}</Popup>
            </Marker>
            
            <Polyline positions={routePositions} color="#007AFF" weight={6} opacity={0.8} />
          </MapContainer>
      </main>

      {/* Bottom Route Details Panel */}
      <footer className="bg-white p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h3 className="text-xl font-heading font-bold text-gray-900 mb-1">Route Details</h3>
            <p className="text-sm text-gray-500 font-medium">To {hospital.name}</p>
          </div>

          <div className="flex space-x-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Distance</p>
                <p className="text-xl font-bold text-gray-900">{hospital.distance} km</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mr-4">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Estimated Time</p>
                <p className="text-xl font-bold text-gray-900">{hospital.eta}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-4">
                 <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Traffic Status</p>
                <p className="text-xl font-bold text-green-600">Light</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleStartNavigation}
            className={`px-8 py-4 rounded-xl font-bold shadow-lg flex items-center transition-all active:scale-95 ${
              isNavigating 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30' 
                : 'bg-primary hover:bg-[#2EB550] text-white shadow-primary/30'
            }`}
          >
            <Navigation className={`w-5 h-5 mr-2 ${isNavigating ? 'animate-bounce' : ''}`} />
            {isNavigating ? 'End Navigation' : 'Start Navigation'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default RouteMap;
