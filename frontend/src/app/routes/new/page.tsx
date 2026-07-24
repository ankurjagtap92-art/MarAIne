"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import { GlassCard, Button, Input, Select } from "@/components/ui";
import { IconShip } from "@/components/ui/icons";
import api from "@/lib/api";

interface Vessel {
  id: string;
  name: string;
  vessel_type: string;
}

export default function NewRoutePage() {
  const router = useRouter();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [vesselId, setVesselId] = useState("");
  const [priority, setPriority] = useState("balanced");
  const [error, setError] = useState("");

  const fetchVessels = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/vessels");
      setVessels(res.data);
      setError("");
    } catch (err: any) {
      console.error("Failed to fetch vessels:", err);
      if (err.response?.status === 404) {
        const mockVessels = JSON.parse(localStorage.getItem("mockVessels") || "[]");
        setVessels(mockVessels);
      } else {
        setVessels([]);
        setError("Could not load vessels. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchVessels();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      vessel_id: vesselId,
      origin_port: origin,
      destination_port: destination,
      priority: priority,
    };

    try {
      const response = await api.post("/api/v1/routes/analyze", payload);
      router.push(`/routes/${response.data.id}`);
    } catch (err: any) {
      console.error("Analysis error:", err);
      if (err.response?.status === 404) {
        const mockId = Date.now().toString();
        const mockRoute = {
          id: mockId,
          vessel_id: vesselId,
          origin_port: origin,
          destination_port: destination,
          priority: priority,
          status: "completed",
          created_at: new Date().toISOString(),
          options: [
            { type: "fastest", distance: 1200, time: "2.5 days", fuel: 45, cost: 27000 },
            { type: "cheapest", distance: 1350, time: "3.0 days", fuel: 38, cost: 22800 },
            { type: "safest", distance: 1400, time: "3.2 days", fuel: 42, cost: 25200 },
            { type: "balanced", distance: 1280, time: "2.7 days", fuel: 40, cost: 24000 },
          ]
        };
        const mockRoutes = JSON.parse(localStorage.getItem("mockRoutes") || "[]");
        mockRoutes.push(mockRoute);
        localStorage.setItem("mockRoutes", JSON.stringify(mockRoutes));
        router.push(`/routes/${mockId}`);
      } else {
        setError(err.response?.data?.detail || "Failed to analyze route.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="min-h-screen bg-[#060b1a] p-8">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => router.push("/routes")}
              className="flex items-center gap-2 text-ink-secondary hover:text-white transition-colors mb-6 group"
            >
              {/* Inline SVG ArrowLeft */}
              <svg className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back to Routes
            </button>

            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
              <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
                New Route Analysis
              </span>
            </h1>
            <p className="text-ink-secondary mb-8">Optimize your next voyage with AI-powered route planning</p>

            <GlassCard glow className="p-8 border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5" />
              <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 backdrop-blur-sm">
                    {error}
                  </div>
                )}

                <Select
                  label="Select Vessel"
                  value={vesselId}
                  onChange={(e) => setVesselId(e.target.value)}
                  required
                  disabled={loading || submitting}
                  className="border border-white/10 focus:border-cyan-400/50"
                >
                  <option value="">Select a vessel...</option>
                  {vessels.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.vessel_type.replace("_", " ").toUpperCase()})
                    </option>
                  ))}
                </Select>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Origin Port"
                    placeholder="e.g., Mumbai (INMUM)"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                    disabled={submitting}
                    className="border border-white/10 focus:border-cyan-400/50"
                  />
                  <Input
                    label="Destination Port"
                    placeholder="e.g., Singapore (SGSIN)"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    disabled={submitting}
                    className="border border-white/10 focus:border-cyan-400/50"
                  />
                </div>

                <Select
                  label="Optimization Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  disabled={submitting}
                  className="border border-white/10 focus:border-cyan-400/50"
                >
                  <option value="fastest">Fastest</option>
                  <option value="cheapest">Cheapest</option>
                  <option value="safest">Safest</option>
                  <option value="balanced">Balanced</option>
                </Select>

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  loading={submitting}
                  className="relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center gap-2">
                    {submitting ? (
                      "Analyzing..."
                    ) : (
                      <>
                        <IconShip className="h-5 w-5" />
                        Analyze Route
                      </>
                    )}
                  </span>
                </Button>
              </form>
            </GlassCard>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}