import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import Image from "next/image";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#060b1a]">

      {/* ============================================================
          NAVBAR
          ============================================================ */}
      <nav className="sticky top-0 z-50 border-b border-[#1c2b45] bg-[#0a1628]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">

          {/* Logo – Glass badge + split wordmark */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/10 border border-cyan-400/20 group-hover:border-cyan-400/50 transition-all group-hover:scale-105">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5ec9ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17l2-6 4 2 4-8 4 8 4-2-2 6" />
                <path d="M2 20h20" />
              </svg>
            </div>
            <span className="text-2xl md:text-3xl font-[family-name:var(--font-logo)] tracking-tight">
              <span className="text-white">Mar</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Alne</span>
            </span>
          </Link>

          {/* Right side: Login + Join the Fleet */}
          <div className="flex items-center gap-4">

            {/* Login – Underline sweep + scale on hover */}
            <Link
              href="/login"
              className="relative text-gray-300 hover:text-white transition text-base font-medium px-5 py-2.5 rounded-lg overflow-hidden group"
            >
              <span className="relative z-10">Login</span>
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all rounded-lg" />
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-full h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 rounded-full" />
              <span className="absolute inset-0 group-hover:scale-105 transition-transform duration-200" />
            </Link>

            {/* Join the Fleet – Shimmer + glow pulse + scale on hover */}
            <Link
              href="/register"
              className="relative px-6 py-3 rounded-xl text-base font-semibold text-[#04101f] overflow-hidden group hover:scale-105 transition-transform duration-200"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 bg-[length:200%_100%] group-hover:animate-[shimmer_1.5s_linear_infinite]" />
              <span className="absolute inset-0 rounded-xl shadow-[0_0_30px_rgba(94,201,255,0.5)] group-hover:shadow-[0_0_50px_rgba(94,201,255,0.9)] transition-shadow duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                Join the Fleet
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>

          </div>
        </div>
      </nav>

      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <HeroSection />
      {/* ============================================================
          SECTION 2: BUILT FOR THE OCEAN – WITH BACKGROUND IMAGE
          ============================================================ */}
      <section className="relative py-20 overflow-hidden">

        {/* ============================================================
            BACKGROUND IMAGE with overlays
            ============================================================ */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/port-night.png"
            alt="Port at night with cargo ship"
            className="w-full h-full object-cover object-[right_bottom]"
          />
          {/* Overlay: darken center where text/cards sit, keep edges visible */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 60% 70% at 50% 40%, rgba(6,11,26,0.85) 0%, rgba(6,11,26,0.6) 55%, transparent 80%),
                linear-gradient(180deg, rgba(6,11,26,0.4) 0%, transparent 20%, transparent 80%, rgba(6,11,26,0.7) 100%)
              `
            }}
          />
        </div>

        {/* Animated grid/route lines background */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(94,201,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(94,201,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Floating glow orbs */}
        <div className="absolute top-10 left-[10%] w-72 h-72 bg-cyan-500/5 rounded-full blur-[100px] animate-float pointer-events-none" />
        <div className="absolute bottom-10 right-[15%] w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">

          {/* HEADING */}
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5ec9ff]/80 mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-6 bg-cyan-400/50" />
              BUILT FOR THE OCEAN
              <span className="h-px w-6 bg-cyan-400/50" />
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              One platform, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">two ways</span> to use it.
            </h2>
            <p className="mt-4 text-gray-300 max-w-xl mx-auto text-sm drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              Powerful AI tools for smarter decisions. Whether you're optimizing a single route or managing an entire fleet — <span className="text-cyan-400">MarAlne</span> adapts to you.
            </p>
          </div>

          {/* CONNECTOR LINE with center badge */}
          <div className="relative max-w-5xl mx-auto">
            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl pointer-events-none hidden md:block" viewBox="0 0 600 100">
              <path d="M50 50 Q300 20 550 50" stroke="#5ec9ff" strokeWidth="1.5" strokeDasharray="6 6" fill="none" opacity="0.3">
                <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="2s" repeatCount="indefinite" />
              </path>
            </svg>

            {/* Center badge on connector line */}
            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full bg-[#0a1628] border border-cyan-400/30 shadow-[0_0_20px_rgba(94,201,255,0.3)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5ec9ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17l2-6 4 2 4-8 4 8 4-2-2 6" />
                <path d="M2 20h20" />
              </svg>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* CARD 1: FOR CAPTAINS (CYAN) */}
              <div className="group relative overflow-hidden rounded-2xl border border-white/5 hover:border-cyan-400/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 p-8 flex flex-col h-full bg-[#0d2137]/50 backdrop-blur-sm">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M14.8 9.2l-2.1 5.6-5.6 2.1 2.1-5.6 5.6-2.1z" />
                      </svg>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold tracking-wider text-cyan-400/80 uppercase mb-1">Optimize Your Voyage</p>
                  <h3 className="text-2xl font-bold text-white">For <span className="text-cyan-400">Captains</span></h3>
                  <p className="mt-3 text-sm text-gray-300 flex-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                    Get intelligent route recommendations, real-time weather insights, risk alerts, and fuel-saving suggestions — all in one place.
                  </p>
                  <div className="flex items-center gap-5 mt-6">
                    <Link href="/routes/new" className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-400 text-[#04101f] font-semibold rounded-lg text-sm hover:-translate-y-0.5 transition-all flex items-center gap-2 group/btn">
                      Start Optimizing
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                    <Link href="#" className="text-sm text-gray-300 hover:text-white transition flex items-center gap-1">
                      Learn More <span className="text-xs">→</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* CARD 2: FOR FLEET MANAGERS (VIOLET) */}
              <div className="group relative overflow-hidden rounded-2xl border border-white/5 hover:border-violet-400/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/10 p-8 flex flex-col h-full bg-[#0d2137]/50 backdrop-blur-sm">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-300 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19V9" />
                        <path d="M11 19V5" />
                        <path d="M18 19v-7" />
                        <path d="M3 19h18" />
                      </svg>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold tracking-wider text-violet-400/80 uppercase mb-1">Manage Your Fleet</p>
                  <h3 className="text-2xl font-bold text-white">For <span className="text-violet-400">Fleet Managers</span></h3>
                  <p className="mt-3 text-sm text-gray-300 flex-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                    Compare priorities across your entire fleet, keep vessel profiles current, and evaluate risk and fuel cost side by side before committing to a voyage.
                  </p>
                  <div className="flex items-center gap-5 mt-6">
                    <Link href="/dashboard" className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-400 text-[#04101f] font-semibold rounded-lg text-sm hover:-translate-y-0.5 transition-all flex items-center gap-2 group/btn">
                      Compare Fleet
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                    <Link href="#" className="text-sm text-gray-300 hover:text-white transition flex items-center gap-1">
                      Learn More <span className="text-xs">→</span>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ============================================================
              STATS – UNIFIED GLASS BAR WITH DIVIDERS
              ============================================================ */}
          {/* ============================================================
    STATS – UNIFIED GLASS BAR WITH COUNTERS
    ============================================================ */}
          <div className="glass rounded-2xl mt-10 max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 divide-x divide-white/10 bg-[#0d2137]/70 backdrop-blur-sm relative overflow-hidden group/stats">
            {/* Hover glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover/stats:opacity-100 transition-opacity duration-700" />

            {[
              {
                key: 'ports',
                value: 20,
                label: "Global Ports",
                sub: "Connected worldwide",
                color: "text-cyan-400",
                bg: "bg-cyan-400/10",
                suffix: "+"
              },
              {
                key: 'vessels',
                value: 500,
                label: "Active Vessels",
                sub: "Real-time tracking",
                color: "text-blue-400",
                bg: "bg-blue-400/10",
                suffix: "+"
              },
              {
                key: 'fuel',
                value: 15,
                label: "Fuel Savings",
                sub: "Avg. per voyage",
                color: "text-emerald-400",
                bg: "bg-emerald-400/10",
                suffix: "%"
              },
              {
                key: 'monitoring',
                value: 24,
                label: "Live Monitoring",
                sub: "Always on watch",
                color: "text-purple-400",
                bg: "bg-purple-400/10",
                suffix: "/7"
              },
              {
                key: 'eta',
                value: 98.7,
                label: "ETA Accuracy",
                sub: "On-time performance",
                color: "text-cyan-400",
                bg: "bg-cyan-400/10",
                suffix: "%"
              },
            ].map((stat, index) => (
              <div
                key={stat.key}
                className="p-6 text-center group/stat hover:bg-white/5 transition-all duration-300 relative"
                style={{ animation: `slideUp 0.6s ease ${index * 100}ms both` }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-500" />

                <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg} ${stat.color} transition-transform duration-300 group-hover/stat:scale-110 group-hover/stat:rotate-6`}>
                  {stat.key === 'ports' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v6l3 3" />
                    </svg>
                  )}
                  {stat.key === 'vessels' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 16l1.5 4.5a2 2 0 0 0 1.9 1.4h11.2a2 2 0 0 0 1.9-1.4L21 16" />
                      <path d="M5 16V9h14v7" />
                      <path d="M9 9V5h6v4" />
                      <path d="M2 16h20" />
                    </svg>
                  )}
                  {stat.key === 'fuel' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 7v10M9.5 9.5c0-1.4 1.1-2.5 2.5-2.5s2.5.7 2.5 1.8-1 1.7-2.5 1.7-2.5.6-2.5 1.7 1.1 1.8 2.5 1.8 2.5-1.1 2.5-2.5" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  )}
                  {stat.key === 'monitoring' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 3v6l3 3" />
                    </svg>
                  )}
                  {stat.key === 'eta' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 12h4l2-5 2 10 2-7 2 4 4-2" />
                    </svg>
                  )}
                </div>
                <p className={`text-2xl font-bold ${stat.color} transition-all duration-300 group-hover/stat:text-white`}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} triggerOnce />
                </p>
                <p className="text-sm text-white/90 group-hover/stat:text-cyan-200 transition-colors">{stat.label}</p>
                <p className="text-[11px] text-gray-500 group-hover/stat:text-gray-400 transition-colors">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Trust line */}
          <p className="text-center text-[11px] tracking-widest text-gray-400 mt-8 uppercase flex items-center justify-center gap-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            <span className="h-px w-8 bg-white/10" />
            Trusted by leading shipping companies worldwide
            <span className="h-px w-8 bg-white/10" />
          </p>

        </div>
      </section>
      {/* Floating particles behind stats */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-400/10"
            style={{
              width: `${2 + Math.random() * 6}px`,
              height: `${2 + Math.random() * 6}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${6 + Math.random() * 10}s ease-in-out ${Math.random() * 5}s infinite`,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      {/* ============================================================
    CTA SECTION – Enhanced
    ============================================================ */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-24 relative">
        {/* Floating particles behind CTA */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-cyan-400/10"
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${8 + Math.random() * 12}s ease-in-out ${Math.random() * 6}s infinite`,
                filter: 'blur(1px)',
              }}
            />
          ))}
        </div>

        <div className="glass p-12 text-center relative overflow-hidden group/cta">
          {/* Subtle rotating gradient background on the glass card */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 animate-[gradientShift_15s_ease_infinite]" />

          <h2 className="text-3xl md:text-4xl font-bold max-w-lg mx-auto relative z-10">
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,212,255,0.3)]">
              Start optimizing your routes in minutes.
            </span>
          </h2>

          <p className="max-w-md mx-auto mt-3 text-sm text-gray-400 relative z-10">
            No sales call. Create an account, register your vessel, and run your first route analysis.
          </p>

          <Link
            href="/register"
            className="mt-6 inline-block relative px-8 py-3.5 bg-gradient-to-r from-blue-500 to-[#5ec9ff] text-[#04101f] font-semibold rounded-lg shadow-glow-cyan hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all duration-300 z-10 group/btn"
          >
            <span className="relative z-10 flex items-center gap-2">
              Join the fleet
              <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {/* Pulse glow ring */}
            <span className="absolute inset-0 rounded-lg animate-[pulseGlow_2s_ease-in-out_infinite] pointer-events-none" />
          </Link>
        </div>
      </section>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer className="border-t border-[#1c2b45] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#5ec9ff]">🚢 MarAlne</span>
              <span className="text-gray-500 text-sm">© 2026</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/login" className="hover:text-white transition">Sign In</Link>
              <Link href="/register" className="hover:text-white transition">Create Account</Link>
              <a href="#" className="hover:text-white transition">Help</a>
            </div>
          </div>
          <div className="text-center text-xs text-gray-500 mt-6">
            20 ports connected · 4 fuel profiles · 4 route priorities
          </div>
        </div>
      </footer>

    </div>
  );
}