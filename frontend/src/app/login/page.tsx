"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b1a] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-[#0d2137]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-8">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-[#00d4ff]">
            🚢 MarAlne
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-white">Welcome Back</h2>
          <p className="mt-1 text-sm text-gray-400">Sign in to access your command center</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#060b1a]/50 border border-[#1c2b45] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff]"
                placeholder="captain@fleet.com"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#060b1a]/50 border border-[#1c2b45] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff]"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 bg-[#060b1a] border-[#1c2b45] rounded text-[#00d4ff] focus:ring-[#00d4ff]/50"
              />
              <label className="ml-2 text-sm text-gray-400">Remember me</label>
            </div>
            <Link href="#" className="text-sm text-[#00d4ff] hover:text-[#00ffc8] transition">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-[#00d4ff] text-[#04101f] font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#00d4ff] hover:text-[#00ffc8] transition font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}