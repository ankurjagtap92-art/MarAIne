"use client";

import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

interface FieldChromeProps {
  label?: string;
  hint?: string;
  error?: string;
}

const fieldBase =
  "w-full rounded-[var(--radius-md)] border bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted transition-colors focus:outline-none focus:ring-2 focus:ring-glow-cyan/20";

function fieldBorder(error?: string) {
  return error ? "border-status-danger/50 focus:border-status-danger" : "border-ocean-line focus:border-glow-cyan";
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldChromeProps {
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, icon, className, id, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={fieldId} className="mb-2 block text-[11px] uppercase tracking-wider text-ink-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">{icon}</span>}
          <input
            ref={ref}
            id={fieldId}
            className={cn(fieldBase, fieldBorder(error), icon && "pl-10", className)}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
            {...props}
          />
        </div>
        {error ? (
          <p id={`${fieldId}-error`} className="mt-1.5 text-xs text-status-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${fieldId}-hint`} className="mt-1.5 text-xs text-ink-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldChromeProps {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, className, id, children, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={fieldId} className="mb-2 block text-[11px] uppercase tracking-wider text-ink-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            className={cn(fieldBase, fieldBorder(error), "cursor-pointer appearance-none pr-9", className)}
            aria-invalid={!!error}
            {...props}
          >
            {children}
          </select>
          <svg
            className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-status-danger">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = "Select";