'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './nav-items';
import { HomeIcon, ChatIcon, ToolsIcon, SettingsIcon } from './icons';
import { signOut } from '@/app/(auth)/actions';

const ICONS = { home: HomeIcon, chat: ChatIcon, tools: ToolsIcon, settings: SettingsIcon };

export function Sidebar({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-surface-muted bg-white lg:flex">
      <div className="flex items-center gap-2 px-5 py-5 text-base font-semibold text-brand-950">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">M</span>
        MKJ Business AI
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                active ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-surface-muted'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-surface-muted p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            {userEmail?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-gray-500">{userEmail}</p>
          </div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-500 hover:bg-surface-muted"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
