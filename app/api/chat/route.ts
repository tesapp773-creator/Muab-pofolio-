import { NextRequest } from 'next/server';
import { requireUser, AuthRequiredError } from '@/lib/supabase/server';
import { getAIProvider, AIProviderError, BUSINESS_SYSTEM_PROMPT, type ChatMessage } from '@/lib/ai';

export const runtime = 'nodejs';

interface ChatRequestBody {
  conversationId: string;
  message: string;
}

/**
 * Streams an AI reply for a message in an existing conversation.
 * - Re-checks the authenticated user server-side (never trusts the client).
 * - Confirms the conversation belongs to that user before doing anything.
 * - Persists both the user message and the assistant reply.
 * - Streams plain-text chunks back to the client as they arrive.
 */
export async function POST(req: NextRequest) {
  let supabase, user;
  try {
    ({ supabase, user } = await requireUser());
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return new Response(JSON.stringify({ error: 'Please sign in to continue.' }), { status: 401 });
    }
    throw err;
  }

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request.' }), { status: 400 });
  }

  const { conversationId, message } = body;
  if (!conversationId || !message || typeof message !== 'string' || !message.trim()) {
    return new Response(JSON.stringify({ error: 'A message is required.' }), { status: 400 });
  }
  if (message.length > 8000) {
    return new Response(JSON.stringify({ error: 'Message is too long.' }), { status: 400 });
  }

  // Ownership check happens implicitly via RLS on every query below —
  // but we also verify explicitly so we can return a clean 404 rather
  // than a confusing empty-history stream.
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .single();

  if (convError || !conversation) {
    return new Response(JSON.stringify({ error: 'Conversation not found.' }), { status: 404 });
  }

  const { data: history } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(40);

  const { error: insertUserMsgError } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    role: 'user',
    content: message,
  });
  if (insertUserMsgError) {
    return new Response(JSON.stringify({ error: 'Could not save your message.' }), { status: 500 });
  }

  const chatMessages: ChatMessage[] = [
    { role: 'system', content: BUSINESS_SYSTEM_PROMPT },
    ...((history ?? []) as ChatMessage[]),
    { role: 'user', content: message },
  ];

  const provider = getAIProvider();
  const encoder = new TextEncoder();
  let full = '';

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of provider.streamChat(chatMessages)) {
          full += chunk;
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        const safeMessage =
          err instanceof AIProviderError
            ? err.message
            : 'Something went wrong generating a response. Please try again.';
        // Surface a distinguishable error frame the client can detect mid-stream.
        controller.enqueue(encoder.encode(`\n\n[[MKJ_ERROR]]${safeMessage}`));
      } finally {
        if (full.trim()) {
          await supabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: full,
            provider: provider.id,
          });
          await supabase.from('usage_logs').insert({
            user_id: user.id,
            kind: 'chat',
            provider: provider.id,
            tokens_estimate: Math.ceil(full.length / 4),
          });
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
