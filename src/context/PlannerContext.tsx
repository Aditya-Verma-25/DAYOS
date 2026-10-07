import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Activity, AppSettings, NavigationTab } from '../types/activity';
import {
  loadActivitiesFromStorage,
  saveActivitiesToStorage,
  loadSettingsFromStorage,
  saveSettingsToStorage,
  getSampleInitialActivities,
  clearAllStorageData,
  exportAllDataAsJSON,
} from '../utils/storage';
import {
  getTodayDateString,
  timeToMinutes,
  calculateDurationMinutes,
  formatDateToISO,
  parseISODate,
} from '../utils/time';
import { triggerHaptic } from '../utils/haptics';
import { notificationService } from '../utils/notifications';

interface DailyMetrics {
  totalActivities: number;
  completedActivities: number;
  totalPlannedMinutes: number;
  completedMinutes: number;
  progressPercent: number;
}

interface OverallStats {
  currentStreak: number;
  totalCompletedActivities: number;
  totalPlannedHours: number;
  totalCompletedHours: number;
  overallCompletionRate: number;
  categoryStats: {
    category: string;
    color: string;
    totalMinutes: number;
    count: number;
    completedCount: number;
  }[];
}

interface PlannerContextType {
  activities: Activity[];
  selectedDate: string;
  activeTab: NavigationTab;
  settings: AppSettings;
  editingActivity: Activity | null;
  isFormOpen: boolean;
  formInitialSlot: { startTime: string; endTime: string } | null;
  toastMessage: { message: string; type: 'info' | 'success' | 'warning' } | null;
  currentDateActivities: Activity[];
  dailyMetrics: DailyMetrics;
  overallStats: OverallStats;
  isDarkMode: boolean;

