"use client";

import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "cyan" | "orange";
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: "bg-white/10 text-gray-300 border-white/10",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  danger: "bg-red-500/10 text-red-400 border-red-500/20",
  info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30",
  orange: "bg-orange-500/15 text-orange-400 border-orange-400/30",
};

export function Badge({ children, variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border",
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
