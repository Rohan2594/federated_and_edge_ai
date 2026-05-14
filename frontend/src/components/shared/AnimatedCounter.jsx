import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({ value, decimals = 0, duration = 1000 }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const from = fromRef.current;
    const to = value;
    startRef.current = null;

    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const current = from + (to - from) * ease;
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span>{display.toFixed(decimals)}</span>;
}
