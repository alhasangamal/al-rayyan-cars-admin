'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function AnimatedBackgroundGlow() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.14),transparent_34%),radial-gradient(circle_at_10%_25%,rgba(59,130,246,0.12),transparent_30%),linear-gradient(145deg,#020617,#050816_42%,#020617)]" />
      <motion.div
        className="absolute -right-28 top-20 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, -35, 0], y: [0, 30, 0], opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-10 left-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, 45, 0], y: [0, -28, 0], opacity: [0.45, 0.75, 0.45] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
    </div>
  );
}
