import { NextRequest, NextResponse } from 'next/server';
import { requireUser, AuthRequiredError } from '@/lib/supabase/server';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { supabase } = await requireUser();
    const [{ data: conversation, error: convError }, { data: messages, error: msgError }] = await Promise.all([
      supabase.from('conversations').select('id, title, kind, tool_slug, updated_at').eq('id', params.id).single(),
      supabase
        .from('messages')
        .select('id, role, content, created_at')
        .eq('conversation_id', params.id)
        .order('created_at', { ascending: true }),
    ]);

    if (convError || !conversation) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    if (msgError) return NextResponse.json({ error: 'Could not load messages.' }, { status: 500 });

    return NextResponse.json({ conversation, messages });
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }
    throw err;
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.from('conversations').delete().eq('id', params.id);
    if (error) return NextResponse.json({ error: 'Could not delete conversation.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }
    throw err;
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { supabase } = await requireUser();
    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 120) : undefined;
    if (!title) return NextResponse.json({ error: 'A title is required.' }, { status: 400 });

    const { error } = await supabase.from('conversations').update({ title }).eq('id', params.id);
    if (error) return NextResponse.json({ error: 'Could not rename conversation.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }
    throw err;
  }
}
