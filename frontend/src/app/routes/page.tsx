"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import { GlassCard, Button, Badge } from "@/components/ui";
import { IconRoute } from "@/components/ui/icons";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

interface RouteItem {
  id: string;
  origin_port: string;
  destination_port: string;
  priority: string;
  status: string;
  created_at: string;
  vessel_id?: string;
  vessel_name?: string;
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      // Try to fetch from backend
      const res = await api.get("/api/v1/routes");
      setRoutes(res.data);
      setError("");
    } catch (err: any) {
      console.error("Fetch routes error:", err);
      // If 404, use localStorage mock
      if (err.response?.status === 404) {
        const mockRoutes = JSON.parse(localStorage.getItem("mockRoutes") || "[]");
        setRoutes(mockRoutes);
        setError("");
      } else {
        setError("Could not load routes. Please try again.");
        setRoutes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#060b1a] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Loading routes...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="min-h-screen bg-[#060b1a] p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white">Route Analysis</h1>
                <p className="text-sm text-ink-secondary">View all your optimized routes</p>
              </div>
              <Link href="/routes/new">
                <Button size="lg">+ New Route</Button>
              </Link>
            </div>

            {error && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm rounded-lg p-3 mb-6">
                {error}
              </div>
            )}

            {routes.length === 0 ? (
              <GlassCard glow className="p-12 text-center text-ink-secondary">
                <IconRoute className="h-16 w-16 mx-auto text-ink-muted mb-4" />
                <p className="text-lg">No routes analyzed yet</p>
                <p className="text-sm text-ink-muted">Start optimizing your first route</p>
                <Link href="/routes/new" className="mt-4 inline-block">
                  <Button>Analyze Route</Button>
                </Link>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routes.map((route) => (
                  <GlassCard key={route.id} glow className="p-6 hover:border-cyan-400/30 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm text-ink-secondary">Origin → Destination</p>
                        <p className="text-lg font-semibold text-white">
                          {route.origin_port} → {route.destination_port}
                        </p>
                      </div>
                      <Badge variant={route.status === "completed" ? "success" : "warning"}>
                        {route.status || "completed"}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm text-ink-secondary">
                      <span>Priority: <span className="text-white capitalize">{route.priority}</span></span>
                      <span>{new Date(route.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-4">
                      <Link href={`/routes/${route.id}`}>
                        <Button variant="outline" size="sm" fullWidth>View Details</Button>
                      </Link>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}