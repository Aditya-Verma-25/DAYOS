import React, { useRef, useEffect, useState, useCallback } from 'react';
import { triggerHaptic } from '../../utils/haptics';

interface WatchWheelProps {
  items: { label: string; value: string | number }[];
  selectedValue: string | number;
  onSelect: (val: any) => void;
  hapticEnabled?: boolean;
  label?: string;
}

const ITEM_HEIGHT = 44; // px

const WatchWheel: React.FC<WatchWheelProps> = ({
  items,
  selectedValue,
  onSelect,
  hapticEnabled = true,
  label,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  const selectedIndex = Math.max(0, items.findIndex((it) => it.value === selectedValue));

  // Sync scroll position when selectedValue changes externally
  useEffect(() => {
    if (isUserScrollingRef.current) return;
    if (containerRef.current) {
      containerRef.current.scrollTop = selectedIndex * ITEM_HEIGHT;
    }
  }, [selectedIndex]);

  // Handle scroll events with debounce to detect snap settlement
  const handleScroll = useCallback(() => {
    isUserScrollingRef.current = true;
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      if (containerRef.current) {
        const top = containerRef.current.scrollTop;
        const index = Math.round(top / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
        if (items[clampedIndex] && items[clampedIndex].value !== selectedValue) {
          triggerHaptic('light', hapticEnabled);
          onSelect(items[clampedIndex].value);
        }
      }
      isUserScrollingRef.current = false;
    }, 80);
  }, [items, selectedValue, onSelect, hapticEnabled]);

  const handleItemClick = (index: number, val: string | number) => {
    triggerHaptic('light', hapticEnabled);
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: 'smooth',
      });
    }
    onSelect(val);
  };

  return (
    <div className="flex flex-col items-center flex-1 min-w-[70px]">
      {label && (
        <span className="text-[10px] font-mono-time uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 font-bold">
          {label}
        </span>
      )}

      <div className="relative w-full h-[132px] overflow-hidden rounded-xl bg-slate-100/60 dark:bg-black/50 border border-slate-200/60 dark:border-white/5">
        {/* Center reticle lens highlighting the active selection in Electric Yellow (z-0 behind items) */}
        <div
          style={{ backgroundColor: '#DFFF00', borderColor: '#DFFF00' }}
          className="absolute left-1 right-1 top-[44px] h-[44px] pointer-events-none rounded-xl border shadow-[0_0_18px_rgba(223,255,0,0.45)] z-0"
        />

        {/* Scrollable items (relative z-10 above the reticle background lens) */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="watch-wheel-container relative z-10 h-full w-full overflow-y-scroll snap-y snap-mandatory py-[44px]"
        >
          {items.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            const distance = Math.abs(idx - selectedIndex);

            return (
              <div
                key={item.value}
                onClick={() => handleItemClick(idx, item.value)}
                style={{
                  height: `${ITEM_HEIGHT}px`,
                  ...(isSelected ? { color: '#000000', opacity: 1, fontWeight: 900 } : {}),
                }}
                className={`watch-wheel-item flex items-center justify-center cursor-pointer select-none transition-all duration-150 ${
                  isSelected
                    ? 'font-black text-2xl scale-110 drop-shadow-none z-20'
                    : distance === 1
                    ? 'text-slate-400 dark:text-slate-500 font-semibold text-base opacity-60 scale-90'
                    : 'text-slate-400 dark:text-slate-600 font-normal text-xs opacity-30 scale-75'
                }`}
              >
                <span
                  style={isSelected ? { color: '#000000', opacity: 1, fontWeight: 900 } : undefined}
                  className={`font-mono-time ${isSelected ? 'text-black font-black' : ''}`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Top & Bottom gradient fading mask (z-30 at the extremities, pointer-events-none) */}
        <div className="absolute inset-x-0 top-0 h-9 bg-gradient-to-b from-white/90 dark:from-[#080a0c] to-transparent pointer-events-none z-30" />
        <div className="absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-white/90 dark:from-[#080a0c] to-transparent pointer-events-none z-30" />
      </div>
    </div>
  );
};

interface WatchTimePickerProps {
  time: string; // 'HH:MM' (24h)
  onChange: (newTime: string) => void;
  hapticEnabled?: boolean;
  label?: string;
  is24Hour?: boolean;
}

export const WatchTimePicker: React.FC<WatchTimePickerProps> = ({
  time,
  onChange,
  hapticEnabled = true,
  label,
  is24Hour = true,
}) => {
  const [hoursStr, minutesStr] = time.split(':');
  const rawHours = parseInt(hoursStr || '09', 10);
  const rawMinutes = parseInt(minutesStr || '00', 10);

  // Minutes options in 5-minute increments (00, 05, 10, ... 55)
  const minuteItems = Array.from({ length: 12 }, (_, i) => {
    const val = i * 5;
    const s = val.toString().padStart(2, '0');
    return { label: s, value: s };
  });

  // Hours options
  let hourItems: { label: string; value: string }[] = [];
  let period: 'AM' | 'PM' = 'AM';
  let displayHour = rawHours;

  if (is24Hour) {
    hourItems = Array.from({ length: 24 }, (_, i) => {
      const s = i.toString().padStart(2, '0');
      return { label: s, value: s };
    });
  } else {
    period = rawHours >= 12 ? 'PM' : 'AM';
    displayHour = rawHours % 12 || 12;
    hourItems = Array.from({ length: 12 }, (_, i) => {
      const h = i + 1;
      const s = h.toString().padStart(2, '0');
      return { label: s, value: s };
    });
  }

  // Handle Hour change
  const handleHourChange = (newHourVal: string) => {
    let finalHour = parseInt(newHourVal, 10);
    if (!is24Hour) {
      if (period === 'PM' && finalHour < 12) finalHour += 12;
      if (period === 'AM' && finalHour === 12) finalHour = 0;
    }
    const finalHStr = finalHour.toString().padStart(2, '0');
    onChange(`${finalHStr}:${minutesStr || '00'}`);
  };

  // Handle Minute change
  const handleMinuteChange = (newMinVal: string) => {
    onChange(`${hoursStr}:${newMinVal}`);
  };

  // Handle Period change (AM/PM)
  const handlePeriodChange = (newPeriod: 'AM' | 'PM') => {
    let finalHour = rawHours;
    if (newPeriod === 'PM' && rawHours < 12) finalHour += 12;
    if (newPeriod === 'AM' && rawHours >= 12) finalHour -= 12;
    const finalHStr = finalHour.toString().padStart(2, '0');
    onChange(`${finalHStr}:${minutesStr || '00'}`);
  };

  // Closest snapped minute string
  const currentMinSnapped = (Math.round(rawMinutes / 5) * 5 % 60).toString().padStart(2, '0');
  const currentHourFormatted = is24Hour
    ? rawHours.toString().padStart(2, '0')
    : displayHour.toString().padStart(2, '0');

  return (
    <div className="flex flex-col space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {label}
          </span>
          <span
            style={{ backgroundColor: '#DFFF00', color: '#000000', opacity: 1, fontWeight: 900 }}
            className="text-xs font-mono-time px-2.5 py-0.5 rounded-md border border-[#DFFF00] shadow-[0_0_8px_rgba(223,255,0,0.4)]"
          >
            {time}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Hours Wheel */}
        <WatchWheel
          label="Hour"
          items={hourItems}
          selectedValue={currentHourFormatted}
          onSelect={handleHourChange}
          hapticEnabled={hapticEnabled}
        />

        {/* Colon separator */}
        <div className="pt-4 text-[#DFFF00] font-black text-xl font-mono-time animate-pulse drop-shadow-[0_0_8px_rgba(223,255,0,0.7)]">
          :
        </div>

        {/* Minutes Wheel */}
        <WatchWheel
          label="Min"
          items={minuteItems}
          selectedValue={currentMinSnapped}
          onSelect={handleMinuteChange}
          hapticEnabled={hapticEnabled}
        />

        {/* AM / PM Toggle if 12-hour mode */}
        {!is24Hour && (
          <div className="flex flex-col items-center justify-center pt-4 gap-1.5 min-w-[50px]">
            <button
              type="button"
              onClick={() => handlePeriodChange('AM')}
              style={period === 'AM' ? { backgroundColor: '#DFFF00', color: '#000000', opacity: 1, fontWeight: 900 } : undefined}
              className={`w-full py-1.5 rounded-lg text-xs font-mono-time font-black border transition-all ${
                period === 'AM'
                  ? 'border-[#DFFF00] shadow-[0_0_10px_rgba(223,255,0,0.6)]'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span style={period === 'AM' ? { color: '#000000', opacity: 1, fontWeight: 900 } : undefined}>AM</span>
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange('PM')}
              style={period === 'PM' ? { backgroundColor: '#DFFF00', color: '#000000', opacity: 1, fontWeight: 900 } : undefined}
              className={`w-full py-1.5 rounded-lg text-xs font-mono-time font-black border transition-all ${
                period === 'PM'
                  ? 'border-[#DFFF00] shadow-[0_0_10px_rgba(223,255,0,0.6)]'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span style={period === 'PM' ? { color: '#000000', opacity: 1, fontWeight: 900 } : undefined}>PM</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
