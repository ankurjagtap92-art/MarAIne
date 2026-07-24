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
  "bg-glow-primary text-white hover:bg-glow-primary-soft hover:shadow-[0_0_24px_rgba(124,92,255,0.4)]",
  outline:
    "bg-transparent border border-ocean-line text-ink-secondary hover:border-glow-cyan hover:text-ink-primary",
  ghost:
    "bg-white/[0.03] text-ink-secondary hover:bg-white/[0.06] hover:text-ink-primary",
  danger:
    "bg-status-danger/10 border border-status-danger/30 text-status-danger hover:bg-status-danger/15",
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