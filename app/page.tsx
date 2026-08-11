import Link from 'next/link';

const FEATURES = [
  { title: 'AI Workspace', desc: 'Chat with an AI tuned for business tasks — marketing, emails, proposals, and more.' },
  { title: 'Business Tools', desc: 'Structured, one-tap tools for common writing tasks — no prompt-crafting needed.' },
  { title: 'Saved outputs', desc: 'Keep the results you like, organized and ready to reuse.' },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-surface-muted bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-base font-semibold text-brand-950">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">M</span>
            MKJ Business AI
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-surface-muted">
              Sign in
            </Link>
            <Link href="/signup" className="rounded-lg bg-brand-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-600">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-950 sm:text-5xl">
            Your AI workspace for everyday business writing
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500 sm:text-lg">
            Marketing copy, emails, proposals, and business plans — drafted in seconds,
            refined in a chat, saved when you’re happy with them.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-soft hover:bg-brand-600"
            >
              Start for free
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-surface-muted"
            >
              Sign in
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-20 sm:grid-cols-3 sm:px-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-surface-muted bg-white p-5 shadow-card">
              <h3 className="text-sm font-semibold text-brand-950">{f.title}</h3>
              <p className="mt-1.5 text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-surface-muted py-6 text-center text-xs text-gray-400">
        MKJ Business AI
      </footer>
    </div>
  );
}
