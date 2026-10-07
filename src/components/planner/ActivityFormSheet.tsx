import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Tag, AlertCircle, Trash2, Copy, Bell, Sparkles, Check, SlidersHorizontal } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { Priority } from '../../types/activity';
import { DEFAULT_CATEGORIES, PRESET_COLORS } from '../../constants/categories';
import {
  timeToMinutes,
  minutesToTime,
  calculateDurationMinutes,
  formatDuration,
  isValidTimeRange,
  getTodayDateString,
  formatTimeDisplay,
} from '../../utils/time';
import { triggerHaptic } from '../../utils/haptics';
import { WatchTimePicker } from '../common/WatchTimePicker';

export const ActivityFormSheet: React.FC = () => {
  const {
    isFormOpen,
    editingActivity,
    formInitialSlot,
    closeModal,
    addActivity,
    updateActivity,
    deleteActivity,
    duplicateActivity,
    selectedDate,
    settings,
  } = usePlanner();

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [activeTimeTarget, setActiveTimeTarget] = useState<'start' | 'end'>('start');
  const [category, setCategory] = useState('Study');
  const [color, setColor] = useState('#DFFF00');
  const [priority, setPriority] = useState<Priority>('medium');
  const [notes, setNotes] = useState('');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number>(15);
  const [errorMsg, setErrorMsg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize or reset form fields whenever modal opens or editingActivity changes
  useEffect(() => {
    if (!isFormOpen) {
      setShowDeleteConfirm(false);
      setErrorMsg('');
      return;
    }

    if (editingActivity) {
      setTitle(editingActivity.title);
      setDate(editingActivity.date);
      setStartTime(editingActivity.startTime);
      setEndTime(editingActivity.endTime);
      setCategory(editingActivity.category);
      setColor(editingActivity.color);
      setPriority(editingActivity.priority);
      setNotes(editingActivity.notes || '');
      setReminderMinutesBefore(editingActivity.reminderMinutesBefore ?? 15);
      setActiveTimeTarget('start');
    } else {
      // New activity
      const defaultDuration = settings.defaultActivityDurationMinutes || 60;
      let start = formInitialSlot ? formInitialSlot.startTime : '09:00';
      let end = formInitialSlot ? formInitialSlot.endTime : '10:00';

      if (!formInitialSlot) {
        // Find a convenient hour starting near current time
        const now = new Date();
        const nextHour = (now.getHours() + 1) % 24;
        const nextNextHour = (nextHour + Math.floor(defaultDuration / 60)) % 24;
        start = `${nextHour.toString().padStart(2, '0')}:00`;
        end = `${nextNextHour.toString().padStart(2, '0')}:00`;
      }

      setTitle('');
      setDate(selectedDate || getTodayDateString());
      setStartTime(start);
      setEndTime(end);
      setCategory('Study');
      setColor('#FF8A00');
      setPriority('medium');
      setNotes('');
      setReminderMinutesBefore(15);
      setActiveTimeTarget('start');
    }
  }, [isFormOpen, editingActivity, formInitialSlot, selectedDate, settings]);

  if (!isFormOpen) return null;

  const durationMinutes = calculateDurationMinutes(startTime, endTime);
  const isTimeValid = isValidTimeRange(startTime, endTime);

  // Quick duration helper buttons
  const applyDuration = (minutes: number) => {
    triggerHaptic('light', settings.hapticFeedbackEnabled);
    const sMins = timeToMinutes(startTime);
    const newEndMins = Math.min(1439, sMins + minutes);
    setEndTime(minutesToTime(newEndMins));
  };

  const handleCategorySelect = (catName: string, catColor: string) => {
    triggerHaptic('light', settings.hapticFeedbackEnabled);
    setCategory(catName);
    setColor(catColor);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Please enter an activity title.');
      triggerHaptic('warning', settings.hapticFeedbackEnabled);
      return;
    }

    if (!isTimeValid) {
      setErrorMsg('End time must be later than start time.');
      triggerHaptic('warning', settings.hapticFeedbackEnabled);
      return;
    }

    if (editingActivity) {
      updateActivity(editingActivity.id, {
        title: title.trim(),
        date,
        startTime,
        endTime,
        category,
        color,
        priority,
        notes: notes.trim() || undefined,
        reminderMinutesBefore,
      });
    } else {
      addActivity({
        title: title.trim(),
        date,
        startTime,
        endTime,
        category,
        color,
        priority,
        notes: notes.trim() || undefined,
        completed: false,
        reminderMinutesBefore,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
      {/* Dimmed backdrop */}
      <div
        onClick={closeModal}
        className="fixed inset-0 bg-black/75 bottom-sheet-backdrop transition-opacity animate-fade-in"
      />

      {/* Bottom Sheet Drawer */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#090c10] rounded-t-[32px] shadow-sheet border-t border-slate-200/80 dark:border-white/10 z-10 max-h-[92vh] flex flex-col animate-slide-up">
        {/* Drag handle pill */}
        <div className="w-full pt-3 pb-1 flex justify-center cursor-grab">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="px-5 py-2.5 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0 shadow-glow-pill"
              style={{ backgroundColor: color }}
            />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              {editingActivity ? 'Edit Activity' : 'Plan New Activity'}
            </h2>
          </div>

          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {errorMsg && (
            <div className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Activity Name */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Activity Title
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. Deep Work, Workout, Architecture Review..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* WATCH-STYLE CENTER SELECTION TIME PICKER */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                <span>Time & Schedule</span>
              </span>

              {/* Start / End switcher tab */}
              <div className="flex items-center p-0.5 rounded-lg bg-slate-200/80 dark:bg-white/10 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light', settings.hapticFeedbackEnabled);
                    setActiveTimeTarget('start');
                  }}
                  style={activeTimeTarget === 'start' ? { backgroundColor: '#DFFF00', color: '#000000', opacity: 1, fontWeight: 900 } : undefined}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeTimeTarget === 'start'
                      ? 'text-black font-black shadow-[0_0_10px_rgba(223,255,0,0.5)]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span style={activeTimeTarget === 'start' ? { color: '#000000', opacity: 1, fontWeight: 900 } : undefined}>
                    Start: {formatTimeDisplay(startTime, settings.timeFormat24h)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light', settings.hapticFeedbackEnabled);
                    setActiveTimeTarget('end');
                  }}
                  style={activeTimeTarget === 'end' ? { backgroundColor: '#DFFF00', color: '#000000', opacity: 1, fontWeight: 900 } : undefined}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeTimeTarget === 'end'
                      ? 'text-black font-black shadow-[0_0_10px_rgba(223,255,0,0.5)]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span style={activeTimeTarget === 'end' ? { color: '#000000', opacity: 1, fontWeight: 900 } : undefined}>
                    End: {formatTimeDisplay(endTime, settings.timeFormat24h)}
                  </span>
                </button>
              </div>
            </div>

            {/* Center-Focused Watch Wheel */}
            <WatchTimePicker
              label={activeTimeTarget === 'start' ? 'Set Start Time (Dial Wheel)' : 'Set End Time (Dial Wheel)'}
              time={activeTimeTarget === 'start' ? startTime : endTime}
              onChange={(newVal) => {
                if (activeTimeTarget === 'start') {
                  setStartTime(newVal);
                  // Ensure end time is at least equal or adjusted if needed
                  const sMins = timeToMinutes(newVal);
                  const eMins = timeToMinutes(endTime);
                  if (eMins <= sMins) {
                    const defaultDur = settings.defaultActivityDurationMinutes || 60;
                    setEndTime(minutesToTime(Math.min(1439, sMins + defaultDur)));
                  }
                } else {
                  setEndTime(newVal);
                }
              }}
              is24Hour={settings.timeFormat24h}
              hapticEnabled={settings.hapticFeedbackEnabled}
            />

            {/* Quick Duration Preset Chips */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-white/5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Duration: <strong className="text-slate-800 dark:text-slate-200 font-mono-time">{isTimeValid ? formatDuration(durationMinutes) : 'Invalid'}</strong>
              </span>

              <div className="flex items-center gap-1">
                {[15, 30, 45, 60, 90].map((mins) => {
                  const isCurrent = durationMinutes === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => applyDuration(mins)}
                      style={isCurrent ? { backgroundColor: '#DFFF00', color: '#000000', opacity: 1, fontWeight: 900 } : undefined}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono-time border transition-colors ${
                        isCurrent
                          ? 'border-[#DFFF00] text-black font-black shadow-glow-pill'
                          : 'bg-white dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-[#DFFF00] hover:text-black dark:hover:bg-[#DFFF00] dark:hover:text-black border-slate-200 dark:border-white/5 font-bold'
                      }`}
                    >
                      <span style={isCurrent ? { color: '#000000', opacity: 1, fontWeight: 900 } : undefined}>
                        +{mins}m
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_CATEGORIES.map((cat) => {
                const isSelected = category.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.name, cat.color)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-black text-white dark:bg-white/10 dark:text-white shadow-xs ring-2 ring-[#DFFF00] border border-white/20'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-white/10'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color, boxShadow: `0 0 6px ${cat.color}` }}
                    />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Palette */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Color Accent
            </label>
            <div className="flex items-center gap-2.5 overflow-x-auto py-1">
              {PRESET_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light', settings.hapticFeedbackEnabled);
                    setColor(hex);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    color.toLowerCase() === hex.toLowerCase() ? 'ring-2 ring-offset-2 ring-[#DFFF00] ring-offset-black' : 'hover:opacity-90'
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  {color.toLowerCase() === hex.toLowerCase() && (
                    <Check
                      className="w-4 h-4 stroke-[3]"
                      style={{
                        color: (hex.toLowerCase() === '#dfff00' || hex.toLowerCase() === '#eab308') ? '#000000' : '#ffffff',
                        stroke: (hex.toLowerCase() === '#dfff00' || hex.toLowerCase() === '#eab308') ? '#000000' : '#ffffff',
                        strokeWidth: 3,
                        opacity: 1,
                      }}
                    />
                  )}
                </button>
              ))}

              {/* Native color picker */}
              <label className="w-8 h-8 rounded-full border border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center cursor-pointer hover:border-[#DFFF00] relative flex-shrink-0">
                <span className="text-xs font-bold text-slate-500">+</span>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  title="Choose custom color"
                />
              </label>
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                const isSelected = priority === p;
                const colors = {
                  low: isSelected ? 'border-slate-500 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200' : 'border-slate-200 dark:border-white/5 text-slate-500',
                  medium: isSelected ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'border-slate-200 dark:border-white/5 text-slate-500',
                  high: isSelected ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300' : 'border-slate-200 dark:border-white/5 text-slate-500',
                };

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light', settings.hapticFeedbackEnabled);
                      setPriority(p);
                    }}
                    className={`py-2 rounded-xl border-2 text-xs font-bold capitalize transition-all ${colors[p]}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-[#DFFF00]" />
              <span>Reminder</span>
            </label>
            <select
              value={reminderMinutesBefore}
              onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#DFFF00] focus:outline-none"
            >
              <option value={0}>At time of event</option>
              <option value={5}>5 minutes before</option>
              <option value={10}>10 minutes before</option>
              <option value={15}>15 minutes before (Default)</option>
              <option value={30}>30 minutes before</option>
              <option value={60}>1 hour before</option>
              <option value={-1}>No reminder</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Notes / Sub-tasks (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any details, meeting links, checklist items..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#DFFF00] focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Delete Confirmation prompt */}
          {showDeleteConfirm && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex flex-col gap-2">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                Are you sure you want to delete this activity?
              </span>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => editingActivity && deleteActivity(editingActivity.id)}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-600 text-white"
                >
                  Delete Activity
                </button>
              </div>
            </div>
          )}

          {/* Bottom Action Buttons */}
          <div className="pt-2 flex items-center gap-2 pb-6">
            {editingActivity && (
              <>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-100 transition-colors flex-shrink-0 border border-rose-200/50 dark:border-rose-900/50"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => duplicateActivity(editingActivity.id)}
                  className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 transition-colors flex-shrink-0 border border-slate-200/50 dark:border-white/5"
                  aria-label="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              type="submit"
              disabled={!isTimeValid || !title.trim()}
              style={{ backgroundColor: '#DFFF00', color: '#000000', opacity: 1, fontWeight: 900 }}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#DFFF00] hover:bg-[#c8ea00] active:bg-[#b5d400] disabled:opacity-50 text-black text-sm font-black shadow-[0_0_20px_-2px_rgba(223,255,0,0.5)] transition-colors"
            >
              <span style={{ color: '#000000', opacity: 1, fontWeight: 900 }}>
                {editingActivity ? 'Save Changes' : 'Create Activity'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
