"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import BehanceHero from "@/components/BehanceHero";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/LoginModal";
import {
  Ship,
  Navigation,
  ShieldCheck,
  Compass,
  Fuel,
  DollarSign,
  Anchor,
  Clock,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  BarChart3,
  MapPin,
  TrendingDown,
  Gauge,
  Radio,
  LogIn,
  UserPlus,
} from "lucide-react";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Login Modal State for Landing Page Actions
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
      // User is logged in: allow normal navigation to proceed
      return;
    }
    // User is NOT logged in: intercept and open login panel modal
    e.preventDefault();
    setLoginModalTarget(targetUrl);
    setLoginModalLabel(targetLabel);
    setLoginModalMode("login");
    setLoginModalOpen(true);
  };
  return (
    <div className="min-h-screen bg-[#050811] text-white selection:bg-orange-500/30 selection:text-orange-200 scroll-smooth">

      {/* ============================================================
          SECTION 1: HERO SHOWCASE (id="home")
          ============================================================ */}
      <section id="home">
        <BehanceHero />
      </section>

      {/* ============================================================
          SECTION 2: ROUTE ENGINE & VOYAGE STRATEGIES (id="routes")
          ============================================================ */}
      <section id="routes" className="relative py-20 px-6 border-t border-[#1b3356]/40 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400 mb-3 font-mono flex items-center justify-center gap-2">
              <Compass className="w-3.5 h-3.5" />
              <span>PRACTICAL NAVIGATION SCIENCE</span>
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Route Engine: <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-400">Multi-Objective Optimization</span>
            </h2>
            <p className="mt-4 text-gray-300 text-sm md:text-base leading-relaxed">
              In real maritime logistics, a ship cannot just sail in a straight line. The route engine calculates 
              safe sea corridors between ports, avoids shallow waters and heavy storm swells, and balances fuel consumption against delivery schedules.
            </p>
          </div>

          {/* Bridge Photo & Haversine Distance Explanation Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
            <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-[#1b3356] group shadow-2xl">
              <Image
                src="/images/bridge-navigation.jpg"
                alt="Ship bridge navigation consoles and ocean view"
                width={800}
                height={400}
                className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-[#050811]/50 to-transparent" />
              
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-[#091322]/90 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
                  <Navigation className="w-3.5 h-3.5 text-orange-400" />
                  <span>Real Navigation Bridge Technology</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-200">
                  Electronic Chart Display and Information Systems (ECDIS) calculate great-circle waypoints 
                  while GPS receivers and radar monitor ship position in real time.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-2xl bg-[#091322]/85 border border-[#1b3356] shadow-xl">
                <div className="flex items-center gap-2 text-xs font-mono text-orange-400 mb-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                  <span>ALGORITHM 1: HAVERSINE DISTANCE</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Great-Circle Navigation</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Because the Earth is a sphere, the shortest distance between two ports is not a straight flat line on a map, 
                  but an arc of a great circle calculated using trigonometric latitude and longitude:
                </p>
                <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-cyan-300">
                  d = 2R · arcsin(√(sin²(Δφ/2) + cos φ₁ · cos φ₂ · sin²(Δλ/2)))
                </div>
                <p className="text-[11px] text-gray-400 mt-2">
                  Where <span className="text-white">R = 6,371 km</span> (Earth's radius), yielding exact Nautical Miles (NM).
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#091322]/85 border border-[#1b3356] shadow-xl">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>ALGORITHM 2: WEATHER SWELL RESISTANCE</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Wave & Monsoon Factoring</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Strong headwinds and wave swells higher than 3.5 meters dramatically increase hull drag. 
                  Sailing around an active storm front is often faster and saves more fuel than pushing through high waves!
                </p>
              </div>
            </div>
          </div>

          {/* The 4 Real Route Strategies Grid */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-orange-400" />
              <span>The 4 Practical Route Profiles Calculated by SeaVision</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Profile 1: Fastest */}
              <div className="p-5 rounded-2xl bg-[#091322]/85 border border-white/10 hover:border-cyan-400/50 transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-mono font-bold uppercase">
                      18 - 20 Knots
                    </span>
                    <Clock className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-cyan-400 transition">Fastest Corridor</h4>
                  <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                    Prioritizes minimum travel hours for time-sensitive or high-value refrigerated cargo. Higher engine RPM burns more bunker fuel.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-[11px] font-mono text-gray-400 flex justify-between">
                  <span>Transit Time:</span>
                  <span className="text-cyan-400 font-bold">Shortest</span>
                </div>
              </div>

              {/* Profile 2: Eco / Cheapest */}
              <div className="p-5 rounded-2xl bg-[#091322]/85 border border-white/10 hover:border-emerald-400/50 transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                      Slow Steaming (12 - 14 kts)
                    </span>
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition">Cheapest (Fuel Saver)</h4>
                  <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                    Utilizes maritime "slow steaming". Because engine power scales with the cube of speed (P ∝ v³), sailing at 13 knots cuts fuel consumption by ~35%.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-[11px] font-mono text-gray-400 flex justify-between">
                  <span>Bunker Cost:</span>
                  <span className="text-emerald-400 font-bold">Lowest Burn</span>
                </div>
              </div>

              {/* Profile 3: Safest */}
              <div className="p-5 rounded-2xl bg-[#091322]/85 border border-white/10 hover:border-amber-400/50 transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-400 text-[10px] font-mono font-bold uppercase">
                      Risk Index &lt; 20/100
                    </span>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition">Safest Corridor</h4>
                  <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                    Steers well clear of seasonal cyclones, heavy monsoonal sea swells, and narrow congested choke areas to protect crew, hull, and cargo.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-[11px] font-mono text-gray-400 flex justify-between">
                  <span>Wave Risk:</span>
                  <span className="text-amber-400 font-bold">Minimal Swell</span>
                </div>
              </div>

              {/* Profile 4: Balanced */}
              <div className="p-5 rounded-2xl bg-[#0c182a] border border-orange-500/40 shadow-[0_0_20px_rgba(255,122,24,0.12)] group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-400 text-[10px] font-mono font-bold uppercase">
                      Recommended
                    </span>
                    <Navigation className="w-4 h-4 text-orange-400" />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-orange-400 transition">Balanced Corridor</h4>
                  <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                    The optimal commercial equilibrium: maintains contract delivery dates without wasteful fuel spikes while steering through calm sea fairways.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-[11px] font-mono text-gray-400 flex justify-between">
                  <span>Efficiency:</span>
                  <span className="text-orange-400 font-bold">Optimal Blend</span>
                </div>
              </div>

            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/routes/new"
              id="landing-simulate-voyage-btn"
              onClick={(e) => handleAuthAction(e, "/routes/new", "Voyage Simulation")}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-black font-semibold text-xs shadow-lg shadow-orange-500/20 hover:from-orange-400 hover:to-amber-400 transition cursor-pointer"
            >
              Simulate a Live Voyage Route ➔
            </Link>
            <Link
              href="/routes"
              id="landing-browse-routes-btn"
              onClick={(e) => handleAuthAction(e, "/routes", "Route Corridors")}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition cursor-pointer"
            >
              Browse Saved Route Corridors
            </Link>
          </div>

        </div>
      </section>

      {/* ============================================================
          SECTION 3: FLEET COMMAND & VESSEL REGISTRY (id="fleet")
          ============================================================ */}
      <section id="fleet" className="relative py-20 px-6 border-t border-[#1b3356]/40 bg-[#070d18]/60">
        <div className="max-w-7xl mx-auto relative z-10">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400 mb-3 font-mono flex items-center justify-center gap-2">
              <Ship className="w-3.5 h-3.5" />
              <span>REAL COMMERCIAL FLEET TRACKING</span>
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Fleet Command: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-orange-400">AIS & Vessel Registry</span>
            </h2>
            <p className="mt-4 text-gray-300 text-sm md:text-base leading-relaxed">
              Every commercial merchant ship in international waters is registered with the International Maritime Organization (IMO) 
              and continuously broadcasts its position via VHF radio transponders.
            </p>
          </div>

          {/* Core Practical Concepts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            
            <div className="p-6 rounded-2xl bg-[#091322]/85 border border-[#1b3356] shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. What is AIS?</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                <strong className="text-white">Automatic Identification System (AIS)</strong> is an automated VHF radio tracking system. 
                Vessels transmit their unique IMO number, GPS coordinates, Course Over Ground (COG), and Speed Over Ground (SOG) in real time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#091322]/85 border border-[#1b3356] shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <Anchor className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. What is an IMO Number?</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                An <strong className="text-white">IMO number</strong> is a permanent 7-digit identifier assigned to a ship by the International Maritime Organization 
                (like a ship’s official passport number). It never changes, even if the ship changes its name or owner.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#091322]/85 border border-[#1b3356] shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Gauge className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. DWT & Ship Draft</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                <strong className="text-white">Deadweight Tonnage (DWT)</strong> is the maximum safe weight of cargo, fuel, and crew a ship can carry. 
                <strong className="text-white">Draft</strong> is the underwater depth of the hull—vital for avoiding groundings in shallow straits.
              </p>
            </div>

          </div>

          {/* Real Registered Ships Showcase with Photo */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-[#1b3356] group shadow-2xl">
              <Image
                src="/images/mega-vessel-hero.jpg"
                alt="Commercial container carrier ship sailing on deep blue sea"
                width={800}
                height={400}
                className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-transparent to-transparent" />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1.5 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active Commercial Vessel</span>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              
              {/* Vessel 1 Card: MV Horizon */}
              <div className="p-6 rounded-2xl bg-[#091322]/90 border border-white/10 hover:border-orange-400/40 transition-all shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-orange-400 uppercase tracking-wider block">Container Ship</span>
                    <h4 className="text-xl font-bold text-white">MV Horizon</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10 font-mono text-xs text-gray-300">
                    IMO: <strong className="text-white">9412345</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono my-3">
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-gray-400 text-[10px] block">Capacity</span>
                    <span className="text-white font-bold">14,000 TEU</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-gray-400 text-[10px] block">Current Speed</span>
                    <span className="text-cyan-400 font-bold">16.4 Knots</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-gray-400 text-[10px] block">Hull Draft</span>
                    <span className="text-white font-bold">12.5 Meters</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-gray-400 text-[10px] block">Passage</span>
                    <span className="text-emerald-400 font-bold">Mumbai ➔ SG</span>
                  </div>
                </div>

                <p className="text-xs text-gray-300">
                  Operates on the Indian Ocean – Strait of Malacca international container corridor carrying manufactured goods.
                </p>
              </div>

              {/* Vessel 2 Card: MV Star */}
              <div className="p-6 rounded-2xl bg-[#091322]/90 border border-white/10 hover:border-cyan-400/40 transition-all shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">Bulk Carrier</span>
                    <h4 className="text-xl font-bold text-white">MV Star</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10 font-mono text-xs text-gray-300">
                    IMO: <strong className="text-white">9832104</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono my-3">
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-gray-400 text-[10px] block">Capacity</span>
                    <span className="text-white font-bold">82,000 DWT</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-gray-400 text-[10px] block">Current Speed</span>
                    <span className="text-cyan-400 font-bold">13.8 Knots</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-gray-400 text-[10px] block">Hull Draft</span>
                    <span className="text-white font-bold">14.2 Meters</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-gray-400 text-[10px] block">Passage</span>
                    <span className="text-emerald-400 font-bold">Colombo ➔ PK</span>
                  </div>
                </div>

                <p className="text-xs text-gray-300">
                  Bulk cargo carrier configured for raw commodities (grain, coal, iron ore) with eco-speed slow steaming.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/vessels"
                  id="landing-manage-vessels-btn"
                  onClick={(e) => handleAuthAction(e, "/vessels", "Fleet Vessel Registry")}
                  className="inline-flex items-center gap-2 text-xs font-mono text-orange-400 hover:text-orange-300 transition cursor-pointer"
                >
                  <span>Manage and add vessels in Fleet Command</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ============================================================
          SECTION 4: MARITIME ANALYTICS & FUEL ECONOMICS (id="analytics")
          ============================================================ */}
      <section id="analytics" className="relative py-20 px-6 border-t border-[#1b3356]/40 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400 mb-3 font-mono flex items-center justify-center gap-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>REAL-WORLD SHIPPING ECONOMICS</span>
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Maritime Analytics: <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Fuel & Carbon Cost</span>
            </h2>
            <p className="mt-4 text-gray-300 text-sm md:text-base leading-relaxed">
              Bunker fuel accounts for 50% to 60% of a commercial ship's total voyage operating cost. 
              Understanding how fuel burn rates and CO₂ emissions are calculated is essential knowledge for engineers and operators.
            </p>
          </div>

          {/* 4 Real-World Educational Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            
            <div className="p-6 rounded-2xl bg-[#091322]/85 border border-[#1b3356] shadow-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-3">
                <Navigation className="w-4 h-4" />
                <span>UNIT 1: NAUTICAL MILE</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1 NM = 1.852 km</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                A nautical mile is based on one minute of arc along a meridian of Earth. 
                One knot means sailing at a speed of exactly 1 Nautical Mile per hour.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#091322]/85 border border-[#1b3356] shadow-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-orange-400 mb-3">
                <Fuel className="w-4 h-4" />
                <span>UNIT 2: BUNKER FUEL</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">~$600 / Metric Ton</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Large ships use Very Low Sulphur Fuel Oil (VLSFO) or Marine Gas Oil (MGO) measured in Metric Tons (MT), 
                purchased at bunkering ports like Singapore or Fujairah.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#091322]/85 border border-[#1b3356] shadow-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-3">
                <DollarSign className="w-4 h-4" />
                <span>CALCULATION 3: VOYAGE COST</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cost = Fuel × Price</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Total Fuel Burn = (Distance ÷ Speed) × Hourly Engine Burn Rate. 
                Multiplying by the bunker price yields the real dollar cost for the passage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#091322]/85 border border-[#1b3356] shadow-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-3">
                <TrendingDown className="w-4 h-4" />
                <span>IMO FACTOR 4: CARBON</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3.114 Tons CO₂ / Ton</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                According to official IMO greenhouse gas regulations, burning 1 ton of marine diesel produces 
                approx. 3.114 tons of CO₂. Saving 14 tons of fuel eliminates ~43.5 tons of carbon emissions!
              </p>
            </div>

          </div>

          {/* Practical Speed vs Fuel Consumption Comparison Table */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#091322]/90 border border-[#1b3356] shadow-2xl mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">The Speed-Power Law: Why Slow Steaming Saves Money</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Example calculation for a 14,000 TEU container ship on a 2,500 NM voyage (Mumbai ➔ Singapore)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-mono">
                P ∝ Speed³ (Cubic Law)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="pb-3 font-semibold">Operating Strategy</th>
                    <th className="pb-3 font-semibold">Speed (knots)</th>
                    <th className="pb-3 font-semibold">Voyage Duration</th>
                    <th className="pb-3 font-semibold">Fuel Burn (Tons)</th>
                    <th className="pb-3 font-semibold">Bunker Cost ($600/ton)</th>
                    <th className="pb-3 font-semibold">CO₂ Produced</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  <tr className="hover:bg-white/5 transition">
                    <td className="py-3 text-cyan-400 font-bold">Fastest Sprint</td>
                    <td className="py-3">19.0 kts</td>
                    <td className="py-3 text-white">131.5 hrs (~5.5 days)</td>
                    <td className="py-3 text-white">128 Tons</td>
                    <td className="py-3 text-white">$76,800</td>
                    <td className="py-3 text-gray-400">398 Tons</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition bg-orange-500/5">
                    <td className="py-3 text-orange-400 font-bold">Balanced Cruising</td>
                    <td className="py-3">15.5 kts</td>
                    <td className="py-3 text-white">161.2 hrs (~6.7 days)</td>
                    <td className="py-3 text-white">92 Tons</td>
                    <td className="py-3 text-white">$55,200</td>
                    <td className="py-3 text-gray-400">286 Tons</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition bg-emerald-500/5">
                    <td className="py-3 text-emerald-400 font-bold">Eco Slow Steaming</td>
                    <td className="py-3">13.0 kts</td>
                    <td className="py-3 text-white">192.3 hrs (~8.0 days)</td>
                    <td className="py-3 text-emerald-400 font-bold">68 Tons (-47%)</td>
                    <td className="py-3 text-emerald-400 font-bold">$40,800 (Save $36k)</td>
                    <td className="py-3 text-emerald-400 font-bold">211 Tons (Save 187t)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-[11px] text-gray-400 leading-relaxed font-sans">
              <strong className="text-white">Explanation for teachers & examiners:</strong> Slowing down by just 6 knots increases travel time by 2.5 days, 
              but saves $36,000 in fuel on a single passage! This is the fundamental reason maritime route optimization software is used worldwide.
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/dashboard"
              id="landing-analytics-dashboard-btn"
              onClick={(e) => handleAuthAction(e, "/dashboard", "Fleet Analytics Dashboard")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-90 transition cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Explore Interactive Fleet Analytics Dashboard ➔</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ============================================================
          SECTION 5: GLOBAL PORTS & SEA LANES (id="ports")
          ============================================================ */}
      <section id="ports" className="relative py-20 px-6 border-t border-[#1b3356]/40 bg-[#070d18]/60">
        <div className="max-w-7xl mx-auto relative z-10">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400 mb-3 font-mono flex items-center justify-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>GLOBAL LOGISTICS NODES</span>
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Global Ports & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-400">UN/LOCODE Standard</span>
            </h2>
            <p className="mt-4 text-gray-300 text-sm md:text-base leading-relaxed">
              International trade relies on standardized port locations, depth restrictions, and maritime Traffic Separation Schemes (TSS).
            </p>
          </div>

          {/* Port Terminal Photo with Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
            
            <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-[#1b3356] group shadow-2xl">
              <Image
                src="/images/container-terminal.jpg"
                alt="Modern commercial deep water container terminal with cranes"
                width={800}
                height={400}
                className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-[#050811]/40 to-transparent" />
              
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-[#091322]/90 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-mono text-orange-400 mb-1">
                  <Anchor className="w-3.5 h-3.5" />
                  <span>Deepwater Container Terminals</span>
                </div>
                <p className="text-xs text-gray-200">
                  Gantry cranes load and unload thousands of 20ft/40ft containers at quaysides designed for vessels drawing up to 16 meters draft.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              
              <div className="p-6 rounded-2xl bg-[#091322]/85 border border-[#1b3356] shadow-xl">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>What is a UN/LOCODE?</span>
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  <strong className="text-white">UN/LOCODE</strong> stands for United Nations Code for Trade and Transport Locations. 
                  It is a standard 5-character alphanumeric code: the first 2 letters identify the country, and the next 3 identify the port:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-center">
                    <span className="text-orange-400 font-bold block">INBOM</span>
                    <span className="text-[10px] text-gray-400">Mumbai, India</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-center">
                    <span className="text-cyan-400 font-bold block">SGSIN</span>
                    <span className="text-[10px] text-gray-400">Singapore</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-center">
                    <span className="text-emerald-400 font-bold block">LKCMB</span>
                    <span className="text-[10px] text-gray-400">Colombo, SL</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-center">
                    <span className="text-amber-400 font-bold block">AEJEA</span>
                    <span className="text-[10px] text-gray-400">Dubai, UAE</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#091322]/85 border border-[#1b3356] shadow-xl">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                  <span>Traffic Separation Schemes (TSS)</span>
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  In narrow chokepoints like the <strong className="text-white">Strait of Malacca</strong> and <strong className="text-white">Singapore Strait</strong>, 
                  thousands of cargo vessels pass each week. The IMO enforces Traffic Separation Schemes—marine "divided highways" where eastbound and westbound traffic 
                  must stay in separate designated corridors to prevent head-on collisions.
                </p>
              </div>

            </div>

          </div>

          {/* Grid of Connected Ports */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#091322]/85 border border-[#1b3356] shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>Major Hubs Supported in SeaVision Database</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs font-mono">
              {[
                { code: "INBOM", name: "Mumbai", country: "India", draft: "14.5m" },
                { code: "SGSIN", name: "Singapore", country: "Singapore", draft: "16.0m" },
                { code: "LKCMB", name: "Colombo", country: "Sri Lanka", draft: "15.0m" },
                { code: "MYPKG", name: "Port Klang", country: "Malaysia", draft: "15.5m" },
                { code: "AEJEA", name: "Jebel Ali", country: "UAE", draft: "17.0m" },
                { code: "OMSLR", name: "Salalah", country: "Oman", draft: "16.0m" },
                { code: "THLCH", name: "Laem Chabang", country: "Thailand", draft: "14.0m" },
                { code: "IDJKT", name: "Jakarta", country: "Indonesia", draft: "14.0m" },
                { code: "VNSGN", name: "Ho Chi Minh", country: "Vietnam", draft: "13.0m" },
                { code: "CNHKG", name: "Hong Kong", country: "Hong Kong", draft: "15.5m" },
              ].map((port) => (
                <div key={port.code} className="p-3 rounded-xl bg-black/30 border border-white/5 hover:border-orange-500/30 transition">
                  <span className="text-orange-400 font-bold block">{port.code}</span>
                  <p className="text-white text-xs font-sans font-semibold mt-0.5">{port.name}</p>
                  <p className="text-gray-400 text-[10px]">{port.country} · Draft {port.draft}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================
          SECTION 6: STUDENT VIVA & PRESENTATION GUIDE
          ============================================================ */}
      <section className="py-20 px-6 border-t border-[#1b3356]/40 bg-gradient-to-b from-[#050811] via-[#091322] to-[#050811]">
        <div className="max-w-5xl mx-auto">
          
          <div className="p-8 sm:p-10 rounded-2xl bg-[#091322]/95 border border-orange-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 blur-[100px] pointer-events-none" />

            <div className="flex items-center gap-3 text-xs font-mono text-orange-400 mb-2">
              <BookOpen className="w-4 h-4" />
              <span>COLLEGE VIVA & PROJECT PRESENTATION CHEAT-SHEET</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              How to Explain SeaVision to Your Teacher or Examiner
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mb-8 leading-relaxed">
              If asked how this software works in your evaluation, here are simple, practical answers you can confidently deliver:
            </p>

            <div className="space-y-4">
              
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Q1: What problem does this project solve?</span>
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed pl-6">
                  "SeaVision calculates the optimal sea route between international commercial ports. It avoids bad weather and storms, 
                  reduces travel time, and saves expensive bunker fuel using slow steaming principles to lower both operational costs and CO₂ emissions."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Q2: What formulas and algorithms are implemented?</span>
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed pl-6">
                  "We use the <strong>Haversine formula</strong> to calculate great-circle nautical distances between spherical GPS coordinates. 
                  Fuel burn is calculated using the cubic relationship between ship speed and propulsion power (<strong>P ∝ v³</strong>), adjusted for wave swell resistance."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Q3: What real-world standards make this believable?</span>
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed pl-6">
                  "We use real <strong>UN/LOCODE port codes</strong> (like INBOM for Mumbai and SGSIN for Singapore), official 7-digit <strong>IMO vessel numbers</strong>, 
                  real-world bunker fuel market pricing (~$600/ton), and the official IMO factor of <strong>3.114 tons CO₂ per ton of fuel</strong>."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Q4: What is the technical architecture?</span>
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed pl-6">
                  "The application is built with <strong>Next.js 15 (App Router)</strong>, <strong>TypeScript</strong> for type safety, 
                  <strong>Tailwind CSS</strong> for responsive design, a modular REST API backend, and an integrated database storing ports, vessels, and route records."
                </p>
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-mono text-gray-400">Ready to test the live simulator?</span>
              <Link
                href="/routes/new"
                id="landing-launch-simulator-btn"
                onClick={(e) => handleAuthAction(e, "/routes/new", "Voyage Simulator")}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold text-xs shadow-md hover:brightness-110 transition cursor-pointer"
              >
                Launch Voyage Simulator ➔
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer className="border-t border-[#1b3356]/60 py-10 bg-[#050811]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-orange-500/20">
                SV
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                <span>Sea</span>
                <span className="text-orange-400">Vision</span>
              </span>
              <span className="text-gray-500 text-xs font-mono ml-2">© 2026 Maritime Route Intelligence</span>
            </div>
            
            <div className="flex flex-wrap gap-6 text-xs text-gray-400 font-mono items-center">
              <Link href="#home" className="hover:text-orange-400 transition">Home</Link>
              <Link href="#routes" className="hover:text-orange-400 transition">Route Engine</Link>
              <Link href="#fleet" className="hover:text-orange-400 transition">Fleet Command</Link>
              <Link href="#analytics" className="hover:text-orange-400 transition">Analytics</Link>
              <Link href="#ports" className="hover:text-orange-400 transition">Ports</Link>
              {!authed ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginModalTarget("/dashboard");
                      setLoginModalLabel("Command Center Sign In");
                      setLoginModalMode("login");
                      setLoginModalOpen(true);
                    }}
                    id="footer-login-btn"
                    className="hover:text-cyan-300 text-white font-medium transition cursor-pointer flex items-center gap-1"
                  >
                    <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginModalTarget("/dashboard");
                      setLoginModalLabel("Create Fleet Account");
                      setLoginModalMode("register");
                      setLoginModalOpen(true);
                    }}
                    id="footer-signup-btn"
                    className="text-orange-400 hover:text-orange-300 font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  id="footer-dashboard-btn"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold transition flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Officer Dashboard ({user?.full_name?.split(" ")[0] || "Active"}) ➔</span>
                </Link>
              )}
            </div>
          </div>
          
          <div className="text-center text-[11px] text-gray-500 mt-6 font-mono">
            20 global hubs · 4 multi-objective routing strategies · AIS vessel telemetry · UN/LOCODE standard
          </div>
        </div>
      </footer>

      {/* Login & Registration Interactive Modal Panel */}
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
