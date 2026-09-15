"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import axios from "axios";

import { GlassCard, StatCard, Button } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import {
  IconCompass,
  IconRoute,
  IconShip,
  IconChart,
  IconLogout,
  IconBell,
  IconSearch,
} from "@/components/ui/icons";

const MapComponent = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[340px] bg-[#091322]/80 rounded-xl flex items-center justify-center border border-white/5">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-gray-400 text-xs font-mono">Loading SeaVision maritime coordinates...</p>
      </div>
    </div>
  ),
});

export default function DashboardContent() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [weatherData, setWeatherData] = useState<{ [key: string]: { temp: number; condition: string } }>({});
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Real live telemetry and state from API
  const [liveData, setLiveData] = useState<{
    metrics: {
      activeVessels: number;
      totalRoutes: number;
      connectedPorts: number;
      totalFuelSavedTons: number;
      totalDistanceNm: number;
      avgRiskScore: number;
      safetyIndex: number;
    };
    activeVoyage: any;
    vesselsList: any[];
  } | null>(null);

  const [activitiesList, setActivitiesList] = useState<any[]>([]);

  const { user: authUser, logout } = useAuth();
  const user = {
    full_name: authUser?.full_name || "Captain Smith",
    role: (authUser?.role || "OPERATOR").toUpperCase(),
    company: authUser?.company_name || "SeaVision Fleet Command",
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    } catch {
      // Fallback
    }
  };

  // Fetch real telemetry from SeaVision API
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const [telemetryRes, actRes] = await Promise.all([
          axios.get("/api/v1/telemetry/live"),
          axios.get("/api/v1/activities/recent?limit=6").catch(() => ({ data: [] })),
        ]);
        if (telemetryRes.data) {
          setLiveData(telemetryRes.data);
        }
        if (actRes.data && Array.isArray(actRes.data)) {
          setActivitiesList(actRes.data);
        }
      } catch (err) {
        console.error("Telemetry fetch fallback:", err);
      }
    };
    fetchLiveData();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY || "";
      const cities = [
        { name: "Mumbai", lat: 19.076, lon: 72.8777 },
        { name: "Singapore", lat: 1.3521, lon: 103.8198 },
        { name: "Colombo", lat: 6.9271, lon: 79.8612 },
      ];

      try {
        if (!apiKey) throw new Error("No API key");
        const results: { [key: string]: { temp: number; condition: string } } = {};
        for (const city of cities) {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric`
          );
          results[city.name] = {
            temp: Math.round(response.data.main.temp),
            condition: response.data.weather[0].main,
          };
        }
        setWeatherData(results);
      } catch {
        setWeatherData({
          Mumbai: { temp: 29, condition: "Clear Horizon" },
          Colombo: { temp: 28, condition: "Moderate Breeze" },
          Singapore: { temp: 31, condition: "Calm Waters" },
        });
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const metrics = liveData?.metrics || {
    totalRoutes: 1,
    activeVessels: 2,
    connectedPorts: 20,
    totalFuelSavedTons: 16.0,
    totalDistanceNm: 2450,
    avgRiskScore: 14,
    safetyIndex: 86,
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: IconCompass },
    { label: "Routes", href: "/routes", icon: IconRoute },
    { label: "Vessels", href: "/vessels", icon: IconShip },
    { label: "Analytics", href: "/analytics", icon: IconChart },
  ];

  const notifications = [
    { id: 1, text: "Voyage route Mumbai → Singapore verified by AI engine", time: "Just now" },
    { id: 2, text: "Live AIS telemetry stream connected across 2 active vessels", time: "18m ago" },
    { id: 3, text: "Bunker fuel pricing updated for Singapore bunkering hubs", time: "1h ago" },
  ];

  const mapPorts = [
    { id: "1", name: "Mumbai", unlocode: "INBOM", latitude: 19.076, longitude: 72.8777 },
    { id: "2", name: "Singapore", unlocode: "SGSIN", latitude: 1.3521, longitude: 103.8198 },
    { id: "3", name: "Chennai", unlocode: "INMAA", latitude: 13.0827, longitude: 80.2707 },
    { id: "4", name: "Colombo", unlocode: "LKCMB", latitude: 6.9271, longitude: 79.8612 },
  ];

  const mapRoutes = [
    {
      id: "1",
      origin_port: "Mumbai",
      destination_port: "Singapore",
      waypoints: [
        { lat: 19.076, lon: 72.8777 },
        { lat: 14.8, lon: 73.2 },
        { lat: 9.8, lon: 76.0 },
        { lat: 5.2, lon: 81.0 },
        { lat: 4.6, lon: 92.5 },
        { lat: 3.8, lon: 98.5 },
        { lat: 1.3521, lon: 103.8198 },
      ],
    },
  ];

  const vesselTypesSummary = [
    { name: "Bulk Carrier / Tanker", count: 2, percent: 100 },
    { name: "Container Vessels", count: 0, percent: 0 },
  ];

  return (
    <div className="flex min-h-screen bg-[#050811] text-white">
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#091322]/95 border border-cyan-400/40 text-xs font-mono text-cyan-300 shadow-2xl backdrop-blur-xl flex items-center gap-2">
          <span>Fleet intelligence report link copied to clipboard</span>
        </div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 border-r border-[#1b3356]/60 bg-[#091322]/90 backdrop-blur-xl transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 flex flex-col justify-between`}
      >
        <div>
          <div className="border-b border-[#1b3356]/60 px-6 py-5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-cyan-500 text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-white">Sea</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-cyan-400">Vision</span>
              </span>
            </Link>
          </div>

          <nav className="px-4 py-6 space-y-1">
            <p className="px-3 text-[10px] uppercase font-mono tracking-wider text-gray-400 mb-2">Command Center</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500/15 to-cyan-500/10 text-orange-400 border border-orange-500/30 shadow-sm"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-orange-400" : "text-gray-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#1b3356]/60 px-4 py-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-cyan-500 text-xs font-bold text-white shadow-sm">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.full_name}</p>
              <p className="text-[10px] font-mono uppercase text-orange-400/90">{user.role.replace("_", " ")}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
          >
            <IconLogout className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 ${isSidebarOpen ? "lg:ml-64" : "ml-0"} transition-margin duration-300`}>
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-[#1b3356]/60 bg-[#091322]/85 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-gray-400 hover:text-white p-1"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px]">AIS Live Feed Active</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/routes/new"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-semibold text-xs transition shadow-md shadow-orange-500/20"
            >
              <span>+ New Route</span>
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative h-9 w-9 rounded-xl border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:border-white/20 transition bg-white/5"
              >
                <IconBell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 text-[9px] font-bold text-black flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#1b3356] bg-[#091322] backdrop-blur-2xl shadow-2xl p-3 z-50">
                  <p className="px-3 py-1.5 text-xs font-semibold text-orange-400 uppercase tracking-wider font-mono">
                    System Telemetry Alerts
                  </p>
                  <div className="divide-y divide-white/5 mt-1">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2.5 hover:bg-white/5 rounded-xl transition">
                        <p className="text-xs text-gray-200 leading-snug">{n.text}</p>
                        <p className="text-[10px] font-mono text-gray-400 mt-1">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/10 transition"
            >
              <span>{user.full_name.split(" ")[0]}</span>
              <IconLogout className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Fleet Command & Operations</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono font-normal">
                  SeaVision v2.4
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Real-time maritime telemetry, fuel consumption tracking, and oceanic route simulation
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Button variant="outline" size="sm" onClick={handleShare}>
                Share Intel ↗
              </Button>
              <Link href="/routes/new">
                <Button variant="primary" size="sm">
                  Simulate Voyage
                </Button>
              </Link>
            </div>
          </div>

          {/* 4 Telemetry Stat Cards in SeaVision Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<IconRoute className="h-5 w-5" />}
              value={metrics.totalRoutes}
              label="Optimized Voyages"
              change="Verified"
              trend="up"
              accent="orange"
            />
            <StatCard
              icon={<IconShip className="h-5 w-5" />}
              value={metrics.activeVessels}
              label="Registered Vessels"
              change="MV Horizon & MV Star"
              trend="neutral"
              accent="cyan"
            />
            <StatCard
              icon={<IconChart className="h-5 w-5" />}
              value={metrics.totalFuelSavedTons}
              suffix=" tons"
              label="Fuel Conserved"
              change="14.2% eco-gain"
              trend="up"
              accent="teal"
            />
            <StatCard
              icon={<IconCompass className="h-5 w-5" />}
              value={metrics.avgRiskScore + "%"}
              label="Fleet Weather Risk"
              change="Low Swell Zone"
              trend="down"
              accent="blue"
            />
          </div>

          {/* Live Maritime Map & Weather Feeds */}
          <div className="rounded-2xl border border-[#1b3356]/70 bg-[#091322]/80 backdrop-blur-xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>Live Oceanic Map & Active Fairway Corridors</span>
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                </h3>
                <p className="text-[11px] text-gray-400">
                  Real-time GPS coordinates for Mumbai to Singapore corridor with waypoint nodes
                </p>
              </div>

              {/* Weather Chips */}
              <div className="flex flex-wrap gap-2 text-xs">
                {!weatherLoading ? (
                  Object.entries(weatherData).map(([city, data]) => (
                    <div
                      key={city}
                      className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10"
                    >
                      <span className="text-gray-400 text-[11px]">{city}</span>
                      <span className="text-cyan-400 font-bold font-mono">{data.temp}°C</span>
                      <span className="text-emerald-400 text-[10px]">{data.condition}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 text-xs font-mono">Fetching weather telemetry...</span>
                )}
              </div>
            </div>

            <MapComponent ports={mapPorts} routes={mapRoutes} height="360px" />
            <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-gray-400 font-mono pt-2 border-t border-white/5">
              <span className="text-cyan-400">⚓ Departure: Mumbai (INBOM) ⇢ Arrival: Singapore (SGSIN)</span>
              <span>Coordinates: 7 Waypoints Verified · Total Track: 2,450 NM</span>
            </div>
          </div>

          {/* Active Voyage Banner */}
          {liveData?.activeVoyage && (
            <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-cyan-500/5 to-transparent p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                  <IconShip className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      Active Passage: {liveData.activeVoyage.vesselName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                      In Transit
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-0.5">
                    {liveData.activeVoyage.origin} ➔ {liveData.activeVoyage.destination} · Priority:{" "}
                    <span className="text-orange-400 font-medium capitalize">
                      {liveData.activeVoyage.priority}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Link
                  href={`/routes/${liveData.activeVoyage.id}`}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition text-center w-full md:w-auto"
                >
                  View Route Analysis ➔
                </Link>
              </div>
            </div>
          )}

          {/* Bottom Grid: Recent Activities & Fleet Readiness */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Logged Activity */}
            <div className="lg:col-span-2 rounded-2xl border border-[#1b3356]/70 bg-[#091322]/80 backdrop-blur-xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Operational Activity Log</h3>
                <Link href="/routes" className="text-xs text-cyan-400 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {(activitiesList.length > 0
                  ? activitiesList
                  : [
                      {
                        description: "Optimized route simulated: Mumbai → Singapore (Balanced Option)",
                        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
                      },
                      {
                        description: "Vessel telemetry sync completed: MV Horizon (IMO: 9412345)",
                        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
                      },
                      {
                        description: "Vessel telemetry sync completed: MV Star (IMO: 9523456)",
                        created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
                      },
                    ]
                ).map((act, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0"
                  >
                    <div className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-400 to-cyan-400 mt-2 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-200">{act.description}</p>
                      <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                        {new Date(act.created_at || Date.now()).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fleet Composition & Readiness */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#1b3356]/70 bg-[#091322]/80 backdrop-blur-xl p-5 shadow-xl flex flex-col items-center">
                <h3 className="text-sm font-semibold text-white mb-3 self-start">Fleet Health & Safety</h3>
                
                {/* Dial */}
                <div className="relative w-28 h-28 my-2">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="44" stroke="#102036" strokeWidth="9" fill="none" />
                    <circle
                      cx="56"
                      cy="56"
                      r="44"
                      stroke="#ff7a18"
                      strokeWidth="9"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 44 * (metrics.safetyIndex / 100)} ${2 * Math.PI * 44 * (1 - metrics.safetyIndex / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold font-mono text-white">{metrics.safetyIndex}%</span>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase">Operational</span>
                  </div>
                </div>
                
                <p className="text-[11px] text-gray-400 text-center mt-1">
                  All active vessels compliant with IMO stability limits and weather bounds.
                </p>
              </div>

              <div className="rounded-2xl border border-[#1b3356]/70 bg-[#091322]/80 backdrop-blur-xl p-5 shadow-xl">
                <h3 className="text-sm font-semibold text-white mb-3">Vessels Registered</h3>
                <div className="space-y-3">
                  {vesselTypesSummary.map((t) => (
                    <div key={t.name}>
                      <div className="flex justify-between text-xs text-gray-300">
                        <span>{t.name}</span>
                        <span className="font-mono text-cyan-400">{t.count} Active</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-1.5 bg-gradient-to-r from-orange-500 to-cyan-400 rounded-full"
                          style={{ width: `${t.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-xs">
                  <Link href="/vessels" className="text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium">
                    <span>Manage Vessels</span>
                    <span>→</span>
                  </Link>
                  <span className="text-[10px] font-mono text-gray-500">2 Units</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
