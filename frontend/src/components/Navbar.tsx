"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[#1c2b45] bg-[#0a1628]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-[#00d4ff] flex items-center gap-2">
          <span className="text-3xl">🚢</span>
          <span>MarAlne</span>
        </Link>
        <div className="flex gap-4">
          <Link href="/login" className="text-gray-400 hover:text-[#00d4ff] transition text-sm">
            Login
          </Link>
          <Link href="/register" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-[#04101f] font-semibold rounded-lg text-sm hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
            Join the Fleet
          </Link>
        </div>
      </div>
    </nav>
  );
}