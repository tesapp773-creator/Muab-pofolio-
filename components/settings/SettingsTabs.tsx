import Link from 'next/link';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/settings', label: 'Profile' },
  { href: '/settings/usage', label: 'Usage' },
  { href: '/settings/saved', label: 'Saved outputs' },
];

export function SettingsTabs({ active }: { active: string }) {
  return (
    <div className="scrollbar-thin flex gap-1 overflow-x-auto border-b border-surface-muted">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            'shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium',
            active === tab.href ? 'border-brand-500 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
