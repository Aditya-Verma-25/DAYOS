/**
 * Haptic feedback utility for mobile touch interactions
 * Uses Capacitor Native Haptics on Android, falling back gracefully to navigator.vibrate on web
 */
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export async function triggerHaptic(
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'light',
  enabled = true
): Promise<void> {
  if (!enabled) return;

  // 1. Android Native Haptics via Capacitor
  if (Capacitor.isNativePlatform()) {
    try {
      switch (type) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          return;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          return;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          return;
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          return;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          return;
      }
    } catch {
      // Fallback to web vibration below
    }
  }

  // 2. Web fallback using navigator.vibrate
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(25);
          break;
        case 'heavy':
          navigator.vibrate(50);
          break;
        case 'success':
          navigator.vibrate([15, 40, 25]);
          break;
        case 'warning':
          navigator.vibrate([30, 50, 30]);
          break;
      }
    } catch {
      // Ignored if device blocks vibration without user gesture
    }
  }
}
