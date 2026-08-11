'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './nav-items';
import { HomeIcon, ChatIcon, ToolsIcon, SettingsIcon } from './icons';

const ICONS = { home: HomeIcon, chat: ChatIcon, tools: ToolsIcon, settings: SettingsIcon };

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-surface-muted bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Primary"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.icon];
        const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium',
              active ? 'text-brand-600' : 'text-gray-400'
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label.split(' ')[0]}
          </Link>
        );
      })}
    </nav>
  );
}
