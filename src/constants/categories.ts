import { CategoryItem } from '../types/activity';

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'study', name: 'Study', color: '#FF8A00' },       // Orange
  { id: 'exercise', name: 'Exercise', color: '#00FF88' }, // Neon Green
  { id: 'college', name: 'College', color: '#B026FF' },   // Electric Violet
  { id: 'health', name: 'Health', color: '#DFFF00' },     // Electric Yellow / Lime
  { id: 'personal', name: 'Personal', color: '#00F0FF' }, // Cyan
  { id: 'project', name: 'Project', color: '#FF2BD6' },   // Magenta / Pink
  { id: 'free-time', name: 'Free Time', color: '#DFFF00' }, // Electric Yellow
  { id: 'work', name: 'Work', color: '#00E5FF' },         // Blue-Cyan
];

export const PRESET_COLORS = [
  '#DFFF00', // Electric Yellow / Lime (Primary DAYOS)
  '#FF8A00', // Orange (Study)
  '#00FF88', // Neon Green (Exercise)
  '#B026FF', // Electric Violet (College)
  '#00F0FF', // Cyan (Personal)
  '#FF2BD6', // Pink / Magenta (Project)
  '#00E5FF', // Blue-Cyan (Work)
  '#F43F5E', // Rose
  '#10B981', // Emerald
  '#EAB308', // Amber
  '#6366F1', // Indigo
  '#64748B', // Slate
];

export const DEFAULT_SETTINGS = {
  theme: 'dark' as const,
  startOfDayHour: 6,
  endOfDayHour: 24,
  defaultActivityDurationMinutes: 60,
  notificationsEnabled: false,
  hapticFeedbackEnabled: true,
  timeFormat24h: false,
};
