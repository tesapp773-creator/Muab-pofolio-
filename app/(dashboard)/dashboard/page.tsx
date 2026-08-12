import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ChatIcon, ToolsIcon } from '@/components/dashboard/icons';

interface ProfileSummary {
  full_name: string | null;
  business_name: string | null;
  plan: 'free' | 'pro' | 'business';
}

interface RecentConversation {
  id: string;
  title: string;
  updated_at: string;
}

export default async function OverviewPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profileResult, conversationCountResult, savedCountResult, recentConversationsResult] = await Promise.all([
    supabase.from('profiles').select('full_name, business_name, plan').eq('id', user!.id).single(),
    supabase.from('conversations').select('id', { count: 'exact', head: true }),
    supabase.from('saved_outputs').select('id', { count: 'exact', head: true }),
    supabase
      .from('conversations')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5),
  ]);

  const profile = profileResult.data as ProfileSummary | null;
  const conversationCount = conversationCountResult.count;
  const savedCount = savedCountResult.count;
  const recentConversations = recentConversationsResult.data as RecentConversation[] | null;

  const firstName = profile?.full_name?.split(' ')[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl font-semibold text-brand-950 sm:text-2xl">
        {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {profile?.business_name ? `${profile.business_name} · ` : ''}
        {profile?.plan === 'free' ? 'Free plan' : profile?.plan}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-surface-muted bg-white p-4">
          <p className="text-2xl font-semibold text-brand-950">{conversationCount ?? 0}</p>
          <p className="mt-0.5 text-xs text-gray-500">Conversations</p>
        </div>
        <div className="rounded-2xl border border-surface-muted bg-white p-4">
          <p className="text-2xl font-semibold text-brand-950">{savedCount ?? 0}</p>
          <p className="mt-0.5 text-xs text-gray-500">Saved outputs</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-surface-muted bg-white p-4 sm:col-span-1">
          <p className="text-2xl font-semibold text-brand-950 capitalize">{profile?.plan ?? 'free'}</p>
          <p className="mt-0.5 text-xs text-gray-500">Current plan</p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/chat"
          className="flex items-center gap-3 rounded-2xl border border-surface-muted bg-white p-4 shadow-card transition hover:border-brand-200"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <ChatIcon className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-medium text-gray-900">Open AI Workspace</span>
            <span className="block text-xs text-gray-500">Start a new conversation</span>
          </span>
        </Link>
        <Link
          href="/tools"
          className="flex items-center gap-3 rounded-2xl border border-surface-muted bg-white p-4 shadow-card transition hover:border-brand-200"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <ToolsIcon className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-medium text-gray-900">Business Tools</span>
            <span className="block text-xs text-gray-500">Structured, one-tap tasks</span>
          </span>
        </Link>
      </div>

      {recentConversations && recentConversations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-700">Recent conversations</h2>
          <div className="mt-3 divide-y divide-surface-muted overflow-hidden rounded-2xl border border-surface-muted bg-white">
            {recentConversations.map((c) => (
              <Link key={c.id} href={`/chat/${c.id}`} className="block px-4 py-3 text-sm hover:bg-surface-subtle">
                <span className="font-medium text-gray-800">{c.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
