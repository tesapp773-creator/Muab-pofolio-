'use client';

import { useRef, type KeyboardEvent } from 'react';
import { SendIcon, StopIcon } from '@/components/dashboard/icons';

export function Composer({
  value,
  onChange,
  onSend,
  onStop,
  isGenerating,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isGenerating) onSend();
    }
  }

  function autoGrow() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <div className="border-t border-surface-muted bg-white/95 px-3 py-3 backdrop-blur pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-4">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-soft focus-within:border-brand-300">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            autoGrow();
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder="Message MKJ Business AI…"
          className="max-h-40 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-gray-400 disabled:opacity-60"
        />
        {isGenerating ? (
          <button
            onClick={onStop}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white hover:bg-gray-800"
            aria-label="Stop generating"
          >
            <StopIcon className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onSend}
            disabled={!value.trim() || disabled}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition hover:bg-brand-600 disabled:opacity-40"
            aria-label="Send message"
          >
            <SendIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mx-auto mt-1.5 max-w-3xl text-center text-[11px] text-gray-400">
        Enter to send · Shift+Enter for a new line
      </p>
    </div>
  );
}
