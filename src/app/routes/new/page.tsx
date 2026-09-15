"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { GlassCard, Button } from "@/components/ui";
import api from "@/lib/api";
import {
  Compass,
  ArrowLeft,
  Navigation,
  Sparkles,
  Zap,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Port {
  id: string;
  name: string;
  code: string;
  country: string;
}

interface Vessel {
  id: string;
  name: string;
  vessel_type: string;
  service_speed_knots?: number;
  fuel_consumption_tons_per_day?: number;
}

export default function NewRouteSimulationPage() {
  const router = useRouter();
  const [ports, setPorts] = useState<Port[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [originPort, setOriginPort] = useState("Mumbai");
  const [destinationPort, setDestinationPort] = useState("Singapore");
  const [selectedVessel, setSelectedVessel] = useState("");
  const [priority, setPriority] = useState<"balanced" | "fastest" | "cheapest" | "safest">("balanced");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [portsRes, vesselsRes] = await Promise.all([
          api.get("/api/v1/ports").catch(() => ({ data: [] })),
          api.get("/api/v1/vessels").catch(() => ({ data: [] })),
        ]);

        if (portsRes.data && Array.isArray(portsRes.data) && portsRes.data.length > 0) {
          setPorts(portsRes.data);
        } else {
          setPorts([
            { id: "p1", name: "Mumbai", code: "INBOM", country: "India" },
            { id: "p2", name: "Singapore", code: "SGSIN", country: "Singapore" },
            { id: "p3", name: "Chennai", code: "INMAA", country: "India" },
            { id: "p4", name: "Colombo", code: "LKCMB", country: "Sri Lanka" },
            { id: "p5", name: "Dubai", code: "AEDXB", country: "UAE" },
            { id: "p6", name: "Rotterdam", code: "NLRTM", country: "Netherlands" },
            { id: "p7", name: "Shanghai", code: "CNSHA", country: "China" },
            { id: "p8", name: "Tokyo", code: "JPTYO", country: "Japan" },
          ]);
        }

        if (vesselsRes.data && Array.isArray(vesselsRes.data) && vesselsRes.data.length > 0) {
          setVessels(vesselsRes.data);
          setSelectedVessel(vesselsRes.data[0].id);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    loadInitialData();
  }, []);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (originPort === destinationPort) {
      setError("Origin and destination ports cannot be the same.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = {
        origin_port: originPort,
        destination_port: destinationPort,
        vessel_id: selectedVessel || undefined,
        priority,
      };

      const res = await api.post("/api/v1/routes/analyze", payload);
      if (res.data?.id) {
        router.push(`/routes/${res.data.id}`);
      } else {
        throw new Error("Failed to receive route analysis confirmation.");
      }
    } catch (err: any) {
      console.error("Simulation error:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Simulation calculation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    {
      id: "balanced",
      title: "Balanced Fairway",
      subtitle: "Recommended commercial equilibrium",
      icon: Compass,
      color: "border-orange-500/50 bg-orange-500/10 text-orange-400",
    },
    {
      id: "fastest",
      title: "Fastest Speed",
      subtitle: "Minimum passage hours (High RPM)",
      icon: Zap,
      color: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
    },
    {
      id: "cheapest",
      title: "Eco Fuel-Saver",
      subtitle: "Slow steaming (Lowest bunker cost)",
      icon: TrendingDown,
      color: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
    },
    {
      id: "safest",
      title: "Safest Swell Buffer",
      subtitle: "Wave clearance & storm avoidance",
      icon: ShieldCheck,
      color: "border-amber-500/50 bg-amber-500/10 text-amber-400",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#050811] text-white selection:bg-orange-500/30 selection:text-orange-200">
        <Navbar />

        <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
          {/* Top navigation */}
          <div>
            <Link
              href="/routes"
              className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition mb-3"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-orange-400" />
              <span>Back to Saved Routes</span>
            </Link>
            <div className="flex items-center gap-2 text-xs font-mono text-orange-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Nautical Routing Engine</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Simulate Optimized Passage Corridor
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Compute geodesics, swell resistance, waypoint channels, and estimated fuel burn.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSimulate}>
            <GlassCard flat className="p-6 sm:p-8 border-[#1b3356] space-y-6">
              {/* Port Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-2">
                    Origin Departure Port
                  </label>
                  <select
                    id="select-origin-port"
                    value={originPort}
                    onChange={(e) => setOriginPort(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#060c18] border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    {ports.map((p) => (
                      <option key={p.id} value={p.name} className="bg-[#091322] text-white">
                        {p.name} ({p.code}) - {p.country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-2">
                    Destination Port of Call
                  </label>
                  <select
                    id="select-dest-port"
                    value={destinationPort}
                    onChange={(e) => setDestinationPort(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#060c18] border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    {ports.map((p) => (
                      <option key={p.id} value={p.name} className="bg-[#091322] text-white">
                        {p.name} ({p.code}) - {p.country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vessel Selector */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-2">
                  Assigned Vessel & Hull Profile
                </label>
                <select
                  id="select-vessel"
                  value={selectedVessel}
                  onChange={(e) => setSelectedVessel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#060c18] border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  {vessels.map((v) => (
                    <option key={v.id} value={v.id} className="bg-[#091322] text-white">
                      {v.name} ({v.vessel_type}) - Service Speed: {v.service_speed_knots || 15} kts, Fuel: {v.fuel_consumption_tons_per_day || 30} t/day
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Selector */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-3">
                  Optimization Priority
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {priorityOptions.map((opt) => {
                    const isSelected = priority === opt.id;
                    const Icon = opt.icon;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        id={`priority-${opt.id}`}
                        onClick={() => setPriority(opt.id as any)}
                        className={`p-4 rounded-xl border text-left transition-all flex items-start justify-between ${
                          isSelected
                            ? `${opt.color} shadow-lg ring-1 ring-white/20`
                            : "border-white/10 bg-black/20 text-gray-400 hover:border-white/20 hover:text-gray-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-white">{opt.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{opt.subtitle}</p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-mono text-gray-400">
                  SeaVision calculates Great-Circle distance + 4 corridor alternatives
                </span>
                <Button
                  type="submit"
                  id="submit-route-simulate"
                  variant="primary"
                  loading={loading}
                  icon={<Navigation className="w-4 h-4" />}
                >
                  Run Corridor Simulation
                </Button>
              </div>
            </GlassCard>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
