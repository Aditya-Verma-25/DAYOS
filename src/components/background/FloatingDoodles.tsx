import React, { useMemo } from 'react';

// Collection of 20 distinct lifestyle and daily-activity SVG doodles
// Clean editorial hand-drawn line style with consistent stroke (1.8px)
const DOODLE_SVGS = [
  // 1. Headphones
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  ),
  // 2. Coffee Cup
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  ),
  // 3. Dumbbell / Exercise
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6.5 6.5 11 11" />
      <path d="m21 21-1-1a2 2 0 0 0-2.83 0l-1.17 1.17a2 2 0 0 1-2.83 0L3 11a2 2 0 0 1 0-2.83l1.17-1.17a2 2 0 0 0 0-2.83l-1-1" />
      <path d="m3 3 1 1a2 2 0 0 0 2.83 0l1.17-1.17a2 2 0 0 1 2.83 0L21 13a2 2 0 0 1 0 2.83l-1.17 1.17a2 2 0 0 0 0 2.83l1 1" />
    </svg>
  ),
  // 4. Book / Study
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
      <path d="M6 14h6" />
    </svg>
  ),
  // 5. Water Bottle / Hydration
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="7" y="6" width="10" height="15" rx="3" />
      <path d="M9 2h6v4H9z" />
      <path d="M7 11h10" />
      <path d="M10 14h4" />
    </svg>
  ),
  // 6. Running Shoe / Movement
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 16h18v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2Z" />
      <path d="M4 16v-3a2 2 0 0 1 1-1.73l7-4.04a2 2 0 0 1 2 0l7 4.04a2 2 0 0 1 1 1.73v3" />
      <path d="M8 12v-2" />
      <path d="M12 10.5V8.5" />
      <path d="M16 12v-2" />
    </svg>
  ),
  // 7. Laptop / Deep Work
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M2 20h20" />
    </svg>
  ),
  // 8. Alarm Clock / Morning
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="m5 3 2 2" />
      <path d="m19 3-2 2" />
      <path d="m6 19-2 2" />
      <path d="m18 19 2 2" />
    </svg>
  ),
  // 9. Moon & Stars / Sleep
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      <path d="M19 3v4" />
      <path d="M21 5h-4" />
    </svg>
  ),
  // 10. Plant / Life & Nature
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22v-9" />
      <path d="M12 13a5 5 0 0 0 5-5c0-3-5-4-5-4s-5 1-5 4a5 5 0 0 0 5 5Z" />
      <path d="M12 17a4 4 0 0 1 4-4" />
      <path d="M12 15a4 4 0 0 0-4-4" />
    </svg>
  ),
  // 11. Bicycle / Commute
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L9 9l3-3 3 5.5" />
      <path d="M12 17.5V14l-3-3" />
    </svg>
  ),
  // 12. Camera / Memories
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  ),
  // 13. Music Note / Relaxation
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  // 14. Heart / Wellness
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ),
  // 15. Glasses / Focus
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="6" cy="14" r="4" />
      <circle cx="18" cy="14" r="4" />
      <path d="M10 14h4" />
      <path d="M6 10l2-6" />
      <path d="M18 10l-2-6" />
    </svg>
  ),
  // 16. Fork & Spoon / Meal
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2v20" />
      <path d="M21 2v6a3 3 0 0 1-3 3h0" />
      <path d="M3 2v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2" />
      <path d="M5 11v11" />
    </svg>
  ),
  // 17. Backpack / Daily carry
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10Z" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5" />
      <path d="M8 10h8" />
    </svg>
  ),
  // 18. Pen / Journaling
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  ),
  // 19. Sun / New Day
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  ),
  // 20. Target / Focus
  (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
];

interface FloatingItem {
  id: number;
  doodleIndex: number;
  topPercent: number;
  leftPercent: number;
  scale: number;
  opacity: number;
  durationSec: number;
  delaySec: number;
  rotationDeg: number;
  driftX: number;
  driftY: number;
  colorClass: string;
}

