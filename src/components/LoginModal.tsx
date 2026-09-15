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
  ShieldCheck,
  AlertCircle,
  UserCheck,
  X,
  UserPlus,
  LogIn,
  Building2,
  User,
} from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl?: string;
  targetLabel?: string;
  initialMode?: "login" | "register";
}

export default function LoginModal({
  isOpen,
  onClose,
  targetUrl = "/dashboard",
  targetLabel = "SeaVision Command Center",
  initialMode = "login",
}: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("operator");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const { login, demoLogin, register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMode(initialMode);
    setError("");
  }, [initialMode, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      onClose();
      router.push(targetUrl);
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await register({
        email,
        password,
        full_name: name || "Fleet Officer",
        company_name: company || "Merchant Shipping Fleet",
        role,
      });
      onClose();
      router.push(targetUrl);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (roleType: "captain" | "director") => {
    setError("");
    setLoading(true);
    setActiveDemo(roleType);

    try {
      await demoLogin(roleType);
      onClose();
      router.push(targetUrl);
    } catch (err: any) {
      setError(err.message || "Demo sign in failed. Please try again.");
    } finally {
      setLoading(false);
      setActiveDemo(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg bg-[#091322] border border-[#1b3356] rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden z-10 animate-in zoom-in-95 duration-200"
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-cyan-400 to-emerald-400" />

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white tracking-tight">SeaVision</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[10px] font-mono text-cyan-400">
                  Login Panel
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                {targetLabel ? `Proceeding to: ${targetLabel}` : "Authenticate to continue"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            id="close-login-modal-btn"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Log In vs Sign Up */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 p-1 bg-[#060c18] rounded-xl border border-white/5">
            <button
              type="button"
              id="modal-tab-login"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === "login"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-md shadow-orange-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
            <button
              type="button"
              id="modal-tab-signup"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === "register"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up / Register</span>
            </button>
          </div>
        </div>

        {/* Quick Demo Login (visible on Login mode) */}
        {mode === "login" && (
          <div className="px-6 pt-4">
            <div className="p-3 rounded-xl bg-[#060c18] border border-orange-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono tracking-wider uppercase text-orange-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" /> 1-Click Fast Access
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Instant Test</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="modal-demo-captain"
                  onClick={() => handleQuickDemo("captain")}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0b172a] hover:bg-[#10223d] border border-cyan-500/30 text-xs font-medium text-cyan-200 hover:text-white transition-all hover:border-cyan-400 disabled:opacity-50 active:scale-95"
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{activeDemo === "captain" ? "Entering..." : "Captain Smith"}</span>
                </button>
                <button
                  type="button"
                  id="modal-demo-director"
                  onClick={() => handleQuickDemo("director")}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0b172a] hover:bg-[#10223d] border border-orange-500/30 text-xs font-medium text-orange-300 hover:text-white transition-all hover:border-orange-400 disabled:opacity-50 active:scale-95"
                >
                  <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span>{activeDemo === "director" ? "Entering..." : "Director Elena"}</span>
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#091322] px-3 text-[10px] uppercase tracking-wider text-gray-400 font-mono">
                or with email
              </span>
              <div className="border-t border-white/10 w-full" />
            </div>
          </div>
        )}

        {/* Modal Form Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === "login" ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Officer Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4 text-orange-400" />
                  </div>
                  <input
                    type="email"
                    id="modal-login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="captain@fleet.com"
                    required
                    disabled={loading}
                    className="w-full pl-9 pr-4 py-2 bg-[#060c18] border border-[#1b3356] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("captain@fleet.com");
                      setPassword("password123");
                    }}
                    className="text-[10px] text-orange-400 hover:underline font-mono"
                  >
                    Auto-fill demo pass
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4 text-orange-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="modal-login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full pl-9 pr-9 py-2 bg-[#060c18] border border-[#1b3356] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="modal-login-submit-btn"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-xs transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Log In & Proceed</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Full Name / Rank
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4 text-cyan-400" />
                  </div>
                  <input
                    type="text"
                    id="modal-register-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Captain Alexander Hayes"
                    required
                    disabled={loading}
                    className="w-full pl-9 pr-4 py-2 bg-[#060c18] border border-[#1b3356] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Company / Organization
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <input
                    type="text"
                    id="modal-register-company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Pacific Freight Lines"
                    disabled={loading}
                    className="w-full pl-9 pr-4 py-2 bg-[#060c18] border border-[#1b3356] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Officer Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4 text-cyan-400" />
                  </div>
                  <input
                    type="email"
                    id="modal-register-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@shippingline.com"
                    required
                    disabled={loading}
                    className="w-full pl-9 pr-4 py-2 bg-[#060c18] border border-[#1b3356] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Officer Role
                </label>
                <select
                  id="modal-register-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-[#060c18] border border-[#1b3356] rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="operator">Fleet Operations Officer</option>
                  <option value="captain">Ship Master / Captain</option>
                  <option value="analyst">Maritime Fuel & Route Analyst</option>
                  <option value="admin">Fleet Commander (Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4 text-cyan-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="modal-register-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full pl-9 pr-9 py-2 bg-[#060c18] border border-[#1b3356] rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="modal-register-submit-btn"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:brightness-110 text-white font-bold text-xs transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Sign Up & Proceed</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#060c18] border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-bit TLS Encrypted</span>
          </div>

          <Link
            href={mode === "login" ? `/login?redirect=${encodeURIComponent(targetUrl)}` : `/register?redirect=${encodeURIComponent(targetUrl)}`}
            onClick={onClose}
            className="text-gray-400 hover:text-white underline underline-offset-2"
          >
            Open dedicated page ➔
          </Link>
        </div>
      </div>
    </div>
  );
}
