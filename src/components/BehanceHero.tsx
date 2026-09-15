"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "./LoginModal";
import {
  Radio,
  Sparkles,
  ArrowRight,
  Share2,
  Bookmark,
  Ship,
  Menu,
  X,
  Compass,
  ShieldCheck,
  Fuel,
  Globe,
  Activity,
  MapPin,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react";

export default function BehanceHero() {
  const [activeTab, setActiveTab] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication state
  const { user, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Login Modal State
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalTarget, setLoginModalTarget] = useState("/dashboard");
  const [loginModalLabel, setLoginModalLabel] = useState("SeaVision Command");
  const [loginModalMode, setLoginModalMode] = useState<"login" | "register">("login");

  useEffect(() => {
    setMounted(true);
  }, []);

  const authed = mounted && isAuthenticated;

  const handleAuthAction = (e: React.MouseEvent, targetUrl: string, targetLabel: string) => {
    if (authed) {
      // Already logged in: proceed further to targetUrl
      return;
    }
    // Not logged in: intercept and open login panel modal with target remembered
    e.preventDefault();
    setLoginModalTarget(targetUrl);
    setLoginModalLabel(targetLabel);
    setLoginModalMode("login");
    setLoginModalOpen(true);
  };

  // Live real data state from SeaVision telemetry API
  const [liveData, setLiveData] = useState<{
    metrics: {
      activeVessels: number;
      totalRoutes: number;
      connectedPorts: number;
      totalFuelSavedTons: number;
      totalDistanceNm: number;
      totalCalculatedCostUsd: number;
      avgRiskScore: number;
      safetyIndex: number;
    };
    activeVoyage: any;
    vesselsList: any[];
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await axios.get("/api/v1/telemetry/live");
        if (res.data) {
          setLiveData(res.data);
        }
      } catch (err) {
        console.warn("Live telemetry fallback:", err);
      }
    };
    fetchTelemetry();
  }, []);

  const metrics = liveData?.metrics || {
    activeVessels: 2,
    totalRoutes: 1,
    connectedPorts: 20,
    totalFuelSavedTons: 16.0,
    totalDistanceNm: 2450,
    totalCalculatedCostUsd: 115200,
    avgRiskScore: 14,
    safetyIndex: 86,
  };

  const activeVoyage = liveData?.activeVoyage || {
    id: "r-mumbai-singapore",
    vesselName: "MV Horizon",
    vesselType: "tanker",
    imo: "9412345",
    origin: "Mumbai",
    destination: "Singapore",
    priority: "balanced",
    status: "completed",
    recommendedOption: {
      route_type: "balanced",
      total_distance_nm: 2450,
      estimated_duration_hours: 165,
      total_fuel_tons: 192,
      fuel_cost_usd: 115200,
      weather_risk_score: 14,
    },
    allOptionsCount: 4,
  };

  return (
    <div className="relative min-h-screen bg-[#050811] text-white overflow-hidden flex flex-col justify-between selection:bg-orange-500/30 selection:text-orange-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#091322]/95 border border-cyan-400/40 text-xs font-mono text-cyan-300 shadow-2xl backdrop-blur-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =====================================================================
          1. BACKGROUND SCENE: Colossal Commercial Container Ship (Website Hero)
          ===================================================================== */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* Deep Ocean & Mega Container Vessel Photographic Canvas */}
        <div className="absolute inset-0">
          <Image
            src="/images/mega-vessel-hero.jpg"
            alt="Colossal modern commercial container ship cutting through ocean waters at sunset"
            fill
            priority
            quality={95}
            className="object-cover object-[center_36%] scale-[1.01] filter brightness-[0.96] contrast-[1.06] saturate-[1.14]"
          />
        </div>

        {/* Soft atmospheric vignettes that keep the ship crisp and fully visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-transparent to-[#050811]/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050811]/60 via-transparent to-[#050811]/80" />

        {/* Ambient Warm Golden Horizon Light & Cyan Ocean Wake Highlights */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[340px] bg-gradient-to-b from-orange-500/15 via-amber-500/10 to-cyan-500/5 blur-[130px] pointer-events-none" />

        {/* Vessel Bow Illumination Halo */}
        <div className="absolute top-[38%] left-1/2 -translate-x-1/2 w-[700px] h-[260px] bg-gradient-to-tr from-cyan-400/10 to-orange-400/10 blur-[100px] pointer-events-none" />

        {/* Subtle Maritime Coordinate Navigation Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,216,255,0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,122,24,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }}
        />

        {/* Ambient subtle sea mist to seamlessly blend into lower sections */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050811] via-[#050811]/60 to-transparent pointer-events-none" />
      </div>

      {/* =====================================================================
          2. TOP HEADER NAVIGATION (Floating Pill Style in Orange & Cyan Theme)
          ===================================================================== */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo: SeaVision with Hex/Anchor Icon */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
              <div className="w-5 h-5 border-2 border-white rounded-md flex items-center justify-center rotate-6 group-hover:rotate-12 transition-transform">
                <Ship className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white font-sans flex items-center">
                <span>Sea</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-cyan-400">Vision</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-orange-400 font-mono -mt-1">
                Maritime Intelligence
              </span>
            </div>
          </Link>

          {/* Center Capsule Floating Menu */}
          <div className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#091322]/80 border border-white/10 backdrop-blur-xl shadow-xl shadow-black/40">
            {[
              { id: "home", label: "Home", href: "#home" },
              { id: "routes", label: "Route Engine", href: "#routes" },
              { id: "fleet", label: "Fleet Command", href: "#fleet" },
              { id: "analytics", label: "Analytics", href: "#analytics" },
              { id: "ports", label: "Ports", href: "#ports" },
              { id: "new-route", label: "+ Plan Voyage", href: "/routes/new" },
            ].map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  if (item.id === "new-route") {
                    handleAuthAction(e, "/routes/new", "Voyage Planner");
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-orange-500/20 to-cyan-500/20 text-white font-semibold border border-orange-500/30 shadow-sm"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Action Group */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              href="/routes/new"
              onClick={(e) => handleAuthAction(e, "/routes/new", "Voyage Simulation")}
              id="nav-simulate-route-btn"
              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition backdrop-blur-md"
            >
              Simulate Route
            </Link>

            {!authed ? (
              <>
                {/* Clear Log In Button */}
                <button
                  type="button"
                  id="nav-login-btn"
                  onClick={() => {
                    setLoginModalTarget("/dashboard");
                    setLoginModalLabel("Command Center Access");
                    setLoginModalMode("login");
                    setLoginModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-cyan-400/50 text-white font-semibold text-xs transition shadow-sm backdrop-blur-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Log In</span>
                </button>

                {/* Clear Sign Up Button */}
                <button
                  type="button"
                  id="nav-signup-btn"
                  onClick={() => {
                    setLoginModalTarget("/dashboard");
                    setLoginModalLabel("Create Fleet Account");
                    setLoginModalMode("register");
                    setLoginModalOpen(true);
                  }}
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-xs transition shadow-md shadow-orange-500/25 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-black" />
                  <span>Sign Up</span>
                </button>
              </>
            ) : (
              <>
                {/* Authenticated Officer Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#091322]/90 border border-emerald-500/30 backdrop-blur-md text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-gray-300 font-mono text-[11px] truncate max-w-[120px]">
                    {user?.full_name || "Fleet Officer"}
                  </span>
                  <span className="text-[10px] text-emerald-400 uppercase font-mono font-semibold">Active</span>
                </div>

                {/* Proceed to Dashboard Button */}
                <Link
                  href="/dashboard"
                  id="nav-dashboard-btn"
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:brightness-110 text-white font-semibold text-xs transition shadow-md shadow-cyan-500/20 flex items-center gap-1.5 active:scale-95"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {/* Sign Out Button */}
                <button
                  type="button"
                  id="nav-logout-btn"
                  onClick={logout}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-300 transition text-xs cursor-pointer"
                  title="Sign out of SeaVision"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 p-4 rounded-2xl bg-[#091322]/95 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col gap-3">
            <Link
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-white py-1 px-2 rounded-lg hover:bg-white/5"
            >
              Home
            </Link>
            <Link
              href="#routes"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-gray-300 py-1 px-2 rounded-lg hover:bg-white/5"
            >
              Route Engine
            </Link>
            <Link
              href="#fleet"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-gray-300 py-1 px-2 rounded-lg hover:bg-white/5"
            >
              Fleet Command
            </Link>
            <Link
              href="#analytics"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-gray-300 py-1 px-2 rounded-lg hover:bg-white/5"
            >
              Maritime Analytics
            </Link>
            <Link
              href="#ports"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-gray-300 py-1 px-2 rounded-lg hover:bg-white/5"
            >
              Global Ports
            </Link>
            <Link
              href="/routes/new"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleAuthAction(e, "/routes/new", "Voyage Planner");
              }}
              className="text-sm text-orange-400 font-medium py-1 px-2 rounded-lg hover:bg-white/5"
            >
              + Plan New Voyage
            </Link>
            
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              {!authed ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="mobile-nav-login-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLoginModalTarget("/dashboard");
                      setLoginModalLabel("Command Center Access");
                      setLoginModalMode("login");
                      setLoginModalOpen(true);
                    }}
                    className="text-center py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Log In</span>
                  </button>

                  <button
                    type="button"
                    id="mobile-nav-signup-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLoginModalTarget("/dashboard");
                      setLoginModalLabel("Create Fleet Account");
                      setLoginModalMode("register");
                      setLoginModalOpen(true);
                    }}
                    className="text-center py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-black" />
                    <span>Sign Up</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-2 text-xs text-gray-300 font-mono">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Online Officer</span>
                    </span>
                    <span className="text-white font-semibold truncate max-w-[150px]">{user?.full_name}</span>
                  </div>
                  <Link
                    href="/dashboard"
                    id="mobile-nav-dashboard-btn"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-2"
                  >
                    <span>Enter Command Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    id="mobile-nav-logout-btn"
                    className="w-full text-center py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-red-300 transition flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =====================================================================
          3. MAIN HERO SHOWCASE: Floating Bento Metrics + Real Data Display
          ===================================================================== */}
      <main id="hero-main-container" className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16 lg:py-20 flex flex-col items-center justify-between min-h-[calc(100vh-140px)]">
        
        {/* =====================================================================
            HERO CENTER STAGE: Completely Unobstructed, Highlighting the Big Vessel
            ===================================================================== */}
        <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center my-auto pt-4 pb-8">
          
          {/* Flagship Vessel Live AIS Telemetry Tag */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-[#091322]/70 hover:bg-[#091322]/90 border border-orange-500/40 backdrop-blur-xl text-xs text-gray-200 mb-6 shadow-2xl shadow-black/50 transition">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <Ship className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-orange-300 font-mono text-[11px] font-semibold tracking-wide uppercase">
              Flagship Carrier: MV SeaVision Horizon
            </span>
            <span className="text-white/30 hidden sm:inline">|</span>
            <span className="text-cyan-300 font-mono text-[11px] hidden sm:inline">
              IMO 9872412 · 24,000 TEU · AIS Transmitting (18.4 kts)
            </span>
            <button
              onClick={() => showToast("Flagship Carrier: MV SeaVision Horizon · Ultra Large Container Vessel · Hull Length 399m · Draft 16.0m")}
              className="ml-1 text-[10px] text-gray-400 hover:text-white underline underline-offset-2"
            >
              Specs
            </button>
          </div>

          {/* Grand Hero Typography */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.04] font-sans drop-shadow-[0_8px_40px_rgba(0,0,0,0.95)]">
            Seamless <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-200 to-cyan-300">
              Cargo Control
            </span>
          </h1>

          {/* Subtitle with High-Contrast Legibility */}
          <p className="mt-5 max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-gray-200 font-normal leading-relaxed drop-shadow-[0_3px_16px_rgba(0,0,0,0.95)]">
            Algorithmic voyage routing, real-time AIS transponder tracking, and hydrodynamic fuel conservation across 20 global deepwater ports.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/routes/new"
              id="hero-plan-voyage-btn"
              onClick={(e) => handleAuthAction(e, "/routes/new", "Voyage Planner")}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-sm shadow-2xl shadow-orange-500/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Plan A Voyage</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>

            <Link
              href="/vessels"
              id="hero-fleet-btn"
              onClick={(e) => handleAuthAction(e, "/vessels", "Fleet AIS Command")}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#091322]/80 hover:bg-[#091322] border border-cyan-400/40 hover:border-cyan-400 text-white font-medium text-sm backdrop-blur-xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Ship className="w-4 h-4 text-cyan-400" />
              <span>Fleet AIS Command</span>
            </Link>

            <Link
              href="/routes"
              id="hero-routes-btn"
              onClick={(e) => handleAuthAction(e, "/routes", "Route Engine")}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-gray-200 hover:text-white font-medium text-sm backdrop-blur-md shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-orange-400" />
              <span>Route Engine</span>
            </Link>
          </div>

          {/* Quick Authentication Direct Access for Landing Page Visitors */}
          {!authed && (
            <div className="mt-4 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/60 border border-orange-500/30 backdrop-blur-md text-xs text-gray-300 shadow-xl">
              <span className="text-orange-400 font-medium">Ready to command the fleet?</span>
              <button
                type="button"
                onClick={() => {
                  setLoginModalTarget("/dashboard");
                  setLoginModalLabel("Command Center Access");
                  setLoginModalMode("login");
                  setLoginModalOpen(true);
                }}
                id="hero-chip-login-btn"
                className="text-white font-semibold hover:text-orange-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Log In</span>
              </button>
              <span className="text-white/20">•</span>
              <button
                type="button"
                onClick={() => {
                  setLoginModalTarget("/dashboard");
                  setLoginModalLabel("Create Fleet Account");
                  setLoginModalMode("register");
                  setLoginModalOpen(true);
                }}
                id="hero-chip-signup-btn"
                className="text-orange-400 font-semibold hover:text-orange-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-orange-400" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* Live Vessel Marine Vector Indicator */}
          <div className="mt-7 inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-[11px] font-mono text-gray-300">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>HEADING 094° ESE</span>
            </span>
            <span className="text-white/20">•</span>
            <span className="text-orange-300">LAT 18°56'N, LON 72°49'E</span>
            <span className="text-white/20">•</span>
            <span className="text-emerald-300">SWELL 1.8M (CALM)</span>
          </div>

        </div>

        {/* =====================================================================
            UNOBTRUSIVE BOTTOM TELEMETRY DOCK: Low Profile, Real Data, Zero View Blocking
            ===================================================================== */}
        <div className="w-full mt-6">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2 px-2">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-400">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>LIVE TELEMETRY DOCK</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              REAL-TIME MARITIME REPOSITORY
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            
            {/* Dock 1: Connected Ports */}
            <div className="group p-3 rounded-2xl bg-[#091322]/75 hover:bg-[#091322]/95 border border-white/10 hover:border-cyan-400/50 backdrop-blur-xl shadow-xl transition-all">
              <div className="flex items-center justify-between text-gray-400 text-[10px] mb-1">
                <span className="text-gray-300 font-medium">Global Hubs</span>
                <Globe className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-lg font-bold font-mono text-white tracking-tight">
                {metrics.connectedPorts} Ports
              </div>
              <div className="text-[10px] text-cyan-400 font-medium truncate mt-0.5">
                UN/LOCODE Standard
              </div>
            </div>

            {/* Dock 2: Fuel Conserved */}
            <div className="group p-3 rounded-2xl bg-[#091322]/75 hover:bg-[#091322]/95 border border-white/10 hover:border-orange-500/50 backdrop-blur-xl shadow-xl transition-all">
              <div className="flex items-center justify-between text-gray-400 text-[10px] mb-1">
                <span className="text-gray-300 font-medium">Fuel Conserved</span>
                <Fuel className="w-3 h-3 text-orange-400" />
              </div>
              <div className="text-lg font-bold font-mono text-white tracking-tight">
                {metrics.totalFuelSavedTons} Tons
              </div>
              <div className="text-[10px] text-emerald-400 font-medium truncate mt-0.5">
                14.2% Eco Reduction
              </div>
            </div>

            {/* Dock 3: Active Fleet */}
            <div className="group p-3 rounded-2xl bg-[#091322]/75 hover:bg-[#091322]/95 border border-white/10 hover:border-cyan-400/50 backdrop-blur-xl shadow-xl transition-all">
              <div className="flex items-center justify-between text-gray-400 text-[10px] mb-1">
                <span className="text-gray-300 font-medium">Active Vessels</span>
                <Ship className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-lg font-bold font-mono text-white tracking-tight">
                {metrics.activeVessels} Units
              </div>
              <div className="text-[10px] text-gray-300 font-medium truncate mt-0.5">
                MV Horizon · MV Star
              </div>
            </div>

            {/* Dock 4: Safety Compliance */}
            <div className="group p-3 rounded-2xl bg-[#091322]/75 hover:bg-[#091322]/95 border border-white/10 hover:border-emerald-500/50 backdrop-blur-xl shadow-xl transition-all">
              <div className="flex items-center justify-between text-gray-400 text-[10px] mb-1">
                <span className="text-gray-300 font-medium">Safety Score</span>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-lg font-bold font-mono text-white tracking-tight text-emerald-400">
                {metrics.safetyIndex}%
              </div>
              <div className="text-[10px] text-emerald-400 font-medium truncate mt-0.5">
                Wave Height &lt; 4.0m
              </div>
            </div>

            {/* Dock 5: Current Passage */}
            <div className="group p-3 rounded-2xl bg-[#091322]/75 hover:bg-[#091322]/95 border border-white/10 hover:border-orange-400/50 backdrop-blur-xl shadow-xl transition-all">
              <div className="flex items-center justify-between text-gray-400 text-[10px] mb-1">
                <span className="text-gray-300 font-medium">Live Corridor</span>
                <MapPin className="w-3 h-3 text-orange-400" />
              </div>
              <div className="text-sm font-bold font-mono text-white tracking-tight truncate">
                {activeVoyage.origin} ➔ {activeVoyage.destination}
              </div>
              <div className="text-[10px] text-orange-400 font-medium truncate mt-0.5">
                {activeVoyage.recommendedOption?.total_distance_nm || 2450} NM · Optimal
              </div>
            </div>

            {/* Dock 6: VHF Communications */}
            <div className="group p-3 rounded-2xl bg-[#091322]/75 hover:bg-[#091322]/95 border border-white/10 hover:border-cyan-400/50 backdrop-blur-xl shadow-xl transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 text-[10px] mb-1">
                <span className="text-gray-300 font-medium">VHF Dispatch</span>
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              </div>
              <div className="text-lg font-bold font-mono text-white tracking-tight">
                Ch. 16
              </div>
              <button
                onClick={() => showToast("Port Radio & Maritime VHF Ch.16 Calling Frequency Active")}
                className="text-[10px] text-cyan-400 hover:text-white font-medium text-left truncate mt-0.5"
              >
                Traffic Watch Link
              </button>
            </div>

          </div>
        </div>

      </main>

      {/* =====================================================================
          4. BOTTOM BAR: System Credentials & Share Action
          ===================================================================== */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-gray-400 text-xs font-mono">
            <span className="text-[10px] uppercase tracking-widest text-orange-400">
              SEAVISION ENGINE
            </span>
            <span className="text-gray-300 hover:text-white transition">
              AIS Live Feeds
            </span>
            <span className="text-gray-300 hover:text-white transition">
              NOAA Wave Grids
            </span>
            <span className="text-gray-300 hover:text-white transition">
              Gemini Maritime Intelligence
            </span>
            <span className="text-gray-300 hover:text-white transition text-cyan-400">
              IMO Annex VI Compliant
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast("Bookmarked SeaVision fleet session!")}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition"
              title="Bookmark"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "SeaVision Maritime Intelligence",
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  showToast("SeaVision link copied to clipboard!");
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>

        </div>
      </footer>

      {/* Interactive Login & Registration Modal Panel */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        targetUrl={loginModalTarget}
        targetLabel={loginModalLabel}
        initialMode={loginModalMode}
      />
    </div>
  );
}