export const FloatingDoodles: React.FC = () => {
  // Mostly monochromatic line-art system: white/silver + pale electric yellow/lime, occasional cyan
  const items: FloatingItem[] = useMemo(() => {
    return [
      { id: 1, doodleIndex: 0, topPercent: 6, leftPercent: 5, scale: 1.05, opacity: 0.32, durationSec: 15, delaySec: 0, rotationDeg: -8, driftX: 7, driftY: -12, colorClass: 'text-slate-800 dark:text-[#DFFF00]/45 dark:drop-shadow-[0_0_8px_rgba(223,255,0,0.35)]' },
      { id: 2, doodleIndex: 1, topPercent: 12, leftPercent: 82, scale: 1.0, opacity: 0.30, durationSec: 17, delaySec: 1.2, rotationDeg: 6, driftX: -8, driftY: 10, colorClass: 'text-slate-800 dark:text-white/40 dark:drop-shadow-[0_0_6px_rgba(255,255,255,0.25)]' },
      { id: 3, doodleIndex: 2, topPercent: 24, leftPercent: 88, scale: 1.1, opacity: 0.28, durationSec: 19, delaySec: 2.8, rotationDeg: -12, driftX: 6, driftY: -13, colorClass: 'text-slate-800 dark:text-slate-300/40' },
      { id: 4, doodleIndex: 3, topPercent: 30, leftPercent: 4, scale: 1.05, opacity: 0.32, durationSec: 16, delaySec: 0.7, rotationDeg: 10, driftX: -7, driftY: 11, colorClass: 'text-slate-800 dark:text-[#DFFF00]/40 dark:drop-shadow-[0_0_8px_rgba(223,255,0,0.3)]' },
      { id: 5, doodleIndex: 4, topPercent: 43, leftPercent: 91, scale: 0.95, opacity: 0.26, durationSec: 20, delaySec: 2.0, rotationDeg: -6, driftX: 8, driftY: -9, colorClass: 'text-slate-800 dark:text-cyan-200/40 dark:drop-shadow-[0_0_8px_rgba(0,240,255,0.2)]' },
      { id: 6, doodleIndex: 5, topPercent: 51, leftPercent: 6, scale: 1.0, opacity: 0.29, durationSec: 18, delaySec: 3.8, rotationDeg: 8, driftX: -6, driftY: 10, colorClass: 'text-slate-800 dark:text-white/35' },
      { id: 7, doodleIndex: 6, topPercent: 63, leftPercent: 86, scale: 1.05, opacity: 0.31, durationSec: 16, delaySec: 1.0, rotationDeg: -7, driftX: 7, driftY: -12, colorClass: 'text-slate-800 dark:text-[#DFFF00]/45 dark:drop-shadow-[0_0_8px_rgba(223,255,0,0.35)]' },
      { id: 8, doodleIndex: 7, topPercent: 73, leftPercent: 7, scale: 1.0, opacity: 0.28, durationSec: 21, delaySec: 3.2, rotationDeg: 12, driftX: -8, driftY: 9, colorClass: 'text-slate-800 dark:text-slate-200/40' },
      { id: 9, doodleIndex: 8, topPercent: 84, leftPercent: 83, scale: 1.1, opacity: 0.33, durationSec: 17, delaySec: 1.8, rotationDeg: -10, driftX: 6, driftY: -11, colorClass: 'text-slate-800 dark:text-[#DFFF00]/40 dark:drop-shadow-[0_0_8px_rgba(223,255,0,0.3)]' },
      { id: 10, doodleIndex: 9, topPercent: 92, leftPercent: 10, scale: 1.0, opacity: 0.27, durationSec: 19, delaySec: 0.4, rotationDeg: 6, driftX: -7, driftY: 8, colorClass: 'text-slate-800 dark:text-white/35' },
      { id: 11, doodleIndex: 11, topPercent: 18, leftPercent: 46, scale: 0.9, opacity: 0.24, durationSec: 22, delaySec: 2.5, rotationDeg: -4, driftX: 5, driftY: -7, colorClass: 'text-slate-800 dark:text-slate-300/35' },
      { id: 12, doodleIndex: 12, topPercent: 57, leftPercent: 48, scale: 0.9, opacity: 0.24, durationSec: 23, delaySec: 4.2, rotationDeg: 5, driftX: -5, driftY: 8, colorClass: 'text-slate-800 dark:text-[#DFFF00]/35' },
      { id: 13, doodleIndex: 13, topPercent: 37, leftPercent: 76, scale: 0.95, opacity: 0.27, durationSec: 17, delaySec: 1.6, rotationDeg: -9, driftX: 6, driftY: -9, colorClass: 'text-slate-800 dark:text-white/35' },
      { id: 14, doodleIndex: 17, topPercent: 79, leftPercent: 50, scale: 0.85, opacity: 0.22, durationSec: 25, delaySec: 3.0, rotationDeg: 14, driftX: -4, driftY: 7, colorClass: 'text-slate-800 dark:text-slate-300/35' },
    ];
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 transition-opacity duration-700"
    >
      {items.map((item) => {
        const IconComponent = DOODLE_SVGS[item.doodleIndex % DOODLE_SVGS.length];

        return (
          <div
            key={item.id}
            className={`absolute ${item.colorClass} transform-gpu motion-safe:animate-gel-float`}
            style={{
              top: `${item.topPercent}%`,
              left: `${item.leftPercent}%`,
              opacity: item.opacity,
              transform: `scale(${item.scale}) rotate(${item.rotationDeg}deg)`,
              animationDuration: `${item.durationSec}s`,
              animationDelay: `${item.delaySec}s`,
              ['--drift-x' as string]: `${item.driftX}px`,
              ['--drift-y' as string]: `${item.driftY}px`,
            }}
          >
            <IconComponent className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
        );
      })}
    </div>
  );
};
