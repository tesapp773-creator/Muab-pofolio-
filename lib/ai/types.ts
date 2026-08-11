export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface AIProvider {
  /** Machine-readable id, stored alongside messages for auditability. */
  id: string;
  /**
   * Stream a chat completion. Yields plain-text chunks as they arrive.
   * Implementations must never leak provider error bodies verbatim —
   * they should throw an AIProviderError with a safe, user-facing message.
   */
  streamChat(messages: ChatMessage[], opts?: { model?: string }): AsyncGenerator<string, void, unknown>;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly kind: 'config' | 'upstream' | 'rate_limit' | 'timeout' = 'upstream'
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}
