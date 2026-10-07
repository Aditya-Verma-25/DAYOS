import React from 'react';
import { Calendar, BarChart3, Settings, CalendarCheck2 } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { NavigationTab } from '../../types/activity';
import { triggerHaptic } from '../../utils/haptics';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, dailyMetrics, settings, isDarkMode } = usePlanner();

  const handleTabChange = (tab: NavigationTab) => {
    triggerHaptic('light', settings.hapticFeedbackEnabled);
    setActiveTab(tab);
  };

  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; badge?: number }[] = [
    {
      id: 'today',
      label: 'Today',
      icon: CalendarCheck2,
      badge: dailyMetrics.totalActivities - dailyMetrics.completedActivities > 0
        ? dailyMetrics.totalActivities - dailyMetrics.completedActivities
        : undefined,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-30 backdrop-blur-lg border-t pb-[calc(var(--safe-area-bottom)+0.35rem)] pt-1.5 transition-colors duration-200 ${
        isDarkMode
          ? 'bg-[#07090C]/95 border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.7)]'
          : 'bg-white/95 border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]'
      }`}
    >
      <div className="max-w-md mx-auto px-4 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              style={isActive ? { backgroundColor: '#DFFF00', color: '#000000', opacity: 1 } : undefined}
              className={`relative min-h-[44px] flex flex-col items-center justify-center py-1.5 px-3.5 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-[#DFFF00] text-black font-black shadow-[0_0_16px_rgba(223,255,0,0.45)]'
                  : isDarkMode
                  ? 'text-white/80 hover:text-white active:scale-95'
                  : 'text-slate-700 hover:text-slate-950 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon
                  className="w-5 h-5 transition-transform duration-150"
                  style={
                    isActive
                      ? { color: '#000000', stroke: '#000000', strokeWidth: 2.8, opacity: 1 }
                      : isDarkMode
                      ? { color: '#ffffff', stroke: '#ffffff', strokeWidth: 1.9, opacity: 0.9 }
                      : { color: '#334155', stroke: '#334155', strokeWidth: 1.9, opacity: 1 }
                  }
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    style={{
                      backgroundColor: isActive
                        ? '#000000'
                        : isDarkMode
                        ? '#DFFF00'
                        : '#0f172a',
                      color: isActive
                        ? '#DFFF00'
                        : isDarkMode
                        ? '#000000'
                        : '#ffffff',
                      opacity: 1,
                      fontWeight: 900,
                    }}
                    className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full text-[10px] flex items-center justify-center shadow-xs"
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                style={
                  isActive
                    ? { color: '#000000', opacity: 1, fontWeight: 900 }
                    : isDarkMode
                    ? { color: '#ffffff', opacity: 0.9, fontWeight: 600 }
                    : { color: '#334155', opacity: 1, fontWeight: 700 }
                }
                className={`text-[11px] mt-0.5 tracking-tight ${
                  isActive
                    ? 'font-black text-black'
                    : isDarkMode
                    ? 'font-semibold text-white'
                    : 'font-bold text-slate-700'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
