import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

import { PlannerProvider, usePlanner } from './context/PlannerContext';
import { PhoneContainer } from './components/layout/PhoneContainer';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { TimelineView } from './components/planner/TimelineView';
import { CalendarView } from './components/calendar/CalendarView';
import { InsightsView } from './components/insights/InsightsView';
import { SettingsView } from './components/settings/SettingsView';
import { ActivityFormSheet } from './components/planner/ActivityFormSheet';
import { Toast } from './components/common/Toast';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, isFormOpen, closeModal, toastMessage, isDarkMode } = usePlanner();

  // Configure native Android mobile behaviors
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // 1. Status Bar Setup
    try {
      StatusBar.setStyle({ style: isDarkMode ? Style.Dark : Style.Light });
      StatusBar.setBackgroundColor({ color: isDarkMode ? '#050505' : '#ffffff' });
    } catch (e) {
      console.warn('Status bar configuration error:', e);
    }

    // 2. Hide Splash Screen after React renders
    try {
      SplashScreen.hide();
    } catch (e) {
      console.warn('Splash screen error:', e);
    }

    // 3. Android Hardware Back Button Handling
    const backListener = CapApp.addListener('backButton', () => {
      // Priority 1: If an activity edit/create sheet is open, dismiss it
      if (isFormOpen) {
        closeModal();
        return;
      }

      // Priority 2: If on a sub-view (calendar, insights, settings), navigate back to 'today'
      if (activeTab !== 'today') {
        setActiveTab('today');
        return;
      }

      // Priority 3: On root today view with no modal open, minimize/exit app cleanly
      CapApp.exitApp();
    });

    return () => {
      backListener.then((handler) => handler.remove()).catch(() => {});
    };
  }, [isFormOpen, closeModal, activeTab, setActiveTab]);

  return (
    <PhoneContainer>
      <Header />

      <main className="flex-1 flex flex-col min-h-0 relative">
        {activeTab === 'today' && <TimelineView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'insights' && <InsightsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      <ActivityFormSheet />
      <BottomNav />
      <Toast toast={toastMessage} />
    </PhoneContainer>
  );
};

export const App: React.FC = () => {
  return (
    <PlannerProvider>
      <AppContent />
    </PlannerProvider>
  );
};

export default App;
