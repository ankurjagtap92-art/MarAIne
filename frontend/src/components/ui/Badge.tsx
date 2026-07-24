import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "success" | "warning" | "danger" | "info" | "neutral";

const variantMap: Record<Variant, string> = {
  success: "bg-status-success/10 text-status-success",
  warning: "bg-status-warning/10 text-status-warning",
  danger: "bg-status-danger/10 text-status-danger",
  info: "bg-glow-blue/10 text-glow-blue",
  neutral: "bg-white/[0.06] text-ink-secondary",
};

const dotMap: Record<Variant, string> = {
  success: "bg-status-success",
  warning: "bg-status-warning",
  danger: "bg-status-danger",
  info: "bg-glow-blue",
  neutral: "bg-ink-muted",
};

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  dot?: boolean;
  className?: string;
}

export default function Badge({ children, variant = "neutral", dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        variantMap[variant],
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotMap[variant])} />}
      {children}
    </span>
  );
}