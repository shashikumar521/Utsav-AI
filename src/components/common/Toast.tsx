import React from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl shadow-lg border text-xs font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-[#392538] text-[#FAF7F0] border-[#C5A46D]/40'
              : toast.type === 'error'
              ? 'bg-red-950 text-red-100 border-red-800'
              : 'bg-white text-[#392538] border-[#E8E1D5]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined text-base ${
                toast.type === 'success' ? 'text-[#C5A46D]' : toast.type === 'error' ? 'text-red-400' : 'text-[#755a2a]'
              }`}
            >
              {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
            </span>
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-white/70 hover:text-white p-0.5"
            aria-label="Dismiss toast"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
