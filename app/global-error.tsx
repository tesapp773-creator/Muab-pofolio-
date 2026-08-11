'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side diagnostic logging only — never surfaces the raw error to the user.
    console.error('Unhandled application error:', error.digest ?? error.message);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center bg-surface-subtle px-4 text-center">
        <p className="text-sm font-medium text-gray-800">Something went wrong.</p>
        <p className="mt-1 max-w-xs text-sm text-gray-500">
          We hit an unexpected error. You can try again, or come back in a moment.
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
