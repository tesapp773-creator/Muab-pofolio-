import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChatWindow } from '@/components/chat/ChatWindow';

interface ConversationSummary {
  id: string;
  title: string;
}

interface StoredMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [conversationResult, messagesResult] = await Promise.all([
    supabase.from('conversations').select('id, title').eq('id', params.id).single(),
    supabase
      .from('messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', params.id)
      .order('created_at', { ascending: true }),
  ]);

  const conversation = conversationResult.data as ConversationSummary | null;
  const messages = messagesResult.data as StoredMessage[] | null;

  if (!conversation) notFound();

  return (
    <ChatWindow
      conversationId={conversation.id}
      initialTitle={conversation.title}
      initialMessages={messages ?? []}
    />
  );
}
