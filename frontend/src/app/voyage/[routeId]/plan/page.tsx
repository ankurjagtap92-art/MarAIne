"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import { GlassCard, Button } from "@/components/ui";
import api from "@/lib/api";

interface VoyagePlan {
  id: string;
  route_id: string;
  selected_option_id: string;
  status: string;
  created_at: string;
}

export default function VoyagePlannerPage() {
  const params = useParams();
  const routeId = params.id as string;
  const [plan, setPlan] = useState<VoyagePlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Your friend will implement the actual voyage planner logic
    // For now, we'll fetch the selected route data or show a placeholder
    const fetchVoyagePlan = async () => {
      try {
        setLoading(true);
        // This endpoint will be created by your friend
        const res = await api.get(`/api/v1/voyage/${routeId}/plan`);
        setPlan(res.data);
      } catch (err) {
        console.error("Voyage planner error:", err);
        // Fallback: show placeholder
        setPlan({
          id: "placeholder",
          route_id: routeId,
          selected_option_id: "pending",
          status: "planning",
          created_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchVoyagePlan();
  }, [routeId]);

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

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="min-h-screen bg-[#060b1a] p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">⚓ Voyage Planner</h1>
            <GlassCard glow className="p-8">
              <p className="text-gray-400 mb-4">
                🚧 This page is under construction. The voyage planner will include:
              </p>
              <ul className="text-sm text-gray-300 list-disc list-inside space-y-2">
                <li>Detailed voyage timeline</li>
                <li>Fuel consumption by segment</li>
                <li>Weather forecasts along the route</li>
                <li>Port call scheduling</li>
                <li>Crew and cargo management</li>
              </ul>
              <div className="mt-6 p-4 bg-cyan-400/5 border border-cyan-400/20 rounded-lg">
                <p className="text-sm text-cyan-300">
                  📌 Route ID: <span className="font-mono">{routeId}</span>
                </p>
                <p className="text-sm text-cyan-300">
                  📌 Status: <span className="text-white">Planning in progress...</span>
                </p>
              </div>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => window.history.back()}
              >
                ← Back to Route
              </Button>
            </GlassCard>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}