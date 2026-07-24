"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import { GlassCard, Button, Input, Select } from "@/components/ui";
import api from "@/lib/api";

interface VesselData {
  name: string;
  imo_number: string;
  vessel_type: string;
  service_speed_knots: number;
  fuel_consumption_tons_per_day: number;
  max_wave_height_meters: number;
}

export default function EditVesselPage() {
  const router = useRouter();
  const params = useParams();
  const vesselId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<VesselData>({
    name: "",
    imo_number: "",
    vessel_type: "",
    service_speed_knots: 0,
    fuel_consumption_tons_per_day: 0,
    max_wave_height_meters: 0,
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

  useEffect(() => {
    const fetchVessel = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/v1/vessels/${vesselId}`);
        setFormData(res.data);
        setError("");
      } catch (err: any) {
        console.error("Fetch vessel error:", err);
        setError("Could not load vessel details.");
      } finally {
        setLoading(false);
      }
    };
    if (vesselId) {
      fetchVessel();
    }
  }, [vesselId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.put(`/api/v1/vessels/${vesselId}`, formData);
      router.push("/vessels");
    } catch (err: any) {
      console.error("Update vessel error:", err);
      setError(err.response?.data?.detail || "Failed to update vessel.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#060b1a] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Loading vessel...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="min-h-screen bg-[#060b1a] p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Edit Vessel</h1>
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
                  disabled={submitting}
                />

                <Input
                  label="IMO Number"
                  name="imo_number"
                  placeholder="e.g., 1234567"
                  value={formData.imo_number}
                  onChange={handleChange}
                  disabled={submitting}
                />

                <Select
                  label="Vessel Type *"
                  name="vessel_type"
                  value={formData.vessel_type}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                >
                  <option value="">Select vessel type...</option>
                  {vesselTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </Select>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Service Speed (knots)"
                    name="service_speed_knots"
                    type="number"
                    step="0.1"
                    placeholder="14.5"
                    value={formData.service_speed_knots}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  <Input
                    label="Fuel Consumption (tons/day)"
                    name="fuel_consumption_tons_per_day"
                    type="number"
                    step="0.1"
                    placeholder="30"
                    value={formData.fuel_consumption_tons_per_day}
                    onChange={handleChange}
                    disabled={submitting}
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
                  disabled={submitting}
                />

                <div className="flex gap-3 pt-4">
                  <Button type="submit" size="lg" loading={submitting}>
                    {submitting ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/vessels")}
                    disabled={submitting}
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