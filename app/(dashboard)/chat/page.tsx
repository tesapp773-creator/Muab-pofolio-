import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { NewConversationButton } from '@/components/chat/NewConversationButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ChatIcon } from '@/components/dashboard/icons';
import { formatRelativeTime } from '@/lib/utils';

export default async function ChatListPage() {
  const supabase = createClient();
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, title, updated_at')
    .eq('kind', 'chat')
    .order('updated_at', { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-brand-950 sm:text-2xl">AI Workspace</h1>
        <NewConversationButton />
      </div>

      {conversations && conversations.length > 0 ? (
        <div className="mt-5 divide-y divide-surface-muted overflow-hidden rounded-2xl border border-surface-muted bg-white">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/chat/${c.id}`}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-surface-subtle"
            >
              <span className="truncate text-sm font-medium text-gray-800">{c.title}</span>
              <span className="ml-3 shrink-0 text-xs text-gray-400">{formatRelativeTime(c.updated_at)}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            icon={<ChatIcon className="h-8 w-8" />}
            title="No conversations yet"
            description="Start a new conversation to get help with marketing, emails, planning, and more."
            action={<NewConversationButton label="Start your first conversation" />}
          />
        </div>
      )}
    </div>
  );
}
