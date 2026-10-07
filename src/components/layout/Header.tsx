import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, CalendarCheck, CalendarDays } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { formatDateDisplay, getCurrentTimeString, formatTimeDisplay, getTodayDateString } from '../../utils/time';
import { triggerHaptic } from '../../utils/haptics';

export const Header: React.FC = () => {
  const { selectedDate, setSelectedDate, dailyMetrics, setActiveTab, settings } = usePlanner();
  const [currentTime, setCurrentTime] = useState(getCurrentTimeString());

  // Live clock updating every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeString());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;

  return (
    <header className="sticky top-0 z-30 px-4 pt-[calc(var(--safe-area-top)+0.75rem)] pb-2.5 bg-white/90 dark:bg-[#07090C]/90 backdrop-blur-md border-b border-slate-200/70 dark:border-white/5 transition-colors">
      <div className="flex items-center justify-between">
        {/* Logo & Tagline (Logitech Inspired: Black Hardware + Electric Yellow Accent) */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0B0D0F] border border-[#DFFF00]/60 flex items-center justify-center text-[#DFFF00] shadow-[0_0_14px_rgba(223,255,0,0.35)]">
            <CalendarCheck className="w-4.5 h-4.5 stroke-[2.5] text-[#DFFF00]" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
              DAYOS
            </h1>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-tight mt-0.5">
              Run your day.
            </p>
          </div>
        </div>

        {/* Current Time Badge & Settings */}
        <div className="flex items-center gap-2">
          {/* Live Current Time with Electric Yellow pulse dot */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-[#0B0D0F] backdrop-blur-xs text-slate-800 dark:text-white border border-slate-200/70 dark:border-white/10 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-pulse shadow-[0_0_8px_#DFFF00]" />
            <span className="text-xs font-mono-time font-bold tracking-tight">
              {formatTimeDisplay(currentTime, settings.timeFormat24h)}
            </span>
          </div>

          {/* Quick Settings Icon */}
          <button
            onClick={() => {
              triggerHaptic('light', settings.hapticFeedbackEnabled);
              setActiveTab('settings');
            }}
            aria-label="Settings"
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all"
          >
            <SettingsIcon className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* Date & Daily Progress Bar Row */}
      <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic('light', settings.hapticFeedbackEnabled);
              setSelectedDate(todayStr);
            }}
            className="flex items-center gap-1.5 py-1 px-1.5 -ml-1 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-[#DFFF00] transition-colors"
          >
            <CalendarDays className="w-3.5 h-3.5 text-[#DFFF00]" />
            <span>{formatDateDisplay(selectedDate)}</span>
          </button>

          {!isToday && (
            <button
              onClick={() => {
                triggerHaptic('light', settings.hapticFeedbackEnabled);
                setSelectedDate(todayStr);
              }}
              style={{ backgroundColor: '#DFFF00', color: '#000000', opacity: 1, fontWeight: 900 }}
              className="text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(223,255,0,0.5)] hover:bg-[#c8ea00] transition-colors"
            >
              Today
            </button>
          )}
        </div>

        {/* Daily Progress with Electric Yellow meter */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {dailyMetrics.completedActivities}/{dailyMetrics.totalActivities}
          </span>

          <div className="relative w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out bg-[#DFFF00] shadow-[0_0_8px_rgba(223,255,0,0.6)]"
              style={{ width: `${dailyMetrics.progressPercent}%` }}
            />
          </div>

          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono-time">
            {dailyMetrics.progressPercent}%
          </span>
        </div>
      </div>
    </header>
  );
};
