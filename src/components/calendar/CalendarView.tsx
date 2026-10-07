import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Clock, Plus, Sparkles } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import {
  getTodayDateString,
  formatDateToISO,
  parseISODate,
  formatDateDisplay,
  formatTimeDisplay,
  calculateDurationMinutes,
  formatDuration,
} from '../../utils/time';
import { triggerHaptic } from '../../utils/haptics';
import { getCategoryGlassStyle } from '../../utils/colors';
import { Badge } from '../common/Badge';

export const CalendarView: React.FC = () => {
  const {
    activities,
    selectedDate,
    setSelectedDate,
    setActiveTab,
    openCreateModal,
    openEditModal,
    toggleComplete,
    settings,
  } = usePlanner();

  const todayStr = getTodayDateString();
  const [currentMonthDate, setCurrentMonthDate] = useState(() => parseISODate(selectedDate));

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0 - 11

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    triggerHaptic('light', settings.hapticFeedbackEnabled);
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    triggerHaptic('light', settings.hapticFeedbackEnabled);
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Activities grouped by date
  const activitiesByDate = React.useMemo(() => {
    const map = new Map<string, typeof activities>();
    activities.forEach((act) => {
      const list = map.get(act.date) || [];
      list.push(act);
      map.set(act.date, list);
    });
    return map;
  }, [activities]);

  const selectedDateActivities = activitiesByDate.get(selectedDate) || [];

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-6 space-y-4 overflow-y-auto">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between bg-white/70 dark:bg-[#080a0c]/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-brand-500" />
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              triggerHaptic('light', settings.hapticFeedbackEnabled);
              setSelectedDate(todayStr);
              setCurrentMonthDate(parseISODate(todayStr));
            }}
            style={selectedDate === todayStr ? { backgroundColor: '#DFFF00', color: '#000000', opacity: 1, fontWeight: 900 } : undefined}
            className={`text-xs font-bold px-3 py-1 rounded-xl transition-all mr-1 ${
              selectedDate === todayStr
                ? 'shadow-glow-pill'
                : 'bg-slate-100/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
            }`}
          >
            Today
          </button>
          <button
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/70 dark:bg-[#080a0c]/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-xs">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, idx) => (
            <span
              key={d}
              className={`text-[11px] font-bold uppercase tracking-wider ${
                idx === 0 || idx === 6 ? 'text-slate-400 dark:text-slate-600' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {d}
            </span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Previous month trailing days */}
          {Array.from({ length: firstDayOfMonth }, (_, i) => {
            const dayNum = daysInPrevMonth - firstDayOfMonth + i + 1;
            const prevMonthDate = new Date(year, month - 1, dayNum);
            const dateStr = formatDateToISO(prevMonthDate);
            return (
              <button
                key={`prev-${dayNum}`}
                onClick={() => {
                  setSelectedDate(dateStr);
                  setCurrentMonthDate(prevMonthDate);
                }}
                className="h-10 rounded-xl flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <span className="text-xs font-medium">{dayNum}</span>
              </button>
            );
          })}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1;
            const d = new Date(year, month, dayNum);
            const dateStr = formatDateToISO(d);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const dayActs = activitiesByDate.get(dateStr) || [];
            const hasActs = dayActs.length > 0;

            return (
              <button
                key={`day-${dayNum}`}
                onClick={() => {
                  triggerHaptic('light', settings.hapticFeedbackEnabled);
                  setSelectedDate(dateStr);
                }}
                style={isSelected ? { backgroundColor: '#DFFF00', color: '#000000', opacity: 1, zIndex: 10 } : undefined}
                className={`relative h-11 rounded-xl flex flex-col items-center justify-center transition-colors ${
                  isSelected
                    ? 'font-black shadow-[0_0_12px_rgba(223,255,0,0.6)] z-10'
                    : isToday
                    ? 'border-2 border-[#DFFF00] text-[#DFFF00] font-black bg-[#DFFF00]/10'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <span
                  style={isSelected ? { color: '#000000', opacity: 1, fontWeight: 900 } : undefined}
                  className={`text-xs font-mono-time ${isSelected ? 'text-black font-black' : ''}`}
                >
                  {dayNum}
                </span>

                {/* Dots indicator */}
                {hasActs && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {dayActs.slice(0, 3).map((act, actIdx) => (
                      <span
                        key={actIdx}
                        className={`w-1 h-1 rounded-full ${isSelected ? 'bg-black' : ''}`}
                        style={{ backgroundColor: isSelected ? '#000000' : act.color, opacity: 1 }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda */}
      <div className="bg-white/70 dark:bg-[#080808]/85 backdrop-blur-md p-4 rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-white/5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {formatDateDisplay(selectedDate)}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {selectedDateActivities.length} {selectedDateActivities.length === 1 ? 'activity' : 'activities'} scheduled
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('today')}
              className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15"
            >
              Open in Timeline
            </button>
            <button
              onClick={() => openCreateModal()}
              style={{ backgroundColor: '#DFFF00', color: '#000000', opacity: 1 }}
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-[0_0_10px_rgba(223,255,0,0.5)] hover:bg-[#c8ea00] active:scale-95 transition-all"
              aria-label="Add activity"
            >
              <Plus className="w-4 h-4" style={{ color: '#000000', stroke: '#000000', strokeWidth: 3, opacity: 1 }} />
            </button>
          </div>
        </div>

        {selectedDateActivities.length === 0 ? (
          <div className="py-8 text-center">
            <Sparkles className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400 dark:text-slate-500">No activities scheduled for this date</p>
            <button
              onClick={() => openCreateModal()}
              className="mt-2 text-xs font-bold text-[#DFFF00] hover:underline"
            >
              + Plan an activity
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {selectedDateActivities.map((act) => {
              const dur = calculateDurationMinutes(act.startTime, act.endTime);
              const cardGlass = getCategoryGlassStyle(act.color, { isCompleted: act.completed });

              return (
                <div
                  key={act.id}
                  onClick={() => openEditModal(act)}
                  style={cardGlass}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    act.completed ? 'opacity-55' : 'hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(act.id);
                      }}
                      className="w-7 h-7 -my-1 rounded-lg flex items-center justify-center flex-shrink-0 touch-manipulation hover:bg-white/10"
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          act.completed
                            ? 'bg-brand-500 border-brand-500 text-black shadow-glow-pill'
                            : 'border-white/30 bg-black/30'
                        }`}
                      >
                        {act.completed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </div>
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: act.color, boxShadow: `0 0 6px ${act.color}` }}
                        />
                        <h4
                          className={`text-xs font-extrabold truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${
                            act.completed
                              ? 'line-through text-slate-400'
                              : 'text-white'
                          }`}
                        >
                          {act.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        <Clock className="w-3 h-3 text-white/60" />
                        <span className="font-mono-time">
                          {formatTimeDisplay(act.startTime, settings.timeFormat24h)} – {formatTimeDisplay(act.endTime, settings.timeFormat24h)}
                        </span>
                        <span>•</span>
                        <span>{formatDuration(dur)}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight bg-black/40 border border-white/15 text-white/90 shadow-xs"
                  >
                    <span>{act.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
