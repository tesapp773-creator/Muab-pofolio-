'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { BusinessTool } from '@/lib/ai/tools';
import { useToast } from '@/components/ui/Toaster';
import { CopyIcon, SendIcon } from '@/components/dashboard/icons';

const ERROR_MARKER = '\n\n[[MKJ_ERROR]]';

export function ToolRunner({ tool }: { tool: BusinessTool }) {
  const { push: toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const missingRequired = tool.fields.some((f) => f.required && !values[f.name]?.trim());

  async function run() {
    if (missingRequired || isGenerating) return;
    setIsGenerating(true);
    setHasRun(true);
    setOutput('');
    setSaved(false);

    try {
      const convRes = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'tool', toolSlug: tool.slug, title: tool.title }),
      });
      if (!convRes.ok) throw new Error();
      const { conversation } = await convRes.json();

      const prompt = tool.buildPrompt(values);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: conversation.id, message: prompt }),
      });
      if (res.status === 401) {
        toast('Your session expired. Please sign in again.', 'error');
        return;
      }
      if (!res.ok || !res.body) throw new Error();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        if (full.includes(ERROR_MARKER)) {
          const [clean, errMsg] = full.split(ERROR_MARKER);
          setOutput(clean);
          toast(errMsg || 'Something went wrong. Please try again.', 'error');
          return;
        }
        setOutput(full);
      }
    } catch {
      toast('Could not generate a result. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  }

  async function save() {
    if (!output.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/saved-outputs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolSlug: tool.slug, title: tool.title, content: output }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      toast('Saved to your outputs.', 'success');
    } catch {
      toast('Could not save this output.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Non-critical.
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4 rounded-2xl border border-surface-muted bg-white p-4 sm:p-5">
        {tool.fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                rows={4}
                placeholder={field.placeholder}
                value={values[field.name] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none ring-brand-400 focus:ring-2"
              />
            ) : (
              <input
                id={field.name}
                type="text"
                placeholder={field.placeholder}
                value={values[field.name] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none ring-brand-400 focus:ring-2"
              />
            )}
          </div>
        ))}

        <button
          onClick={run}
          disabled={missingRequired || isGenerating}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          <SendIcon className="h-4 w-4" />
          {isGenerating ? 'Generating…' : 'Generate'}
        </button>
      </div>

      {hasRun && (
        <div className="rounded-2xl border border-surface-muted bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Result</h3>
            {output && !isGenerating && (
              <div className="flex items-center gap-3">
                <button onClick={copy} className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                  <CopyIcon className="h-3.5 w-3.5" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={save}
                  disabled={saving || saved}
                  className="text-xs font-medium text-brand-600 hover:underline disabled:opacity-50"
                >
                  {saved ? 'Saved' : saving ? 'Saving…' : 'Save output'}
                </button>
              </div>
            )}
          </div>
          <div className="prose prose-sm mt-3 max-w-none prose-p:my-2 prose-pre:rounded-xl prose-pre:bg-gray-900">
            {output ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
            ) : (
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-gray-400" />
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-gray-400 [animation-delay:0.15s]" />
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-gray-400 [animation-delay:0.3s]" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
