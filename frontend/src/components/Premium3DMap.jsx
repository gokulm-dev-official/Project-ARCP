import React from 'react';
import Map, { Layer, Source } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZHVtbXl0b2tlbiIsImEiOiJjbHhxemFiYzEwMDAwMmtvNnJ0ZGRmZGRmIn0.dummy'; // Provide a real token in .env

const skyLayer = {
  id: 'sky',
  type: 'sky',
  paint: {
    'sky-type': 'atmosphere',
    'sky-atmosphere-sun': [0.0, 0.0],
    'sky-atmosphere-sun-intensity': 15
  }
};

const buildingLayer = {
  id: '3d-buildings',
  source: 'composite',
  'source-layer': 'building',
  filter: ['==', 'extrude', 'true'],
  type: 'fill-extrusion',
  minzoom: 14,
  paint: {
    'fill-extrusion-color': '#334155', // Slate color for dark theme
    'fill-extrusion-height': [
      'interpolate', ['linear'], ['zoom'],
      14, 0,
      14.05, ['get', 'height']
    ],
    'fill-extrusion-base': [
      'interpolate', ['linear'], ['zoom'],
      14, 0,
      14.05, ['get', 'min_height']
    ],
    'fill-extrusion-opacity': 0.8
  }
};

export default function Premium3DMap({ viewState, setViewState, children }) {
  return (
    <Map
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
      terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
    >
      <Source
        id="mapbox-dem"
        type="raster-dem"
        url="mapbox://mapbox.mapbox-terrain-dem-v1"
        tileSize={512}
        maxzoom={14}
      />
      <Layer {...skyLayer} />
      <Layer {...buildingLayer} />
      
      {children}
    </Map>
  );
}
