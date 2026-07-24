"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import { GlassCard, Button, Input, Select } from "@/components/ui";
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

  // Fetch vessels on mount
  useEffect(() => {
    fetchVessels();
  }, []);

  // 🔥 NEW: Refetch when page becomes visible (user returns from adding vessel)
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
            <h1 className="text-3xl font-bold text-white mb-6">New Route Analysis</h1>
            <GlassCard glow className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
                    {error}
                  </div>
                )}

                <Select
                  label="Select Vessel"
                  value={vesselId}
                  onChange={(e) => setVesselId(e.target.value)}
                  required
                  disabled={loading || submitting}
                >
                  <option value="">Select a vessel...</option>
                  {vessels.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.vessel_type})
                    </option>
                  ))}
                </Select>

                <Input
                  label="Origin Port"
                  placeholder="e.g., Mumbai (INMUM)"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  required
                  disabled={submitting}
                />

                <Input
                  label="Destination Port"
                  placeholder="e.g., Singapore (SGSIN)"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  disabled={submitting}
                />

                <Select
                  label="Optimization Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  disabled={submitting}
                >
                  <option value="fastest">Fastest</option>
                  <option value="cheapest">Cheapest</option>
                  <option value="safest">Safest</option>
                  <option value="balanced">Balanced</option>
                </Select>

                <Button type="submit" size="lg" fullWidth loading={submitting}>
                  {submitting ? "Analyzing..." : "Analyze Route"}
                </Button>
              </form>
            </GlassCard>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}