  // Actions
  setSelectedDate: (date: string) => void;
  setActiveTab: (tab: NavigationTab) => void;
  openCreateModal: (slot?: { startTime: string; endTime: string }) => void;
  openEditModal: (activity: Activity) => void;
  closeModal: () => void;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => Activity;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  duplicateActivity: (id: string) => void;
  toggleComplete: (id: string) => void;
  rescheduleActivity: (id: string, newStartTime: string, newEndTime: string) => boolean;
  updateSettings: (updates: Partial<AppSettings>) => void;
  exportData: () => void;
  importData: (jsonStr: string) => { success: boolean; message: string };
  clearAllData: () => void;
  resetToDefaults: () => void;
  showToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>(() => loadActivitiesFromStorage());
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [activeTab, setActiveTab] = useState<NavigationTab>('today');
  const [settings, setSettings] = useState<AppSettings>(() => loadSettingsFromStorage());
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formInitialSlot, setFormInitialSlot] = useState<{ startTime: string; endTime: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);

  // Track system preference changes dynamically
  const [isSystemDark, setIsSystemDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const isDarkMode = settings.theme === 'dark' || (settings.theme === 'system' && isSystemDark);

  // Sync activities to storage
  useEffect(() => {
    saveActivitiesToStorage(activities);
  }, [activities]);

  // Sync settings to storage & apply theme class to document
  useEffect(() => {
    saveSettingsToStorage(settings);

    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [settings, isDarkMode]);

  // Schedule notifications for activities
  useEffect(() => {
    if (!settings.notificationsEnabled) {
      notificationService.clearAllReminders();
      return;
    }

    const todayStr = getTodayDateString();
    const todayActivities = activities.filter(a => a.date === todayStr && !a.completed);

    todayActivities.forEach(act => {
      const minutesBefore = act.reminderMinutesBefore ?? 10;
      if (minutesBefore < 0) return;

      const [h, m] = act.startTime.split(':').map(Number);
      const trigger = new Date();
      trigger.setHours(h, m - minutesBefore, 0, 0);

      if (trigger.getTime() > Date.now()) {
        notificationService.scheduleReminder(
          act.id,
          `Upcoming: ${act.title}`,
          `Starts in ${minutesBefore} minutes at ${act.startTime}`,
          trigger
        );
      }
    });

    return () => {
      notificationService.clearAllReminders();
    };
  }, [activities, settings.notificationsEnabled]);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToastMessage({ message, type });
    window.setTimeout(() => {
      setToastMessage(prev => (prev?.message === message ? null : prev));
    }, 3200);
  }, []);

  const openCreateModal = useCallback((slot?: { startTime: string; endTime: string }) => {
    triggerHaptic('light', settings.hapticFeedbackEnabled);
    setEditingActivity(null);
    setFormInitialSlot(slot || null);
    setIsFormOpen(true);
  }, [settings.hapticFeedbackEnabled]);

  const openEditModal = useCallback((activity: Activity) => {
    triggerHaptic('light', settings.hapticFeedbackEnabled);
    setEditingActivity(activity);
    setFormInitialSlot(null);
    setIsFormOpen(true);
  }, [settings.hapticFeedbackEnabled]);

  const closeModal = useCallback(() => {
    setIsFormOpen(false);
    setEditingActivity(null);
    setFormInitialSlot(null);
  }, []);

  const addActivity = useCallback((data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAct: Activity = {
      ...data,
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setActivities(prev => [...prev, newAct]);
    triggerHaptic('success', settings.hapticFeedbackEnabled);
    showToast(`Added "${newAct.title}"`, 'success');
    closeModal();
    return newAct;
  }, [closeModal, settings.hapticFeedbackEnabled, showToast]);

  const updateActivity = useCallback((id: string, updates: Partial<Activity>) => {
    setActivities(prev =>
      prev.map(act => (act.id === id ? { ...act, ...updates, updatedAt: new Date().toISOString() } : act))
    );
    triggerHaptic('medium', settings.hapticFeedbackEnabled);
    showToast('Activity updated', 'info');
    closeModal();
  }, [closeModal, settings.hapticFeedbackEnabled, showToast]);

  const deleteActivity = useCallback((id: string) => {
    setActivities(prev => {
      const act = prev.find(a => a.id === id);
      if (act) {
        showToast(`Deleted "${act.title}"`, 'warning');
      }
      return prev.filter(a => a.id !== id);
    });
    triggerHaptic('warning', settings.hapticFeedbackEnabled);
    closeModal();
  }, [closeModal, settings.hapticFeedbackEnabled, showToast]);

  const duplicateActivity = useCallback((id: string) => {
    const target = activities.find(a => a.id === id);
    if (!target) return;

    const startMins = timeToMinutes(target.startTime);
    const endMins = timeToMinutes(target.endTime);
    const duration = endMins - startMins;

    // Shift by duration or 30 mins
    const newStartMins = Math.min(1439 - duration, endMins);
    const newEndMins = Math.min(1439, newStartMins + duration);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const newStartTime = `${pad(Math.floor(newStartMins / 60))}:${pad(newStartMins % 60)}`;
    const newEndTime = `${pad(Math.floor(newEndMins / 60))}:${pad(newEndMins % 60)}`;

    const duplicated: Activity = {
      ...target,
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: `${target.title} (Copy)`,
      startTime: newStartTime,
      endTime: newEndTime,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setActivities(prev => [...prev, duplicated]);
    triggerHaptic('success', settings.hapticFeedbackEnabled);
    showToast(`Duplicated "${target.title}"`, 'success');
    closeModal();
  }, [activities, closeModal, settings.hapticFeedbackEnabled, showToast]);

  const toggleComplete = useCallback((id: string) => {
    setActivities(prev =>
      prev.map(act => {
        if (act.id === id) {
          const next = !act.completed;
          triggerHaptic(next ? 'success' : 'light', settings.hapticFeedbackEnabled);
          return { ...act, completed: next, updatedAt: new Date().toISOString() };
        }
        return act;
      })
    );
  }, [settings.hapticFeedbackEnabled]);

  const rescheduleActivity = useCallback((id: string, newStartTime: string, newEndTime: string): boolean => {
    const sMins = timeToMinutes(newStartTime);
    const eMins = timeToMinutes(newEndTime);
    if (eMins <= sMins) return false;

    setActivities(prev =>
      prev.map(act =>
        act.id === id
          ? { ...act, startTime: newStartTime, endTime: newEndTime, updatedAt: new Date().toISOString() }
          : act
      )
    );
    triggerHaptic('light', settings.hapticFeedbackEnabled);
    return true;
  }, [settings.hapticFeedbackEnabled]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    triggerHaptic('light', settings.hapticFeedbackEnabled);
    showToast('Settings saved', 'info');
  }, [settings.hapticFeedbackEnabled, showToast]);

  const exportData = useCallback(() => {
    const jsonStr = exportAllDataAsJSON(activities, settings);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dayos-backup-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Schedule data exported', 'success');
  }, [activities, settings, showToast]);

  const importData = useCallback((jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.activities || !Array.isArray(data.activities)) {
        return { success: false, message: 'Invalid format: missing activities array.' };
      }
      setActivities(data.activities);
      if (data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
      showToast('Data imported successfully', 'success');
      return { success: true, message: 'Imported successfully!' };
    } catch {
      return { success: false, message: 'Invalid JSON file.' };
    }
  }, [showToast]);

  const clearAllData = useCallback(() => {
    clearAllStorageData();
    setActivities([]);
    showToast('All schedule data cleared', 'warning');
  }, [showToast]);

  const resetToDefaults = useCallback(() => {
    const initial = getSampleInitialActivities();
    setActivities(initial);
    saveActivitiesToStorage(initial);
    showToast('Reset to default schedule', 'info');
  }, [showToast]);

  // Filter activities for currently selected date, sorted by startTime
  const currentDateActivities = useMemo(() => {
    return activities
      .filter(a => a.date === selectedDate)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [activities, selectedDate]);

  // Daily metrics for selected date
  const dailyMetrics = useMemo<DailyMetrics>(() => {
    const totalActivities = currentDateActivities.length;
    const completedActivities = currentDateActivities.filter(a => a.completed).length;

    let totalPlannedMinutes = 0;
    let completedMinutes = 0;

    currentDateActivities.forEach(act => {
      const duration = calculateDurationMinutes(act.startTime, act.endTime);
      totalPlannedMinutes += duration;
      if (act.completed) {
        completedMinutes += duration;
      }
    });

    const progressPercent = totalPlannedMinutes > 0
      ? Math.round((completedMinutes / totalPlannedMinutes) * 100)
      : totalActivities > 0
      ? Math.round((completedActivities / totalActivities) * 100)
      : 0;

    return {
      totalActivities,
      completedActivities,
      totalPlannedMinutes,
      completedMinutes,
      progressPercent,
    };
  }, [currentDateActivities]);

  // Overall statistics for Insights tab
  const overallStats = useMemo<OverallStats>(() => {
    let totalCompleted = 0;
    let totalPlannedMins = 0;
    let totalCompletedMins = 0;

    const catMap = new Map<string, { color: string; totalMinutes: number; count: number; completedCount: number }>();
    const datesWithCompleted = new Set<string>();

    activities.forEach(act => {
      const duration = calculateDurationMinutes(act.startTime, act.endTime);
      totalPlannedMins += duration;
      if (act.completed) {
        totalCompleted++;
        totalCompletedMins += duration;
        datesWithCompleted.add(act.date);
      }

      const existing = catMap.get(act.category) || {
        color: act.color,
        totalMinutes: 0,
        count: 0,
        completedCount: 0,
      };
      existing.totalMinutes += duration;
      existing.count += 1;
      if (act.completed) existing.completedCount += 1;
      catMap.set(act.category, existing);
    });

    // Calculate streak
    let currentStreak = 0;
    let checkDate = new Date();
    const todayStr = getTodayDateString();

    // If today has completed activity, start streak counting from today
    // If not, check if yesterday had one to maintain streak
    const hasTodayCompleted = datesWithCompleted.has(todayStr);
    if (!hasTodayCompleted) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dStr = formatDateToISO(checkDate);
      if (datesWithCompleted.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const categoryStats = Array.from(catMap.entries()).map(([category, val]) => ({
      category,
      color: val.color,
      totalMinutes: val.totalMinutes,
      count: val.count,
      completedCount: val.completedCount,
    })).sort((a, b) => b.totalMinutes - a.totalMinutes);

    const overallRate = totalPlannedMins > 0
      ? Math.round((totalCompletedMins / totalPlannedMins) * 100)
      : totalCompleted > 0
      ? 100
      : 0;

    return {
      currentStreak,
      totalCompletedActivities: totalCompleted,
      totalPlannedHours: Math.round((totalPlannedMins / 60) * 10) / 10,
      totalCompletedHours: Math.round((totalCompletedMins / 60) * 10) / 10,
      overallCompletionRate: overallRate,
      categoryStats,
    };
  }, [activities]);

  const value = {
    activities,
    selectedDate,
    activeTab,
    settings,
    editingActivity,
    isFormOpen,
    formInitialSlot,
    toastMessage,
    currentDateActivities,
    dailyMetrics,
    overallStats,
    isDarkMode,
    setSelectedDate,
    setActiveTab,
    openCreateModal,
    openEditModal,
    closeModal,
    addActivity,
    updateActivity,
    deleteActivity,
    duplicateActivity,
    toggleComplete,
    rescheduleActivity,
    updateSettings,
    exportData,
    importData,
    clearAllData,
    resetToDefaults,
    showToast,
  };

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
};

export const usePlanner = (): PlannerContextType => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};
