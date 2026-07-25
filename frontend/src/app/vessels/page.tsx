"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import { GlassCard, Button, Badge } from "@/components/ui";
import { IconShip, IconPlus } from "@/components/ui/icons";
import api from "@/lib/api";

interface Vessel {
  id: string;
  name: string;
  imo_number?: string;
  vessel_type: string;
  service_speed_knots?: number;
  fuel_consumption_tons_per_day?: number;
  created_at: string;
}

const VesselSkeleton = () => (
  <div className="bg-[#0a1628]/50 rounded-2xl border border-white/5 p-6 animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="h-6 w-32 bg-white/10 rounded" />
      <div className="h-6 w-20 bg-white/10 rounded-full" />
    </div>
    <div className="space-y-2">
      <div className="h-4 w-28 bg-white/10 rounded" />
      <div className="h-4 w-36 bg-white/10 rounded" />
      <div className="h-4 w-32 bg-white/10 rounded" />
    </div>
    <div className="mt-4 flex gap-2">
      <div className="h-9 w-20 bg-white/10 rounded" />
      <div className="h-9 w-20 bg-white/10 rounded" />
    </div>
  </div>
);

export default function VesselsPage() {
  const router = useRouter();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchVessels = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/vessels");
      setVessels(res.data);
      setError("");
    } catch (err: any) {
      console.error("Fetch vessels error:", err);

      // ✅ Handle 401 – interceptor already redirects; just clear error
      if (err.response?.status === 401) {
        setError("");
        setVessels([]);
        return;
      }

      if (err.response?.status === 404) {
        const mockVessels = JSON.parse(localStorage.getItem("mockVessels") || "[]");
        setVessels(mockVessels);
        setError("");
        return;
      }

      setError("Could not load vessels.");
      setVessels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vessel?")) return;
    try {
      setDeleting(id);
      await api.delete(`/api/v1/vessels/${id}`);
      setVessels(vessels.filter(v => v.id !== id));
    } catch (err: any) {
      console.error("Delete vessel error:", err);
      if (err.response?.status === 404 || err.response?.status === 405) {
        const mockVessels = JSON.parse(localStorage.getItem("mockVessels") || "[]");
        const updated = mockVessels.filter((v: any) => v.id !== id);
        localStorage.setItem("mockVessels", JSON.stringify(updated));
        setVessels(vessels.filter(v => v.id !== id));
      } else {
        alert("Failed to delete vessel. Please try again.");
      }
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#060b1a] p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Fleet Management</h1>
                <p className="text-sm text-ink-secondary mt-1">Manage your vessels and their profiles</p>
              </div>
              <div className="h-12 w-40 bg-white/5 rounded-xl animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <VesselSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="min-h-screen bg-[#060b1a] p-8 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                  <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
                    Fleet Management
                  </span>
                  <span className="text-sm font-normal bg-white/5 px-3 py-1 rounded-full text-ink-secondary border border-white/5">
                    {vessels.length} vessels
                  </span>
                </h1>
                <p className="text-sm text-ink-secondary mt-1">Manage your vessels and their profiles</p>
              </div>
              <Link href="/vessels/new">
                <Button size="lg" className="group relative overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-2">
                    <IconPlus className="h-5 w-5" />
                    Add Vessel
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
              {vessels.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <GlassCard glow className="p-16 text-center border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5" />
                    <div className="relative z-10">
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 flex items-center justify-center border border-white/10 mb-6">
                        <IconShip className="h-10 w-10 text-ink-muted" />
                      </div>
                      <h3 className="text-2xl font-semibold text-white mb-2">No vessels registered</h3>
                      <p className="text-ink-secondary mb-6">Add your first vessel to start tracking</p>
                      <Link href="/vessels/new">
                        <Button size="lg" className="group">
                          <span className="flex items-center gap-2">
                            Add Vessel
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
                  {vessels.map((vessel, index) => (
                    <motion.div
                      key={vessel.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="group"
                    >
                      <GlassCard glow className="p-6 border border-white/5 hover:border-cyan-400/30 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-white">{vessel.name}</h3>
                            <Badge variant="info" className="capitalize">
                              {vessel.vessel_type.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-ink-secondary">
                            {vessel.imo_number && (
                              <p>IMO: <span className="text-white font-mono">{vessel.imo_number}</span></p>
                            )}
                            {vessel.service_speed_knots && (
                              <p>Service Speed: <span className="text-white">{vessel.service_speed_knots} knots</span></p>
                            )}
                            {vessel.fuel_consumption_tons_per_day && (
                              <p>Fuel: <span className="text-white">{vessel.fuel_consumption_tons_per_day} tons/day</span></p>
                            )}
                          </div>
                          <div className="mt-5 pt-4 border-t border-white/5 flex gap-2">
                            <Link href={`/vessels/${vessel.id}/edit`} className="flex-1">
                              <Button variant="outline" size="sm" fullWidth className="group-hover:border-cyan-400/50 transition-colors">
                                <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(vessel.id)}
                              disabled={deleting === vessel.id}
                              className="flex-1"
                            >
                              {deleting === vessel.id ? (
                                "Deleting..."
                              ) : (
                                <>
                                  <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18" />
                                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <path d="M10 11v6" />
                                    <path d="M14 11v6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                  </svg>
                                  Delete
                                </>
                              )}
                            </Button>
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