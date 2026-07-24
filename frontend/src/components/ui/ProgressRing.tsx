"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  className?: string;
}

export default function ProgressRing({
  value,
  size = 96,
  strokeWidth = 8,
  color = "var(--color-glow-cyan)",
  trackColor = "rgba(255,255,255,0.06)",
  label,
  sublabel,
  className,
}: ProgressRingProps) {
  const [animated, setAnimated] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      setAnimated(Math.min(Math.max(value, 0), 100))
    );
    return () => cancelAnimationFrame(id);
  }, [value]);

  const offset = circumference - (animated / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="font-mono text-lg font-bold text-ink-primary">{label}</span>}
        {sublabel && <span className="text-[10px] text-ink-secondary">{sublabel}</span>}
      </div>
    </div>
  );
}