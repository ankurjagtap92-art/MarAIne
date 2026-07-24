"use client";

import { useState } from "react";
import { IconSearch, IconBell, IconLogout } from "@/components/ui/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = ["Overview", "Reports", "Analytics"];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a1628]/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Pill navigation */}
        <div className="flex items-center gap-1 rounded-full bg-white/[0.04] p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm rounded-full transition-all ${
                activeTab === tab
                  ? "bg-glow-primary text-white shadow-[0_0_20px_rgba(124,92,255,0.3)]"
                  : "text-ink-secondary hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search – icon-only, expandable */}
        <button className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center text-ink-secondary hover:text-white hover:border-white/20 transition">
          <IconSearch className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button className="relative h-9 w-9 rounded-full border border-white/10 flex items-center justify-center text-ink-secondary hover:text-white hover:border-white/20 transition">
          <IconBell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-status-danger text-[10px] font-bold text-white flex items-center justify-center">
            3
          </span>
        </button>

        {/* User + logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-secondary hover:text-white transition"
        >
          <span className="hidden md:inline">{user?.full_name?.split(" ")[0] || "User"}</span>
          <IconLogout className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}