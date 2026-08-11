import { createClient } from '@/lib/supabase/server';
import { SettingsTabs } from '@/components/settings/SettingsTabs';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { signOut } from '@/app/(auth)/actions';

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, business_name, plan')
    .eq('id', user!.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl font-semibold text-brand-950 sm:text-2xl">Settings</h1>
      <div className="mt-4">
        <SettingsTabs active="/settings" />
      </div>

      <div className="mt-5 space-y-5">
        <ProfileForm
          initialFullName={profile?.full_name ?? ''}
          initialBusinessName={profile?.business_name ?? ''}
          email={user!.email ?? ''}
        />

        <div className="flex items-center justify-between rounded-2xl border border-surface-muted bg-white p-4 sm:p-5">
          <div>
            <p className="text-sm font-medium text-gray-800 capitalize">{profile?.plan ?? 'free'} plan</p>
            <p className="text-xs text-gray-500">Manage your subscription</p>
          </div>
          <span className="rounded-lg bg-surface-muted px-3 py-1.5 text-xs font-medium text-gray-500">Coming soon</span>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-surface-muted"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
