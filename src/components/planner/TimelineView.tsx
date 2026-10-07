import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { Activity } from '../../types/activity';
import {
  timeToMinutes,
  minutesToTime,
  getCurrentTimeMinutes,
  getCurrentTimeString,
  getTodayDateString,
  getRelativeDateString,
  formatTimeDisplay,
  formatDateDisplay,
  formatDuration,
  checkOverlap,
  computeActivityLayoutColumns,
} from '../../utils/time';
import { triggerHaptic } from '../../utils/haptics';
import { hexToRgba } from '../../utils/colors';
import { ActivityCard } from './ActivityCard';

const HOUR_HEIGHT = 72; // px per hour
const MINUTE_HEIGHT = HOUR_HEIGHT / 60; // 1.2 px per minute

export const TimelineView: React.FC = () => {
  const {
    currentDateActivities,
    selectedDate,
    setSelectedDate,
    settings,
    openCreateModal,
    openEditModal,
    rescheduleActivity,
    showToast,
  } = usePlanner();

  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(getCurrentTimeMinutes());
  const [currentTimeString, setCurrentTimeString] = useState(getCurrentTimeString());
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  // Drag & Drop / Resize state
  const [dragSession, setDragSession] = useState<{
    activity: Activity;
    type: 'move' | 'resize-top' | 'resize-bottom';
    startY: number;
    initialStartMinutes: number;
    initialEndMinutes: number;
    currentStartMinutes: number;
    currentEndMinutes: number;
    hasMoved: boolean;
  } | null>(null);

  const startHour = settings.startOfDayHour ?? 6;
  const endHour = settings.endOfDayHour ?? 24;
  const totalHours = Math.max(1, endHour - startHour);
  const timelineHeight = totalHours * HOUR_HEIGHT;

  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;

  // Keep live time updated smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeMinutes(getCurrentTimeMinutes());
      setCurrentTimeString(getCurrentTimeString());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to current time on first load if viewing today
  useEffect(() => {
    if (isToday && containerRef.current) {
      const currentOffsetMinutes = currentTimeMinutes - startHour * 60;
      if (currentOffsetMinutes > 0) {
        const targetScroll = Math.max(0, currentOffsetMinutes * MINUTE_HEIGHT - 140);
        containerRef.current.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
      }
    }
  }, [isToday, startHour]);

  // Generate hours array
  const hours = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);

  // Layout positions for overlapping activities
  const layoutPositions = useMemo(() => {
    return computeActivityLayoutColumns(currentDateActivities);
  }, [currentDateActivities]);

  // Check for any schedule overlaps
  const hasOverlaps = useMemo(() => {
    for (let i = 0; i < currentDateActivities.length; i++) {
      for (let j = i + 1; j < currentDateActivities.length; j++) {
        if (
          checkOverlap(
            currentDateActivities[i].startTime,
            currentDateActivities[i].endTime,
            currentDateActivities[j].startTime,
            currentDateActivities[j].endTime
          )
        ) {
          return true;
        }
      }
    }
    return false;
  }, [currentDateActivities]);

  // Click on empty timeline slot to add activity
  const handleTimelineSlotClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragSession) return;
    const target = e.target as HTMLElement;
    if (target.closest('.glass-card-surface') || target.closest('button')) {
      return;
    }

    // Deselect if clicking on empty timeline
    if (selectedActivityId) {
      setSelectedActivityId(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const clickedMinutesFromStart = offsetY / MINUTE_HEIGHT;
    const absoluteMinutes = startHour * 60 + clickedMinutesFromStart;

    // Snap to nearest 15-minute slot
    const snappedMinutes = Math.floor(absoluteMinutes / 15) * 15;
    const duration = settings.defaultActivityDurationMinutes || 60;
    const endMinutes = Math.min(1439, snappedMinutes + duration);

    const startTime = minutesToTime(snappedMinutes);
    const endTime = minutesToTime(endMinutes);

    openCreateModal({ startTime, endTime });
  };

  // Pending touch/mouse drag candidate before threshold or hold timer activates
  const pendingDragRef = useRef<{
    activity: Activity;
    pointerType: string;
    startX: number;
    startY: number;
    initialStartMinutes: number;
    initialEndMinutes: number;
    holdTimer: number | null;
  } | null>(null);

  // Synchronized ref for dragSession to avoid stale closures in window event listeners
  const dragSessionRef = useRef(dragSession);
  dragSessionRef.current = dragSession;

  // Full-card pointer down -> initiates intentional drag threshold or hold delay
  const handleCardPointerDown = (e: React.PointerEvent, act: Activity) => {
    // If clicking interactive child elements (checkbox, resize, menu), ignore
    if ((e.target as HTMLElement).closest('.no-drag, .resize-handle')) {
      return;
    }

    // Clean up any prior pending drag
    if (pendingDragRef.current?.holdTimer) {
      window.clearTimeout(pendingDragRef.current.holdTimer);
    }

    const sMins = timeToMinutes(act.startTime);
    const eMins = timeToMinutes(act.endTime);
    const startX = e.clientX;
    const startY = e.clientY;
    const pointerType = e.pointerType;

    // For touch screens: require a subtle 220ms hold to activate drag.
    // If the user moves their finger before 220ms (scrolling timeline), the hold is canceled immediately!
    let holdTimer: number | null = null;
    if (pointerType === 'touch') {
      holdTimer = window.setTimeout(() => {
        triggerHaptic('medium', settings.hapticFeedbackEnabled);
        setDragSession({
          activity: act,
          type: 'move',
          startY: startY,
          initialStartMinutes: sMins,
          initialEndMinutes: eMins,
          currentStartMinutes: sMins,
          currentEndMinutes: eMins,
          hasMoved: true,
        });
        pendingDragRef.current = null;
      }, 220);
    }

    pendingDragRef.current = {
      activity: act,
      pointerType,
      startX,
      startY,
      initialStartMinutes: sMins,
      initialEndMinutes: eMins,
      holdTimer,
    };
  };

  // Resize Top Handle pointer down (instant activation for dedicated handle)
  const handleResizeTopStart = (e: React.PointerEvent, act: Activity) => {
    const sMins = timeToMinutes(act.startTime);
    const eMins = timeToMinutes(act.endTime);

    triggerHaptic('light', settings.hapticFeedbackEnabled);
    setDragSession({
      activity: act,
      type: 'resize-top',
      startY: e.clientY,
      initialStartMinutes: sMins,
      initialEndMinutes: eMins,
      currentStartMinutes: sMins,
      currentEndMinutes: eMins,
      hasMoved: true,
    });
  };

  // Resize Bottom Handle pointer down (instant activation for dedicated handle)
  const handleResizeBottomStart = (e: React.PointerEvent, act: Activity) => {
    const sMins = timeToMinutes(act.startTime);
    const eMins = timeToMinutes(act.endTime);

    triggerHaptic('light', settings.hapticFeedbackEnabled);
    setDragSession({
      activity: act,
      type: 'resize-bottom',
      startY: e.clientY,
      initialStartMinutes: sMins,
      initialEndMinutes: eMins,
      currentStartMinutes: sMins,
      currentEndMinutes: eMins,
      hasMoved: true,
    });
  };

  // Global pointer move & up listeners for drag & drop with threshold & scroll tolerance
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const activeSession = dragSessionRef.current;

      // 1. If actively dragging: handle 15-minute snapping and movement
      if (activeSession) {
        const deltaY = e.clientY - activeSession.startY;
        const rawDeltaMinutes = deltaY / MINUTE_HEIGHT;
        const snappedDeltaMinutes = Math.round(rawDeltaMinutes / 15) * 15;

        if (activeSession.type === 'move') {
          const duration = activeSession.initialEndMinutes - activeSession.initialStartMinutes;
          let newStart = activeSession.initialStartMinutes + snappedDeltaMinutes;
          newStart = Math.max(0, Math.min(1440 - duration, newStart));
          const newEnd = newStart + duration;

          setDragSession((prev) =>
            prev
              ? {
                  ...prev,
                  hasMoved: true,
                  currentStartMinutes: newStart,
                  currentEndMinutes: newEnd,
                }
              : null
          );
        } else if (activeSession.type === 'resize-top') {
          let newStart = activeSession.initialStartMinutes + snappedDeltaMinutes;
          newStart = Math.max(0, Math.min(activeSession.initialEndMinutes - 15, newStart));

          setDragSession((prev) =>
            prev
              ? {
                  ...prev,
                  hasMoved: true,
                  currentStartMinutes: newStart,
                }
              : null
          );
        } else if (activeSession.type === 'resize-bottom') {
          let newEnd = activeSession.initialEndMinutes + snappedDeltaMinutes;
          newEnd = Math.min(1439, Math.max(activeSession.initialStartMinutes + 15, newEnd));

          setDragSession((prev) =>
            prev
              ? {
                  ...prev,
                  hasMoved: true,
                  currentEndMinutes: newEnd,
                }
              : null
          );
        }
        return;
      }

      // 2. If a card was touched/pressed but drag is not yet active:
      const pending = pendingDragRef.current;
      if (!pending) return;

      const deltaY = Math.abs(e.clientY - pending.startY);

      if (pending.pointerType === 'touch') {
        // If vertical movement > 8px before the hold timer completes, the user is scrolling!
        // Immediately cancel the hold timer so native timeline scrolling proceeds uninterrupted.
        if (deltaY > 8) {
          if (pending.holdTimer) {
            window.clearTimeout(pending.holdTimer);
          }
          pendingDragRef.current = null;
        }
      } else {
        // On desktop/mouse: 12px intentional movement threshold to initiate drag
        if (deltaY >= 12) {
          triggerHaptic('light', settings.hapticFeedbackEnabled);
          setDragSession({
            activity: pending.activity,
            type: 'move',
            startY: pending.startY,
            initialStartMinutes: pending.initialStartMinutes,
            initialEndMinutes: pending.initialEndMinutes,
            currentStartMinutes: pending.initialStartMinutes,
            currentEndMinutes: pending.initialEndMinutes,
            hasMoved: true,
          });
          pendingDragRef.current = null;
        }
      }
    };

    const handlePointerUp = () => {
      // 1. If pending drag never activated -> it was a simple tap/click!
      const pending = pendingDragRef.current;
      if (pending) {
        if (pending.holdTimer) {
          window.clearTimeout(pending.holdTimer);
        }
        const act = pending.activity;
        pendingDragRef.current = null;

        // Selection / edit modal toggle
        if (selectedActivityId === act.id) {
          openEditModal(act);
        } else {
          setSelectedActivityId(act.id);
          triggerHaptic('light', settings.hapticFeedbackEnabled);
        }
        return;
      }

      // 2. If an active drag session is finishing:
      const activeSession = dragSessionRef.current;
      if (activeSession) {
        if (activeSession.hasMoved) {
          const newStartTime = minutesToTime(activeSession.currentStartMinutes);
          const newEndTime = minutesToTime(activeSession.currentEndMinutes);

          if (
            newStartTime !== activeSession.activity.startTime ||
            newEndTime !== activeSession.activity.endTime
          ) {
            rescheduleActivity(activeSession.activity.id, newStartTime, newEndTime);
            triggerHaptic('medium', settings.hapticFeedbackEnabled);
            showToast(
              `Rescheduled to ${formatTimeDisplay(newStartTime, settings.timeFormat24h)} – ${formatTimeDisplay(newEndTime, settings.timeFormat24h)}`,
              'success'
            );
          }
        }
        setDragSession(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [openEditModal, rescheduleActivity, selectedActivityId, settings.hapticFeedbackEnabled, settings.timeFormat24h, showToast]);

  return (
    <div className="flex-1 flex flex-col relative select-none">
      {/* Date Switcher Bar (Obsidian glass with calm navigation) */}
      <div className="px-4 py-2 flex items-center justify-between bg-white/70 dark:bg-[#080a0c]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-white/5 transition-colors">
        <button
          onClick={() => {
            triggerHaptic('light', settings.hapticFeedbackEnabled);
            setSelectedDate(getRelativeDateString(-1, selectedDate));
            setSelectedActivityId(null);
          }}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2]" />
        </button>

        <div className="text-center">
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block tracking-tight">
            {formatDateDisplay(selectedDate)}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            {currentDateActivities.length} {currentDateActivities.length === 1 ? 'activity planned' : 'activities planned'}
          </span>
        </div>

        <button
          onClick={() => {
            triggerHaptic('light', settings.hapticFeedbackEnabled);
            setSelectedDate(getRelativeDateString(1, selectedDate));
            setSelectedActivityId(null);
          }}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all"
          aria-label="Next day"
        >
          <ChevronRight className="w-5 h-5 stroke-[2]" />
        </button>
      </div>

      {/* Schedule Overlap Hint Banner if any conflict exists */}
      {hasOverlaps && (
        <div className="mx-4 mt-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-300/40 dark:border-amber-700/40 flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Concurrent activities are aligned in columns. Drag any card to adjust.</span>
        </div>
      )}

      {/* Empty State Banner if no activities for selected date */}
      {currentDateActivities.length === 0 && (
        <div className="mx-4 mt-4 p-5 rounded-2xl bg-white/70 dark:bg-[#080a0c]/70 backdrop-blur-md border border-slate-200/80 dark:border-white/10 text-center animate-fade-in shadow-card">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 text-brand-500 flex items-center justify-center mx-auto mb-2 border border-brand-500/20 shadow-glow-pill">
            <Calendar className="w-5 h-5 stroke-[1.8]" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Your day is open</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tap any time slot on the schedule or tap + below to plan an activity.
          </p>
        </div>
      )}

      {/* Scrollable Timeline Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overscroll-contain relative px-3 py-4"
        style={{ maxHeight: 'calc(100vh - 195px)' }}
      >
        <div
          onClick={handleTimelineSlotClick}
          className="relative min-w-full cursor-pointer"
          style={{ height: `${timelineHeight}px` }}
        >
          {/* Hour grid lines & time labels */}
          {hours.map((hour) => {
            const topPx = (hour - startHour) * HOUR_HEIGHT;
            const hourString = `${hour.toString().padStart(2, '0')}:00`;

            return (
              <div
                key={hour}
                className="absolute left-0 right-0 flex items-start pointer-events-none"
                style={{ top: `${topPx}px` }}
              >
                {/* Time Label */}
                <div className="w-16 flex-shrink-0 pr-2.5 -translate-y-2.5 text-right">
                  <span className="text-[11px] font-mono-time font-medium text-slate-400 dark:text-slate-500 select-none">
                    {formatTimeDisplay(hourString, settings.timeFormat24h)}
                  </span>
                </div>

                {/* Horizontal hour line */}
                <div className="flex-1 border-t border-slate-200/60 dark:border-white/5 relative" />

                {/* Subtle half-hour dashed guideline */}
                {hour < endHour && (
                  <div
                    className="absolute left-16 right-0 border-t border-dashed border-slate-200/30 dark:border-white/[0.03]"
                    style={{ top: `${HOUR_HEIGHT / 2}px` }}
                  />
                )}
              </div>
            );
          })}

          {/* FUTURISTIC ELECTRIC YELLOW CURRENT TIME LINE & BEAD (Logitech inspired) */}
          {isToday && (
            (() => {
              const currentOffsetMinutes = currentTimeMinutes - startHour * 60;
              if (currentOffsetMinutes >= 0 && currentOffsetMinutes <= totalHours * 60) {
                const nowTopPx = currentOffsetMinutes * MINUTE_HEIGHT;
                return (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none flex items-center transition-all duration-700"
                    style={{ top: `${nowTopPx}px` }}
                  >
                    {/* Time Bead showing real time with electric yellow glow */}
                    <div className="w-16 flex items-center justify-end pr-2 -translate-y-0.5">
                      <div
                        style={{ backgroundColor: '#DFFF00', color: '#000000', opacity: 1, fontWeight: 900 }}
                        className="px-2 py-0.5 rounded-full text-[10px] font-mono-time font-black text-black shadow-[0_0_12px_rgba(223,255,0,0.7)] flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                        <span style={{ color: '#000000', opacity: 1, fontWeight: 900 }}>
                          {formatTimeDisplay(currentTimeString, settings.timeFormat24h)}
                        </span>
                      </div>
                    </div>

                    {/* Thin elegant electric yellow line with bloom aura */}
                    <div className="flex-1 relative flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#DFFF00] -ml-1 border-2 border-black shadow-[0_0_10px_rgba(223,255,0,0.8)]" />
                      <div className="flex-1 h-[1.5px] bg-[#DFFF00] shadow-[0_0_10px_rgba(223,255,0,0.7)]" />
                    </div>
                  </div>
                );
              }
              return null;
            })()
          )}

          {/* GHOST / WIREFRAME PLACEHOLDER AT ORIGINAL POSITION (Uses dragged activity's category color) */}
          {dragSession && dragSession.hasMoved && dragSession.type === 'move' && (
            (() => {
              const draggedColor = dragSession.activity.color || '#DFFF00';
              const origStart = dragSession.initialStartMinutes;
              const origEnd = dragSession.initialEndMinutes;
              const origTopPx = (origStart - startHour * 60) * MINUTE_HEIGHT;
              const origHeightPx = (origEnd - origStart) * MINUTE_HEIGHT;

              return (
                <div
                  className="absolute pointer-events-none rounded-2xl transition-all duration-150 flex items-center justify-center border-dashed"
                  style={{
                    top: `${origTopPx}px`,
                    height: `${Math.max(38, origHeightPx)}px`,
                    left: '4.75rem',
                    right: '0.75rem',
                    borderColor: hexToRgba(draggedColor, 0.6),
                    backgroundColor: hexToRgba(draggedColor, 0.08),
                    borderWidth: '1.5px',
                  }}
                >
                  <span
                    className="text-[11px] font-mono-time font-bold"
                    style={{ color: draggedColor }}
                  >
                    Original: {formatTimeDisplay(dragSession.activity.startTime, settings.timeFormat24h)}
                  </span>
                </div>
              );
            })()
          )}

          {/* TARGET DROP ZONE GUIDE ON TIMELINE (Dynamically colored by the dragged activity) */}
          {dragSession && dragSession.hasMoved && dragSession.type === 'move' && (
            (() => {
              const draggedColor = dragSession.activity.color || '#DFFF00';
              const targetStart = dragSession.currentStartMinutes;
              const targetEnd = dragSession.currentEndMinutes;
              const targetTopPx = (targetStart - startHour * 60) * MINUTE_HEIGHT;
              const targetHeightPx = (targetEnd - targetStart) * MINUTE_HEIGHT;
              const targetStartTimeStr = minutesToTime(targetStart);
              const targetEndTimeStr = minutesToTime(targetEnd);
              const durMinutes = targetEnd - targetStart;

              return (
                <div
                  className="absolute pointer-events-none rounded-2xl backdrop-blur-md transition-all duration-75 flex flex-col justify-between p-2 z-25"
                  style={{
                    top: `${targetTopPx}px`,
                    height: `${Math.max(38, targetHeightPx)}px`,
                    left: '4.75rem',
                    right: '0.75rem',
                    border: `2px solid ${draggedColor}`,
                    background: `linear-gradient(135deg, ${hexToRgba(draggedColor, 0.28)} 0%, ${hexToRgba(draggedColor, 0.10)} 100%), rgba(11, 13, 16, 0.88)`,
                    boxShadow: `0 0 24px -2px ${hexToRgba(draggedColor, 0.75)}`,
                  }}
                >
                  {/* Floating target time badge */}
                  <div
                    className="inline-flex items-center gap-1.5 self-start px-2 py-0.5 rounded-full text-[10px] font-mono-time font-black"
                    style={{
                      backgroundColor: draggedColor,
                      color: '#000000',
                      boxShadow: `0 0 12px ${draggedColor}`,
                    }}
                  >
                    <ArrowUpDown className="w-3 h-3 stroke-[2.5]" />
                    <span>
                      Drop at {formatTimeDisplay(targetStartTimeStr, settings.timeFormat24h)} – {formatTimeDisplay(targetEndTimeStr, settings.timeFormat24h)} ({formatDuration(durMinutes)})
                    </span>
                  </div>
                </div>
              );
            })()
          )}

          {/* RESIZING LIVE DURATION PILL (During top or bottom resize) */}
          {dragSession && dragSession.hasMoved && (dragSession.type === 'resize-top' || dragSession.type === 'resize-bottom') && (
            (() => {
              const draggedColor = dragSession.activity.color || '#DFFF00';
              const rStart = dragSession.currentStartMinutes;
              const rEnd = dragSession.currentEndMinutes;
              const rTopPx = (rStart - startHour * 60) * MINUTE_HEIGHT;
              const rHeightPx = (rEnd - rStart) * MINUTE_HEIGHT;
              const rStartTimeStr = minutesToTime(rStart);
              const rEndTimeStr = minutesToTime(rEnd);
              const durMinutes = rEnd - rStart;

              return (
                <div
                  className="absolute pointer-events-none rounded-2xl transition-all duration-75 z-35 flex items-center justify-center"
                  style={{
                    top: `${rTopPx}px`,
                    height: `${Math.max(38, rHeightPx)}px`,
                    left: '4.75rem',
                    right: '0.75rem',
                    border: `2px solid ${draggedColor}`,
                    background: `linear-gradient(135deg, ${hexToRgba(draggedColor, 0.22)} 0%, ${hexToRgba(draggedColor, 0.08)} 100%), rgba(11, 13, 16, 0.88)`,
                    boxShadow: `0 0 24px -2px ${hexToRgba(draggedColor, 0.7)}`,
                  }}
                >
                  <div className="px-2.5 py-1 rounded-full bg-black text-white text-[11px] font-mono-time font-bold shadow-lg flex items-center gap-2 border border-white/20">
                    <span>
                      {formatTimeDisplay(rStartTimeStr, settings.timeFormat24h)} – {formatTimeDisplay(rEndTimeStr, settings.timeFormat24h)}
                    </span>
                    <span style={{ color: draggedColor }} className="font-extrabold">
                      • {formatDuration(durMinutes)}
                    </span>
                  </div>
                </div>
              );
            })()
          )}

          {/* Activity Cards positioned on timeline with column layout */}
          {currentDateActivities.map((activity) => {
            const startMins = timeToMinutes(activity.startTime);
            const endMins = timeToMinutes(activity.endTime);

            const isDraggingThis = dragSession && dragSession.activity.id === activity.id;
            const isSelected = selectedActivityId === activity.id;
            const isDimmed = Boolean(selectedActivityId && selectedActivityId !== activity.id);

            const effectiveStart = isDraggingThis ? dragSession.currentStartMinutes : startMins;
            const effectiveEnd = isDraggingThis ? dragSession.currentEndMinutes : endMins;

            const topOffsetPx = (effectiveStart - startHour * 60) * MINUTE_HEIGHT;
            const heightPx = (effectiveEnd - effectiveStart) * MINUTE_HEIGHT;

            const pos = layoutPositions.get(activity.id) || { colIndex: 0, totalCols: 1 };

            return (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isAbsolute={true}
                topOffsetPx={topOffsetPx}
                heightPx={heightPx}
                colIndex={pos.colIndex}
                totalCols={pos.totalCols}
                isDragging={Boolean(isDraggingThis && dragSession?.hasMoved)}
                isSelected={isSelected}
                isDimmed={isDimmed}
                onCardPointerDown={handleCardPointerDown}
                onResizeTopStart={handleResizeTopStart}
                onResizeBottomStart={handleResizeBottomStart}
              />
            );
          })}
        </div>
      </div>

      {/* Floating Action Button (FAB) "+" - Logitech aesthetic: Black hardware center + Electric Yellow border */}
      <div className="sticky bottom-4 right-4 flex justify-end px-4 pointer-events-none z-30 -mt-16">
        <button
          onClick={() => {
            triggerHaptic('light', settings.hapticFeedbackEnabled);
            openCreateModal();
          }}
          aria-label="Add activity"
          className="pointer-events-auto w-14 h-14 rounded-full bg-[#0d1015] hover:bg-[#151921] active:bg-[#1f2530] border-2 border-[#DFFF00] text-[#DFFF00] shadow-[0_0_20px_-2px_rgba(223,255,0,0.5)] hover:shadow-[0_0_28px_rgba(223,255,0,0.7)] active:scale-95 transition-all flex items-center justify-center focus:outline-none"
        >
          <Plus className="w-7 h-7 stroke-[3] text-[#DFFF00]" />
        </button>
      </div>
    </div>
  );
};
