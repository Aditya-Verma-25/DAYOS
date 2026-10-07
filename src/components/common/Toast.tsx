import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  toast: { message: string; type: 'info' | 'success' | 'warning' } | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  const icons = {
    info: <Info className="w-4 h-4 text-cyan-400" />,
    success: <CheckCircle2 className="w-4 h-4 text-brand-500" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-400" />,
  };

  const borderColors = {
    info: 'border-cyan-500/40 bg-black/90 text-cyan-100 shadow-neon-cyan',
    success: 'border-brand-500/40 bg-black/90 text-brand-100 shadow-neon',
    warning: 'border-amber-500/40 bg-black/90 text-amber-100 shadow-lg',
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-slide-up px-4 max-w-sm w-full">
      <div
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl backdrop-blur-md border ${
          borderColors[toast.type]
        }`}
      >
        {icons[toast.type]}
        <span className="text-xs font-semibold tracking-wide leading-tight">{toast.message}</span>
      </div>
    </div>
  );
};
