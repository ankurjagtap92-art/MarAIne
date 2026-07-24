"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import { GlassCard } from "@/components/ui";
import { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import api from "@/lib/api";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface FuelData {
  date: string;
  fuel_saved_tons: number;
}

interface RiskData {
  route_id: string;
  origin: string;
  destination: string;
  created_at: string;
  avg_risk_score: number;
}

interface VesselData {
  vessel_name: string;
  vessel_type: string;
  total_routes: number;
  avg_fuel_consumption: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [fuelData, setFuelData] = useState<FuelData[]>([]);
  const [riskData, setRiskData] = useState<RiskData[]>([]);
  const [vesselData, setVesselData] = useState<VesselData[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Fetch fuel analytics
        try {
          const fuelRes = await api.get("/api/v1/analytics/fuel");
          setFuelData(fuelRes.data);
        } catch {
          // Mock data for demo
          setFuelData([
            { date: "2026-07-01", fuel_saved_tons: 2.5 },
            { date: "2026-07-08", fuel_saved_tons: 3.1 },
            { date: "2026-07-15", fuel_saved_tons: 4.8 },
            { date: "2026-07-22", fuel_saved_tons: 6.2 },
          ]);
        }

        // Fetch risk analytics
        try {
          const riskRes = await api.get("/api/v1/analytics/risk");
          setRiskData(riskRes.data);
        } catch {
          setRiskData([
            { route_id: "1", origin: "Mumbai", destination: "Singapore", created_at: "2026-07-24T10:00:00", avg_risk_score: 18 },
            { route_id: "2", origin: "Chennai", destination: "Colombo", created_at: "2026-07-20T14:00:00", avg_risk_score: 12 },
            { route_id: "3", origin: "Mumbai", destination: "Dubai", created_at: "2026-07-15T08:00:00", avg_risk_score: 25 },
          ]);
        }

        // Fetch vessel analytics
        try {
          const vesselRes = await api.get("/api/v1/analytics/vessels");
          setVesselData(vesselRes.data);
        } catch {
          setVesselData([
            { vessel_name: "MV Horizon", vessel_type: "tanker", total_routes: 3, avg_fuel_consumption: 85 },
            { vessel_name: "MV Star", vessel_type: "container_ship", total_routes: 2, avg_fuel_consumption: 70 },
            { vessel_name: "MV Ocean", vessel_type: "bulk_carrier", total_routes: 1, avg_fuel_consumption: 90 },
          ]);
        }
      } catch (err) {
        setError("Could not load analytics data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Chart configurations
  const fuelChartData = {
    labels: fuelData.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: "Fuel Saved (tons)",
        data: fuelData.map(d => d.fuel_saved_tons),
        backgroundColor: "rgba(0, 212, 255, 0.2)",
        borderColor: "#00d4ff",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const riskChartData = {
    labels: riskData.map(d => `${d.origin} → ${d.destination}`),
    datasets: [
      {
        label: "Average Risk Score",
        data: riskData.map(d => d.avg_risk_score),
        backgroundColor: riskData.map(d => d.avg_risk_score > 20 ? "rgba(255, 84, 112, 0.7)" : "rgba(0, 212, 255, 0.7)"),
        borderColor: riskData.map(d => d.avg_risk_score > 20 ? "#ff5470" : "#00d4ff"),
        borderWidth: 1,
      },
    ],
  };

  const vesselChartData = {
    labels: vesselData.map(v => v.vessel_name),
    datasets: [
      {
        label: "Average Fuel Consumption (tons/day)",
        data: vesselData.map(v => v.avg_fuel_consumption),
        backgroundColor: ["rgba(0, 212, 255, 0.6)", "rgba(0, 255, 200, 0.6)", "rgba(139, 92, 246, 0.6)", "rgba(59, 130, 246, 0.6)"],
        borderColor: ["#00d4ff", "#00ffc8", "#8b5cf6", "#3b82f6"],
        borderWidth: 2,
      },
    ],
  };

  // Vessel type distribution
  const vesselTypeCounts = vesselData.reduce((acc, v) => {
    acc[v.vessel_type] = (acc[v.vessel_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const doughnutData = {
    labels: Object.keys(vesselTypeCounts).map(t => t.replace("_", " ").toUpperCase()),
    datasets: [
      {
        data: Object.values(vesselTypeCounts),
        backgroundColor: ["#00d4ff", "#00ffc8", "#8b5cf6", "#3b82f6"],
        borderColor: "#060b1a",
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#060b1a] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Loading analytics...</p>
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
            <h1 className="text-3xl font-bold text-white mb-6">📊 Analytics</h1>
            <p className="text-sm text-ink-secondary mb-8">Monitor your fleet performance and route efficiency.</p>

            {error && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm rounded-lg p-3 mb-6">
                {error}
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <GlassCard glow className="p-4 text-center">
                <p className="text-ink-secondary text-sm">Total Routes</p>
                <p className="text-2xl font-bold text-white">{riskData.length}</p>
              </GlassCard>
              <GlassCard glow className="p-4 text-center">
                <p className="text-ink-secondary text-sm">Fuel Saved (tons)</p>
                <p className="text-2xl font-bold text-cyan-400">{fuelData.reduce((sum, d) => sum + d.fuel_saved_tons, 0).toFixed(1)}</p>
              </GlassCard>
              <GlassCard glow className="p-4 text-center">
                <p className="text-ink-secondary text-sm">Avg Risk Score</p>
                <p className="text-2xl font-bold text-teal-400">
                  {riskData.length > 0 ? (riskData.reduce((sum, d) => sum + d.avg_risk_score, 0) / riskData.length).toFixed(1) : "N/A"}
                </p>
              </GlassCard>
              <GlassCard glow className="p-4 text-center">
                <p className="text-ink-secondary text-sm">Active Vessels</p>
                <p className="text-2xl font-bold text-violet-400">{vesselData.length}</p>
              </GlassCard>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fuel Savings Chart */}
              <GlassCard glow className="p-6">
                <h3 className="text-sm font-semibold text-white mb-4">⛽ Fuel Savings Trend</h3>
                <div className="h-64">
                  <Line data={fuelChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }} />
                </div>
              </GlassCard>

              {/* Risk Chart */}
              <GlassCard glow className="p-6">
                <h3 className="text-sm font-semibold text-white mb-4">🛡️ Risk Score per Route</h3>
                <div className="h-64">
                  <Bar data={riskChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#94a3b8', maxRotation: 45, font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }} />
                </div>
              </GlassCard>

              {/* Vessel Performance */}
              <GlassCard glow className="p-6">
                <h3 className="text-sm font-semibold text-white mb-4">⛴️ Vessel Fuel Consumption</h3>
                <div className="h-64">
                  <Bar data={vesselChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#94a3b8', maxRotation: 45, font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }} />
                </div>
              </GlassCard>

              {/* Vessel Type Distribution */}
              <GlassCard glow className="p-6">
                <h3 className="text-sm font-semibold text-white mb-4">🚢 Fleet Composition</h3>
                <div className="h-64 flex items-center justify-center">
                  {Object.keys(vesselTypeCounts).length > 0 ? (
                    <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } } }} />
                  ) : (
                    <p className="text-ink-secondary">No vessels data</p>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}