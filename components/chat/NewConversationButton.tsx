'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@/components/dashboard/icons';

export function NewConversationButton({ label = 'New chat' }: { label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function createConversation() {
    setLoading(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'chat' }),
      });
      if (!res.ok) throw new Error();
      const { conversation } = await res.json();
      router.push(`/chat/${conversation.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={createConversation}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
    >
      <PlusIcon className="h-4 w-4" />
      {loading ? 'Creating…' : label}
    </button>
  );
}
