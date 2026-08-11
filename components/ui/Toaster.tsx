'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Toast {
  id: number;
  message: string;
  variant: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  push: (message: string, variant?: Toast['variant']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, variant: Toast['variant'] = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto w-full max-w-sm animate-fade-in rounded-xl border px-4 py-3 text-sm shadow-card',
              t.variant === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-800',
              t.variant === 'error' && 'border-red-200 bg-red-50 text-red-700',
              t.variant === 'info' && 'border-gray-200 bg-white text-gray-700'
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
