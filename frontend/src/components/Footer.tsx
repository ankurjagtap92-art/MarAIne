"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <footer className="relative border-t border-[#1c2b45] py-16 mt-8 overflow-hidden">
        
        {/* Background animations – unchanged */}
        <div 
          className="absolute inset-0 -z-10"
          style={{
            background: `
              linear-gradient(45deg, #0a1628, #1a3a52, #0d2137, #0a1628),
              radial-gradient(ellipse at 20% 80%, rgba(0,180,216,0.05) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.05) 0%, transparent 50%)
            `,
            backgroundSize: '400% 400%',
            animation: 'gradientShift 15s ease infinite',
          }}
        />

        {/* Floating particles – unchanged */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-cyan-400/10"
              style={{
                width: `${2 + Math.random() * 6}px`,
                height: `${2 + Math.random() * 6}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `floatParticle ${8 + Math.random() * 12}s ease-in-out ${Math.random() * 6}s infinite`,
                filter: 'blur(1px)',
              }}
            />
          ))}
        </div>

        {/* Animated gradient accent line – unchanged */}
        <div 
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(94,201,255,0.5), rgba(139,92,246,0.5), transparent)',
            animation: 'glowPulse 3s ease-in-out infinite',
          }}
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">

          {/* ============================================================
              TOP ROW – Brand, Social, Newsletter (unchanged layout)
              ============================================================ */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-8 border-b border-white/5">

            {/* Brand – larger logo text */}
            <div className="flex items-center gap-4 group/logo">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/10 border border-cyan-400/20 group-hover/logo:border-cyan-400/50 transition-all duration-500 group-hover/logo:shadow-[0_0_30px_rgba(94,201,255,0.3)]">
                <svg 
                  width="22" 
                  height="22" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#5ec9ff" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="transition-transform duration-700 group-hover/logo:rotate-[360deg]"
                >
                  <path d="M3 17l2-6 4 2 4-8 4 8 4-2-2 6" />
                  <path d="M2 20h20" />
                </svg>
              </div>
              <div>
                {/* Logo size: 28px with font-weight 700 */}
                <span className="text-[28px] font-bold font-[family-name:var(--font-logo)] tracking-tight block leading-tight">
                  <span className="text-white">Mar</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Alne</span>
                </span>
                <span className="text-[11px] text-gray-500 tracking-[0.2em] opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 block">
                  MARITIME INTELLIGENCE
                </span>
              </div>
            </div>

            {/* Newsletter – unchanged */}
            <div className="w-full lg:w-auto">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5 font-medium tracking-wider">
                    STAY UPDATED
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="px-4 py-2.5 w-48 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 hover:border-cyan-400/50 focus:border-cyan-400 focus:outline-none transition-all"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 hover:from-cyan-400/40 hover:to-blue-500/40 border border-cyan-400/50 rounded-lg text-sm font-semibold text-cyan-300 transition-all hover:shadow-[0_0_20px_rgba(94,201,255,0.2)]"
                    >
                      {subscribed ? "✓ Subscribed!" : "Subscribe"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Social links – unchanged */}
            <div className="flex gap-3">
              {[
                { label: "Twitter", icon: "𝕏", href: "#" },
                { label: "LinkedIn", icon: "in", href: "#" },
                { label: "GitHub", icon: "◆", href: "#" },
                { label: "YouTube", icon: "▶", href: "#" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="group h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(94,201,255,0.15)]"
                >
                  <span className="text-sm font-bold group-hover:scale-110 transition-transform">
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* ============================================================
              MIDDLE ROW – Multi-Column Links (unchanged)
              ============================================================ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8">
            {[
              {
                title: "Product",
                links: [
                  { label: "Route Optimization", href: "/routes/new" },
                  { label: "For Captains", href: "/captains" },
                  { label: "For Fleet Managers", href: "/dashboard" },
                  { label: "API Docs", href: "#" },
                ],
              },
              {
                title: "Company",
                links: [
                  { label: "About Us", href: "#" },
                  { label: "Careers", href: "#" },
                  { label: "Blog", href: "#" },
                  { label: "Press", href: "#" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" },
                  { label: "Cookie Policy", href: "#" },
                  { label: "Security", href: "#" },
                ],
              },
              {
                title: "Connect",
                links: [
                  { label: "Support", href: "#" },
                  { label: "Status", href: "#" },
                  { label: "Contact", href: "#" },
                  { label: "Community", href: "#" },
                ],
              },
            ].map((column) => (
              <div key={column.title}>
                <h4 className="text-white font-semibold mb-4 text-sm tracking-wider">
                  {column.title}
                </h4>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-cyan-400 transition-colors duration-200 group flex items-center gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-cyan-400/0 group-hover:bg-cyan-400/50 transition-all duration-200" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ============================================================
              BOTTOM ROW – LARGER, MORE READABLE TEXT
              ============================================================ */}
          <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">

            {/* Left: System Status + Copyright – larger */}
            <div className="flex items-center gap-3 text-[15px] text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All systems operational</span>
              </div>
              <span className="text-gray-600">|</span>
              <span className="font-mono text-[13px] text-gray-500">v1.0.0</span>
              <span className="text-gray-600">|</span>
              <div className="flex items-center gap-1.5 group/copyright cursor-help">
                <span className="text-[15px] text-gray-400 font-medium">© {year}</span>
                <span className="text-[13px] text-gray-500 opacity-0 group-hover/copyright:opacity-100 transition-opacity">
                  Last updated: July 2026
                </span>
              </div>
            </div>

            {/* Center: Tagline – larger text + letter-spacing */}
            <div className="flex items-center gap-2 text-[15px] tracking-[0.03em]">
              <span className="h-px w-6 bg-cyan-400/30" />
              <span className="font-medium text-gray-300">20 ports connected</span>
              <span className="text-cyan-400/30">•</span>
              <span className="font-medium text-gray-300">4 fuel profiles</span>
              <span className="text-cyan-400/30">•</span>
              <span className="font-medium text-gray-300">4 route priorities</span>
              <span className="h-px w-6 bg-cyan-400/30" />
            </div>

            {/* Right: Navigation Links – larger text, better spacing */}
            <div className="flex items-center gap-5 text-[15px] font-medium">
              <Link href="/login" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 group flex items-center gap-1">
                <span className="group-hover:underline group-hover:underline-offset-2">Sign In</span>
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/register" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 group flex items-center gap-1">
                <span className="group-hover:underline group-hover:underline-offset-2">Create Account</span>
              </Link>
              <span className="text-gray-600">|</span>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 group flex items-center gap-1">
                <span className="group-hover:underline group-hover:underline-offset-2">Help</span>
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* Back to top button – unchanged */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 transition-all duration-500 shadow-lg shadow-cyan-400/20 hover:shadow-[0_0_30px_rgba(94,201,255,0.3)] hover:-translate-y-1 ${
          showBackToTop 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-12 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7-7 7 7" />
        </svg>
        <span className="absolute inset-0 rounded-full animate-ping-slow pointer-events-none" style={{ boxShadow: '0 0 30px rgba(94,201,255,0.2)' }} />
      </button>

      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.1; }
          50% { transform: translateY(-30px) translateX(15px); opacity: 0.5; }
        }
        @keyframes ping-slow {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
}