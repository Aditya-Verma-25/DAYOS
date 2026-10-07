# DAYOS — Run your day.

**DAYOS** is a complete, mobile-first personal day-planning application and personal operating system. Plan your entire day using time-based activity cards, track your productivity rhythm, and follow your schedule with precision.

---

## 📱 Features

- **Mobile-First Experience**: Designed specifically for modern smartphones with bottom sheets, safe-area support, thumb-friendly touch zones, and tactile haptic feedback.
- **Vertical Interactive Timeline**: 
  - Dynamic hour markers with live time indicator and pulsing bead.
  - Arbitrary start and end times (not restricted to fixed 1-hour slots).
  - Tap any open slot on the timeline to schedule an activity immediately.
  - Interactive vertical drag to reschedule in 15-minute increments.
  - Top and bottom resize handles to modify activity durations directly on the timeline.
  - Automatic schedule overlap detection and warnings.
- **Polished Activity Cards**:
  - Activity title, start time, end time, duration, priority badge (High, Med, Low), category color badge, notes preview.
  - Single-tap completion with strikethrough and haptic feedback.
  - Tap to edit, duplicate, or delete.
- **Creation & Edit Bottom Sheet**:
  - Quick duration chips (+15m, +30m, 1h, 2h).
  - Categorization (Study, College, Work, Health, Personal, Exercise, Project, Free Time).
  - Color palette with custom hex color picker.
  - Priority selector and reminder offsets.
- **Calendar & Agenda View**:
  - Full month calendar grid with dot indicators showing activity density.
  - Instant day switcher to view and manage past or upcoming schedules.
- **Insights & Metrics**:
  - Real-time productivity streak counter.
  - Planned vs. completed hours calculation.
  - Today's completion rate and all-time success percentages.
  - Category time allocation breakdown.
- **Settings & Local-First Persistence**:
  - Theme switching: System / Light / Dark mode.
  - Configurable timeline start of day and end of day.
  - Default activity length preferences.
  - 12-Hour vs. 24-Hour time format toggle.
  - Browser notifications with isolated service layer ready for native Capacitor notifications.
  - Export and import JSON backups.
  - Safe data wipe and demo reset.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 📦 Packaging as an Android App with Capacitor

DAYOS was built from the ground up to be easily packaged with Capacitor:

```bash
# 1. Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor
npx cap init DAYOS com.dayos.app --web-dir dist

# 3. Add Android platform
npx cap add android

# 4. Build web assets and sync
npm run build
npx cap sync

# 5. Open in Android Studio to build APK
npx cap open android
```
