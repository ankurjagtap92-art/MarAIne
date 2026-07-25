"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import { GlassCard, Button } from "@/components/ui";
import dynamic from "next/dynamic";
import api from "@/lib/api";

const MapComponent = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-[#0d2137]/50 rounded-xl flex items-center justify-center border border-white/5">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-gray-400 text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

const PORT_COORDS: { [key: string]: { lat: number; lon: number } } = {
  "Mumbai": { lat: 19.0760, lon: 72.8777 },
  "Singapore": { lat: 1.3521, lon: 103.8198 },
  "Chennai": { lat: 13.0827, lon: 80.2707 },
  "Colombo": { lat: 6.9271, lon: 79.8612 },
  "Calcutta": { lat: 22.5726, lon: 88.3639 },
  "Goa": { lat: 15.2993, lon: 73.7391 },
  "Gujrat": { lat: 21.1702, lon: 72.8311 },
  "Dubai": { lat: 25.2048, lon: 55.2708 },
  "Chicago": { lat: 41.8781, lon: -87.6298 },
  "New York": { lat: 40.7128, lon: -74.0060 },
  "London": { lat: 51.5074, lon: -0.1278 },
  "Rotterdam": { lat: 51.9225, lon: 4.4792 },
  "Shanghai": { lat: 31.2304, lon: 121.4737 },
  "Tokyo": { lat: 35.6762, lon: 139.6503 },
  "Sydney": { lat: -33.8688, lon: 151.2093 },
  "Cape Town": { lat: -33.9249, lon: 18.4241 },
};

function getCoords(portName: string) {
  if (!portName) return { lat: 20, lon: 80 };
  const exact = PORT_COORDS[portName.trim()];
  if (exact) return exact;
  const key = Object.keys(PORT_COORDS).find(k =>
    portName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(portName.toLowerCase())
  );
  return key ? PORT_COORDS[key] : { lat: 20, lon: 80 };
}

const SEA_CORRIDORS: Record<string, { lat: number; lon: number }[]> = {
  "Mumbai-Singapore": [
    { lat: 19.0760, lon: 72.8777 },
    { lat: 15.0, lon: 73.0 },
    { lat: 10.5, lon: 75.5 },
    { lat: 7.5, lon: 77.5 },
    { lat: 5.5, lon: 80.5 },
    { lat: 5.0, lon: 85.0 },
    { lat: 4.5, lon: 92.0 },
    { lat: 4.0, lon: 98.0 },
    { lat: 1.3521, lon: 103.8198 },
  ],
  "Chennai-Singapore": [
    { lat: 13.0827, lon: 80.2707 },
    { lat: 10.5, lon: 80.5 },
    { lat: 7.5, lon: 81.0 },
    { lat: 5.5, lon: 85.0 },
    { lat: 4.5, lon: 92.0 },
    { lat: 4.0, lon: 98.0 },
    { lat: 1.3521, lon: 103.8198 },
  ],
  "Mumbai-Dubai": [
    { lat: 19.0760, lon: 72.8777 },
    { lat: 20.0, lon: 68.0 },
    { lat: 22.0, lon: 62.0 },
    { lat: 24.0, lon: 58.0 },
    { lat: 25.2048, lon: 55.2708 },
  ],
};

function getSeaCorridor(origin: string, dest: string) {
  const key1 = `${origin}-${dest}`;
  const key2 = `${dest}-${origin}`;
  let corridor = SEA_CORRIDORS[key1] || SEA_CORRIDORS[key2];
  if (corridor) {
    if (SEA_CORRIDORS[key2]) corridor = [...corridor].reverse();
    return corridor;
  }
  return null;
}

function greatCircleInterpolate(
  origin: { lat: number; lon: number },
  dest: { lat: number; lon: number },
  numPoints: number = 5
) {
  const lat1 = origin.lat * Math.PI / 180;
  const lon1 = origin.lon * Math.PI / 180;
  const lat2 = dest.lat * Math.PI / 180;
  const lon2 = dest.lon * Math.PI / 180;
  const dLon = lon2 - lon1;
  const d = Math.acos(
    Math.sin(lat1) * Math.sin(lat2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.cos(dLon)
  );
  if (d < 0.001) {
    const wps = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      wps.push({
        lat: origin.lat + (dest.lat - origin.lat) * t,
        lon: origin.lon + (dest.lon - origin.lon) * t,
      });
    }
    return wps;
  }
  const waypoints = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const A = Math.sin((1 - t) * d) / Math.sin(d);
    const B = Math.sin(t * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    const lat = Math.atan2(z, Math.sqrt(x*x + y*y));
    const lon = Math.atan2(y, x);
    waypoints.push({
      lat: lat * 180 / Math.PI,
      lon: lon * 180 / Math.PI,
    });
  }
  return waypoints;
}

function generateSeaRouteWaypoints(
  originName: string,
  destName: string,
  numPointsPerSegment: number = 3
) {
  const originCoords = getCoords(originName);
  const destCoords = getCoords(destName);
  const corridor = getSeaCorridor(originName, destName);
  if (corridor) {
    let allWps: { lat: number; lon: number }[] = [];
    for (let i = 0; i < corridor.length - 1; i++) {
      const seg = greatCircleInterpolate(corridor[i], corridor[i+1], numPointsPerSegment);
      if (i === 0) allWps = allWps.concat(seg);
      else allWps = allWps.concat(seg.slice(1));
    }
    if (allWps.length < 2) allWps = [originCoords, destCoords];
    return allWps.map((p, idx) => ({
      lat: p.lat,
      lon: p.lon,
      sequence: idx + 1,
      reason: idx === 0 ? "Origin" : (idx === allWps.length - 1 ? "Destination" : `Waypoint ${idx}`),
    }));
  }
  const midLat = (originCoords.lat + destCoords.lat) / 2;
  const midLon = (originCoords.lon + destCoords.lon) / 2;
  const seaMid = { lat: midLat, lon: midLon + 3.0 };
  const wps = greatCircleInterpolate(originCoords, seaMid, 3);
  const wps2 = greatCircleInterpolate(seaMid, destCoords, 3);
  const combined = [...wps, ...wps2.slice(1)];
  return combined.map((p, idx) => ({
    lat: p.lat,
    lon: p.lon,
    sequence: idx + 1,
    reason: idx === 0 ? "Origin" : (idx === combined.length - 1 ? "Destination" : `Waypoint ${idx}`),
  }));
}

export default function VoyagePlannerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const routeId = params.id as string;
  const optionId = searchParams.get("optionId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [route, setRoute] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [usingMock, setUsingMock] = useState(false);

  // ✅ Download CSV coordinates
  const downloadCoordinates = () => {
    if (!selectedOption || !selectedOption.waypoints || selectedOption.waypoints.length < 2) {
      alert("No waypoints available.");
      return;
    }
    const waypoints = selectedOption.waypoints;
    let csv = "Sequence,Latitude,Longitude,Reason\n";
    waypoints.forEach((w: any) => {
      csv += `${w.sequence},${w.lat},${w.lon},${w.reason || ""}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voyage_${route?.origin_port || "origin"}_to_${route?.destination_port || "dest"}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        setUsingMock(false);

        const fetchPromise = api.get(`/api/v1/routes/${routeId}`);
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error("Request timed out")), 3000);
        });

        let data;
        try {
          const res = await Promise.race([fetchPromise, timeoutPromise]) as any;
          clearTimeout(timeoutId);
          data = res.data;
        } catch (err) {
          clearTimeout(timeoutId);
          console.warn("API fetch failed – using fallback data.");
          throw err;
        }

        if (!isMounted) return;
        setRoute(data);

        let selected = null;
        if (optionId) {
          selected = data.options?.find((o: any) => o.id === optionId);
        }
        if (!selected && data.options && data.options.length > 0) {
          selected = data.options[0];
        }

        if (!selected) {
          setUsingMock(true);
          const origin = data.origin_port || "Mumbai";
          const dest = data.destination_port || "Singapore";
          const waypoints = generateSeaRouteWaypoints(origin, dest, 4);
          selected = {
            id: "dummy-" + Date.now(),
            route_type: data.priority || "balanced",
            total_distance_nm: 1500,
            estimated_duration_hours: 90,
            total_fuel_tons: 30,
            fuel_cost_usd: 18000,
            weather_risk_score: 15,
            waypoints: waypoints,
          };
        }

        if (selected && (!selected.waypoints || selected.waypoints.length < 2)) {
          setUsingMock(true);
          const origin = data.origin_port || "Mumbai";
          const dest = data.destination_port || "Singapore";
          selected.waypoints = generateSeaRouteWaypoints(origin, dest, 4);
        }

        setSelectedOption(selected);
      } catch (err) {
        console.error("Error loading voyage:", err);
        if (isMounted) {
          setError("Could not load route. Showing demo data.");
          setUsingMock(true);
          const origin = "Mumbai";
          const dest = "Singapore";
          const waypoints = generateSeaRouteWaypoints(origin, dest, 4);
          setRoute({ origin_port: origin, destination_port: dest, priority: "balanced" });
          setSelectedOption({
            id: "fallback-" + Date.now(),
            route_type: "balanced",
            total_distance_nm: 1425,
            estimated_duration_hours: 89.3,
            total_fuel_tons: 27,
            fuel_cost_usd: 16200,
            weather_risk_score: 15,
            waypoints: waypoints,
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [routeId, optionId]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#060b1a] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Loading voyage plan...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !selectedOption) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#060b1a] p-8">
          <div className="max-w-3xl mx-auto text-center">
            <GlassCard glow className="p-12">
              <p className="text-red-400">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
              <br />
              <a href={`/routes/${routeId}`} className="mt-4 inline-block text-cyan-400 hover:underline">
                Back to route
              </a>
            </GlassCard>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!selectedOption) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#060b1a] p-8">
          <div className="max-w-3xl mx-auto text-center">
            <GlassCard glow className="p-12">
              <p className="text-ink-secondary">No route data available.</p>
              <a href={`/routes/${routeId}`} className="mt-4 inline-block text-cyan-400 hover:underline">
                Back to route
              </a>
            </GlassCard>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const waypoints = selectedOption.waypoints || [];
  const waypointsForMap = waypoints.map((w: any) => ({ lat: w.lat, lon: w.lon }));

  const steps = waypoints.length > 1 ? waypoints.map((w: any, i: number) => {
    if (i === 0) return null;
    const prev = waypoints[i-1];
    const R = 6371;
    const dLat = (w.lat - prev.lat) * Math.PI / 180;
    const dLon = (w.lon - prev.lon) * Math.PI / 180;
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) +
              Math.cos(prev.lat * Math.PI/180) * Math.cos(w.lat * Math.PI/180) *
              Math.sin(dLon/2)*Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance_km = R * c;
    const distance_nm = distance_km / 1.852;
    const bearing = Math.atan2(
      Math.sin(dLon) * Math.cos(w.lat * Math.PI/180),
      Math.cos(prev.lat * Math.PI/180) * Math.sin(w.lat * Math.PI/180) -
      Math.sin(prev.lat * Math.PI/180) * Math.cos(w.lat * Math.PI/180) * Math.cos(dLon)
    ) * 180 / Math.PI;
    return {
      from: i === 1 ? "Origin" : `WP ${i}`,
      to: i === waypoints.length - 1 ? "Destination" : `WP ${i+1}`,
      distance: distance_nm.toFixed(1),
      bearing: ((bearing % 360) + 360) % 360 === 0 ? "000" : (((bearing % 360) + 360) % 360).toFixed(0),
    };
  }).filter(Boolean) : [];

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="min-h-screen bg-[#060b1a] p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white">⚓ Voyage Planner</h1>
                <p className="text-sm text-ink-secondary">
                  {route?.origin_port || "Origin"} → {route?.destination_port || "Destination"} · {selectedOption.route_type} route
                  {usingMock && <span className="ml-2 text-yellow-400 text-xs">(demo data)</span>}
                </p>
              </div>
              <div className="flex gap-2">
                {/* ✅ Download Coordinates Button */}
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={downloadCoordinates}
                  className="flex items-center gap-2"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4v16h16" />
                    <path d="M8 8l4 4-4 4" />
                    <path d="M12 12h8" />
                  </svg>
                  Download Coordinates
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                  ← Back
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GlassCard glow className="p-4 border border-white/5">
                  <MapComponent
                    waypoints={waypointsForMap}
                    routes={[{
                      id: 'voyage-route',
                      origin_port: route?.origin_port || 'Origin',
                      destination_port: route?.destination_port || 'Destination',
                      waypoints: waypointsForMap
                    }]}
                    height="500px"
                    center={waypointsForMap.length > 0 ? [waypointsForMap[0].lat, waypointsForMap[0].lon] : [20, 30]}
                    zoom={4}
                  />
                  <p className="text-xs text-ink-muted mt-2 text-right">
                    🗺️ {waypointsForMap.length} waypoints · {selectedOption.total_distance_nm} nm total
                  </p>
                </GlassCard>
              </div>

              <div className="lg:col-span-1 space-y-4">
                <GlassCard glow className="p-4 border border-white/5">
                  <h3 className="text-sm font-semibold text-white mb-3">Route Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-ink-secondary">Distance:</span> <span className="text-white">{selectedOption.total_distance_nm} nm</span></div>
                    <div><span className="text-ink-secondary">Duration:</span> <span className="text-white">{selectedOption.estimated_duration_hours} hrs</span></div>
                    <div><span className="text-ink-secondary">Fuel:</span> <span className="text-white">{selectedOption.total_fuel_tons} tons</span></div>
                    <div><span className="text-ink-secondary">Cost:</span> <span className="text-cyan-400 font-semibold">${selectedOption.fuel_cost_usd.toLocaleString()}</span></div>
                    <div><span className="text-ink-secondary">Risk:</span> <span className="text-white">{selectedOption.weather_risk_score}/100</span></div>
                  </div>
                </GlassCard>

                {steps.length > 0 && (
                  <GlassCard glow className="p-4 border border-white/5 max-h-[300px] overflow-y-auto">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      🧭 Directions
                      <span className="text-xs font-normal text-ink-secondary">({steps.length} legs)</span>
                    </h3>
                    <div className="space-y-2">
                      {steps.map((step: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 border-b border-white/5 pb-2 last:border-0">
                          <div className="w-6 h-6 rounded-full bg-cyan-400/20 flex items-center justify-center text-xs font-bold text-cyan-300 flex-shrink-0">
                            {idx+1}
                          </div>
                          <div>
                            <p className="text-sm text-white">{step.from} → {step.to}</p>
                            <p className="text-xs text-ink-secondary">{step.distance} nm · Bearing {step.bearing}°</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}