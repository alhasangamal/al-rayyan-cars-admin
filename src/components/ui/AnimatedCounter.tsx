'use client';

import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const reduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    let frame = 0;
    const totalFrames = 36;
    const delta = value;
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
      setDisplayValue(Math.round(delta * progress));
      if (frame >= totalFrames) window.clearInterval(timer);
    }, 16);

    return () => window.clearInterval(timer);
  }, [reduceMotion, value]);

  const effectiveValue = reduceMotion ? value : displayValue;
  const formatted = useMemo(() => effectiveValue.toLocaleString('en-US'), [effectiveValue]);

  return <>{formatted}{suffix}</>;
}
