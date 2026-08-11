import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChatWindow } from '@/components/chat/ChatWindow';

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [{ data: conversation }, { data: messages }] = await Promise.all([
    supabase.from('conversations').select('id, title').eq('id', params.id).single(),
    supabase
      .from('messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', params.id)
      .order('created_at', { ascending: true }),
  ]);

  if (!conversation) notFound();

  return (
    <ChatWindow
      conversationId={conversation.id}
      initialTitle={conversation.title}
      initialMessages={messages ?? []}
    />
  );
}
