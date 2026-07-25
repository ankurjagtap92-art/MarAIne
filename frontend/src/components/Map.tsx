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

interface Waypoint {
  lat: number;
  lon: number;
  label?: string;
}

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
  waypoints?: Waypoint[];
  height?: string;
  center?: [number, number];
  zoom?: number;
}

// Component to fit map bounds to positions
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

export default function Map({
  ports = [],
  routes = [],
  waypoints = [],
  height = "320px",
  center = [20, 30],
  zoom = 3,
}: MapProps) {
  const [isClient, setIsClient] = useState(false);
  const [allPositions, setAllPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    setIsClient(true);
    const positions: [number, number][] = [];
    ports.forEach((p) => positions.push([p.latitude, p.longitude]));
    waypoints.forEach((w) => positions.push([w.lat, w.lon]));
    setAllPositions(positions);
  }, [ports, waypoints]);

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

  // ✅ Build polyline positions from ALL waypoints in order
  const polylinePositions = waypoints.map((w) => [w.lat, w.lon] as [number, number]);

  // ✅ For routes prop, also build polyline
  const routePolylines = routes.map((route) => {
    if (!route.waypoints || route.waypoints.length < 2) return null;
    return route.waypoints.map((w) => [w.lat, w.lon] as [number, number]);
  }).filter(Boolean);

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

        {/* ✅ Waypoints Polyline – connects ALL waypoints in order */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            color="#7c5cff"
            weight={4}
            opacity={0.9}
            dashArray={null}
            smoothFactor={1}
          />
        )}

        {/* Route Polylines from routes prop */}
        {routePolylines.map((positions, idx) => {
          if (!positions || positions.length < 2) return null;
          return (
            <Polyline
              key={idx}
              positions={positions}
              color="#00d4ff"
              weight={3}
              opacity={0.7}
              dashArray="8 8"
            />
          );
        })}

        {/* Waypoint Markers with sequence numbers */}
        {waypoints.map((w, idx) => (
          <Marker
            key={idx}
            position={[w.lat, w.lon]}
            icon={L.divIcon({
              className: "bg-cyan-400 text-black font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs border-2 border-white shadow-lg",
              html: `${idx + 1}`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
          >
            <Popup>
              <div className="text-white bg-[#0a1628] p-2 rounded-lg">
                <p className="font-semibold">{w.label || `Waypoint ${idx + 1}`}</p>
                <p className="text-xs text-gray-400">
                  Lat: {w.lat.toFixed(4)}, Lon: {w.lon.toFixed(4)}
                </p>
                {idx === 0 && <p className="text-xs text-cyan-400">📍 Origin</p>}
                {idx === waypoints.length - 1 && <p className="text-xs text-cyan-400">🏁 Destination</p>}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Fit bounds */}
        {allPositions.length > 0 && <FitBounds positions={allPositions} />}
      </MapContainer>
    </div>
  );
}