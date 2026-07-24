"use client";

import { HTMLAttributes, ReactNode, useRef } from "react";
import { cn } from "@/lib/cn";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: boolean;
  flat?: boolean;          // ✅ new: flat variant
  variant?: "glass" | "flat";
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function GlassCard({
  children,
  glow = false,
  flat = false,
  variant = "glass",
  padding = "md",
  className,
  onMouseMove,
  ...props
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (glow && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      ref.current.style.setProperty("--x", `${e.clientX - rect.left}px`);
      ref.current.style.setProperty("--y", `${e.clientY - rect.top}px`);
    }
    onMouseMove?.(e);
  };

  const isFlat = variant === "flat" || flat;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn(
        isFlat ? "glass-flat" : "glass",
        glow && "hover-glow",
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}