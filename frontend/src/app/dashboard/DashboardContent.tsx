"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import axios from "axios";

import { GlassCard, StatCard, Button } from "@/components/ui";
import {
  IconCompass,
  IconRoute,
  IconShip,
  IconChart,
  IconLogout,
  IconBell,
  IconSearch,
} from "@/components/ui/icons";

// ✅ Dynamically import Map with no SSR
const MapComponent = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] bg-[#0d2137]/50 rounded-xl flex items-center justify-center border border-white/5">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-gray-400 text-sm">Loading maritime map...</p>
      </div>
    </div>
  ),
});

export default function DashboardContent() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [weatherData, setWeatherData] = useState<{ [key: string]: { temp: number; condition: string } }>({});
  const [weatherLoading, setWeatherLoading] = useState(true);

  // ✅ Mock user
  const user = {
    full_name: "Smith Kennedy",
    role: "OPERATOR",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("✅ Dashboard link copied!");
    } catch {
      alert("Could not copy link.");
    }
  };

  // ✅ Fetch weather
  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY || "";
      const cities = [
        { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
        { name: "Singapore", lat: 1.3521, lon: 103.8198 },
      ];

      try {
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
          Mumbai: { temp: 28, condition: "Partly Cloudy" },
          Singapore: { temp: 31, condition: "Thunderstorm" },
        });
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeather();
  }, []);

  // ============================================
  // STATIC DATA (matches Screenshot 507)
  // ============================================
  const stats = {
    totalRoutes: 14,
    fuelSaved: 0,
    riskScore: 12,
  };

  const activities = [
    { id: "1", description: "Route analyzed: Mumbai → Singapore" },
    { id: "2", description: "Route analyzed: Mumbai → Singapore" },
    { id: "3", description: "Route analyzed: Mumbai → Singapore" },
    { id: "4", description: "Route analyzed: Mumbai → Singapore" },
  ];

  const fleetTypes = [
    { name: "Container", value: 12 },
    { name: "Tanker", value: 8 },
    { name: "Built", value: 4 },
    { name: "Other", value: 16 },
  ];
  const totalFleet = fleetTypes.reduce((sum, t) => sum + t.value, 0);
  const fleetHealth = 68;

  const mapPorts = [
    { id: "1", name: "Mumbai", unlocode: "INBOM", latitude: 19.0760, longitude: 72.8777 },
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
        { lat: 19.0760, lon: 72.8777 },
        { lat: 15.0, lon: 75.0 },
        { lat: 10.0, lon: 80.0 },
        { lat: 5.0, lon: 95.0 },
        { lat: 1.3521, lon: 103.8198 },
      ],
    },
  ];

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: IconCompass },
    { label: "Routes", href: "/routes", icon: IconRoute },
    { label: "Vessels", href: "/vessels", icon: IconShip },
    { label: "Analytics", href: "/analytics", icon: IconChart },
  ];

  const notifications = [
    { id: 1, text: "Route optimization complete", time: "2m ago" },
    { id: 2, text: "Fuel price updated", time: "1h ago" },
  ];

  return (
    <div className="flex min-h-screen bg-[#060b1a]">
      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 border-r border-[#1c2b45] bg-[#0a1628]/80 backdrop-blur-xl transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="border-b border-[#1c2b45] px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/10 border border-cyan-400/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5ec9ff" strokeWidth="2">
                <path d="M3 17l2-6 4 2 4-8 4 8 4-2-2 6" />
                <path d="M2 20h20" />
              </svg>
            </div>
            <span className="text-xl font-[family-name:var(--font-logo)] tracking-tight">
              <span className="text-white">Mar</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Alne</span>
            </span>
          </Link>
        </div>

        <nav className="px-4 py-6 space-y-1">
          <p className="px-3 text-[11px] uppercase tracking-wider text-ink-muted">Main</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <div
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#7c5cff]/10 text-[#7c5cff] shadow-[0_0_20px_rgba(124,92,255,0.1)]"
                    : "text-ink-secondary hover:bg-white/5 hover:text-ink-primary"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </div>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-[#1c2b45] px-4 py-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7c5cff] to-blue-500 text-xs font-bold text-white">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-primary">{user.full_name}</p>
              <p className="text-[10px] uppercase text-ink-muted">{user.role.replace("_", " ")}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-secondary transition-colors hover:bg-status-danger/10 hover:text-status-danger"
          >
            <IconLogout className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT – unchanged */}
      <main className={`flex-1 ${isSidebarOpen ? "lg:ml-64" : "ml-0"} transition-margin duration-300`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a1628]/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center text-ink-secondary hover:text-white hover:border-white/20 transition">
              <IconSearch className="h-4 w-4" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative h-9 w-9 rounded-full border border-white/10 flex items-center justify-center text-ink-secondary hover:text-white hover:border-white/20 transition"
              >
                <IconBell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-status-danger text-[10px] font-bold text-white flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 rounded-lg border border-[#1c2b45] bg-[#0a1628] backdrop-blur-xl shadow-xl p-2 z-50">
                  <p className="px-3 py-2 text-xs font-semibold text-ink-muted uppercase tracking-wider">Notifications</p>
                  {notifications.map((n) => (
                    <div key={n.id} className="px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer">
                      <p className="text-sm text-white">{n.text}</p>
                      <p className="text-[10px] text-ink-muted">{n.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-secondary hover:text-white transition"
            >
              <span className="hidden md:inline">{user.full_name.split(" ")[0]}</span>
              <IconLogout className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* DASHBOARD BODY – same as before, but I'll keep it concise */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-ink-primary">Fleet Overview</h1>
              <p className="text-sm text-ink-muted">Here's what's happening with your fleet today</p>
            </div>
            <Button variant="primary" size="sm" onClick={handleShare}>
              Share Report ↗
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard
              icon={<IconRoute className="h-5 w-5" />}
              value={stats.totalRoutes}
              label="Total Routes"
              accent="violet"
              delay={0}
            />
            <StatCard
              icon={<IconShip className="h-5 w-5" />}
              value={stats.fuelSaved + "%"}
              label="Fuel Saved"
              accent="teal"
              delay={0.1}
            />
            <StatCard
              icon={<IconChart className="h-5 w-5" />}
              value={stats.riskScore + "%"}
              label="Risk Score"
              accent="warning"
              delay={0.2}
            />
          </div>

          <div className="mb-6">
            <GlassCard flat className="p-4 relative">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-white">Live Maritime Map</h3>
                <div className="flex gap-4 text-xs">
                  {!weatherLoading ? (
                    Object.entries(weatherData).map(([city, data]) => (
                      <div key={city} className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                        <span className="text-gray-400">{city}</span>
                        <span className="text-cyan-300 font-bold">{data.temp}°C</span>
                        <span className="text-gray-500 text-[10px]">{data.condition}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500 text-xs">Fetching weather...</span>
                  )}
                </div>
              </div>
              <MapComponent ports={mapPorts} routes={mapRoutes} height="340px" />
              <p className="text-[10px] text-ink-muted mt-2 text-right">
                🗺️ Routes: Mumbai ⇢ Singapore (dashed) | ⚓ Port markers
              </p>
            </GlassCard>
          </div>

          <div className="mb-6">
            <GlassCard flat className="p-4 border border-cyan-400/10 bg-cyan-500/5">
              <p className="text-sm text-cyan-300 font-semibold flex items-center gap-2">
                <span className="text-lg">💡</span> 
                Fuel efficiency improvement since last month: <span className="text-white font-bold">+32%</span>
              </p>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GlassCard flat className="p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  {activities.map((act, index) => (
                    <div key={index} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0">
                      <div className="h-2 w-2 rounded-full bg-[#7c5cff] mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-white">{act.description}</p>
                        <p className="text-[10px] text-ink-muted">
                          {index === 0 ? "Duration: 2h 26m" : "Duration: 2h 27m"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            <div className="space-y-4">
              <GlassCard flat className="p-4 flex flex-col items-center">
                <h3 className="text-sm font-semibold text-white mb-2 self-start">Fleet Health</h3>
                <div className="relative w-28 h-28">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="44" stroke="#1c2b45" strokeWidth="10" fill="none" />
                    <circle
                      cx="56"
                      cy="56"
                      r="44"
                      stroke="#7c5cff"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 44 * (fleetHealth / 100)} ${2 * Math.PI * 44 * (1 - fleetHealth / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold text-white">{fleetHealth}%</span>
                    <span className="text-[10px] text-ink-muted">Active</span>
                  </div>
                </div>
                <p className="text-[10px] text-ink-muted mt-2">Go to Settings to activate Windows.</p>
              </GlassCard>

              <GlassCard flat className="p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Fleet by Type</h3>
                <div className="space-y-3">
                  {fleetTypes.map((type) => {
                    const percentage = (type.value / totalFleet) * 100;
                    return (
                      <div key={type.name}>
                        <div className="flex justify-between text-sm text-gray-300">
                          <span>{type.name}</span>
                          <span className="text-ink-muted">{type.value}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#1c2b45] rounded-full overflow-hidden mt-1">
                          <div
                            className="h-1.5 bg-gradient-to-r from-[#7c5cff] to-cyan-400 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-xs text-ink-muted flex justify-between border-t border-white/5 pt-3">
                  <span>View details</span>
                  <span>→</span>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}