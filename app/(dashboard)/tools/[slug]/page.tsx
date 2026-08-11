import { notFound } from 'next/navigation';
import { getToolBySlug } from '@/lib/ai/tools';
import { ToolRunner } from '@/components/tools/ToolRunner';

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl font-semibold text-brand-950 sm:text-2xl">{tool.title}</h1>
      <p className="mt-1 text-sm text-gray-500">{tool.description}</p>
      <div className="mt-6">
        <ToolRunner tool={tool} />
      </div>
    </div>
  );
}
