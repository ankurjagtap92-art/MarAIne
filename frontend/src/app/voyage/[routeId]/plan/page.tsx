"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import { GlassCard, Button } from "@/components/ui";
import dynamic from "next/dynamic";
import api from "@/lib/api";

// ✅ Dynamically import Map (ssr: false for Leaflet)
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

interface Waypoint {
  lat: number;
  lon: number;
  sequence: number;
  reason?: string;
  distance_from_start_nm?: number;
  cumulative_fuel_tons?: number;
  // add others as needed
}

interface OptionDetail {
  id: string;
  route_type: string;
  total_distance_nm: number;
  estimated_duration_hours: number;
  total_fuel_tons: number;
  fuel_cost_usd: number;
  weather_risk_score: number;
  waypoints: Waypoint[];
}

interface RouteDetail {
  id: string;
  origin_port: string;
  destination_port: string;
  priority: string;
  options: OptionDetail[];
}

export default function VoyagePlannerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const routeId = params.id as string;
  const optionId = searchParams.get("optionId");

  const [route, setRoute] = useState<RouteDetail | null>(null);
  const [selectedOption, setSelectedOption] = useState<OptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/v1/routes/${routeId}`);
        setRoute(res.data);

        // Find the selected option
        if (optionId) {
          const opt = res.data.options.find((o: OptionDetail) => o.id === optionId);
          if (opt) {
            setSelectedOption(opt);
          } else {
            // Fallback: pick the first option (or recommended)
            setSelectedOption(res.data.options[0] || null);
          }
        } else {
          // No optionId in URL – pick the first one
          setSelectedOption(res.data.options[0] || null);
        }
        setError("");
      } catch (err: any) {
        console.error("Fetch voyage plan error:", err);
        setError("Could not load voyage plan.");
      } finally {
        setLoading(false);
      }
    };
    if (routeId) {
      fetchRoute();
    }
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

  if (error || !route || !selectedOption) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#060b1a] p-8">
          <div className="max-w-3xl mx-auto text-center">
            <GlassCard glow className="p-12">
              <p className="text-red-400">{error || "Voyage plan not found"}</p>
              <a href={`/routes/${routeId}`} className="mt-4 inline-block text-cyan-400 hover:underline">Back to route</a>
            </GlassCard>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Build waypoints array for the map
  const waypoints = selectedOption.waypoints?.map(w => ({ lat: w.lat, lon: w.lon })) || [];

  // Compute step-by-step instructions (if we have at least 2 waypoints)
  const steps = waypoints.length > 1 ? waypoints.map((w, i) => {
    if (i === 0) return null;
    const prev = waypoints[i-1];
    // Simple bearing & distance (mock – we could compute real haversine)
    const dLat = w.lat - prev.lat;
    const dLon = w.lon - prev.lon;
    const distance = Math.sqrt(dLat*dLat + dLon*dLon) * 111; // rough nm
    const bearing = Math.atan2(dLon, dLat) * 180 / Math.PI;
    return {
      from: i === 1 ? "Origin" : `Waypoint ${i}`,
      to: i === waypoints.length - 1 ? "Destination" : `Waypoint ${i+1}`,
      distance: distance.toFixed(1),
      bearing: bearing.toFixed(0),
      sequence: i,
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
                  {route.origin_port} → {route.destination_port} · {selectedOption.route_type} route
                </p>
              </div>
              <Button variant="outline" onClick={() => window.history.back()}>
                ← Back to Route
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map – takes 2/3 width */}
              <div className="lg:col-span-2">
                <GlassCard glow className="p-4 border border-white/5">
                  <MapComponent
                    waypoints={waypoints}
                    height="500px"
                    center={waypoints.length > 0 ? [waypoints[0].lat, waypoints[0].lon] : [20, 30]}
                    zoom={4}
                  />
                  <p className="text-xs text-ink-muted mt-2 text-right">
                    🗺️ Route waypoints · {waypoints.length} points
                  </p>
                </GlassCard>
              </div>

              {/* Sidebar: route details + step-by-step */}
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
                            <p className="text-sm text-white">
                              {step.from} → {step.to}
                            </p>
                            <p className="text-xs text-ink-secondary">
                              {step.distance} nm · Bearing {step.bearing}°
                            </p>
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