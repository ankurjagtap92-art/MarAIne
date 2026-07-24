"use client";

import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { GlassCard, StatCard, Button, Badge } from "@/components/ui";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  IconCompass,
  IconRoute,
  IconShip,
  IconChart,
  IconLogout,
  IconBell,
  IconSearch,
} from "@/components/ui/icons";
import dynamic from "next/dynamic";
import api from "@/lib/api";

ChartJS.register(ArcElement, Tooltip, Legend);

const GaugeChart = dynamic(() => import("@/components/ui/GaugeChart"), { ssr: false });
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const [stats] = useState({
    totalRoutes: 24,
    fuelSaved: 18.5,
    riskScore: 12,
    activeVessels: 7,
  });
  const [activities] = useState([
    { id: "1", description: "Route analyzed: Mumbai → Singapore", created_at: new Date().toISOString() },
    { id: "2", description: "Added vessel: MV Horizon", created_at: new Date().toISOString() },
  ]);
  const [ports] = useState([
    { id: "1", name: "Mumbai", unlocode: "INBOM", latitude: 18.94, longitude: 72.83 },
    { id: "2", name: "Singapore", unlocode: "SGSIN", latitude: 1.29, longitude: 103.85 },
  ]);
  const [routesWithWaypoints] = useState([]);

  const handleLogout = () => { logout(); router.push("/"); };
  const handleShare = async () => {
    try { await navigator.clipboard.writeText(window.location.href); alert("✅ Copied!"); } catch { alert("Could not copy."); }
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: IconCompass },
    { label: "Routes", href: "/routes", icon: IconRoute },
    { label: "Vessels", href: "/vessels", icon: IconShip },
    { label: "Analytics", href: "/analytics", icon: IconChart },
  ];

  const chartData = {
    labels: ["Container", "Tanker", "Bulk", "Other"],
    values: [4, 3, 2, 1],
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-[#060b1a]">
        {/* Sidebar */}
        <aside className="fixed top-0 left-0 z-50 h-full w-64 border-r border-[#1c2b45] bg-[#0a1628]/80 backdrop-blur-xl transition-transform duration-300">
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
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive ? "bg-[#7c5cff]/10 text-[#7c5cff]" : "text-ink-secondary hover:bg-white/5 hover:text-ink-primary"}`}>
                  <Icon className="h-5 w-5" /> {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 border-t border-[#1c2b45] px-4 py-4">
            <div className="flex items-center gap-3 px-2 mb-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7c5cff] to-blue-500 text-xs font-bold text-white">
                {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="truncate text-sm font-medium text-ink-primary">{user?.full_name || "User"}</p>
                <p className="text-[10px] uppercase text-ink-muted">{user?.role?.replace("_", " ") || "Operator"}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-secondary transition-colors hover:bg-status-danger/10 hover:text-status-danger">
              <IconLogout className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a1628]/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden text-gray-400 hover:text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center text-ink-secondary hover:text-white hover:border-white/20 transition">
                <IconSearch className="h-4 w-4" />
              </button>
              <button className="relative h-9 w-9 rounded-full border border-white/10 flex items-center justify-center text-ink-secondary hover:text-white hover:border-white/20 transition">
                <IconBell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-status-danger text-[10px] font-bold text-white flex items-center justify-center">3</span>
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-secondary hover:text-white transition">
                <span className="hidden md:inline">{user?.full_name?.split(" ")[0] || "User"}</span>
                <IconLogout className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-ink-primary">Fleet Overview</h1>
                <p className="text-sm text-ink-muted">Here's what's happening with your fleet today</p>
              </div>
              <Button variant="primary" size="sm" onClick={handleShare}>Share Report ↗</Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {[
                { label: "Total Routes", value: stats.totalRoutes, icon: IconRoute, color: "violet" },
                { label: "Fuel Saved", value: stats.fuelSaved + "%", icon: IconShip, color: "teal" },
                { label: "Risk Score", value: stats.riskScore + "/100", icon: IconChart, color: "warning" },
                { label: "Active Vessels", value: stats.activeVessels, icon: IconCompass, color: "violet" },
              ].map((stat, i) => (
                <StatCard key={i} icon={<stat.icon className="h-5 w-5" />} value={stat.value} label={stat.label} accent={stat.color as any} delay={i * 0.1} />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <GlassCard flat className="col-span-2 p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Interactive Fleet Map</h3>
                <div className="h-[320px] w-full">
                  <Map ports={ports} routes={routesWithWaypoints} height="320px" />
                </div>
              </GlassCard>
              <GlassCard flat className="col-span-1 p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Recent Activity</h3>
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 border-b border-white/5 pb-3">
                    <div className="h-2 w-2 rounded-full bg-[#7c5cff] mt-2" />
                    <div>
                      <p className="text-sm text-white">{act.description}</p>
                      <p className="text-[10px] text-ink-muted">{new Date(act.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </GlassCard>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <GlassCard flat className="col-span-1 bg-gradient-to-br from-[#7c5cff] to-violet-700 border-none p-5 flex flex-col justify-between min-h-[180px]">
                <div>
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Insight</p>
                  <p className="text-3xl font-bold text-white mt-1">+32%</p>
                  <p className="text-sm text-white/80">Fuel efficiency improvement since last month</p>
                </div>
                <button className="mt-3 self-start bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm transition">View details →</button>
              </GlassCard>

              <GlassCard flat className="col-span-1 p-4">
                <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Fleet by Type</h4>
                <div className="h-32 mt-2 flex items-center justify-center">
                  <Doughnut
                    data={{
                      labels: chartData.labels,
                      datasets: [{ data: chartData.values, backgroundColor: ["#7c5cff", "#00d4ff", "#00ffc8", "#f59e0b"], borderWidth: 0 }],
                    }}
                    options={{ plugins: { legend: { display: false } }, cutout: "70%", maintainAspectRatio: false }}
                  />
                </div>
              </GlassCard>

              <GlassCard flat className="col-span-1 p-4 flex flex-col items-center justify-center">
                <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wider self-start">Fleet Health</h4>
                <GaugeChart value={68} size={120} label="68%" sublabel="Overall" className="mt-2" />
              </GlassCard>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}