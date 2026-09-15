"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

interface Port {
  id: string;
  name: string;
  unlocode?: string;
  latitude: number;
  longitude: number;
}

interface Waypoint {
  lat: number;
  lon: number;
}

interface Route {
  id: string;
  origin_port?: string;
  destination_port?: string;
  waypoints?: Waypoint[];
}

interface MapProps {
  ports?: Port[];
  routes?: Route[];
  height?: string;
  center?: [number, number];
  zoom?: number;
}

export default function Map({
  ports = [],
  routes = [],
  height = "360px",
  center = [12.0, 85.0],
  zoom = 4,
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: false,
    });
    mapInstanceRef.current = map;

    // Dark-themed tile layer (CartoDB Dark Matter)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 18,
      subdomains: "abcd",
    }).addTo(map);

    // Port Marker Icon generator
    const createPortIcon = (name: string) =>
      L.divIcon({
        className: "custom-port-marker",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="width: 14px; height: 14px; background: #ff7a18; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 12px #ff7a18;"></div>
            <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); white-space: nowrap; background: rgba(5,8,17,0.85); border: 1px solid rgba(255,122,24,0.4); padding: 1px 6px; border-radius: 4px; font-size: 10px; font-family: monospace; color: #ff9d42;">
              ${name}
            </div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

    const createWaypointIcon = () =>
      L.divIcon({
        className: "custom-waypoint-marker",
        html: `
          <div style="width: 8px; height: 8px; background: #00d8ff; border: 1.5px solid #ffffff; border-radius: 50%; box-shadow: 0 0 8px #00d8ff;"></div>
        `,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

    // Add ports
    ports.forEach((port) => {
      if (typeof port.latitude === "number" && typeof port.longitude === "number") {
        const marker = L.marker([port.latitude, port.longitude], {
          icon: createPortIcon(port.name),
        }).addTo(map);

        marker.bindPopup(`
          <div style="color: #050811; font-family: sans-serif; font-size: 12px; padding: 4px;">
            <strong style="color: #d95e09;">${port.name}</strong><br />
            ${port.unlocode ? `UN/LOCODE: ${port.unlocode}<br />` : ""}
            Lat: ${port.latitude.toFixed(4)}, Lon: ${port.longitude.toFixed(4)}
          </div>
        `);
      }
    });

    // Add routes & waypoints
    routes.forEach((route) => {
      if (route.waypoints && route.waypoints.length > 1) {
        const latLngs: [number, number][] = route.waypoints.map((wp) => [wp.lat, wp.lon]);

        // Draw Polyline for navigation track
        L.polyline(latLngs, {
          color: "#ff7a18",
          weight: 3,
          opacity: 0.85,
          dashArray: "6, 8",
        }).addTo(map);

        // Add small glowing dots at each waypoint
        route.waypoints.slice(1, -1).forEach((wp) => {
          L.marker([wp.lat, wp.lon], { icon: createWaypointIcon() }).addTo(map);
        });
      }
    });

    // Fit bounds if both ports and routes are present
    const allCoords: [number, number][] = [];
    ports.forEach((p) => allCoords.push([p.latitude, p.longitude]));
    routes.forEach((r) => r.waypoints?.forEach((w) => allCoords.push([w.lat, w.lon])));
    if (allCoords.length > 1) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [ports, routes, center, zoom]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: "100%", borderRadius: "12px", overflow: "hidden" }}
      className="border border-[#1b3356]/60 shadow-inner z-0"
    />
  );
}
