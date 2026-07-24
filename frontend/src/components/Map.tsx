"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Port {
  id: string;
  name: string;
  unlocode: string;
  latitude: number;
  longitude: number;
}

interface Route {
  id: string;
  origin_port: string;
  destination_port: string;
  waypoints?: { lat: number; lon: number }[];
}

interface MapProps {
  ports?: Port[];
  routes?: Route[];
  height?: string;
  center?: [number, number];
  zoom?: number;
}

// Component to fit map bounds to markers
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);
  return null;
}

export default function Map({ ports = [], routes = [], height = "320px", center = [20, 30], zoom = 3 }: MapProps) {
  const [isClient, setIsClient] = useState(false);
  const [markerPositions, setMarkerPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    setIsClient(true);
    const positions = ports.map(p => [p.latitude, p.longitude] as [number, number]);
    setMarkerPositions(positions);
  }, [ports]);

  if (!isClient) {
    return (
      <div 
        className="bg-[#0d2137]/50 backdrop-blur-sm border border-white/5 rounded-xl flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-400 text-sm">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-white/5" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%", background: "#060b1a" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Port Markers */}
        {ports.map((port) => (
          <Marker key={port.id} position={[port.latitude, port.longitude]}>
            <Popup>
              <div className="text-white bg-[#0a1628] p-2 rounded-lg">
                <p className="font-semibold">{port.name}</p>
                <p className="text-xs text-gray-400">{port.unlocode}</p>
                <p className="text-xs text-gray-400">
                  {port.latitude.toFixed(4)}, {port.longitude.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route Lines */}
        {routes.map((route) => {
          if (!route.waypoints || route.waypoints.length < 2) return null;
          const positions = route.waypoints.map(w => [w.lat, w.lon] as [number, number]);
          return (
            <Polyline
              key={route.id}
              positions={positions}
              color="#00d4ff"
              weight={3}
              opacity={0.7}
              dashArray="8 8"
            />
          );
        })}

        {/* Fit bounds */}
        {markerPositions.length > 0 && <FitBounds positions={markerPositions} />}
      </MapContainer>
    </div>
  );
}

useEffect(() => {
  console.log("Map component mounted");
}, []);