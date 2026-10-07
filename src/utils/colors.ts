import React from 'react';

/**
 * Converts a hex color string to an rgba() string with the specified opacity.
 */
export function hexToRgba(hex: string, alpha: number): string {
  if (!hex) return `rgba(223, 255, 0, ${alpha})`;
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const intVal = parseInt(clean, 16);
  if (isNaN(intVal)) return `rgba(223, 255, 0, ${alpha})`;
  const r = (intVal >> 16) & 255;
  const g = (intVal >> 8) & 255;
  const b = intVal & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Generates the full category-colored smoked glass styling for activity cards.
 * Implements 70% dark smoked glass + 30% category color atmosphere, with fine
 * borders, inner reflection, and ambient category glow.
 */
export function getCategoryGlassStyle(
  color: string,
  state: {
    isSelected?: boolean;
    isDragging?: boolean;
    isDimmed?: boolean;
    isCompleted?: boolean;
    isPressed?: boolean;
  }
): React.CSSProperties {
  const { isSelected, isDragging, isDimmed, isCompleted, isPressed } = state;

  if (isDragging) {
    return {
      background: `linear-gradient(135deg, ${hexToRgba(color, 0.45)} 0%, ${hexToRgba(color, 0.22)} 50%, ${hexToRgba(color, 0.12)} 100%), linear-gradient(180deg, #141820 0%, #0A0D12 100%)`,
      borderColor: color,
      borderWidth: '1.5px',
      boxShadow: `0 0 32px 0px ${hexToRgba(color, 0.85)}, 0 14px 36px rgba(0, 0, 0, 0.95), inset 0 1px 0 0 rgba(255, 255, 255, 0.45), inset 0 0 24px -2px ${hexToRgba(color, 0.45)}`,
    };
  }

  if (isSelected) {
    return {
      background: `linear-gradient(135deg, ${hexToRgba(color, 0.40)} 0%, ${hexToRgba(color, 0.20)} 50%, ${hexToRgba(color, 0.10)} 100%), linear-gradient(180deg, #12151B 0%, #080A0E 100%)`,
      borderColor: color,
      borderWidth: '1.5px',
      boxShadow: `0 0 28px -2px ${hexToRgba(color, 0.75)}, 0 10px 28px rgba(0, 0, 0, 0.9), inset 0 1px 0 0 rgba(255, 255, 255, 0.35), inset 0 0 20px -2px ${hexToRgba(color, 0.4)}`,
    };
  }

  if (isPressed) {
    return {
      background: `linear-gradient(135deg, ${hexToRgba(color, 0.36)} 0%, ${hexToRgba(color, 0.18)} 50%, ${hexToRgba(color, 0.08)} 100%), linear-gradient(180deg, #12151B 0%, #080A0E 100%)`,
      borderColor: hexToRgba(color, 0.75),
      borderWidth: '1px',
      boxShadow: `0 0 20px -2px ${hexToRgba(color, 0.5)}, 0 8px 22px rgba(0, 0, 0, 0.85), inset 0 1px 0 0 rgba(255, 255, 255, 0.25)`,
    };
  }

  if (isDimmed) {
    return {
      background: `linear-gradient(135deg, ${hexToRgba(color, 0.16)} 0%, ${hexToRgba(color, 0.06)} 100%), #080A0D`,
      borderColor: hexToRgba(color, 0.25),
      borderWidth: '1px',
      boxShadow: `0 4px 16px -2px rgba(0, 0, 0, 0.75)`,
      opacity: 0.45,
    };
  }

  if (isCompleted) {
    return {
      background: `linear-gradient(135deg, ${hexToRgba(color, 0.15)} 0%, ${hexToRgba(color, 0.05)} 100%), #080A0D`,
      borderColor: hexToRgba(color, 0.25),
      borderWidth: '1px',
      boxShadow: `0 4px 16px -2px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)`,
      opacity: 0.55,
    };
  }

  // Default normal card: 70% dark smoked glass + 30% category color atmosphere
  return {
    background: `linear-gradient(135deg, ${hexToRgba(color, 0.30)} 0%, ${hexToRgba(color, 0.15)} 50%, ${hexToRgba(color, 0.06)} 100%), linear-gradient(180deg, #101318 0%, #08090C 100%)`,
    borderColor: hexToRgba(color, 0.45),
    borderWidth: '1px',
    boxShadow: `0 6px 20px -2px rgba(0, 0, 0, 0.8), 0 0 16px -4px ${hexToRgba(color, 0.35)}, inset 0 1px 0 0 rgba(255, 255, 255, 0.20), inset 0 0 18px -4px ${hexToRgba(color, 0.22)}`,
  };
}
