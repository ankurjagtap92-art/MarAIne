"use client";

import { ReactNode } from "react";
import GlassCard from "./GlassCard";
import AnimatedCounter from "./AnimatedCounter";
import { cn } from "@/lib/cn";

type Accent = "violet" | "cyan" | "teal" | "blue" | "warning" | "danger";

const accentMap: Record<Accent, { text: string; bg: string }> = {
  violet: { text: "text-glow-primary", bg: "bg-glow-primary/10" },
  cyan: { text: "text-glow-cyan", bg: "bg-glow-cyan/10" },
  teal: { text: "text-glow-teal", bg: "bg-glow-teal/10" },
  blue: { text: "text-glow-blue", bg: "bg-glow-blue/10" },
  warning: { text: "text-status-warning", bg: "bg-status-warning/10" },
  danger: { text: "text-status-danger", bg: "bg-status-danger/10" },
};

interface StatCardProps {
  icon: ReactNode;
  value: number | string;
  label: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  accent?: Accent;
  suffix?: string;
  delay?: number;
}

export default function StatCard({
  icon,
  value,
  label,
  change,
  trend = "neutral",
  accent = "cyan",
  suffix = "",
  delay = 0,
}: StatCardProps) {
  const a = accentMap[accent] || accentMap.cyan;

  return (
    <GlassCard flat className="p-4 animate-in" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center justify-between">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", a.bg, a.text)}>
          {icon}
        </div>
        {change && (
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              trend === "up" ? "text-status-success bg-status-success/10" :
              trend === "down" ? "text-status-danger bg-status-danger/10" :
              "text-ink-muted bg-white/5"
            )}
          >
            {trend === "up" ? "▲" : trend === "down" ? "▼" : ""} {change}
          </span>
        )}
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold text-ink-primary">
          {typeof value === "number" ? <AnimatedCounter value={value} suffix={suffix} /> : value}
        </div>
        <p className="text-xs text-ink-secondary">{label}</p>
      </div>
    </GlassCard>
  );
}