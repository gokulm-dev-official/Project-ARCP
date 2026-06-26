import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Bell, Settings, LogOut, Search, Activity, Volume2, ShieldAlert } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
};

const MapUpdater = ({ center }) => {
  const map = useMap();
  React.useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const AmbulanceDashboard = () => {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationName, setLocationName] = useState("Locating...");
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  const fetchLocationData = async (lat, lng) => {
    setCurrentLocation([lat, lng]);
    setLocationName("Locating...");
    setLoadingHospitals(true);

    // Reverse Geocode to get actual street name
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

    // Fetch real nearby hospitals using Overpass API (30km radius)
    try {
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:30000, ${lat}, ${lng});
          way["amenity"="hospital"](around:30000, ${lat}, ${lng});
          node["amenity"="clinic"](around:30000, ${lat}, ${lng});
          way["amenity"="clinic"](around:30000, ${lat}, ${lng});
        );
        out center;
      `;
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`
      });
      const data = await res.json();
      
      let fetchedHospitals = data.elements.filter(el => el.tags && el.tags.name).map((el, index) => {
        const hLat = el.lat || el.center?.lat;
        const hLng = el.lon || el.center?.lon;
        const dist = calculateDistance(lat, lng, hLat, hLng);
        return {
          id: index,
          name: el.tags.name,
          type: el.tags.healthcare === 'hospital' ? 'Private' : 'General',
          distance: parseFloat(dist),
          eta: Math.round(dist * 2.5) + ' min',
          lat: hLat,
          lng: hLng,
          selected: false
        };
      });

      fetchedHospitals.sort((a, b) => a.distance - b.distance);
      if (fetchedHospitals.length > 0) {
        fetchedHospitals[0].selected = true; // Select nearest
      } else {
         fetchedHospitals = [
           { id: 99, name: 'No Real Hospitals Found in 30km (Mock)', type: 'Government', distance: 5.0, eta: '12 min', selected: true, lat: lat + 0.05, lng: lng + 0.05 }
         ];
      }
      
      setHospitals(fetchedHospitals.slice(0, 5)); // Keep top 5
      setLoadingHospitals(false);
    } catch (err) {
      console.error("Failed to fetch hospitals", err);
      const fallbackHospitals = [
        { id: 101, name: 'City Central Hospital (API Offline)', type: 'Government', distance: 2.3, eta: '6 min', selected: true, lat: lat + 0.015, lng: lng + 0.015 },
        { id: 102, name: 'Metro Care Hospital (API Offline)', type: 'Private', distance: 3.8, eta: '10 min', selected: false, lat: lat - 0.02, lng: lng - 0.01 },
        { id: 103, name: 'Sunrise Medical Center (API Offline)', type: 'Private', distance: 5.1, eta: '14 min', selected: false, lat: lat + 0.03, lng: lng - 0.025 }
      ];
      setHospitals(fallbackHospitals);
      setLoadingHospitals(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchLocationData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          fetchLocationData(13.0604, 80.2496); // Fallback to Chennai
        }
      );
    } else {
      fetchLocationData(13.0604, 80.2496);
    }
  }, []);

  const handleManualLocation = (lat, lng) => {
    fetchLocationData(lat, lng);
  };

  // Click handler component for the map
  const LocationPicker = () => {
    useMapEvents({
      click(e) {
        handleManualLocation(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

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
        setLocationSearchQuery(''); // clear input
      } else {
        setLocationName("Location not found");
      }
    } catch (err) {
      console.error("Geocoding failed", err);
      setLocationName("Search failed");
    }
  };

  const selectedHospital = hospitals.find(h => h.selected);

  const handleSelectHospital = (id) => {
    setHospitals(hospitals.map(h => ({ ...h, selected: h.id === id })));
  };

  const toggleEmergency = () => {
    const newState = !emergencyActive;
    setEmergencyActive(newState);
    
    if (newState && currentLocation) {
      // Broadcast emergency to Vehicle dashboards via localStorage
      localStorage.setItem('smart_ambulance_emergency', JSON.stringify({
        active: true,
        lat: currentLocation[0],
        lng: currentLocation[1],
        radius: 5, // km
        timestamp: Date.now()
      }));
    } else {
      // Cancel emergency
      localStorage.setItem('smart_ambulance_emergency', JSON.stringify({ active: false }));
    }
  };

  const filteredHospitals = hospitals.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-body text-textPrimary overflow-hidden">
      
      {/* Sidebar Navigation */}
      <nav className="w-20 bg-[#1A1D21] flex flex-col items-center py-8 justify-between z-10 shadow-2xl">
        <div className="space-y-8">
          <div className="bg-primary/20 p-3 rounded-2xl cursor-pointer hover:bg-primary/30 transition-colors">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <div className="flex flex-col space-y-6">
            <NavIcon icon={<Navigation />} active onClick={() => {}} />
            <NavIcon icon={<MapPin />} onClick={() => alert('Map View Module Coming Soon')} />
            <NavIcon icon={<Search />} onClick={() => alert('Advanced Search Module Coming Soon')} />
            <NavIcon icon={<Bell />} onClick={() => alert('Notifications Module Coming Soon')} />
            <NavIcon icon={<Settings />} onClick={() => alert('Settings Module Coming Soon')} />
          </div>
        </div>
        <div onClick={() => navigate('/login')} className="cursor-pointer text-gray-500 hover:text-white transition-colors">
          <LogOut className="w-6 h-6" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">Good Morning, Driver 👋</h1>
            <p className="text-sm text-textSecondary font-medium">Drive Safe. Save Lives.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold border border-green-200">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Live
            </div>
            <span className="text-gray-500 font-medium">10:30 AM</span>
            <img src="https://ui-avatars.com/api/?name=Driver&background=E5E7EB&color=374151" alt="Driver" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          
          {/* Left Column (Locations & List) */}
          <div className="col-span-4 flex flex-col space-y-6">
            
            {/* Current Location Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Current Location</h2>
              <div className="flex items-start">
                <div className="mt-1 mr-3">
                  <div className="w-3 h-3 bg-primary rounded-full ring-4 ring-primary/20"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{locationName}</p>
                  <p className="text-sm text-gray-500">
                    {currentLocation ? `${currentLocation[0].toFixed(4)}, ${currentLocation[1].toFixed(4)}` : 'Waiting for GPS...'}
                  </p>
                </div>
              </div>
              <form onSubmit={handleManualLocationSearch} className="mt-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Set location manually (e.g. Times Square)" 
                  value={locationSearchQuery}
                  onChange={(e) => setLocationSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-24 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:text-primary/80">
                  SEARCH
                </button>
              </form>
            </div>

            {/* Nearby Hospitals List */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-heading font-bold text-gray-900">Nearby Hospitals</h2>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search hospitals..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {loadingHospitals ? (
                  <div className="flex justify-center items-center h-full">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredHospitals.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-sm text-gray-500 text-center">
                     No hospitals found matching "{searchQuery}"
                  </div>
                ) : (
                  filteredHospitals.map((hospital, index) => (
                    <div 
                      key={hospital.id}
                      onClick={() => handleSelectHospital(hospital.id)}
                      className={`p-4 rounded-xl cursor-pointer border transition-all ${
                      hospital.selected 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-start space-x-3">
                        <span className="text-gray-400 font-bold text-sm">{index + 1}</span>
                        <div>
                          <h3 className={`font-semibold text-sm ${hospital.selected ? 'text-primary' : 'text-gray-900'}`}>{hospital.name}</h3>
                          <p className="text-xs text-gray-500">{hospital.distance} km • {hospital.eta}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wide ${
                        hospital.type === 'Government' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {hospital.type}
                      </span>
                    </div>
                  </div>
                ))
                )}
              </div>
              <button className="mt-4 text-primary text-sm font-semibold hover:underline text-center w-full">
                View All Hospitals
              </button>
            </div>

          </div>

          {/* Middle Column (Map View) */}
          <div className="col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative z-0">
            <div className="absolute top-4 left-4 right-4 flex justify-between z-10 pointer-events-none">
               <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-gray-100 pointer-events-auto">
                 <p className="text-xs text-gray-500 font-semibold uppercase">Distance</p>
                 <p className="text-xl font-bold text-gray-900">{selectedHospital?.distance} km</p>
               </div>
               <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-gray-100 pointer-events-auto">
                 <p className="text-xs text-gray-500 font-semibold uppercase">ETA</p>
                 <p className="text-xl font-bold text-gray-900">{selectedHospital?.eta}</p>
               </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
               <div className="bg-gray-900/80 backdrop-blur text-white px-4 py-2 rounded-full shadow-lg border border-gray-700 pointer-events-auto flex items-center">
                 <MapPin className="w-4 h-4 mr-2 text-primary" />
                 <span className="text-sm font-medium">Click anywhere on map to manually set location</span>
               </div>
            </div>
            
            {/* Map Area */}
            <div className="flex-1 bg-gray-100 relative group overflow-hidden z-0">
               {currentLocation ? (
                <MapContainer 
                  center={currentLocation} 
                  zoom={13} 
                  style={{ width: '100%', height: '100%' }}
                  zoomControl={false}
                >
                  <MapUpdater center={currentLocation} />
                  <LocationPicker />
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={currentLocation}>
                    <Popup>Your Location</Popup>
                  </Marker>
                  {selectedHospital && (
                    <Marker position={[selectedHospital.lat, selectedHospital.lng]}>
                      <Popup>{selectedHospital.name}</Popup>
                    </Marker>
                  )}
                  {selectedHospital && (
                    <Polyline 
                      positions={[currentLocation, [selectedHospital.lat, selectedHospital.lng]]} 
                      color="#007AFF" 
                      weight={4} 
                      dashArray="10, 10" 
                    />
                  )}
                </MapContainer>
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-medium">Getting your location...</div>
               )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-white">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Selected Hospital</p>
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedHospital ? selectedHospital.name : 'None selected'}</h3>
                  <p className="text-sm text-gray-500">Destination</p>
                  <p className="text-sm font-semibold text-gray-700 mt-2">{selectedHospital?.distance} km • <span className="text-primary">{selectedHospital?.eta}</span></p>
                </div>
                <button 
                  onClick={() => navigate('/route-map', { 
                    state: { 
                      currentLocation, 
                      hospital: selectedHospital 
                    } 
                  })}
                  disabled={!currentLocation || !selectedHospital}
                  className="px-6 py-2 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  Confirm Route
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (Actions & Status) */}
          <div className="col-span-3 flex flex-col space-y-6">
            
            {/* Emergency Status Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-sm font-semibold text-gray-900">Emergency Status</h2>
                 <span className={`text-xs font-bold px-2 py-1 rounded-md ${emergencyActive ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                   {emergencyActive ? 'Active' : 'Inactive'}
                 </span>
               </div>

               <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${emergencyActive ? 'bg-red-100 animate-pulse' : 'bg-gray-100'}`}>
                 <ShieldAlert className={`w-12 h-12 ${emergencyActive ? 'text-red-500' : 'text-gray-400'}`} />
               </div>

               <h3 className="text-lg font-bold text-gray-900 mb-1">{emergencyActive ? 'Emergency En Route' : 'Ready for Dispatch'}</h3>
               <p className="text-sm text-gray-500 mb-6 px-4">
                 {emergencyActive ? 'Notifications sent to nearby vehicles.' : 'Activate emergency status to notify traffic.'}
               </p>

               <button 
                  onClick={toggleEmergency}
                  className={`w-full py-3.5 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] ${
                    emergencyActive 
                      ? 'bg-white text-gray-900 border-2 border-gray-200 shadow-sm hover:bg-gray-50' 
                      : 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/30'
                  }`}
                >
                 {emergencyActive ? 'Cancel Request' : 'Activate Emergency'}
               </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <ActionCard icon={<Volume2 className="w-5 h-5" />} title="Horn" desc="Sound Alert" />
                <ActionCard icon={<Bell className="w-5 h-5 text-red-500" />} title="Siren" desc="Activate Siren" active={emergencyActive} />
                <ActionCard icon={<Navigation className="w-5 h-5 text-blue-500" />} title="Share Location" desc="Share Live Location" />
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

const NavIcon = ({ icon, active, onClick }) => (
  <div onClick={onClick} className={`p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-white/10 text-white shadow-inner' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
    {icon}
  </div>
);

const ActionCard = ({ icon, title, desc, active }) => (
  <div className={`flex items-center p-3 rounded-xl cursor-pointer transition-all border ${active ? 'bg-red-50 border-red-200' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${active ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
      {icon}
    </div>
    <div>
      <h4 className={`font-semibold text-sm ${active ? 'text-red-900' : 'text-gray-900'}`}>{title}</h4>
      <p className={`text-xs ${active ? 'text-red-600' : 'text-gray-500'}`}>{desc}</p>
    </div>
  </div>
);

export default AmbulanceDashboard;
