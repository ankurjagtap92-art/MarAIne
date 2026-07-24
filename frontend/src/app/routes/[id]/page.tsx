"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import { GlassCard, Badge, Button } from "@/components/ui";
import api from "@/lib/api";

interface RouteOption {
  id: string;
  route_type: string;
  total_distance_nm: number;
  estimated_duration_hours: number;
  total_fuel_tons: number;
  fuel_cost_usd: number;
  weather_risk_score: number;
  is_recommended: boolean;
  // Add more if needed
}

interface RouteResult {
  id: string;
  origin_port: string;
  destination_port: string;
  priority: string;
  status: string;
  created_at: string;
  ai_explanation?: string;
  options: RouteOption[];
}

export default function RouteResultPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = params.id as string;
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/v1/routes/${routeId}`);
        setRoute(res.data);
        setError("");
      } catch (err: any) {
        console.error("Fetch route error:", err);
        setError("Could not load route details.");
      } finally {
        setLoading(false);
      }
    };
    if (routeId) {
      fetchRoute();
    }
  }, [routeId]);

  const handleSelectRoute = (optionId: string) => {
  setSelectedOption(optionId);
  // ✅ Redirect to voyage planner (your friend will build this page)
  router.push(`/voyage/${routeId}/plan`);
};

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#060b1a] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Loading route details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !route) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#060b1a] p-8">
          <div className="max-w-3xl mx-auto text-center">
            <GlassCard glow className="p-12">
              <p className="text-red-400">{error || "Route not found"}</p>
              <a href="/routes/new" className="mt-4 inline-block text-cyan-400 hover:underline">Go back to new route</a>
            </GlassCard>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="min-h-screen bg-[#060b1a] p-8">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Route Analysis Result</h1>
            <GlassCard glow className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-ink-secondary">Origin → Destination</p>
                  <p className="text-xl font-bold text-white">{route.origin_port} → {route.destination_port}</p>
                </div>
                <Badge variant="info">{route.priority.toUpperCase()}</Badge>
              </div>

              {/* AI Explanation */}
              {route.ai_explanation && (
                <div className="mb-6 p-4 bg-cyan-400/5 border border-cyan-400/20 rounded-lg">
                  <p className="text-sm text-cyan-300 font-semibold mb-1">🤖 AI Analysis</p>
                  <p className="text-sm text-gray-300">{route.ai_explanation}</p>
                </div>
              )}

              <div className="border-t border-white/5 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  🚢 Route Options
                  <span className="text-sm font-normal text-ink-secondary">(Choose the one that fits your needs)</span>
                </h3>

                {route.options && route.options.length > 0 ? (
                  <div className="space-y-6">
                    {route.options.map((opt) => {
                      const isRecommended = opt.is_recommended;
                      const isSelected = selectedOption === opt.id;
                      return (
                        <div
                          key={opt.id}
                          className={`relative bg-white/5 rounded-xl p-6 border transition-all ${
                            isRecommended
                              ? "border-cyan-400/50 shadow-[0_0_30px_rgba(0,212,255,0.1)]"
                              : "border-white/10 hover:border-cyan-400/20"
                          }`}
                        >
                          {isRecommended && (
                            <div className="absolute -top-2 right-6">
                              <Badge variant="info" dot>⭐ Recommended</Badge>
                            </div>
                          )}
                          <div className="flex flex-wrap md:flex-nowrap justify-between items-start gap-4">
                            <div className="flex-1">
                              <p className="text-lg font-semibold text-white capitalize flex items-center gap-2">
                                {opt.route_type}
                                {opt.route_type === "fastest" && " ⚡"}
                                {opt.route_type === "cheapest" && " 💰"}
                                {opt.route_type === "safest" && " 🛡️"}
                                {opt.route_type === "balanced" && " ⚖️"}
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-sm">
                                <div>
                                  <span className="text-ink-secondary">Distance</span>
                                  <p className="text-white font-medium">{opt.total_distance_nm} nm</p>
                                </div>
                                <div>
                                  <span className="text-ink-secondary">Duration</span>
                                  <p className="text-white font-medium">{opt.estimated_duration_hours} hrs</p>
                                </div>
                                <div>
                                  <span className="text-ink-secondary">Fuel</span>
                                  <p className="text-white font-medium">{opt.total_fuel_tons} tons</p>
                                </div>
                                <div>
                                  <span className="text-ink-secondary">Cost</span>
                                  <p className="text-cyan-400 font-semibold">${opt.fuel_cost_usd.toLocaleString()}</p>
                                </div>
                                <div>
                                  <span className="text-ink-secondary">Risk</span>
                                  <p className="text-white font-medium">{opt.weather_risk_score}/100</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex-shrink-0 mt-4 md:mt-0">
                              <Button
                                variant={isRecommended ? "primary" : "outline"}
                                size="sm"
                                onClick={() => handleSelectRoute(opt.id)}
                                className={isSelected ? "bg-green-500/20 border-green-500 text-green-300" : ""}
                              >
                                {isSelected ? "✓ Selected" : "Select This Route"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-ink-secondary">No route options available.</p>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}