"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface GaugeChartProps {
  value: number; // 0-100
  size?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  trackColor?: string;
  className?: string;
}

export default function GaugeChart({
  value,
  size = 180,
  label,
  sublabel,
  color = "#7c5cff",
  trackColor = "rgba(255,255,255,0.06)",
  className,
}: GaugeChartProps) {
  const [animated, setAnimated] = useState(0);
  const clamped = Math.min(Math.max(value, 0), 100);
  const radius = size / 2 - 12;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = Math.PI * radius; // half circle

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(clamped));
    return () => cancelAnimationFrame(id);
  }, [clamped]);

  const offset = circumference - (animated / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex flex-col items-center", className)}
      style={{ width: size }}
    >
      <svg width={size} height={size / 2 + 12} viewBox={`0 0 ${size} ${size / 2 + 12}`}>
        {/* Background track */}
        <path
          d={`M 12 ${cy} A ${radius} ${radius} 0 0 1 ${size - 12} ${cy}`}
          fill="none"
          stroke={trackColor}
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Animated gauge */}
        <path
          d={`M 12 ${cy} A ${radius} ${radius} 0 0 1 ${size - 12} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        {label && <span className="font-mono text-xl font-bold text-ink-primary">{label}</span>}
        {sublabel && <span className="text-[11px] text-ink-secondary">{sublabel}</span>}
      </div>
      <div
        suppressHydrationWarning
        className={cn("relative inline-flex flex-col items-center", className)}
        style={{ width: size }}
      ></div>
    </div>
  );
}