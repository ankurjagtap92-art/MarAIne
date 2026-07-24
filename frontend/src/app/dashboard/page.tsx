"use client";

import dynamic from "next/dynamic";

const DashboardContent = dynamic(() => import("./DashboardContent"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#060b1a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading dashboard...</p>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  return <DashboardContent />;
}