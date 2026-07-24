"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  triggerOnce?: boolean;
}

export default function AnimatedCounter({
  value,
  duration = 900,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
  triggerOnce = true,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);
  const fromRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce,
  });

  useEffect(() => {
    if (inView && !hasTriggered) {
      setHasTriggered(true);
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReduced) {
        setDisplay(value);
        return;
      }

      const from = fromRef.current;
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(from + (value - from) * eased);
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          fromRef.current = value;
        }
      };

      frameRef.current = requestAnimationFrame(tick);
      return () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
    }
  }, [inView, value, duration, hasTriggered]);

  // If not triggered yet, show 0 (or you can show a placeholder)
  const displayValue = hasTriggered ? display : 0;

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {prefix}
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}