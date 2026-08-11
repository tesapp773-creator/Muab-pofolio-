import { AIProviderError, type AIProvider, type ChatMessage } from './types';

/**
 * Optional secondary provider. Only meaningful if GEMINI_API_KEY is set
 * server-side; the key is never sent to the browser. Included so the
 * provider can be swapped/added without touching UI code — see lib/ai/index.ts.
 */
export class GeminiProvider implements AIProvider {
  id = 'gemini';

  async *streamChat(
    messages: ChatMessage[],
    opts?: { model?: string }
  ): AsyncGenerator<string, void, unknown> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AIProviderError('Gemini is not configured.', 'config');
    }
    const model = opts?.model ?? process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
    const systemInstruction = messages.find((m) => m.role === 'system')?.content;

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
        }),
      });
    } catch {
      throw new AIProviderError('Could not reach the AI service. Please try again.', 'timeout');
    }

    if (res.status === 429) {
      throw new AIProviderError('The AI service is rate-limited right now. Please try again shortly.', 'rate_limit');
    }
    if (!res.ok || !res.body) {
      throw new AIProviderError('The AI service returned an error. Please try again.', 'upstream');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        try {
          const parsed = JSON.parse(data);
          const token: string | undefined = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (token) yield token;
        } catch {
          // Skip malformed SSE frames.
        }
      }
    }
  }
}
