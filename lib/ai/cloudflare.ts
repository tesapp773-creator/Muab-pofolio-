import { AIProviderError, type AIProvider, type ChatMessage } from './types';

/**
 * Cloudflare Workers AI, routed through Cloudflare AI Gateway.
 *
 * Request path:
 *   this server -> https://gateway.ai.cloudflare.com/v1/{account}/{gateway}/workers-ai/{model}
 *
 * All credentials are read from server-only env vars and are never sent to
 * the browser. If "Authenticated Gateway" is turned on for the Gateway,
 * CLOUDFLARE_AI_GATEWAY_TOKEN is additionally required and sent as
 * `cf-aig-authorization`.
 */
export class CloudflareWorkersAIProvider implements AIProvider {
  id = 'cloudflare-workers-ai';

  private get endpointBase() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const gatewayId = process.env.CLOUDFLARE_AI_GATEWAY_ID;
    if (!accountId || !gatewayId) {
      throw new AIProviderError(
        'AI is not configured yet (missing Cloudflare account/gateway id).',
        'config'
      );
    }
    return `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/workers-ai`;
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
    if (process.env.CLOUDFLARE_AI_GATEWAY_TOKEN) {
      headers['cf-aig-authorization'] = process.env.CLOUDFLARE_AI_GATEWAY_TOKEN;
    }
    return headers;
  }

  async *streamChat(
    messages: ChatMessage[],
    opts?: { model?: string }
  ): AsyncGenerator<string, void, unknown> {
    const model = opts?.model ?? process.env.CLOUDFLARE_AI_MODEL ?? '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
    const url = `${this.endpointBase}/${model}`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ messages, stream: true }),
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
          const token: string | undefined = parsed.response;
          if (token) yield token;
        } catch {
          // Skip malformed SSE frames rather than failing the whole stream.
        }
      }
    }
  }
}
