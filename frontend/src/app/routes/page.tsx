"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import { GlassCard, Button, Badge } from "@/components/ui";
import { IconRoute, IconPlus } from "@/components/ui/icons";
import api from "@/lib/api";

interface RouteItem {
  id: string;
  origin_port: string;
  destination_port: string;
  priority: string;
  status: string;
  created_at: string;
}

const RouteSkeleton = () => (
  <div className="bg-[#0a1628]/50 rounded-2xl border border-white/5 p-6 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div>
        <div className="h-4 w-20 bg-white/10 rounded mb-2" />
        <div className="h-6 w-40 bg-white/10 rounded" />
      </div>
      <div className="h-6 w-20 bg-white/10 rounded-full" />
    </div>
    <div className="flex justify-between">
      <div className="h-4 w-24 bg-white/10 rounded" />
      <div className="h-4 w-20 bg-white/10 rounded" />
    </div>
    <div className="mt-4 h-9 w-full bg-white/10 rounded" />
  </div>
);

export default function RoutesPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching routes...");
      const res = await api.get("/api/v1/routes");
      console.log("✅ Routes response:", res.data);
      console.log("📦 Type of response:", typeof res.data, "isArray:", Array.isArray(res.data));

      // Ensure data is an array
      const routesData = Array.isArray(res.data) ? res.data : [];
      console.log("📊 Routes data (after validation):", routesData);
      setRoutes(routesData);
      setError("");
    } catch (err: any) {
      console.error("❌ Fetch routes error:", err);
      if (err.response?.status === 401) {
        setError("");
        setRoutes([]);
        return;
      }
      if (err.response?.status === 404) {
        const mockRoutes = JSON.parse(localStorage.getItem("mockRoutes") || "[]");
        setRoutes(mockRoutes);
        setError("");
        return;
      }
      setError("Could not load routes. Please try again.");
      setRoutes([]);
    } finally {
      setLoading(false);
      console.log("🏁 Final routes state length:", routes.length);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#060b1a] p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Route Analysis</h1>
                <p className="text-sm text-ink-secondary mt-1">View all your optimized routes</p>
              </div>
              <div className="h-12 w-36 bg-white/5 rounded-xl animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <RouteSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const hasRoutes = routes && routes.length > 0;

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="min-h-screen bg-[#060b1a] p-8 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                  <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
                    Route Analysis
                  </span>
                  <span className="text-sm font-normal bg-white/5 px-3 py-1 rounded-full text-ink-secondary border border-white/5">
                    {routes.length} routes
                  </span>
                </h1>
                <p className="text-sm text-ink-secondary mt-1">View all your optimized routes</p>
              </div>
              <Link href="/routes/new">
                <Button size="lg" className="group relative overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-2">
                    <IconPlus className="h-5 w-5" />
                    New Route
                  </span>
                </Button>
              </Link>
            </div>

            {error && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm rounded-lg p-4 mb-6 backdrop-blur-sm">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {!hasRoutes ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <GlassCard glow className="p-16 text-center border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5" />
                    <div className="relative z-10">
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 flex items-center justify-center border border-white/10 mb-6">
                        <IconRoute className="h-10 w-10 text-ink-muted" />
                      </div>
                      <h3 className="text-2xl font-semibold text-white mb-2">No routes analyzed yet</h3>
                      <p className="text-ink-secondary mb-6">Start optimizing your first route with AI-powered insights</p>
                      <Link href="/routes/new">
                        <Button size="lg" className="group">
                          <span className="flex items-center gap-2">
                            Analyze Route
                            <svg className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M7 17L17 7" />
                              <path d="M7 7h10v10" />
                            </svg>
                          </span>
                        </Button>
                      </Link>
                    </div>
                  </GlassCard>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {routes.map((route, index) => (
                    <motion.div
                      key={route.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="group"
                    >
                      <GlassCard glow className="p-6 border border-white/5 hover:border-cyan-400/30 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">Route</p>
                              <h3 className="text-lg font-semibold text-white mt-1">
                                {route.origin_port} <span className="text-ink-muted">→</span> {route.destination_port}
                              </h3>
                            </div>
                            <Badge
                              variant={route.status === "completed" ? "success" : "warning"}
                              className="capitalize"
                            >
                              <span className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${route.status === "completed" ? "bg-green-400" : "bg-yellow-400"} animate-pulse`} />
                                {route.status || "completed"}
                              </span>
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm text-ink-secondary">
                            <span>
                              Priority: <span className="text-white capitalize font-medium">{route.priority}</span>
                            </span>
                            <span>{new Date(route.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="mt-5 pt-4 border-t border-white/5">
                            <Link href={`/routes/${route.id}`}>
                              <Button variant="outline" size="sm" fullWidth className="group-hover:border-cyan-400/50 transition-colors">
                                View Details
                                <svg className="h-4 w-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M7 17L17 7" />
                                  <path d="M7 7h10v10" />
                                </svg>
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}