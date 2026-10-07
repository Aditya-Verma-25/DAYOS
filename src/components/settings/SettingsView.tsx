import React, { useState, useRef } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Clock,
  Bell,
  Vibrate,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { ThemeMode } from '../../types/activity';
import { notificationService } from '../../utils/notifications';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportData,
    importData,
    clearAllData,
    resetToDefaults,
    showToast,
  } = usePlanner();

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThemeChange = (theme: ThemeMode) => {
    updateSettings({ theme });
  };

  const handleNotificationToggle = async () => {
    if (!settings.notificationsEnabled) {
      const granted = await notificationService.requestPermission();
      if (granted) {
        updateSettings({ notificationsEnabled: true });
        showToast('Notifications enabled', 'success');
      } else {
        showToast('Notification permission denied by browser', 'warning');
        updateSettings({ notificationsEnabled: false });
      }
    } else {
      updateSettings({ notificationsEnabled: false });
      showToast('Notifications disabled', 'info');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importData(content);
        if (!result.success) {
          showToast(result.message, 'warning');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-8 space-y-4 overflow-y-auto">
      {/* Title */}
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings & Preferences
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personalize your daily operating system.
        </p>
      </div>

      {/* Theme Selection */}
      <div className="bg-white/70 dark:bg-[#080a0c]/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Appearance
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'system', label: 'System', icon: Monitor },
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = settings.theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleThemeChange(item.id as ThemeMode)}
                style={isSelected ? { backgroundColor: '#DFFF00', color: '#000000', opacity: 1 } : undefined}
                className={`py-2.5 px-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  isSelected
                    ? 'border-[#DFFF00] text-black font-black shadow-glow-pill'
                    : 'border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 font-semibold'
                }`}
              >
                <Icon
                  className="w-4 h-4"
                  style={isSelected ? { color: '#000000', stroke: '#000000', strokeWidth: 2.8, opacity: 1 } : undefined}
                />
                <span
                  style={isSelected ? { color: '#000000', opacity: 1, fontWeight: 900 } : undefined}
                  className={`text-xs ${isSelected ? 'text-black font-black' : ''}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule Hours & Durations */}
      <div className="bg-white/70 dark:bg-[#080a0c]/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-brand-500" />
          <span>Timeline Bounds</span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Day Starts At</span>
            <select
              value={settings.startOfDayHour}
              onChange={(e) => updateSettings({ startOfDayHour: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i} className="dark:bg-[#0b0e13]">
                  {i.toString().padStart(2, '0')}:00 {i < 12 ? 'AM' : 'PM'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Day Ends At</span>
            <select
              value={settings.endOfDayHour}
              onChange={(e) => updateSettings({ endOfDayHour: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {Array.from({ length: 13 }, (_, i) => 12 + i).map((h) => (
                <option key={h} value={h} className="dark:bg-[#0b0e13]">
                  {h === 24 ? 'Midnight (24:00)' : `${h}:00 PM`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Default Activity Length</span>
          <div className="grid grid-cols-4 gap-2">
            {[30, 45, 60, 90].map((mins) => {
              const isSelected = settings.defaultActivityDurationMinutes === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => updateSettings({ defaultActivityDurationMinutes: mins })}
                  style={isSelected ? { backgroundColor: '#DFFF00', color: '#000000', opacity: 1, fontWeight: 900 } : undefined}
                  className={`py-1.5 rounded-xl border text-xs font-mono-time transition-all ${
                    isSelected
                      ? 'border-[#DFFF00] text-black font-black shadow-glow-pill'
                      : 'border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold'
                  }`}
                >
                  <span
                    style={isSelected ? { color: '#000000', opacity: 1, fontWeight: 900 } : undefined}
                    className={isSelected ? 'text-black font-black' : ''}
                  >
                    {mins}m
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 24-hour time format toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">24-Hour Time Format</span>
            <span className="text-[11px] text-slate-400">Display 14:00 instead of 2:00 PM</span>
          </div>
          <button
            type="button"
            onClick={() => updateSettings({ timeFormat24h: !settings.timeFormat24h })}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
              settings.timeFormat24h ? 'bg-brand-500 shadow-glow-pill' : 'bg-slate-300 dark:bg-white/10'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full transition-transform ${
                settings.timeFormat24h ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notifications & Haptics */}
      <div className="bg-white/70 dark:bg-[#080a0c]/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Feedback & Alerts
        </label>

        {/* Notifications toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Activity Reminders
              </span>
              <span className="text-[11px] text-slate-400">
                Receive alerts before scheduled activities
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNotificationToggle}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
              settings.notificationsEnabled ? 'bg-brand-500 shadow-glow-pill' : 'bg-slate-300 dark:bg-white/10'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full transition-transform ${
                settings.notificationsEnabled ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white'
              }`}
            />
          </button>
        </div>

        {/* Haptic feedback toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Vibrate className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Haptic Feedback
              </span>
              <span className="text-[11px] text-slate-400">
                Tactile feedback when tapping & rescheduling
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => updateSettings({ hapticFeedbackEnabled: !settings.hapticFeedbackEnabled })}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
              settings.hapticFeedbackEnabled ? 'bg-brand-500 shadow-glow-pill' : 'bg-slate-300 dark:bg-white/10'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full transition-transform ${
                settings.hapticFeedbackEnabled ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Data Management: Export / Import / Clear */}
      <div className="bg-white/70 dark:bg-[#080a0c]/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-brand-500" />
          <span>Data & Backups</span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          {/* Export JSON */}
          <button
            type="button"
            onClick={exportData}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-brand-500" />
            <span>Export Backup</span>
          </button>

          {/* Import JSON */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Import Backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Reset to sample data */}
          <button
            type="button"
            onClick={resetToDefaults}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 text-xs font-semibold transition-colors border border-slate-200/50 dark:border-white/5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          {/* Clear all data */}
          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors border border-rose-200/50 dark:border-rose-900/40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-[#0c1015] rounded-3xl p-5 border border-slate-200 dark:border-white/10 shadow-2xl space-y-3 animate-scale-in">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Clear All Schedule Data?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This will permanently delete all activities from your local storage. This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllData();
                  setConfirmClearOpen(false);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-sm hover:bg-rose-700"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About DAYOS Card (Must retain Aditya Verma's credit as requested) */}
      <div className="bg-white/70 dark:bg-[#080a0c]/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-xs text-center space-y-1">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
          DAYOS
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Run your day.
        </p>
        <div className="pt-2 text-[11px] text-slate-400 dark:text-slate-500 space-y-0.5 border-t border-slate-100 dark:border-white/5">
          <p className="font-semibold text-slate-600 dark:text-slate-300">Made by Aditya Verma</p>
          <p>© 2026 Aditya Verma</p>
          <p className="text-[10px] text-slate-400">Version 1.0.0 • Local-First Companion</p>
        </div>
      </div>
    </div>
  );
};
