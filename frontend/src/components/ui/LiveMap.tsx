import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationResponse } from '@/types/location';
import type { Mission } from '@/types/mission';
import { useTheme } from '@/context/ThemeContext';

// Custom icons
const createIcon = (color: string, isPulsing: boolean = false) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        ${isPulsing ? `<div class="absolute w-full h-full rounded-full animate-ping opacity-75" style="background-color: ${color}"></div>` : ''}
        <div class="relative z-10 w-4 h-4 rounded-full border-2 border-white shadow-md" style="background-color: ${color}"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const icons = {
  ambulance: createIcon('#ef4444', true), // Emergency Red
  vehicle: createIcon('#3b82f6'),         // Primary Blue
  destination: createIcon('#22c55e'),     // Success Green
};

// Component to handle auto-centering map
function MapController({ center, zoom }: { center: [number, number], zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] !== 0 && center[1] !== 0) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

interface LiveMapProps {
  center: [number, number];
  ambulances?: LocationResponse[];
  vehicles?: LocationResponse[];
  activeMission?: Mission | null;
  zoom?: number;
  height?: string;
  className?: string;
}

export default function LiveMap({
  center,
  ambulances = [],
  vehicles = [],
  activeMission = null,
  zoom = 14,
  height = '400px',
  className = '',
}: LiveMapProps) {
  const { isDark } = useTheme();

  // Map styles based on theme
  const mapUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    
  const attribution = '&copy; <a href="https://carto.com/">CARTO</a>';

  return (
    <div className={`map-container w-full z-0 relative ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer url={mapUrl} attribution={attribution} />
        <MapController center={center} zoom={zoom} />

        {/* Mission Radius */}
        {activeMission && activeMission.startLat && (
          <Circle
            center={[activeMission.startLat, activeMission.startLng]}
            radius={activeMission.alertRadiusMeters}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 10',
            }}
          />
        )}

        {/* Destination Marker */}
        {activeMission && activeMission.endLat && activeMission.endLng && (
          <Marker
            position={[activeMission.endLat, activeMission.endLng]}
            icon={icons.destination}
          >
            <Popup className="custom-popup">
              <div className="font-semibold">{activeMission.destinationName || 'Destination'}</div>
              <div className="text-xs text-dark-500">Mission Endpoint</div>
            </Popup>
          </Marker>
        )}

        {/* Vehicles */}
        {vehicles.map((v) => (
          <Marker
            key={`veh-${v.userId}`}
            position={[v.latitude, v.longitude]}
            icon={icons.vehicle}
          >
            <Popup className="custom-popup">
              <div className="font-semibold">{v.userName}</div>
              <div className="text-xs text-dark-500">Speed: {Math.round(v.speed || 0)} km/h</div>
            </Popup>
          </Marker>
        ))}

        {/* Ambulances */}
        {ambulances.map((a) => (
          <Marker
            key={`amb-${a.userId}`}
            position={[a.latitude, a.longitude]}
            icon={icons.ambulance}
          >
            <Popup className="custom-popup">
              <div className="font-semibold text-emergency-600">{a.userName}</div>
              <div className="text-xs font-bold bg-emergency-100 text-emergency-700 px-2 py-0.5 rounded-full inline-block mt-1">
                ACTIVE EMERGENCY
              </div>
              <div className="text-xs text-dark-500 mt-1">Speed: {Math.round(a.speed || 0)} km/h</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-dark-900/20 to-transparent pointer-events-none z-[1]" />
      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-dark-900/20 to-transparent pointer-events-none z-[1]" />
    </div>
  );
}
