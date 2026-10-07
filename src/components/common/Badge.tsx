import React from 'react';

interface BadgeProps {
  label: string;
  color?: string;
  size?: 'sm' | 'md';
  variant?: 'subtle' | 'solid' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = '#6366f1',
  size = 'sm',
  variant = 'subtle',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] font-medium' : 'px-2.5 py-1 text-xs font-semibold';

  let style: React.CSSProperties = {};
  let baseClasses = 'inline-flex items-center gap-1 rounded-full whitespace-nowrap transition-colors ';

  if (variant === 'subtle') {
    style = {
      backgroundColor: `${color}18`,
      color: color,
      border: `1px solid ${color}30`,
    };
  } else if (variant === 'solid') {
    style = {
      backgroundColor: color,
      color: '#ffffff',
    };
  } else {
    style = {
      backgroundColor: 'transparent',
      borderColor: color,
      color: color,
      borderWidth: '1px',
    };
  }

  return (
    <span className={`${baseClasses} ${sizeClasses} ${className}`} style={style}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
};
