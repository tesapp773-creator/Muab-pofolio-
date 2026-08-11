import { NextRequest, NextResponse } from 'next/server';
import { requireUser, AuthRequiredError } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, kind, tool_slug, updated_at')
      .order('updated_at', { ascending: false })
      .limit(100);

    if (error) return NextResponse.json({ error: 'Could not load conversations.' }, { status: 500 });
    return NextResponse.json({ conversations: data });
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }
    throw err;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim().slice(0, 120) : 'New conversation';
    const kind = body.kind === 'tool' ? 'tool' : 'chat';
    const toolSlug = typeof body.toolSlug === 'string' ? body.toolSlug : null;

    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title, kind, tool_slug: toolSlug })
      .select('id, title, kind, tool_slug, updated_at')
      .single();

    if (error) return NextResponse.json({ error: 'Could not create conversation.' }, { status: 500 });
    return NextResponse.json({ conversation: data }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }
    throw err;
  }
}
