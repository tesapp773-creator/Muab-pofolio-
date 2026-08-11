import { CloudflareWorkersAIProvider } from './cloudflare';
import { GeminiProvider } from './gemini';
import type { AIProvider } from './types';

export * from './types';

/**
 * Single place that decides which AI provider backs the app.
 * Swapping providers/models never requires touching UI or API route code —
 * only this file (and the relevant env vars).
 */
export function getAIProvider(preferred?: 'cloudflare' | 'gemini'): AIProvider {
  if (preferred === 'gemini' || (!preferred && process.env.AI_DEFAULT_PROVIDER === 'gemini')) {
    return new GeminiProvider();
  }
  return new CloudflareWorkersAIProvider();
}

export const BUSINESS_SYSTEM_PROMPT = `You are the MKJ Business AI assistant — a sharp, practical business co-pilot.
You help with marketing copy, emails, proposals, business plans, social content,
summarization, translation, and general business strategy.
Be concise and concrete. Prefer clear structure (short paragraphs, bullet points)
over filler. Ask a clarifying question only when the request is genuinely ambiguous;
otherwise make a reasonable assumption and proceed.`;
