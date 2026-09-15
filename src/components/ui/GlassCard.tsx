"use client";

import { HTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  flat?: boolean;
  glow?: boolean;
  hover?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, flat, glow, hover = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          flat ? "glass-flat" : "glass",
          hover && "glass-hover",
          glow && "shadow-glow-cyan border-cyan-500/30",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
