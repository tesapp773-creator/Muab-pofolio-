'use client';

import { useEffect, useRef } from 'react';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  destructive = true,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm animate-fade-in rounded-2xl bg-white p-5 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-sm font-semibold text-gray-900">
          {title}
        </h2>
        {description && <p className="mt-1.5 text-sm text-gray-500">{description}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-600 hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={
              destructive
                ? 'rounded-lg bg-red-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-red-700'
                : 'rounded-lg bg-brand-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-600'
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
