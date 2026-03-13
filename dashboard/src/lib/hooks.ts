"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Animates a number from 0 to `target` over `duration` ms with ease-out cubic.
 */
export function useAnimatedNumber(
  target: number,
  duration: number = 800,
  decimals: number = 0,
): string {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) {
      setCurrent(0);
      return;
    }

    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCurrent(eased * target);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return current.toFixed(decimals);
}
