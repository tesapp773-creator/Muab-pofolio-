import { AIProviderError, type AIProvider, type ChatMessage } from './types';

/**
 * Cloudflare Workers AI, called through Cloudflare's unified AI REST API
 * and routed via AI Gateway (for logging, caching, and rate limiting).
 *
 * Endpoint: https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1/chat/completions
 * This is Cloudflare's current OpenAI-SDK-compatible endpoint (as of mid-2026),
 * which supersedes the older `/workers-ai/{model}` and the now-deprecated
 * `gateway.ai.cloudflare.com/.../compat/chat/completions` path for single-model
 * calls. Routing through a specific AI Gateway is done via the
 * `cf-aig-gateway-id` header rather than a different base URL.
 *
 * All credentials are read from server-only env vars and are never sent to
 * the browser.
 */
export class CloudflareWorkersAIProvider implements AIProvider {
  id = 'cloudflare-workers-ai';

  private get endpoint() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    if (!accountId) {
      throw new AIProviderError('AI is not configured yet (missing Cloudflare account id).', 'config');
    }
    return `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`;
  }

  private get headers(): Record<string, string> {
    const apiToken = process.env.CLOUDFLARE_WORKERS_AI_API_TOKEN;
    if (!apiToken) {
      throw new AIProviderError('AI is not configured yet (missing Workers AI token).', 'config');
    }
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    };
    // Route through a specific AI Gateway (logging/caching/rate limits) if configured.
    if (process.env.CLOUDFLARE_AI_GATEWAY_ID) {
      headers['cf-aig-gateway-id'] = process.env.CLOUDFLARE_AI_GATEWAY_ID;
    }
    // Only relevant if that gateway has "Authenticated Gateway" turned on.
    if (process.env.CLOUDFLARE_AI_GATEWAY_TOKEN) {
      headers['cf-aig-authorization'] = `Bearer ${process.env.CLOUDFLARE_AI_GATEWAY_TOKEN}`;
    }
    return headers;
  }

  async *streamChat(
    messages: ChatMessage[],
    opts?: { model?: string }
  ): AsyncGenerator<string, void, unknown> {
    // Workers AI models are addressed with an "@cf/" prefix in this API.
    const model = opts?.model ?? process.env.CLOUDFLARE_AI_MODEL ?? '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

    let res: Response;
    try {
      res = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ model, messages, stream: true }),
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
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          // Standard OpenAI-compatible streaming delta shape.
          const token: string | undefined = parsed?.choices?.[0]?.delta?.content;
          if (token) yield token;
        } catch {
          // Skip malformed SSE frames rather than failing the whole stream.
        }
      }
    }
  }
}
