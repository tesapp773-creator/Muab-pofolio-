'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toaster';
import { TrashIcon, CopyIcon } from '@/components/dashboard/icons';
import { formatRelativeTime } from '@/lib/utils';

interface SavedItem {
  id: string;
  tool_slug: string;
  title: string;
  content: string;
  created_at: string;
}

export function SavedOutputsList({ items }: { items: SavedItem[] }) {
  const router = useRouter();
  const { push: toast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  async function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    const res = await fetch(`/api/saved-outputs/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast('Deleted.', 'success');
      router.refresh();
    } else {
      toast('Could not delete this item.', 'error');
    }
  }

  async function copy(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      toast('Copied to clipboard.', 'success');
    } catch {
      // Non-critical.
    }
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const expanded = expandedId === item.id;
        return (
          <div key={item.id} className="rounded-2xl border border-surface-muted bg-white p-4">
            <button className="flex w-full items-center justify-between text-left" onClick={() => setExpandedId(expanded ? null : item.id)}>
              <span>
                <span className="block text-sm font-medium text-gray-800">{item.title}</span>
                <span className="block text-xs text-gray-400">{formatRelativeTime(item.created_at)}</span>
              </span>
              <span className="text-xs text-gray-400">{expanded ? 'Hide' : 'View'}</span>
            </button>

            {expanded && (
              <>
                <div className="prose prose-sm mt-3 max-w-none border-t border-surface-muted pt-3 prose-p:my-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => copy(item.content)}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    <CopyIcon className="h-3.5 w-3.5" />
                    Copy
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item.id)}
                    className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this saved output?"
        description="This can't be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
