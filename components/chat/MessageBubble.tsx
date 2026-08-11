'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { CopyIcon, RetryIcon } from '@/components/dashboard/icons';

export interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  pending?: boolean;
  failed?: boolean;
}

export function MessageBubble({
  message,
  onRetry,
}: {
  message: DisplayMessage;
  onRetry?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail in insecure contexts — fail silently, non-critical.
    }
  }

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('group max-w-[88%] sm:max-w-[75%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser ? 'bg-brand-500 text-white' : 'border border-surface-muted bg-white text-gray-800',
            message.failed && 'border-red-200 bg-red-50 text-red-700'
          )}
        >
          {message.pending && !message.content ? (
            <span className="inline-flex gap-1">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-current" />
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-current [animation-delay:0.15s]" />
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-current [animation-delay:0.3s]" />
            </span>
          ) : isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:my-2 prose-pre:my-2 prose-pre:rounded-xl prose-pre:bg-gray-900 prose-headings:my-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {!message.pending && message.content && (
          <div className="mt-1 flex items-center gap-1 px-1 opacity-0 transition group-hover:opacity-100">
            <button
              onClick={copy}
              className="rounded-md p-1 text-gray-400 hover:bg-surface-muted hover:text-gray-600"
              aria-label="Copy response"
            >
              <CopyIcon className="h-3.5 w-3.5" />
            </button>
            {copied && <span className="text-[11px] text-gray-400">Copied</span>}
          </div>
        )}

        {message.failed && onRetry && (
          <button
            onClick={onRetry}
            className="mt-1 flex items-center gap-1 px-1 text-xs font-medium text-red-600 hover:underline"
          >
            <RetryIcon className="h-3.5 w-3.5" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
