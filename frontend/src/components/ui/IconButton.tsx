"use client";

import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/lib/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  label: string;
  badge?: number;
  size?: "sm" | "md";
  active?: boolean;
}

const sizeMap = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, label, badge, size = "md", active, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={cn(
          "relative flex items-center justify-center rounded-lg border transition-all duration-200",
          active
            ? "border-glow-cyan/40 bg-glow-cyan/10 text-glow-cyan"
            : "border-ocean-line bg-white/[0.02] text-ink-secondary hover:border-glow-cyan/30 hover:text-ink-primary",
          sizeMap[size],
          className
        )}
        {...props}
      >
        {children}
        {typeof badge === "number" && badge > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-danger px-1 text-[10px] font-bold text-white">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";

export default IconButton;