import { NextRequest, NextResponse } from 'next/server';
import { requireUser, AuthRequiredError } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from('saved_outputs')
      .select('id, tool_slug, title, content, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) return NextResponse.json({ error: 'Could not load saved items.' }, { status: 500 });
    return NextResponse.json({ items: data });
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
    const { toolSlug, title, content } = body;
    if (!toolSlug || !title || !content) {
      return NextResponse.json({ error: 'toolSlug, title, and content are required.' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('saved_outputs')
      .insert({ user_id: user.id, tool_slug: toolSlug, title: String(title).slice(0, 200), content })
      .select('id, tool_slug, title, content, created_at')
      .single();
    if (error) return NextResponse.json({ error: 'Could not save.' }, { status: 500 });
    return NextResponse.json({ item: data }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }
    throw err;
  }
}
