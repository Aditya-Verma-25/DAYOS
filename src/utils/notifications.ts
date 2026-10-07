/**
 * Unified notification and reminder management for DAYOS
 * Seamlessly integrates Web Notifications API (Browser) and Capacitor LocalNotifications (Android)
 */
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface ScheduleReminderOptions {
  id: string;
  title: string;
  body: string;
  triggerTime: Date;
}

function stringToNumericId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

class NotificationService {
  private activeTimeouts: Map<string, number> = new Map();
  private channelCreated = false;

  constructor() {
    this.initNativeListeners();
  }

  private async initNativeListeners(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        // Create high-priority notification channel for Android 8.0+
        if (!this.channelCreated) {
          await LocalNotifications.createChannel({
            id: 'dayos_reminders',
            name: 'Activity Reminders',
            description: 'Timely reminders for scheduled DAYOS activities',
            importance: 5,
            visibility: 1,
            vibration: true,
            lights: true,
            lightColor: '#DFFF00',
          });
          this.channelCreated = true;
        }

        // Handle notification action / tap
        await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
          console.log('[DAYOS Native] Notification tapped:', notification.notification.title);
        });
      } catch (err) {
        console.warn('[DAYOS Native] Notification initialization warning:', err);
      }
    }
  }

  public isSupported(): boolean {
    if (Capacitor.isNativePlatform()) {
      return true;
    }
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public async getPermissionStatus(): Promise<'granted' | 'denied' | 'prompt'> {
    if (Capacitor.isNativePlatform()) {
      try {
        const status = await LocalNotifications.checkPermissions();
        if (status.display === 'granted') return 'granted';
        if (status.display === 'denied') return 'denied';
        return 'prompt';
      } catch {
        return 'denied';
      }
    }

    if (!this.isSupported()) return 'denied';
    return Notification.permission as 'granted' | 'denied' | 'prompt';
  }

  public async requestPermission(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await LocalNotifications.requestPermissions();
        return result.display === 'granted';
      } catch {
        return false;
      }
    }

    if (!this.isSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  public async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 1000000),
              title,
              body: options?.body || '',
              channelId: 'dayos_reminders',
              smallIcon: 'ic_stat_icon_config_sample',
              iconColor: '#DFFF00',
            },
          ],
        });
      } catch (err) {
        console.warn('[DAYOS Native] Failed to send instant notification:', err);
      }
      return;
    }

    // Web Notification API
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return;
    }

    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, options);
        }).catch(() => {});
      }
    }
  }

  public async scheduleReminder(id: string, title: string, body: string, triggerTime: Date): Promise<void> {
    const now = Date.now();
    const delay = triggerTime.getTime() - now;
    if (delay <= 0) return;

    // 1. Android Native Local Notification
    if (Capacitor.isNativePlatform()) {
      try {
        const numericId = stringToNumericId(id);
        // Clear previous schedule for this activity
        await LocalNotifications.cancel({ notifications: [{ id: numericId }] });

        await LocalNotifications.schedule({
          notifications: [
            {
              id: numericId,
              title,
              body,
              schedule: { at: triggerTime },
              channelId: 'dayos_reminders',
              smallIcon: 'ic_stat_icon_config_sample',
              iconColor: '#DFFF00',
              extra: { activityId: id },
            },
          ],
        });
      } catch (err) {
        console.warn('[DAYOS Native] Failed to schedule native notification:', err);
      }
      return;
    }

    // 2. Web In-Session Timeout
    this.cancelReminder(id);
    const timerId = window.setTimeout(() => {
      this.sendNotification(title, {
        body,
        tag: id,
      });
      this.activeTimeouts.delete(id);
    }, delay);

    this.activeTimeouts.set(id, timerId);
  }

  public async cancelReminder(id: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        const numericId = stringToNumericId(id);
        await LocalNotifications.cancel({ notifications: [{ id: numericId }] });
      } catch {}
      return;
    }

    const existing = this.activeTimeouts.get(id);
    if (existing) {
      clearTimeout(existing);
      this.activeTimeouts.delete(id);
    }
  }

  public async clearAllReminders(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({ notifications: pending.notifications });
        }
      } catch {}
      return;
    }

    this.activeTimeouts.forEach((timer) => clearTimeout(timer));
    this.activeTimeouts.clear();
  }
}

export const notificationService = new NotificationService();
