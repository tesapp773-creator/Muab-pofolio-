'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-gray-800">Something went wrong loading this page.</p>
      <p className="mt-1 max-w-xs text-sm text-gray-500">Please try again — if it keeps happening, let us know.</p>
      <button
        onClick={reset}
        className="mt-4 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
      >
        Try again
      </button>
    </div>
  );
}
