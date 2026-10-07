/**
 * Time and date manipulation utilities for DAYOS
 */

export function timeToMinutes(time: string): number {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTime(minutes: number): string {
  const normalized = Math.max(0, Math.min(1439, Math.round(minutes)));
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function formatTimeDisplay(time: string, is24h = false): string {
  if (!time) return '';
  if (is24h) return time;

  const [hoursStr, minsStr] = time.split(':');
  let hours = parseInt(hoursStr, 10);
  const mins = minsStr || '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  return `${hours}:${mins} ${ampm}`;
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

export function getTodayDateString(): string {
  const now = new Date();
  return formatDateToISO(now);
}

export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateDisplay(dateStr: string): string {
  const date = parseISODate(dateStr);
  const today = getTodayDateString();
  const yesterday = getRelativeDateString(-1);
  const tomorrow = getRelativeDateString(1);

  let prefix = '';
  if (dateStr === today) prefix = 'Today, ';
  else if (dateStr === yesterday) prefix = 'Yesterday, ';
  else if (dateStr === tomorrow) prefix = 'Tomorrow, ';

  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  };
  return `${prefix}${date.toLocaleDateString('en-US', options)}`;
}

export function getRelativeDateString(offsetDays: number, fromDateStr?: string): string {
  const base = fromDateStr ? parseISODate(fromDateStr) : new Date();
  base.setDate(base.getDate() + offsetDays);
  return formatDateToISO(base);
}

export function getCurrentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function getCurrentTimeString(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

export function isValidTimeRange(start: string, end: string): boolean {
  return timeToMinutes(end) > timeToMinutes(start);
}

export function calculateDurationMinutes(start: string, end: string): number {
  return Math.max(0, timeToMinutes(end) - timeToMinutes(start));
}

export function checkOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return Math.max(s1, s2) < Math.min(e1, e2);
}

export interface ActivityLayoutPosition {
  colIndex: number;
  totalCols: number;
}

export function computeActivityLayoutColumns<T extends { id: string; startTime: string; endTime: string }>(
  activities: T[]
): Map<string, ActivityLayoutPosition> {
  const result = new Map<string, ActivityLayoutPosition>();
  if (!activities || activities.length === 0) return result;

  const sorted = [...activities].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  let currentCluster: T[] = [];
  let clusterEnd = -1;
  const clusters: T[][] = [];

  for (const act of sorted) {
    const s = timeToMinutes(act.startTime);
    const e = timeToMinutes(act.endTime);

    if (currentCluster.length === 0) {
      currentCluster.push(act);
      clusterEnd = e;
    } else {
      if (s < clusterEnd) {
        currentCluster.push(act);
        clusterEnd = Math.max(clusterEnd, e);
      } else {
        clusters.push(currentCluster);
        currentCluster = [act];
        clusterEnd = e;
      }
    }
  }

  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  for (const cluster of clusters) {
    if (cluster.length === 1) {
      result.set(cluster[0].id, { colIndex: 0, totalCols: 1 });
      continue;
    }

    const colEndTimes: number[] = [];
    const clusterPositions: { id: string; colIndex: number }[] = [];

    for (const act of cluster) {
      const s = timeToMinutes(act.startTime);
      const e = timeToMinutes(act.endTime);

      let placedCol = -1;
      for (let c = 0; c < colEndTimes.length; c++) {
        if (colEndTimes[c] <= s) {
          placedCol = c;
          colEndTimes[c] = e;
          break;
        }
      }

      if (placedCol === -1) {
        placedCol = colEndTimes.length;
        colEndTimes.push(e);
      }

      clusterPositions.push({ id: act.id, colIndex: placedCol });
    }

    const totalCols = Math.max(1, colEndTimes.length);
    for (const pos of clusterPositions) {
      result.set(pos.id, { colIndex: pos.colIndex, totalCols });
    }
  }

  return result;
}

