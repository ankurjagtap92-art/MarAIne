"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import { GlassCard, Button } from "@/components/ui";
import dynamic from "next/dynamic";
import api from "@/lib/api";

// ✅ Dynamically import Map
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

// ============================================
// MOCK DATA – used as fallback if API fails
// ============================================
const MOCK_ROUTE = {
  id: "mock-route",
  origin_port: "Mumbai (INMUM)",
  destination_port: "Singapore (SGSIN)",
  priority: "balanced",
  options: [
    {
      id: "mock-opt",
      route_type: "balanced",
      total_distance_nm: 1425,
      estimated_duration_hours: 89.3,
      total_fuel_tons: 27,
      fuel_cost_usd: 16200,
      weather_risk_score: 15,
      waypoints: [
        { lat: 19.0760, lon: 72.8777, sequence: 1, reason: "Origin" },
        { lat: 15.0, lon: 75.0, sequence: 2, reason: "Coastal" },
        { lat: 10.0, lon: 80.0, sequence: 3, reason: "Midpoint" },
        { lat: 5.0, lon: 95.0, sequence: 4, reason: "Strait" },
        { lat: 1.3521, lon: 103.8198, sequence: 5, reason: "Destination" },
      ],
    },
  ],
};

export default function VoyagePlannerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const routeId = params.id as string;
  const optionId = searchParams.get("optionId");

  const [route, setRoute] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setLoading(true);
        // Try to fetch real data
        const res = await api.get(`/api/v1/routes/${routeId}`);
        const data = res.data;

        // Check if we have options with waypoints
        let options = data.options || [];
        // If options exist but have no waypoints, we'll generate some later
        setRoute(data);
        setUsingMock(false);

        // Find selected option
        let selected = null;
        if (optionId) {
          selected = options.find((o: any) => o.id === optionId);
        }
        if (!selected && options.length > 0) {
          selected = options[0];
        }

        if (selected) {
          // If selected has no waypoints, generate them from origin/destination
          if (!selected.waypoints || selected.waypoints.length < 2) {
            // Generate a few waypoints along a straight line (dummy)
            // We'll use coordinates from port names or default to Mumbai->Singapore
            const coords = getPortCoords(data.origin_port, data.destination_port);
            selected.waypoints = generateWaypoints(coords.origin, coords.destination, 5);
          }
          setSelectedOption(selected);
        } else {
          // No options at all – fallback to mock
          throw new Error("No route options found");
        }

        setError("");
      } catch (err: any) {
        console.warn("Using mock data due to API error:", err);
        // Use mock data
        setUsingMock(true);
        const mock = MOCK_ROUTE;
        setRoute(mock);
        const selected = mock.options.find(o => o.id === "mock-opt");
        if (selected) {
          // Ensure waypoints exist
          if (!selected.waypoints || selected.waypoints.length < 2) {
            selected.waypoints = generateWaypoints(
              { lat: 19.0760, lon: 72.8777 },
              { lat: 1.3521, lon: 103.8198 },
              5
            );
          }
          setSelectedOption(selected);
        }
        setError("");
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [routeId, optionId]);

  // Helper to get port coords from name (hardcoded for demo)
  function getPortCoords(origin: string, dest: string) {
    const portMap: { [key: string]: { lat: number; lon: number } } = {
      "Mumbai": { lat: 19.0760, lon: 72.8777 },
      "Singapore": { lat: 1.3521, lon: 103.8198 },
      "Chennai": { lat: 13.0827, lon: 80.2707 },
      "Colombo": { lat: 6.9271, lon: 79.8612 },
    };
    const originKey = origin.split("(")[0].trim();
    const destKey = dest.split("(")[0].trim();
    const originCoords = portMap[originKey] || { lat: 20, lon: 70 };
    const destCoords = portMap[destKey] || { lat: 10, lon: 100 };
    return { origin: originCoords, destination: destCoords };
  }

  function generateWaypoints(origin: {lat: number, lon: number}, dest: {lat: number, lon: number}, count: number) {
    const waypoints = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      waypoints.push({
        lat: origin.lat + (dest.lat - origin.lat) * t,
        lon: origin.lon + (dest.lon - origin.lon) * t,
        sequence: i + 1,
        reason: i === 0 ? "Origin" : (i === count ? "Destination" : `Waypoint ${i}`),
      });
    }
    return waypoints;
  }

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

  if (error || !selectedOption) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#060b1a] p-8">
          <div className="max-w-3xl mx-auto text-center">
            <GlassCard glow className="p-12">
              <p className="text-red-400">{error || "Voyage plan not found"}</p>
              <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
              <br />
              <a href={`/routes/${routeId}`} className="mt-4 inline-block text-cyan-400 hover:underline">Back to route</a>
            </GlassCard>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Build waypoints array for the map
  const waypoints = selectedOption.waypoints || [];
  const waypointsForMap = waypoints.map((w: any) => ({ lat: w.lat, lon: w.lon }));

  // Compute step‑by‑step directions
  const steps = waypoints.length > 1 ? waypoints.map((w: any, i: number) => {
    if (i === 0) return null;
    const prev = waypoints[i-1];
    const dLat = w.lat - prev.lat;
    const dLon = w.lon - prev.lon;
    const distance = Math.sqrt(dLat*dLat + dLon*dLon) * 111; // approximate nm
    const bearing = Math.atan2(dLon, dLat) * 180 / Math.PI;
    return {
      from: i === 1 ? "Origin" : `WP ${i}`,
      to: i === waypoints.length - 1 ? "Destination" : `WP ${i+1}`,
      distance: distance.toFixed(1),
      bearing: bearing.toFixed(0),
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
              <Button variant="outline" onClick={() => window.history.back()}>
                ← Back to Route
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GlassCard glow className="p-4 border border-white/5">
                  <MapComponent
                    waypoints={waypointsForMap}
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
                      {steps.map((step, idx) => (
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