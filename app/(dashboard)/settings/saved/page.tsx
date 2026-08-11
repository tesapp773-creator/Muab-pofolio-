import { createClient } from '@/lib/supabase/server';
import { SettingsTabs } from '@/components/settings/SettingsTabs';
import { SavedOutputsList } from '@/components/settings/SavedOutputsList';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function SavedOutputsPage() {
  const supabase = createClient();
  const { data: items } = await supabase
    .from('saved_outputs')
    .select('id, tool_slug, title, content, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl font-semibold text-brand-950 sm:text-2xl">Settings</h1>
      <div className="mt-4">
        <SettingsTabs active="/settings/saved" />
      </div>

      <div className="mt-5">
        {items && items.length > 0 ? (
          <SavedOutputsList items={items} />
        ) : (
          <EmptyState title="Nothing saved yet" description="Outputs you save from Business Tools will show up here." />
        )}
      </div>
    </div>
  );
}
