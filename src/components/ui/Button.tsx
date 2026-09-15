"use client";

import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const sizeMap: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[13px] gap-1.5 rounded-[var(--radius-md)]",
  md: "px-5 py-2.5 text-sm gap-2 rounded-[var(--radius-lg)]",
  lg: "px-6 py-3.5 text-base gap-2.5 rounded-[var(--radius-lg)]",
};

const variantMap: Record<Variant, string> = {
  primary: 
    "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-[#050811] font-semibold hover:from-orange-400 hover:to-amber-400 hover:shadow-[0_0_24px_rgba(255,122,24,0.45)] border border-orange-400/30 active:scale-[0.98]",
  outline:
    "bg-transparent border border-ocean-line text-ink-secondary hover:border-cyan-400/50 hover:text-white hover:bg-cyan-500/5",
  ghost:
    "bg-white/[0.03] text-ink-secondary hover:bg-white/[0.08] hover:text-white",
  danger:
    "bg-status-danger/10 border border-status-danger/30 text-status-danger hover:bg-status-danger/20",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", icon, loading, fullWidth, className, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ocean-deep disabled:cursor-not-allowed disabled:opacity-50",
          sizeMap[size],
          variantMap[variant],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          icon
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;