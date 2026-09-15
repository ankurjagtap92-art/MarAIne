"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import { GlassCard, Button } from "@/components/ui";
import api from "@/lib/api";
import { ArrowLeft, Sparkles, Navigation } from "lucide-react";

interface RouteOption {
  id: string;
  route_type: string;
  total_distance_nm: number;
  estimated_duration_hours: number;
  total_fuel_tons: number;
  fuel_cost_usd: number;
  weather_risk_score: number;
  is_recommended: boolean;
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
    router.push(`/voyage/${routeId}/plan?optionId=${optionId}`);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#050811] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-xs font-mono">Loading SeaVision corridor analysis...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !route) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#050811] p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <GlassCard glow className="p-12 border-[#1b3356]">
              <p className="text-red-400">{error || "Route not found"}</p>
              <Link href="/routes/new" className="mt-4 inline-block text-orange-400 hover:underline">
                Simulate a new voyage
              </Link>
            </GlassCard>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="min-h-screen bg-[#050811] p-6 md:p-8 text-white">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
              <Link
                href="/routes"
                className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-orange-400" />
                <span>Back to Saved Routes</span>
              </Link>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 rounded-full">
                SeaVision Analysis Completed
              </span>
            </div>

            <div className="rounded-2xl border border-[#1b3356] bg-[#091322]/85 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
                <div>
                  <p className="text-xs font-mono text-orange-400 uppercase tracking-wider mb-1">
                    Passage Corridor
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                    <span>{route.origin_port}</span>
                    <span className="text-orange-400 font-normal text-lg">➔</span>
                    <span>{route.destination_port}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-xs font-semibold uppercase">
                    Priority: {route.priority}
                  </span>
                </div>
              </div>

              {route.ai_explanation && (
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 via-cyan-500/5 to-transparent border border-orange-500/20 rounded-xl">
                  <p className="text-xs text-orange-400 font-mono font-semibold mb-1.5 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span>SeaVision Nautical AI Recommendation</span>
                  </p>
                  <p className="text-sm text-gray-200 leading-relaxed">{route.ai_explanation}</p>
                </div>
              )}

              <div>
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  <span>Calculated Route Strategies</span>
                  <span className="text-xs font-normal text-gray-400">(Select profile to lock voyage plan)</span>
                </h3>

                {route.options && route.options.length > 0 ? (
                  <div className="space-y-4">
                    {route.options.map((opt) => {
                      const isRecommended = opt.is_recommended;
                      const isSelected = selectedOption === opt.id;
                      return (
                        <div
                          key={opt.id}
                          className={`relative rounded-xl p-5 border transition-all ${
                            isRecommended
                              ? "bg-[#0c1b30] border-orange-500/50 shadow-[0_0_30px_rgba(255,122,24,0.15)]"
                              : "bg-white/5 border-white/10 hover:border-cyan-400/30"
                          }`}
                        >
                          {isRecommended && (
                            <div className="absolute -top-2.5 right-6">
                              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-black font-bold text-[10px] font-mono tracking-wider shadow-md">
                                ★ RECOMMENDED PASSAGE
                              </span>
                            </div>
                          )}

                          <div className="flex flex-wrap md:flex-nowrap justify-between items-start gap-4">
                            <div className="flex-1">
                              <p className="text-base font-bold text-white capitalize flex items-center gap-2">
                                <span className={isRecommended ? "text-orange-400" : "text-cyan-400"}>
                                  {opt.route_type} Corridor
                                </span>
                              </p>

                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3 text-xs font-mono">
                                <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                                  <span className="text-gray-400 text-[10px] block">Distance</span>
                                  <p className="text-white font-bold mt-0.5">{opt.total_distance_nm} NM</p>
                                </div>
                                <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                                  <span className="text-gray-400 text-[10px] block">Duration</span>
                                  <p className="text-white font-bold mt-0.5">{opt.estimated_duration_hours} hrs</p>
                                </div>
                                <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                                  <span className="text-gray-400 text-[10px] block">Fuel Burn</span>
                                  <p className="text-emerald-400 font-bold mt-0.5">{opt.total_fuel_tons} tons</p>
                                </div>
                                <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                                  <span className="text-gray-400 text-[10px] block">Bunker Cost</span>
                                  <p className="text-cyan-400 font-bold mt-0.5">${opt.fuel_cost_usd.toLocaleString()}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                                  <span className="text-gray-400 text-[10px] block">Weather Risk</span>
                                  <p className="text-white font-bold mt-0.5">{opt.weather_risk_score}/100</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex-shrink-0 mt-4 md:mt-2">
                              <Button
                                variant={isRecommended ? "primary" : "outline"}
                                size="sm"
                                onClick={() => handleSelectRoute(opt.id)}
                                className={isSelected ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : ""}
                              >
                                {isSelected ? "✓ Confirmed" : "Lock This Route ➔"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No route options available.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}
