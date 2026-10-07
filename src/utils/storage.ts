import { Activity, AppSettings } from '../types/activity';
import { DEFAULT_SETTINGS } from '../constants/categories';
import { getTodayDateString, getRelativeDateString } from './time';

const STORAGE_KEYS = {
  ACTIVITIES: 'dayos_activities_v1',
  SETTINGS: 'dayos_settings_v1',
  HAS_SEEDED: 'dayos_has_seeded_v1',
};

export function getSampleInitialActivities(): Activity[] {
  const today = getTodayDateString();
  const yesterday = getRelativeDateString(-1);
  const twoDaysAgo = getRelativeDateString(-2);

  return [
    // Today's activities
    {
      id: 'act-sample-today-1',
      title: 'Morning Routine',
      date: today,
      startTime: '08:00',
      endTime: '09:30',
      category: 'Health',
      color: '#DFFF00', // Lime / Electric Yellow
      priority: 'medium',
      notes: 'Hydration, light stretching, and healthy breakfast.',
      completed: true,
      reminderMinutesBefore: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'act-sample-today-2',
      title: 'College',
      date: today,
      startTime: '10:00',
      endTime: '13:00',
      category: 'College',
      color: '#B026FF', // Electric Violet
      priority: 'high',
      notes: 'Systems Architecture lecture and Software Engineering seminar.',
      completed: true,
      reminderMinutesBefore: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'act-sample-today-3',
      title: 'Study',
      date: today,
      startTime: '14:00',
      endTime: '16:00',
      category: 'Study',
      color: '#FF8A00', // Orange
      priority: 'high',
      notes: 'Review algorithms problem sets and practice dynamic programming.',
      completed: false,
      reminderMinutesBefore: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'act-sample-today-4',
      title: 'Exercise',
      date: today,
      startTime: '18:00',
      endTime: '19:00',
      category: 'Exercise',
      color: '#00FF88', // Neon Green
      priority: 'medium',
      notes: '5km outdoor run followed by core strength workout.',
      completed: false,
      reminderMinutesBefore: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'act-sample-today-5',
      title: 'Personal Time',
      date: today,
      startTime: '20:00',
      endTime: '21:00',
      category: 'Personal',
      color: '#00F0FF', // Cyan
      priority: 'low',
      notes: 'Read sci-fi novel and wind down for the night.',
      completed: false,
      reminderMinutesBefore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Yesterday's activities for realistic streak
    {
      id: 'act-sample-yest-1',
      title: 'Morning Cardio',
      date: yesterday,
      startTime: '08:00',
      endTime: '09:00',
      category: 'Exercise',
      color: '#00FF88',
      priority: 'medium',
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'act-sample-yest-2',
      title: 'College Lab Sessions',
      date: yesterday,
      startTime: '10:00',
      endTime: '13:00',
      category: 'College',
      color: '#B026FF',
      priority: 'high',
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'act-sample-yest-3',
      title: 'Project Architecture',
      date: yesterday,
      startTime: '15:00',
      endTime: '17:30',
      category: 'Project',
      color: '#FF2BD6', // Magenta / Pink
      priority: 'high',
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // 2 Days ago activities
    {
      id: 'act-sample-2d-1',
      title: 'Exam Preparation',
      date: twoDaysAgo,
      startTime: '09:00',
      endTime: '12:00',
      category: 'Study',
      color: '#FF8A00',
      priority: 'high',
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'act-sample-2d-2',
      title: 'Gym & Recovery',
      date: twoDaysAgo,
      startTime: '17:00',
      endTime: '18:30',
      category: 'Health',
      color: '#DFFF00',
      priority: 'medium',
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
}

export function loadActivitiesFromStorage(): Activity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    const hasSeeded = localStorage.getItem(STORAGE_KEYS.HAS_SEEDED);

    if (!raw && !hasSeeded) {
      const initial = getSampleInitialActivities();
      saveActivitiesToStorage(initial);
      localStorage.setItem(STORAGE_KEYS.HAS_SEEDED, 'true');
      return initial;
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    return [];
  } catch (err) {
    console.error('Failed to load activities from storage:', err);
    return getSampleInitialActivities();
  }
}

export function saveActivitiesToStorage(activities: Activity[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (err) {
    console.error('Failed to save activities to storage:', err);
  }
}

export function loadSettingsFromStorage(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettingsToStorage(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function clearAllStorageData(): void {
  localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.setItem(STORAGE_KEYS.HAS_SEEDED, 'true');
}

export function exportAllDataAsJSON(activities: Activity[], settings: AppSettings): string {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    activities,
    settings,
  };
  return JSON.stringify(data, null, 2);
}
