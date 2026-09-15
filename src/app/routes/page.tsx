"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { GlassCard, Button } from "@/components/ui";
import api from "@/lib/api";
import { Compass, Navigation, Plus, ArrowRight, Fuel, Clock } from "lucide-react";

interface Waypoint {
  sequence: number;
  lat: number;
  lon: number;
  reason?: string;
}

interface RouteOption {
  id: string;
  route_type: string;
  total_distance_nm: number;
  estimated_duration_hours: number;
  total_fuel_tons: number;
  fuel_cost_usd: number;
  weather_risk_score: number;
  is_recommended: boolean;
  waypoints?: Waypoint[];
}

interface RouteAnalysis {
  id: string;
  user_id: string;
  vessel_id: string;
  origin_port: string;
  destination_port: string;
  priority: string;
  status: string;
  ai_explanation?: string;
  created_at: string;
  options: RouteOption[];
}

export default function RoutesListPage() {
  const [routes, setRoutes] = useState<RouteAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/v1/routes");
        if (res.data && Array.isArray(res.data)) {
          setRoutes(res.data);
        }
      } catch (err: any) {
        console.error("Fetch routes error:", err);
        setError("Could not load analyzed sea routes.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#050811] text-white selection:bg-orange-500/30 selection:text-orange-200">
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-orange-400 uppercase tracking-wider mb-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Fairway Optimization History</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Saved Sea Corridors & Simulations
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Explore calculated multi-objective routes with weather risk modeling and fuel estimations
              </p>
            </div>

            <Link href="/routes/new">
              <Button
                id="btn-simulate-new-route"
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
              >
                Simulate New Route
              </Button>
            </Link>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono text-gray-400">Loading maritime corridors...</p>
            </div>
          ) : routes.length === 0 ? (
            <GlassCard flat className="p-12 text-center border-white/5">
              <Navigation className="w-12 h-12 text-orange-400/60 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">No routes analyzed yet</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
                Run your first multi-objective voyage simulation between global ports to receive optimized fuel and risk-minimized waypoints.
              </p>
              <Link href="/routes/new">
                <Button variant="primary">Start Route Analysis</Button>
              </Link>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {routes.map((route) => {
                const recommended = route.options?.find((o) => o.is_recommended) || route.options?.[0];
                return (
                  <GlassCard
                    key={route.id}
                    flat
                    className="p-6 border-[#1b3356]/70 flex flex-col justify-between hover:border-orange-500/40 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-semibold">
                          Priority: {route.priority}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {new Date(route.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white flex items-center gap-2 group-hover:text-orange-400 transition">
                        <span>{route.origin_port}</span>
                        <span className="text-orange-400 font-normal">➔</span>
                        <span>{route.destination_port}</span>
                      </h3>

                      {recommended && (
                        <div className="grid grid-cols-3 gap-2 mt-4 text-xs font-mono">
                          <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                            <span className="text-gray-400 text-[10px] block flex items-center gap-1">
                              <Navigation className="w-3 h-3 text-cyan-400" /> Track
                            </span>
                            <p className="text-white font-bold mt-1">{recommended.total_distance_nm} NM</p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                            <span className="text-gray-400 text-[10px] block flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" /> Duration
                            </span>
                            <p className="text-white font-bold mt-1">{recommended.estimated_duration_hours} hrs</p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                            <span className="text-gray-400 text-[10px] block flex items-center gap-1">
                              <Fuel className="w-3 h-3 text-emerald-400" /> Fuel
                            </span>
                            <p className="text-emerald-400 font-bold mt-1">{recommended.total_fuel_tons} t</p>
                          </div>
                        </div>
                      )}

                      {route.ai_explanation && (
                        <p className="text-xs text-gray-300 mt-4 line-clamp-2 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/5">
                          {route.ai_explanation}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs font-mono text-cyan-400">
                        {route.options?.length || 0} Corridor Strategies
                      </span>
                      <Link
                        href={`/routes/${route.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-400 hover:text-white transition group/link"
                      >
                        <span>Inspect Analysis</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
