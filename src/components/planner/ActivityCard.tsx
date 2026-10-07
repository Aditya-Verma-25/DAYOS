import React, { useState } from 'react';
import { Check, Clock, MoreVertical, Copy, Trash2, Edit3, FileText, AlertCircle } from 'lucide-react';
import { Activity } from '../../types/activity';
import { usePlanner } from '../../context/PlannerContext';
import { formatTimeDisplay, calculateDurationMinutes, formatDuration } from '../../utils/time';
import { triggerHaptic } from '../../utils/haptics';
import { getCategoryGlassStyle } from '../../utils/colors';

interface ActivityCardProps {
  activity: Activity;
  topOffsetPx?: number;
  heightPx?: number;
  isAbsolute?: boolean;
  colIndex?: number;
  totalCols?: number;
  isDragging?: boolean;
  isSelected?: boolean;
  isDimmed?: boolean;
  onCardPointerDown?: (e: React.PointerEvent, act: Activity) => void;
  onResizeTopStart?: (e: React.PointerEvent, act: Activity) => void;
  onResizeBottomStart?: (e: React.PointerEvent, act: Activity) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  topOffsetPx,
  heightPx,
  isAbsolute = false,
  colIndex = 0,
  totalCols = 1,
  isDragging = false,
  isSelected = false,
  isDimmed = false,
  onCardPointerDown,
  onResizeTopStart,
  onResizeBottomStart,
}) => {
  const { toggleComplete, openEditModal, duplicateActivity, deleteActivity, settings } = usePlanner();
  const [showMenu, setShowMenu] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const duration = calculateDurationMinutes(activity.startTime, activity.endTime);
  const isCompact = heightPx !== undefined && heightPx < 54;

  // Handle pointer down on card surface (for full-card drag or press lift)
  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.no-drag') || target.closest('.resize-handle')) {
      return;
    }
    setIsPressed(true);
    triggerHaptic('light', settings.hapticFeedbackEnabled);
    if (onCardPointerDown) {
      onCardPointerDown(e, activity);
    }
  };

  const handlePointerUp = () => {
    setIsPressed(false);
  };

  // Overlapping column layout calculation
  let layoutStyle: React.CSSProperties = {};
  if (isAbsolute && topOffsetPx !== undefined && heightPx !== undefined) {
    const effectiveHeight = Math.max(38, heightPx);

    if (totalCols > 1) {
      layoutStyle = {
        position: 'absolute',
        top: `${topOffsetPx}px`,
        height: `${effectiveHeight}px`,
        left: `calc(4.75rem + (${colIndex} * (100% - 5.5rem) / ${totalCols}))`,
        width: `calc((100% - 5.75rem) / ${totalCols})`,
      };
    } else {
      layoutStyle = {
        position: 'absolute',
        top: `${topOffsetPx}px`,
        height: `${effectiveHeight}px`,
        left: '4.75rem',
        right: '0.75rem',
      };
    }
  }

  // Full category-colored smoked glass styling (70% dark smoked glass + 30% category color atmosphere)
  const glassStyle = getCategoryGlassStyle(activity.color, {
    isSelected,
    isDragging,
    isDimmed,
    isCompleted: activity.completed,
    isPressed,
  });

  return (
    <div
      style={{ ...layoutStyle, ...glassStyle }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`group glass-card-surface select-none rounded-2xl transition-all duration-200 overflow-hidden border backdrop-blur-md ${
        isDragging
          ? 'touch-none cursor-grabbing z-40 scale-[1.04] -translate-y-1'
          : isSelected
          ? 'touch-pan-y cursor-pointer z-30 scale-[1.03] -translate-y-0.5'
          : isPressed
          ? 'touch-pan-y cursor-pointer scale-[1.02] -translate-y-0.5 z-25'
          : 'touch-pan-y cursor-pointer hover:-translate-y-0.5'
      } ${isAbsolute ? 'z-10' : 'mb-3'}`}
    >
      {/* Top resize handle for duration modification (accessible touch zone) */}
      {isAbsolute && onResizeTopStart && (
        <div
          onPointerDown={(e) => {
            e.stopPropagation();
            onResizeTopStart(e, activity);
          }}
          className="resize-handle absolute top-0 left-0 right-0 h-4 cursor-ns-resize z-20 flex items-center justify-center touch-none -mt-1 group-hover:opacity-100 opacity-50 transition-opacity"
          title="Drag top to change start time"
        >
          <div className="w-8 h-1 rounded-full bg-white/30 group-hover:bg-[#DFFF00] transition-colors" />
        </div>
      )}

      {/* Card Body: Compact view vs Full view */}
      {isCompact ? (
        <div className="h-full flex items-center justify-between px-3 gap-2">
          {/* Left: Checkbox + Title + Time */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleComplete(activity.id);
              }}
              aria-label={activity.completed ? 'Mark incomplete' : 'Mark complete'}
              className="no-drag w-7 h-7 -my-1 rounded-lg flex items-center justify-center flex-shrink-0 touch-manipulation hover:bg-white/10"
            >
              <div
                className={`w-4.5 h-4.5 rounded-md flex items-center justify-center border transition-all ${
                  activity.completed
                    ? 'border-[#DFFF00] shadow-glow-pill'
                    : 'border-white/30 bg-black/30 hover:border-brand-500'
                }`}
                style={activity.completed ? { backgroundColor: '#DFFF00', borderColor: '#DFFF00', color: '#000000', opacity: 1 } : undefined}
              >
                {activity.completed && (
                  <Check
                    className="w-3 h-3 stroke-[3.5]"
                    style={{ color: '#000000', stroke: '#000000', strokeWidth: 3.5, opacity: 1 }}
                  />
                )}
              </div>
            </button>

            <span
              className={`text-xs font-bold truncate leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${
                activity.completed
                  ? 'line-through text-slate-400'
                  : 'text-white'
              }`}
            >
              {activity.title}
            </span>

            <span className="text-[10px] font-mono-time text-white/80 flex-shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {formatTimeDisplay(activity.startTime, settings.timeFormat24h)}
            </span>
          </div>

          {/* Right: Category dot */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span
              className="w-2 h-2 rounded-full shadow-xs"
              style={{
                backgroundColor: activity.color,
                boxShadow: `0 0 8px ${activity.color}`,
              }}
              title={activity.category}
            />
          </div>
        </div>
      ) : (
        /* Full card presentation */
        <div className="h-full flex flex-col justify-between p-3">
          {/* Top row */}
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              {/* Checkbox button with comfortable 32x32px hit-box */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleComplete(activity.id);
                }}
                aria-label={activity.completed ? 'Mark incomplete' : 'Mark complete'}
                className="no-drag w-7 h-7 -mt-0.5 -ml-1 rounded-lg flex items-center justify-center flex-shrink-0 touch-manipulation hover:bg-white/10 transition-colors"
              >
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                    activity.completed
                      ? 'border-[#DFFF00] shadow-glow-pill'
                      : 'border-white/30 bg-black/30 hover:border-brand-500'
                  }`}
                  style={activity.completed ? { backgroundColor: '#DFFF00', borderColor: '#DFFF00', color: '#000000', opacity: 1 } : undefined}
                >
                  {activity.completed && (
                    <Check
                      className="w-3.5 h-3.5 stroke-[3.5]"
                      style={{ color: '#000000', stroke: '#000000', strokeWidth: 3.5, opacity: 1 }}
                    />
                  )}
                </div>
              </button>

              {/* Title & Notes */}
              <div className="min-w-0 flex-1">
                <h3
                  className={`text-xs sm:text-sm font-extrabold tracking-tight truncate leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${
                    activity.completed
                      ? 'line-through text-slate-400'
                      : 'text-white'
                  }`}
                >
                  {activity.title}
                </h3>

                {activity.notes && (
                  <p className="text-[11px] text-white/75 truncate mt-0.5 flex items-center gap-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    <FileText className="w-3 h-3 flex-shrink-0 text-white/60" />
                    <span>{activity.notes}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {activity.priority === 'high' && (
                <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-950/70 text-rose-300 border border-rose-800/60 shadow-xs">
                  <AlertCircle className="w-2.5 h-2.5" />
                  High
                </span>
              )}

              {/* Quick Actions Dropdown Button */}
              <div className="relative no-drag">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu((prev) => !prev);
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-black/30 transition-colors"
                  aria-label="Activity options"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                      }}
                    />
                    <div
                      className="absolute right-0 top-8 z-40 w-36 py-1 bg-[#101318]/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 text-xs animate-scale-in"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          openEditModal(activity);
                        }}
                        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-white/10 text-slate-200 font-medium"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-brand-500" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          duplicateActivity(activity.id);
                        }}
                        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-white/10 text-slate-200 font-medium"
                      >
                        <Copy className="w-3.5 h-3.5 text-brand-cyan" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          deleteActivity(activity.id);
                        }}
                        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-rose-950/40 text-rose-400 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom row: Time & Category Pill */}
          <div className="flex items-center justify-between gap-1.5 mt-2 pt-1 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-[11px] font-mono-time font-medium text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              <Clock className="w-3 h-3 text-white/60 flex-shrink-0" />
              <span>
                {formatTimeDisplay(activity.startTime, settings.timeFormat24h)} – {formatTimeDisplay(activity.endTime, settings.timeFormat24h)}
              </span>
              <span className="text-[10px] text-white/60">
                ({formatDuration(duration)})
              </span>
            </div>

            {/* Category Pill: Dark translucent capsule with vibrant jewel dot */}
            <div
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight bg-black/40 border border-white/15 text-white/90 shadow-xs"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: activity.color,
                  boxShadow: `0 0 6px ${activity.color}`,
                }}
              />
              <span>{activity.category}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom resize handle for duration modification (accessible touch zone) */}
      {isAbsolute && onResizeBottomStart && (
        <div
          onPointerDown={(e) => {
            e.stopPropagation();
            onResizeBottomStart(e, activity);
          }}
          className="resize-handle absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize z-20 flex items-center justify-center touch-none -mb-1 group-hover:opacity-100 opacity-50 transition-opacity"
          title="Drag bottom to change end time"
        >
          <div className="w-8 h-1 rounded-full bg-white/30 group-hover:bg-[#DFFF00] transition-colors" />
        </div>
      )}
    </div>
  );
};
