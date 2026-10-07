import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { FloatingDoodles } from '../background/FloatingDoodles';

interface PhoneContainerProps {
  children: React.ReactNode;
}

export const PhoneContainer: React.FC<PhoneContainerProps> = ({ children }) => {
  const [deviceFrame, setDeviceFrame] = useState(true);

  return (
    <div className="min-h-screen bg-[#e8ecf2] dark:bg-[#050505] flex flex-col items-center justify-start transition-colors selection:bg-brand-500 selection:text-black relative font-sans">
      {/* Desktop view switcher (hidden on real mobile screens) */}
      <div className="hidden lg:flex fixed top-3 right-4 z-50 items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#0b0e13]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-card text-xs font-medium text-slate-600 dark:text-slate-400">
        <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-1 font-semibold uppercase tracking-wider">Preview:</span>
        <button
          onClick={() => setDeviceFrame(true)}
          style={deviceFrame ? { backgroundColor: '#DFFF00', color: '#000000', opacity: 1, fontWeight: 900 } : undefined}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
            deviceFrame
              ? 'bg-[#DFFF00] text-black font-black shadow-glow-pill'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Mobile Frame (Phone First)"
        >
          <Smartphone
            className="w-3.5 h-3.5"
            style={deviceFrame ? { color: '#000000', stroke: '#000000', strokeWidth: 2.8, opacity: 1 } : undefined}
          />
          <span style={deviceFrame ? { color: '#000000', opacity: 1, fontWeight: 900 } : undefined}>
            Mobile
          </span>
        </button>
        <button
          onClick={() => setDeviceFrame(false)}
          style={!deviceFrame ? { backgroundColor: '#DFFF00', color: '#000000', opacity: 1, fontWeight: 900 } : undefined}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
            !deviceFrame
              ? 'bg-[#DFFF00] text-black font-black shadow-glow-pill'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Full Width"
        >
          <Monitor
            className="w-3.5 h-3.5"
            style={!deviceFrame ? { color: '#000000', stroke: '#000000', strokeWidth: 2.8, opacity: 1 } : undefined}
          />
          <span style={!deviceFrame ? { color: '#000000', opacity: 1, fontWeight: 900 } : undefined}>
            Full
          </span>
        </button>
      </div>

      {/* Main Mobile Screen Container */}
      <div
        className={`w-full bg-gradient-to-b from-[#fafbfe] via-[#f4f6fa] to-[#edf0f7] dark:bg-gradient-to-b dark:from-[#080a0c] dark:via-[#090b0e] dark:to-[#050709] transition-all duration-300 relative flex flex-col min-h-screen overflow-hidden ${
          deviceFrame
            ? 'max-w-md my-0 lg:my-6 lg:rounded-[44px] lg:border-[8px] lg:border-[#14181f] dark:lg:border-[#12151b] shadow-2xl'
            : 'max-w-2xl border-x border-slate-200/80 dark:border-white/5'
        }`}
      >
        {/* Soft atmospheric ambient glow (Neon Lime & Cyan blooms) */}
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/3 w-80 h-80 rounded-full bg-brand-500/5 dark:bg-brand-500/10 blur-3xl pointer-events-none z-0"
        />
        <div
          aria-hidden="true"
          className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-brand-cyan/5 dark:bg-brand-cyan/8 blur-3xl pointer-events-none z-0"
        />

        {/* Floating daily-life lifestyle doodles in soft transparent gel */}
        <FloatingDoodles />

        {/* Hardware notch / speaker pill on desktop mobile frame */}
        {deviceFrame && (
          <div className="hidden lg:flex justify-center pt-2.5 pb-1 bg-transparent relative z-20">
            <div className="w-24 h-4 rounded-full bg-slate-200/70 dark:bg-[#12161d] flex items-center justify-center gap-2 border border-black/10 dark:border-white/5">
              <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-800" />
              <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-800" />
            </div>
          </div>
        )}

        {/* Screen content (sits above background doodles) */}
        <div className="flex-1 flex flex-col pb-20 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};
