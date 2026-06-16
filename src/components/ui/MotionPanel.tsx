'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface MotionPanelProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function MotionPanel({ children, className = '', delay = 0 }: MotionPanelProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
