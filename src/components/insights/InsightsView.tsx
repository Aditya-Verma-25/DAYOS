import React from 'react';
import { Calendar, Clock, CheckCircle2, Target, BarChart2, PieChart, Sparkles } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { formatDuration } from '../../utils/time';

export const InsightsView: React.FC = () => {
  const { overallStats, dailyMetrics } = usePlanner();

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-6 space-y-4 overflow-y-auto">
      {/* Calm Header */}
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
          Your Day at a Glance
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          A calm reflection on your time, commitments, and daily rhythm.
        </p>
      </div>

      {/* Gentle Consistency Card (Calm self-awareness, no aggressive pressure) */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#080a0c]/80 backdrop-blur-md border border-slate-200/70 dark:border-white/10 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-500 tracking-tight">
            <Calendar className="w-4 h-4 stroke-[2]" />
            <span>Daily Rhythm</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono-time">
              {overallStats.currentStreak}
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {overallStats.currentStreak === 1 ? 'day recorded' : 'consecutive days active'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {overallStats.currentStreak > 0
              ? 'Steady, mindful progress through your schedule.'
              : 'Plan and follow your commitments at your own pace.'}
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 border border-brand-500/30 flex items-center justify-center flex-shrink-0 shadow-glow-pill">
          <Sparkles className="w-6 h-6 stroke-[1.8]" />
        </div>
      </div>

      {/* Today's Balance Card */}
      <div className="bg-white/70 dark:bg-[#080a0c]/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Today's Completion
            </h3>
          </div>
          <span className="text-xs font-bold font-mono-time text-brand-500">
            {dailyMetrics.progressPercent}%
          </span>
        </div>

        {/* Calm Progress Bar */}
        <div className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden border border-slate-200/40 dark:border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              dailyMetrics.progressPercent === 100
                ? 'bg-brand-500 shadow-glow-pill'
                : 'bg-brand-500'
            }`}
            style={{ width: `${dailyMetrics.progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-0.5">
          <span>{formatDuration(dailyMetrics.completedMinutes)} completed</span>
          <span>{formatDuration(dailyMetrics.totalPlannedMinutes)} planned</span>
        </div>
      </div>

      {/* 4-Metric Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Planned Hours */}
        <div className="bg-white/70 dark:bg-[#080a0c]/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Planned Time
          </span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono-time">
            {overallStats.totalPlannedHours}h
          </span>
        </div>

        {/* Completed Hours */}
        <div className="bg-white/70 dark:bg-[#080a0c]/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-2 border border-brand-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Fulfilled Time
          </span>
          <span className="text-xl font-extrabold text-brand-500 font-mono-time">
            {overallStats.totalCompletedHours}h
          </span>
        </div>

        {/* Overall Completion Rate */}
        <div className="bg-white/70 dark:bg-[#080a0c]/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2 border border-cyan-500/20">
            <BarChart2 className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Follow-Through
          </span>
          <span className="text-xl font-extrabold text-cyan-400 font-mono-time">
            {overallStats.overallCompletionRate}%
          </span>
        </div>

        {/* Completed Activities */}
        <div className="bg-white/70 dark:bg-[#080a0c]/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 border border-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Activities Done
          </span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono-time">
            {overallStats.totalCompletedActivities}
          </span>
        </div>
      </div>

      {/* Category Time Allocation Breakdown */}
      <div className="bg-white/70 dark:bg-[#080a0c]/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-brand-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Where Your Time Went
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Total duration</span>
        </div>

        {overallStats.categoryStats.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">No categories recorded yet</p>
        ) : (
          <div className="space-y-2.5">
            {overallStats.categoryStats.map((item) => {
              const totalMins = overallStats.totalPlannedHours * 60;
              const percent = totalMins > 0 ? Math.round((item.totalMinutes / totalMins) * 100) : 0;

              return (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.category}</span>
                      <span className="text-[11px] font-normal text-slate-400">
                        ({item.completedCount}/{item.count} done)
                      </span>
                    </div>
                    <span className="font-mono-time font-medium text-slate-600 dark:text-slate-300">
                      {formatDuration(item.totalMinutes)}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(4, percent))}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
