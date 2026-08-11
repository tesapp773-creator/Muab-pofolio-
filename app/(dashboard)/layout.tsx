import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { ToastProvider } from '@/components/ui/Toaster';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <Sidebar userEmail={user.email} />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 pb-20 lg:pb-0">{children}</main>
        </div>
        <MobileNav />
      </div>
    </ToastProvider>
  );
}
