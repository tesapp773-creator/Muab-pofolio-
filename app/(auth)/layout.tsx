import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-subtle px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 text-lg font-semibold text-brand-950">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">M</span>
        MKJ Business AI
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-surface-muted bg-white p-6 shadow-card sm:p-8">
        {children}
      </div>
    </div>
  );
}
