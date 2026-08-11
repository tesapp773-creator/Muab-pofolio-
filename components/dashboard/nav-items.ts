export interface NavItem {
  href: string;
  label: string;
  icon: 'home' | 'chat' | 'tools' | 'settings';
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: 'home' },
  { href: '/chat', label: 'AI Workspace', icon: 'chat' },
  { href: '/tools', label: 'Business Tools', icon: 'tools' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
];
