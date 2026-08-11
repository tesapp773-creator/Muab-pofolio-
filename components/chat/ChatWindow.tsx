'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageBubble, type DisplayMessage } from './MessageBubble';
import { Composer } from './Composer';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toaster';
import { TrashIcon } from '@/components/dashboard/icons';

interface StoredMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

const ERROR_MARKER = '\n\n[[MKJ_ERROR]]';

export function ChatWindow({
  conversationId,
  initialTitle,
  initialMessages,
}: {
  conversationId: string;
  initialTitle: string;
  initialMessages: StoredMessage[];
}) {
  const router = useRouter();
  const { push: toast } = useToast();
  const [messages, setMessages] = useState<DisplayMessage[]>(
    initialMessages.map((m) => ({ id: m.id, role: m.role, content: m.content }))
  );
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<string>('');

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || isGenerating) return;

    lastUserMessageRef.current = text;
    setInput('');

    const userMsgId = `u-${Date.now()}`;
    const assistantMsgId = `a-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: text },
      { id: assistantMsgId, role: 'assistant', content: '', pending: true },
    ]);

    setIsGenerating(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message: text }),
        signal: controller.signal,
      });

      if (res.status === 401) {
        toast('Your session expired. Please sign in again.', 'error');
        router.push('/login');
        return;
      }
      if (!res.ok || !res.body) {
        throw new Error('stream-failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      let sawError = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });

        if (full.includes(ERROR_MARKER)) {
          sawError = true;
          const [clean, errMsg] = full.split(ERROR_MARKER);
          full = clean;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, content: clean, pending: false } : m))
          );
          toast(errMsg || 'Something went wrong generating a response.', 'error');
          break;
        }

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: full, pending: true } : m))
        );
      }

      if (!sawError) {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: full, pending: false } : m))
        );
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setMessages((prev) => prev.map((m) => (m.id === assistantMsgId ? { ...m, pending: false } : m)));
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, pending: false, failed: true, content: m.content } : m
          )
        );
        toast('Could not reach the AI service. Please try again.', 'error');
      }
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  function retryLast() {
    setMessages((prev) => prev.filter((m) => !(m.role === 'assistant' && m.failed)));
    send(lastUserMessageRef.current);
  }

  async function deleteConversation() {
    setConfirmDelete(false);
    const res = await fetch(`/api/conversations/${conversationId}`, { method: 'DELETE' });
    if (res.ok) {
      toast('Conversation deleted.', 'success');
      router.push('/chat');
      router.refresh();
    } else {
      toast('Could not delete conversation.', 'error');
    }
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col lg:h-screen">
      <div className="flex items-center justify-between border-b border-surface-muted bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/chat" className="shrink-0 text-sm text-gray-400 hover:text-gray-600 lg:hidden">
            ←
          </Link>
          <h1 className="truncate text-sm font-medium text-gray-800">{initialTitle}</h1>
        </div>
        <button
          onClick={() => setConfirmDelete(true)}
          className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
          aria-label="Delete conversation"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-gray-600">Start the conversation</p>
            <p className="mt-1 max-w-xs text-sm text-gray-400">
              Ask for a marketing email, a business plan outline, a social post — anything business-related.
            </p>
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} onRetry={m.failed ? retryLast : undefined} />)
        )}
      </div>

      <Composer
        value={input}
        onChange={setInput}
        onSend={() => send()}
        onStop={stop}
        isGenerating={isGenerating}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this conversation?"
        description="This will permanently delete the conversation and all its messages."
        confirmLabel="Delete"
        onConfirm={deleteConversation}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
