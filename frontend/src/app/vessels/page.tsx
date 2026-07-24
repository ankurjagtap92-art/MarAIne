"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import { GlassCard, Button, Badge } from "@/components/ui";
import { IconShip } from "@/components/ui/icons";
import api from "@/lib/api";
import Link from "next/link";

interface Vessel {
  id: string;
  name: string;
  imo_number?: string;
  vessel_type: string;
  service_speed_knots?: number;
  fuel_consumption_tons_per_day?: number;
  created_at: string;
}

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
      if (err.response?.status === 404) {
        const mockVessels = JSON.parse(localStorage.getItem("mockVessels") || "[]");
        setVessels(mockVessels);
        setError("");
      } else {
        setError("Could not load vessels.");
        setVessels([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vessel?")) return;
    try {
      setDeleting(id);
      await api.delete(`/api/v1/vessels/${id}`);
      // Remove from UI
      setVessels(vessels.filter(v => v.id !== id));
    } catch (err: any) {
      console.error("Delete vessel error:", err);
      // If backend fails, try localStorage mock delete
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
        <div className="min-h-screen bg-[#060b1a] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Loading vessels...</p>
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
                <h1 className="text-3xl font-bold text-white">Fleet Management</h1>
                <p className="text-sm text-ink-secondary">Manage your vessels and their profiles</p>
              </div>
              <Link href="/vessels/new">
                <Button size="lg">+ Add Vessel</Button>
              </Link>
            </div>

            {error && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm rounded-lg p-3 mb-6">
                {error}
              </div>
            )}

            {vessels.length === 0 ? (
              <GlassCard glow className="p-12 text-center text-ink-secondary">
                <IconShip className="h-16 w-16 mx-auto text-ink-muted mb-4" />
                <p className="text-lg">No vessels registered</p>
                <p className="text-sm text-ink-muted">Add your first vessel to start tracking</p>
                <Link href="/vessels/new" className="mt-4 inline-block">
                  <Button>Add Vessel</Button>
                </Link>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vessels.map((vessel) => (
                  <GlassCard key={vessel.id} glow className="p-6 hover:border-cyan-400/30 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{vessel.name}</h3>
                      <Badge variant="info">{vessel.vessel_type.replace("_", " ")}</Badge>
                    </div>
                    {vessel.imo_number && (
                      <p className="text-sm text-ink-secondary">IMO: {vessel.imo_number}</p>
                    )}
                    {vessel.service_speed_knots && (
                      <p className="text-sm text-ink-secondary">
                        Service Speed: {vessel.service_speed_knots} knots
                      </p>
                    )}
                    {vessel.fuel_consumption_tons_per_day && (
                      <p className="text-sm text-ink-secondary">
                        Fuel: {vessel.fuel_consumption_tons_per_day} tons/day
                      </p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Link href={`/vessels/${vessel.id}/edit`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(vessel.id)}
                        disabled={deleting === vessel.id}
                      >
                        {deleting === vessel.id ? "Deleting..." : "Delete"}
                      </Button>
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


