"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Ship, LayoutDashboard, Route as RouteIcon, Anchor, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1c2b45] bg-[#07111e]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/30 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-md shadow-cyan-500/20 group-hover:border-cyan-400 transition-all">
            <Ship className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Mar<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">AI</span>ne
          </span>
        </Link>

        {/* Links & Auth State */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-cyan-300 hover:bg-white/5 transition"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                  Dashboard
                </Link>
                <Link
                  href="/vessels"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-cyan-300 hover:bg-white/5 transition"
                >
                  <Anchor className="w-3.5 h-3.5 text-cyan-400" />
                  Fleet
                </Link>
                <Link
                  href="/routes"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-cyan-300 hover:bg-white/5 transition"
                >
                  <RouteIcon className="w-3.5 h-3.5 text-cyan-400" />
                  Sea Lanes
                </Link>
              </div>

              <div className="h-4 w-px bg-white/10 hidden md:block" />

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0d2137] border border-cyan-500/20 text-xs">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-white font-medium truncate max-w-[130px]">
                    {user.full_name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[10px] font-mono text-cyan-300 uppercase">
                    {user.role || "Officer"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-gray-300 hover:text-cyan-300 transition text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-[#04101f] font-semibold rounded-lg text-sm shadow-md shadow-cyan-500/25 hover:shadow-cyan-400/40 transition-all hover:scale-[1.02] active:scale-95"
              >
                Join Fleet
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
