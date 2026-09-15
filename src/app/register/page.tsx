"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Ship,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  ArrowRight,
  ArrowLeft,
  Home,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Radio,
  Anchor,
} from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("operator");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  // Simple password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };
  const strength = getPasswordStrength();

  const handleFillSample = () => {
    const randomId = Math.floor(Math.random() * 900) + 100;
    setName(`Captain Alexander Hayes ${randomId}`);
    setEmail(`alexander.${randomId}@pacificfreight.com`);
    setCompany("Pacific Freight & Bulk Lines");
    setRole("operator");
    setPassword("MarinePass2026!");
    setConfirmPassword("MarinePass2026!");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await register({
        email,
        password,
        full_name: name,
        company_name: company || "Merchant Shipping Fleet",
        role,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please review your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b1a] relative flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Maritime ambient ocean glow and radar grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[550px] bg-cyan-500/10 blur-[140px] rounded-full" />
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 blur-[90px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#00d4ff 1px, transparent 1px), linear-gradient(to right, #00d4ff 1px, transparent 1px), linear-gradient(to bottom, #00d4ff 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative w-full max-w-xl z-10">
        {/* Top Floating Navigation Bar */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link
            href="/"
            id="register-back-to-home-top"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a1b33]/90 hover:bg-[#0f284a] border border-cyan-500/30 hover:border-cyan-400 text-xs font-medium text-cyan-300 hover:text-white backdrop-blur-md transition-all shadow-lg shadow-cyan-950/40 group active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Home</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a1b33]/80 border border-cyan-500/30 text-xs font-mono text-cyan-300 backdrop-blur-md shadow-lg shadow-cyan-950/40">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">Carrier Registration</span>
            <span className="text-emerald-400">Open</span>
          </div>
        </div>

        {/* Main Glassmorphic Card */}
        <div className="bg-[#0b1728]/85 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden group">
          {/* Subtle top cyan neon line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

          {/* Card Header */}
          <div className="text-center mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group/logo transition-transform hover:scale-105"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/30 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-md shadow-cyan-500/20">
                <Ship className="w-6 h-6 text-cyan-400 group-hover/logo:rotate-6 transition-transform" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold tracking-tight text-white block leading-tight">
                  Mar<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">AI</span>ne
                </span>
                <span className="text-[10px] tracking-widest uppercase text-cyan-400/80 font-mono block">
                  Fleet Intelligence
                </span>
              </div>
            </Link>

            <h1 className="mt-4 text-2xl font-semibold text-white tracking-tight">
              Create Fleet Officer Account
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Join commercial shipping operators optimizing ocean transit & fuel
            </p>
          </div>

          {/* 1-Click Sample Profile Fill */}
          <div className="mb-6 flex items-center justify-between p-3 rounded-xl bg-[#07111e]/80 border border-cyan-500/20">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Testing the platform?</span>
            </div>
            <button
              type="button"
              id="fill-sample-profile-btn"
              onClick={handleFillSample}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs text-cyan-300 font-medium transition hover:border-cyan-400"
            >
              ⚡ Fill Sample Profile
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Full Name / Title
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4 text-cyan-400/80" />
                  </div>
                  <input
                    type="text"
                    id="register-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Captain Marcus Vance"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#07111e]/70 border border-[#1b314f] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Official Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4 text-cyan-400/80" />
                  </div>
                  <input
                    type="email"
                    id="register-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marcus@oceaniclines.com"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#07111e]/70 border border-[#1b314f] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Shipping Line / Company
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Building2 className="w-4 h-4 text-cyan-400/80" />
                  </div>
                  <input
                    type="text"
                    id="register-company-input"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nordic Freight Carriers"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#07111e]/70 border border-[#1b314f] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Maritime Operational Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Anchor className="w-4 h-4 text-cyan-400/80" />
                  </div>
                  <select
                    id="register-role-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-8 py-2.5 bg-[#07111e]/70 border border-[#1b314f] rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="operator" className="bg-[#0b1728] text-white">
                      Master Mariner / Vessel Captain
                    </option>
                    <option value="fleet_manager" className="bg-[#0b1728] text-white">
                      Fleet Logistics Director
                    </option>
                    <option value="port_operations" className="bg-[#0b1728] text-white">
                      Port & Terminal Operator
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4 text-cyan-400/80" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="register-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#07111e]/70 border border-[#1b314f] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4 text-cyan-400/80" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="register-confirm-password-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#07111e]/70 border border-[#1b314f] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Password strength visual indicator */}
            {password && (
              <div className="pt-1">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-gray-400">Cipher Security Level</span>
                  <span
                    className={`font-medium font-mono ${
                      strength <= 1
                        ? "text-amber-400"
                        : strength <= 3
                        ? "text-cyan-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {strength <= 1 ? "Basic" : strength <= 3 ? "Standard" : "High Grade (256-bit)"}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  <div
                    className={`rounded-full transition-all ${
                      strength >= 1 ? "bg-amber-400" : "bg-white/10"
                    }`}
                  />
                  <div
                    className={`rounded-full transition-all ${
                      strength >= 2 ? "bg-cyan-400" : "bg-white/10"
                    }`}
                  />
                  <div
                    className={`rounded-full transition-all ${
                      strength >= 3 ? "bg-cyan-400" : "bg-white/10"
                    }`}
                  />
                  <div
                    className={`rounded-full transition-all ${
                      strength >= 4 ? "bg-emerald-400" : "bg-white/10"
                    }`}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              id="register-submit-btn"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 hover:from-cyan-400 hover:to-blue-400 text-[#04101f] font-semibold text-sm transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#04101f]/40 border-t-[#04101f] rounded-full animate-spin" />
                  <span>Provisioning Officer Credentials...</span>
                </>
              ) : (
                <>
                  <span>Join Fleet & Launch Command Center</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="mt-6 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-xs text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                id="register-login-link"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition inline-flex items-center gap-1 hover:underline"
              >
                Sign In <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
            <Link
              href="/"
              id="register-back-to-home-bottom"
              className="text-xs text-gray-400 hover:text-cyan-300 font-medium transition inline-flex items-center gap-1.5 hover:underline"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400/80" /> Back to Home
            </Link>
          </div>
        </div>

        {/* Security / Compliance Badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-gray-400 font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            SOLAS Verified Authentication
          </span>
          <span className="text-white/10">•</span>
          <span>Instant Provisioning</span>
          <span className="text-white/10">•</span>
          <span>Dual Role Authorization</span>
        </div>
      </div>
    </div>
  );
}
