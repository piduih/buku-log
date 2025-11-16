import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
}

interface ToastProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  // Use a ref to keep track of active timers so we can clear them on updates/unmount
  const timersRef = React.useRef<Record<string, number>>({});

  useEffect(() => {
    // Clear timers for toasts that were removed
    const currentIds = new Set(toasts.map(t => t.id));
    for (const id of Object.keys(timersRef.current)) {
      if (!currentIds.has(id)) {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
      }
    }

    // Start timers for new toasts
    toasts.forEach(t => {
      if (!timersRef.current[t.id]) {
        const timeoutId = window.setTimeout(() => {
          removeToast(t.id);
          delete timersRef.current[t.id];
        }, 3500);
        timersRef.current[t.id] = timeoutId;
      }
    });

    // Cleanup: clear all timers when the component unmounts or toasts list empties
    return () => {
      for (const id of Object.keys(timersRef.current)) {
        clearTimeout(timersRef.current[id]);
      }
      timersRef.current = {};
    };
  }, [toasts, removeToast]);

  return (
    // On small screens, make the toasts take almost full width so they are usable on phones.
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2 items-end sm:items-end" role="status" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-2 rounded shadow-md w-full max-w-[92vw] sm:w-72 flex items-center justify-between ${t.type === 'success' ? 'bg-green-500 text-white' : t.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-800 text-white'}`}>
          <div className="text-sm">{t.message}</div>
          <button onClick={() => removeToast(t.id)} className="ml-3 opacity-80 px-2 py-1 rounded-md hover:bg-white/10">✕</button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
