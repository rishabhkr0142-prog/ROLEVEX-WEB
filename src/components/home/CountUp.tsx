"use client";

import { useEffect, useRef, useState } from "react";

/** Small odometer-style counter used in the Home stats band. */
export function CountUp({ value, duration = 1100 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const startedAt = useRef<number | null>(null);
  const from = useRef(0);

  useEffect(() => {
    if (value <= 0) {
      setDisplay(value);
      return;
    }
    let frame: number;

    const tick = (now: number) => {
      if (startedAt.current === null) startedAt.current = now;
      const progress = Math.min(1, (now - startedAt.current) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from.current + (value - from.current) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else from.current = value;
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{display.toLocaleString("en-US")}</>;
}
