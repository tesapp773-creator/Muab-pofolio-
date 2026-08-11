import Link from 'next/link';
import { BUSINESS_TOOLS } from '@/lib/ai/tools';

const CATEGORIES = ['Marketing', 'Writing', 'Planning', 'Productivity'] as const;

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl font-semibold text-brand-950 sm:text-2xl">Business Tools</h1>
      <p className="mt-1 text-sm text-gray-500">Structured, one-tap tools — no prompt-crafting needed.</p>

      {CATEGORIES.map((category) => {
        const tools = BUSINESS_TOOLS.filter((t) => t.category === category);
        if (tools.length === 0) return null;
        return (
          <section key={category} className="mt-7">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">{category}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {tools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="rounded-2xl border border-surface-muted bg-white p-4 shadow-card transition hover:border-brand-200"
                >
                  <h3 className="text-sm font-semibold text-gray-900">{tool.title}</h3
                  ><p className="mt-1 text-sm text-gray-500">{tool.description}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
