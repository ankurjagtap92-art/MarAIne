"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 5;
      setMouseX(x);
      setMouseY(y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">

      {/* ============================================================
          FULL-BLEED SHIP IMAGE – with CSS filter to boost color/contrast
          ============================================================ */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${mouseX * 0.08}px, ${mouseY * 0.08}px) scale(1.05)`,
          transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <Image
          src="/images/ship.png"
          alt="Cargo ship at sea"
          fill
          priority
          className="object-cover object-[center_70%]"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.8s ease",
            // 🔥 BOOST the image itself – this is the biggest lever
            filter: "brightness(1.15) contrast(1.12) saturate(1.25)",
          }}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
        />
      </div>

      {/* ============================================================
          LIGHT OVERLAY – now much lighter (top/bottom only)
          ============================================================ */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            /* 🔥 Lighter linear gradient – was 0.40, now 0.22 */
            linear-gradient(180deg, rgba(6,11,26,0.22) 0%, rgba(6,11,26,0.05) 35%, rgba(6,11,26,0.02) 65%, rgba(6,11,26,0.60) 100%)
          `
        }}
      />

      {/* ============================================================
          RADIAL VIGNETTE – shrunk & softened (was 70%×55%, 0.75 → now 50%×38%, 0.55)
          ============================================================ */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 50% 38% at 50% 40%, rgba(6,11,26,0.55) 0%, rgba(6,11,26,0.2) 50%, transparent 75%)`
        }}
      />

      {/* ============================================================
          SUBTLE FOG – lowered opacity (was 0.30 → now 0.18)
          ============================================================ */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(6,11,26,0.18) 0%, transparent 100%)"
        }}
      />

      {/* ============================================================
          CONTENT – unchanged, but benefits from brighter ship
          ============================================================ */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 backdrop-blur-sm px-4 py-1.5 text-xs text-white/90 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#5ec9ff] opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5ec9ff]" />
            </span>
            AI-Powered Maritime Intelligence
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
            <span 
              className="text-white" 
              style={{ WebkitTextStroke: "1px rgba(0,0,0,0.3)" }}
            >
              Navigate
            </span>{" "}
            <span 
              className="text-[#5ec9ff]" 
              style={{ 
                textShadow: "0 0 40px rgba(0,180,255,0.6), 0 4px 20px rgba(0,0,0,0.9)" 
              }}
            >
              the Unknown
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-white drop-shadow-[0_2px_15px_rgba(0,0,0,0.95)] leading-relaxed mt-4">
            AI-powered route optimization that saves 15% fuel, reduces risk by 5x,
            and guides your fleet through any ocean — before you leave port.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link
              href="/register"
              className="px-8 py-3 bg-slate-600/40 backdrop-blur-md border border-white/20 text-white font-semibold rounded-full text-sm hover:bg-slate-600/60 transition-all shadow-lg"
            >
              Enter Command Center
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-slate-700/30 backdrop-blur-md border border-white/15 text-white font-semibold rounded-full text-sm hover:bg-slate-700/50 transition-all shadow-lg"
            >
              Captain Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 w-full max-w-2xl mx-auto">
            {[
              { value: "20+", label: "Global Ports" },
              { value: "5x", label: "Safer Routes" },
              { value: "15%", label: "Fuel Savings" },
              { value: "4", label: "Route Options" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center hover:border-[#5ec9ff]/30 transition-all"
              >
                <p className="font-mono text-xl font-bold text-[#5ec9ff]">{s.value}</p>
                <p className="text-[10px] text-gray-300">{s.label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Scroll to explore</span>
        <svg width="16" height="16" viewBox="0 0 18 18" className="text-[#5ec9ff] animate-bounce">
          <path d="M9 3v12M3 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
}