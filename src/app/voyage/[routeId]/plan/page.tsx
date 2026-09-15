"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { GlassCard, Button } from "@/components/ui";
import api from "@/lib/api";
import {
  ArrowLeft,
  Navigation,
  Download,
  CheckCircle2,
  MapPin,
  Clock,
  Fuel,
  DollarSign,
} from "lucide-react";

interface Waypoint {
  sequence: number;
  lat: number;
  lon: number;
  reason?: string;
}

interface SelectedOption {
  id: string;
  route_type: string;
  total_distance_nm: number;
  estimated_duration_hours: number;
  total_fuel_tons: number;
  fuel_cost_usd: number;
  weather_risk_score: number;
  waypoints?: Waypoint[];
}

interface VoyagePlanData {
  route_id: string;
  origin_port: string;
  destination_port: string;
  selected_option: SelectedOption;
  status: string;
  created_at: string;
}

export default function VoyagePlanPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const routeId = params.routeId as string;
  const optionId = searchParams.get("optionId");

  const [plan, setPlan] = useState<VoyagePlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exported, setExported] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/api/v1/voyage/${routeId}/plan${optionId ? `?optionId=${optionId}` : ""}`
        );
        setPlan(res.data);
      } catch (err: any) {
        console.error("Fetch voyage plan error:", err);
        setError("Could not load voyage plan.");
      } finally {
        setLoading(false);
      }
    };
    if (routeId) fetchPlan();
  }, [routeId, optionId]);

  const handleExportWaypoints = () => {
    if (!plan?.selected_option?.waypoints) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Sequence,Latitude,Longitude,Description\n" +
      plan.selected_option.waypoints
        .map((w) => `${w.sequence},${w.lat},${w.lon},"${w.reason || "Waypoint"}"`)
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `voyage-plan-${plan.origin_port}-${plan.destination_port}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExported(true);
    setTimeout(() => setExported(false), 4000);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#050811] flex items-center justify-center text-white">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono text-gray-400">Locking ECDIS passage plan...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !plan) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#050811] p-8 text-white">
          <div className="max-w-xl mx-auto text-center py-20">
            <p className="text-red-400 mb-4">{error || "Voyage plan not found."}</p>
            <Link href="/routes" className="text-orange-400 hover:underline text-sm">
              Return to routes overview
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const opt = plan.selected_option;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#050811] text-white selection:bg-orange-500/30 selection:text-orange-200">
        <Navbar />

        <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
          {/* Back link */}
          <div className="flex items-center justify-between">
            <Link
              href={`/routes/${plan.route_id}`}
              className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-orange-400" />
              <span>Back to Analysis</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Voyage Plan Locked for Bridge Navigation</span>
            </span>
          </div>

          {/* Header Card */}
          <GlassCard flat className="p-6 sm:p-8 border-[#1b3356]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
              <div>
                <p className="text-xs font-mono text-orange-400 uppercase tracking-wider mb-1">
                  Commercial ECDIS Passage Record
                </p>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <span>{plan.origin_port}</span>
                  <span className="text-orange-400 font-normal">➔</span>
                  <span>{plan.destination_port}</span>
                </h1>
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  Corridor Strategy: <span className="text-cyan-400 capitalize">{opt?.route_type || "Balanced"}</span>
                </p>
              </div>

              <Button
                variant="primary"
                icon={<Download className="w-4 h-4" />}
                onClick={handleExportWaypoints}
              >
                {exported ? "Downloaded CSV" : "Export Waypoints (CSV)"}
              </Button>
            </div>

            {/* Metrics */}
            {opt && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-gray-400 text-[10px] block flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-cyan-400" /> Total Track
                  </span>
                  <p className="text-white text-base font-bold mt-1">{opt.total_distance_nm} NM</p>
                </div>
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-gray-400 text-[10px] block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Passage Time
                  </span>
                  <p className="text-white text-base font-bold mt-1">{opt.estimated_duration_hours} hrs</p>
                </div>
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-gray-400 text-[10px] block flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-emerald-400" /> Bunker Burn
                  </span>
                  <p className="text-emerald-400 text-base font-bold mt-1">{opt.total_fuel_tons} tons</p>
                </div>
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-gray-400 text-[10px] block flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-cyan-400" /> Bunker Expense
                  </span>
                  <p className="text-cyan-400 text-base font-bold mt-1">${opt.fuel_cost_usd?.toLocaleString()}</p>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Waypoints Table */}
          <GlassCard flat className="p-6 border-[#1b3356]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400" />
                <span>Navigation Waypoint Schedule</span>
              </h3>
              <span className="text-xs font-mono text-gray-400">
                WGS-84 Geodetic Decimal Degrees
              </span>
            </div>

            {opt?.waypoints && opt.waypoints.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Latitude</th>
                      <th className="py-2.5 px-3">Longitude</th>
                      <th className="py-2.5 px-3">Navigation Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {opt.waypoints.map((wp) => (
                      <tr key={wp.sequence} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 text-orange-400 font-bold">{wp.sequence}</td>
                        <td className="py-2.5 px-3 text-white">{wp.lat.toFixed(4)}° N</td>
                        <td className="py-2.5 px-3 text-white">{wp.lon.toFixed(4)}° E</td>
                        <td className="py-2.5 px-3 text-gray-300">{wp.reason || "Oceanic Waypoint"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-4">No specific waypoints listed for this corridor.</p>
            )}
          </GlassCard>
        </main>
      </div>
    </ProtectedRoute>
  );
}
