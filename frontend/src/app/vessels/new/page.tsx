"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import { GlassCard, Button, Input } from "@/components/ui";
import api from "@/lib/api";

export default function NewVesselPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    imo_number: "",
    vessel_type: "",
    service_speed_knots: "",
    fuel_consumption_tons_per_day: "",
    max_wave_height_meters: "",
  });

  const vesselTypes = [
    "container_ship",
    "bulk_carrier",
    "tanker",
    "lng_carrier",
    "ro_ro",
    "general_cargo",
    "other",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      name: formData.name,
      imo_number: formData.imo_number || undefined,
      vessel_type: formData.vessel_type,
      service_speed_knots: parseFloat(formData.service_speed_knots) || undefined,
      fuel_consumption_tons_per_day: parseFloat(formData.fuel_consumption_tons_per_day) || undefined,
      max_wave_height_meters: parseFloat(formData.max_wave_height_meters) || undefined,
    };

    try {
      await api.post("/api/v1/vessels", payload);
      router.push("/vessels");
    } catch (err: any) {
      console.error("Create vessel error:", err);
      
      if (err.response?.status === 404) {
        const mockVessels = JSON.parse(localStorage.getItem("mockVessels") || "[]");
        const newVessel = {
          id: Date.now().toString(),
          ...payload,
          created_at: new Date().toISOString(),
        };
        mockVessels.push(newVessel);
        localStorage.setItem("mockVessels", JSON.stringify(mockVessels));
        router.push("/vessels");
      } else {
        setError(err.response?.data?.detail || "Failed to create vessel. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="min-h-screen bg-[#060b1a] p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Add New Vessel</h1>
            <GlassCard glow className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
                    {error}
                  </div>
                )}

                <Input
                  label="Vessel Name *"
                  name="name"
                  placeholder="e.g., MV Horizon"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

                <Input
                  label="IMO Number"
                  name="imo_number"
                  placeholder="e.g., 1234567"
                  value={formData.imo_number}
                  onChange={handleChange}
                  disabled={loading}
                />

                {/* NATIVE SELECT – FIX */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-300">
                    Vessel Type *
                  </label>
                  <select
                    name="vessel_type"
                    value={formData.vessel_type}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full rounded-lg border border-[#1c2b45] bg-[#060b1a]/50 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select vessel type...</option>
                    {vesselTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Service Speed (knots)"
                    name="service_speed_knots"
                    type="number"
                    step="0.1"
                    placeholder="14.5"
                    value={formData.service_speed_knots}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <Input
                    label="Fuel Consumption (tons/day)"
                    name="fuel_consumption_tons_per_day"
                    type="number"
                    step="0.1"
                    placeholder="30"
                    value={formData.fuel_consumption_tons_per_day}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <Input
                  label="Max Wave Height (meters)"
                  name="max_wave_height_meters"
                  type="number"
                  step="0.1"
                  placeholder="8.0"
                  value={formData.max_wave_height_meters}
                  onChange={handleChange}
                  disabled={loading}
                />

                <div className="flex gap-3 pt-4">
                  <Button type="submit" size="lg" loading={loading}>
                    {loading ? "Creating..." : "Create Vessel"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/vessels")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}