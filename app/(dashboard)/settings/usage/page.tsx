import { createClient } from '@/lib/supabase/server';
import { SettingsTabs } from '@/components/settings/SettingsTabs';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function UsagePage() {
  const supabase = createClient();
  const { data: logs } = await supabase
    .from('usage_logs')
    .select('kind, tokens_estimate, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  const totalTokens = (logs ?? []).reduce((sum, l) => sum + (l.tokens_estimate ?? 0), 0);
  const chatCount = (logs ?? []).filter((l) => l.kind === 'chat').length;
  const toolCount = (logs ?? []).filter((l) => l.kind === 'tool').length;

  const now = Date.now();
  const last30Days = (logs ?? []).filter((l) => now - new Date(l.created_at).getTime() < 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl font-semibold text-brand-950 sm:text-2xl">Settings</h1>
      <div className="mt-4">
        <SettingsTabs active="/settings/usage" />
      </div>

      <div className="mt-5">
        {logs && logs.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="AI generations" value={chatCount + toolCount} />
            <Stat label="Est. tokens used" value={totalTokens.toLocaleString()} />
            <Stat label="Last 30 days" value={last30Days.length} />
            <Stat label="Chat vs. Tools" value={`${chatCount} / ${toolCount}`} />
          </div>
        ) : (
          <EmptyState title="No usage yet" description="Your AI generations will show up here once you start using MKJ Business AI." />
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-surface-muted bg-white p-4">
      <p className="text-xl font-semibold text-brand-950">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
    </div>
  );
}
