import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-gray-800">Page not found</p>
      <p className="mt-1 max-w-xs text-sm text-gray-500">The page you’re looking for doesn’t exist or was moved.</p>
      <Link href="/dashboard" className="mt-4 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
        Back to dashboard
      </Link>
    </div>
  );
}
