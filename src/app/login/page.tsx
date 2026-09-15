"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Ship,
  Compass,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Home,
  ShieldCheck,
  AlertCircle,
  Radio,
  UserCheck,
  UserPlus,
  LogIn,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState<string>("/dashboard");
  const { login, demoLogin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const r = params.get("redirect");
      if (r && r.startsWith("/")) {
        setRedirectPath(r);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: "captain" | "director") => {
    setError("");
    setLoading(true);
    setActiveDemo(role);

    try {
      if (role === "captain") {
        setEmail("captain@fleet.com");
        setPassword("password123");
      } else {
        setEmail("director@maraine.io");
        setPassword("password123");
      }
      await demoLogin(role);
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || "Demo sign in failed. Please try again.");
    } finally {
      setLoading(false);
      setActiveDemo(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] relative flex items-center justify-center px-4 py-12 overflow-hidden text-white selection:bg-orange-500/30 selection:text-orange-200">
      {/* Maritime ambient glow in Orange / Cyan / Navy */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-orange-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full" />
        {/* Coordinate grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#ff7a18 1px, transparent 1px), linear-gradient(to right, #00d8ff 1px, transparent 1px), linear-gradient(to bottom, #ff7a18 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative w-full max-w-lg z-10">
        {/* Top Prominent Return to Home Navigation Bar */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link
            href="/"
            id="login-back-to-home-top"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#091322]/90 hover:bg-[#0d1c33] border border-orange-500/30 hover:border-orange-400 text-xs font-semibold text-orange-400 hover:text-white backdrop-blur-md transition-all shadow-lg shadow-black/40 group active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-orange-400 group-hover:-translate-x-1 transition-transform" />
            <span>← Return to Home Page</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#091322]/80 border border-[#1b3356] text-xs font-mono text-cyan-300 backdrop-blur-md shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">AIS SeaVision</span>
            <span className="text-emerald-400">Live</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#091322]/90 backdrop-blur-2xl border border-[#1b3356] rounded-2xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          {/* Subtle top gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-cyan-400 to-emerald-400 opacity-90" />

          {/* Card Header */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group/logo transition-transform hover:scale-105"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <Ship className="w-6 h-6 text-white group-hover/logo:rotate-6 transition-transform" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold tracking-tight text-white block leading-tight">
                  <span>Sea</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-cyan-400">Vision</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase text-orange-400 font-mono block">
                  Maritime Intelligence
                </span>
              </div>
            </Link>

            <h1 className="mt-5 text-2xl font-semibold text-white tracking-tight">
              Command Center Login Panel
            </h1>
            <p className="mt-1 text-xs text-gray-400">
              Access optimized fairways, voyage simulations, and vessel telemetry
            </p>
          </div>

          {/* Context Alert when redirected */}
          {redirectPath !== "/dashboard" && (
            <div className="mb-5 p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-400 shrink-0" />
              <span>
                Please sign in or register to access <strong>{redirectPath}</strong>.
              </span>
            </div>
          )}

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-[#060c18] rounded-xl border border-white/5 mb-6">
            <div className="py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5">
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </div>
            <Link
              href={`/register${redirectPath !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
              id="login-tab-to-register"
              className="py-2 text-xs font-semibold rounded-lg text-gray-400 hover:text-white transition-all flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up / Register</span>
            </Link>
          </div>

          {/* Quick Demo Login Bar */}
          <div className="mb-6 p-3.5 rounded-xl bg-[#060c18] border border-orange-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono tracking-wider uppercase text-orange-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Quick Role Access
              </span>
              <span className="text-[10px] text-gray-400 font-mono">1-Click Test</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="quick-demo-captain"
                onClick={() => handleQuickDemo("captain")}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#0b172a] hover:bg-[#10223d] border border-cyan-500/30 text-xs font-medium text-cyan-200 hover:text-white transition-all hover:border-cyan-400 disabled:opacity-50 active:scale-95"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                {activeDemo === "captain" ? "Entering..." : "Captain Smith"}
              </button>
              <button
                type="button"
                id="quick-demo-director"
                onClick={() => handleQuickDemo("director")}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#0b172a] hover:bg-[#10223d] border border-orange-500/30 text-xs font-medium text-orange-300 hover:text-white transition-all hover:border-orange-400 disabled:opacity-50 active:scale-95"
              >
                <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                {activeDemo === "director" ? "Entering..." : "Director Elena"}
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#091322] px-3 text-[11px] uppercase tracking-wider text-gray-400 font-mono">
              or credentials
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Officer / Company Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4 text-orange-400" />
                </div>
                <input
                  type="email"
                  id="login-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="captain@fleet.com"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#060c18] border border-[#1b3356] rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Secure Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("captain@fleet.com");
                    setPassword("password123");
                  }}
                  className="text-[11px] text-orange-400 hover:text-orange-300 transition"
                >
                  Use Default Pass
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4 text-orange-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#060c18] border border-[#1b3356] rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-orange-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-3.5 h-3.5 rounded bg-[#060c18] border-[#1b3356] text-orange-500 focus:ring-orange-500/50"
                />
                <span className="text-xs text-gray-400">Maintain session</span>
              </label>
              <span className="text-xs text-gray-400 font-mono">
                Pass: <code className="text-orange-400">password123</code>
              </span>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-black font-semibold text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate & Enter SeaVision</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher and explicit Return to Home */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-xs text-gray-400">
              New officer?{" "}
              <Link
                href={`/register${redirectPath !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                id="login-register-link"
                className="text-orange-400 hover:text-orange-300 font-medium transition inline-flex items-center gap-1 hover:underline"
              >
                Register Fleet Account <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
            <Link
              href="/"
              id="login-back-to-home-bottom"
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200 hover:text-white font-medium transition inline-flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-orange-400" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Security / Compliance Badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-gray-400 font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            256-bit TLS Encryption
          </span>
          <span className="text-white/10">•</span>
          <span>IMO & SOLAS Compliant</span>
          <span className="text-white/10">•</span>
          <span>Zero Telemetry Leaks</span>
        </div>
      </div>
    </div>
  );
}
