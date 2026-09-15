"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { GlassCard, Button } from "@/components/ui";
import api from "@/lib/api";
import { Ship, Plus, Anchor, Gauge, Fuel, Waves, CheckCircle2, AlertCircle, X } from "lucide-react";

interface Vessel {
  id: string;
  user_id: string;
  name: string;
  imo_number?: string;
  vessel_type: string;
  service_speed_knots?: number;
  fuel_consumption_tons_per_day?: number;
  max_wave_height_meters?: number;
  created_at: string;
}

export default function VesselsPage() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [imoNumber, setImoNumber] = useState("");
  const [vesselType, setVesselType] = useState("container_ship");
  const [speed, setSpeed] = useState("16.0");
  const [fuelRate, setFuelRate] = useState("35.0");
  const [maxWave, setMaxWave] = useState("8.5");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchVessels = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/vessels");
      if (res.data && Array.isArray(res.data)) {
        setVessels(res.data);
      }
    } catch (err: any) {
      console.error("Fetch vessels error:", err);
      setError("Could not load fleet vessels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  const handleAddVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError("Vessel name is required.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await api.post("/api/v1/vessels", {
        name,
        imo_number: imoNumber || undefined,
        vessel_type: vesselType,
        service_speed_knots: parseFloat(speed) || 15.0,
        fuel_consumption_tons_per_day: parseFloat(fuelRate) || 30.0,
        max_wave_height_meters: parseFloat(maxWave) || 8.0,
      });

      setSuccessMsg(`Vessel ${name} registered into active fleet command!`);
      setTimeout(() => setSuccessMsg(""), 4000);
      setName("");
      setImoNumber("");
      setShowAddModal(false);
      fetchVessels();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to add vessel.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#050811] text-white selection:bg-orange-500/30 selection:text-orange-200">
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
                <Anchor className="w-3.5 h-3.5" />
                <span>Commercial Fleet Registry</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Fleet Management & Hull Specifications
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Manage your vessels, calibrated hydrodynamic speeds, bunker consumption baselines, and wave tolerance limits.
              </p>
            </div>

            <Button
              id="btn-register-vessel"
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Register Vessel
            </Button>
          </div>

          {/* Success / Error Messages */}
          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Vessels Grid */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono text-gray-400">Loading fleet vessels...</p>
            </div>
          ) : vessels.length === 0 ? (
            <GlassCard flat className="p-12 text-center border-white/5">
              <Ship className="w-12 h-12 text-cyan-400/60 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">No vessels registered</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
                Add your merchant vessels to automatically calculate accurate fuel burns and passage profiles.
              </p>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                Register First Vessel
              </Button>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vessels.map((vessel) => (
                <GlassCard
                  key={vessel.id}
                  flat
                  className="p-6 border-[#1b3356]/70 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                        {vessel.vessel_type.replace("_", " ")}
                      </span>
                      {vessel.imo_number && (
                        <span className="text-[11px] font-mono text-gray-400">
                          IMO: {vessel.imo_number}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition flex items-center gap-2">
                      <Ship className="w-5 h-5 text-cyan-400" />
                      <span>{vessel.name}</span>
                    </h3>

                    <div className="grid grid-cols-3 gap-2 mt-5 text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                        <span className="text-gray-400 text-[10px] block flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-orange-400" /> Speed
                        </span>
                        <p className="text-white font-bold mt-1">{vessel.service_speed_knots || 15} kts</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                        <span className="text-gray-400 text-[10px] block flex items-center gap-1">
                          <Fuel className="w-3 h-3 text-emerald-400" /> Fuel
                        </span>
                        <p className="text-emerald-400 font-bold mt-1">{vessel.fuel_consumption_tons_per_day || 30} t/d</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                        <span className="text-gray-400 text-[10px] block flex items-center gap-1">
                          <Waves className="w-3 h-3 text-cyan-400" /> Wave Tol.
                        </span>
                        <p className="text-cyan-400 font-bold mt-1">{vessel.max_wave_height_meters || 8.0} m</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Operational
                    </span>
                    <Link
                      href="/routes/new"
                      className="text-xs font-medium text-cyan-400 hover:text-white transition"
                    >
                      Plan Route ➔
                    </Link>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Add Vessel Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <div className="bg-[#091322] border border-[#1b3356] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Ship className="w-5 h-5 text-orange-400" />
                    <span>Register New Vessel</span>
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddVessel} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Vessel Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MV Pacific Voyager"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#060c18] border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        IMO Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9812450"
                        value={imoNumber}
                        onChange={(e) => setImoNumber(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#060c18] border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Vessel Type
                      </label>
                      <select
                        value={vesselType}
                        onChange={(e) => setVesselType(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#060c18] border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none"
                      >
                        <option value="container_ship">Container Ship</option>
                        <option value="tanker">Tanker</option>
                        <option value="bulk_carrier">Bulk Carrier</option>
                        <option value="lng_carrier">LNG Carrier</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Service Speed (kts)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={speed}
                        onChange={(e) => setSpeed(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#060c18] border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Fuel (tons/day)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={fuelRate}
                        onChange={(e) => setFuelRate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#060c18] border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Max Wave (m)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={maxWave}
                        onChange={(e) => setMaxWave(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#060c18] border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={submitting}
                    >
                      Save Vessel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
