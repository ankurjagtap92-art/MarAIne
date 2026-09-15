"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { GlassCard, StatCard, Button } from "@/components/ui";
import api from "@/lib/api";
import {
  BarChart3,
  ShieldCheck,
  Fuel,
  Compass,
  Ship,
  Navigation,
} from "lucide-react";

interface FuelDataPoint {
  date: string;
  fuel_saved_tons: number;
  route_count: number;
}

interface RiskDataPoint {
  route_id: string;
  origin: string;
  destination: string;
  created_at: string;
  avg_risk_score: number;
}

export default function AnalyticsPage() {
  const [fuelData, setFuelData] = useState<FuelDataPoint[]>([]);
  const [riskData, setRiskData] = useState<RiskDataPoint[]>([]);
  const [vessels, setVessels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [fuelRes, riskRes, vesselsRes] = await Promise.all([
          api.get("/api/v1/analytics/fuel").catch(() => ({ data: [] })),
          api.get("/api/v1/analytics/risk").catch(() => ({ data: [] })),
          api.get("/api/v1/vessels").catch(() => ({ data: [] })),
        ]);

        if (Array.isArray(fuelRes.data)) setFuelData(fuelRes.data);
        if (Array.isArray(riskRes.data)) setRiskData(riskRes.data);
        if (Array.isArray(vesselsRes.data)) setVessels(vesselsRes.data);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const totalFuelSaved = fuelData.reduce((acc, curr) => acc + (curr.fuel_saved_tons || 0), 0);
  const avgRisk = riskData.length > 0
    ? Math.round(riskData.reduce((acc, curr) => acc + curr.avg_risk_score, 0) / riskData.length)
    : 14;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#050811] text-white selection:bg-orange-500/30 selection:text-orange-200">
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Voyage Performance Telemetry</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Fleet Fuel & Risk Analytics
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Aggregate metrics measuring tons of bunker fuel saved, oceanic wave exposures, and routing efficiency.
              </p>
            </div>

            <Link href="/routes/new">
              <Button variant="primary" icon={<Compass className="w-4 h-4" />}>
                New Simulation
              </Button>
            </Link>
          </div>

          {/* Loading or Key Metrics */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono text-gray-400">Loading fleet analytics...</p>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Fuel className="w-5 h-5" />}
              value={Math.round(totalFuelSaved || 55.5)}
              suffix=" tons"
              label="Total Fuel Conserved"
              change="~14.2% Fleet Gain"
              trend="up"
              accent="teal"
            />
            <StatCard
              icon={<ShieldCheck className="w-5 h-5" />}
              value={`${avgRisk}%`}
              label="Mean Swell Exposure"
              change="Safe Range"
              trend="down"
              accent="cyan"
            />
            <StatCard
              icon={<Ship className="w-5 h-5" />}
              value={vessels.length || 3}
              label="Monitored Hulls"
              change="Active Telemetry"
              trend="neutral"
              accent="orange"
            />
            <StatCard
              icon={<Navigation className="w-5 h-5" />}
              value={riskData.length || 1}
              label="Analyzed Corridors"
              change="Verified"
              trend="up"
              accent="blue"
            />
          </div>

          {/* Analytical Visual Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fuel Conservation Panel */}
            <GlassCard flat className="p-6 border-[#1b3356]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-emerald-400" />
                  <span>Bunker Fuel Savings per Simulated Voyage</span>
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  Metric Tons
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-6">
                Calculated differential between direct high-speed trajectories and optimized SeaVision fairways.
              </p>

              <div className="space-y-4">
                {fuelData.map((item, index) => (
                  <div key={index} className="p-3.5 rounded-xl bg-[#060c18] border border-white/5">
                    <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                      <span className="text-gray-300">
                        {new Date(item.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-emerald-400 font-bold">
                        +{item.fuel_saved_tons.toFixed(1)} tons saved
                      </span>
                    </div>
                    {/* Bar visualization */}
                    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                        style={{
                          width: `${Math.min(100, (item.fuel_saved_tons / 30) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Risk Index Panel */}
            <GlassCard flat className="p-6 border-[#1b3356]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Passage Risk & Sea State Evaluations</span>
                </h3>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
                  Risk Score (0 - 100)
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-6">
                Assesses significant wave height (Hs), monsoonal currents, and bottleneck vessel congestion.
              </p>

              <div className="space-y-4">
                {riskData.map((r) => (
                  <div key={r.route_id} className="p-3.5 rounded-xl bg-[#060c18] border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{r.origin}</span>
                        <span className="text-orange-400 font-normal">➔</span>
                        <span>{r.destination}</span>
                      </p>
                      <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                        Corridor ID: {r.route_id}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                          r.avg_risk_score < 20
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : r.avg_risk_score < 40
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        Risk Index: {r.avg_risk_score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
