export type Priority = 'low' | 'medium' | 'high';

export interface Activity {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24-hour format)
  endTime: string; // HH:mm (24-hour format)
  category: string;
  color: string;
  priority: Priority;
  notes?: string;
  completed: boolean;
  reminderMinutesBefore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  color: string;
  textColor?: string;
  icon?: string;
}

export type ThemeMode = 'system' | 'light' | 'dark';

export interface AppSettings {
  theme: ThemeMode;
  startOfDayHour: number; // e.g. 6 (06:00)
  endOfDayHour: number; // e.g. 24 (24:00)
  defaultActivityDurationMinutes: number; // e.g. 60
  notificationsEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  timeFormat24h: boolean;
}

export type NavigationTab = 'today' | 'calendar' | 'insights' | 'settings';
