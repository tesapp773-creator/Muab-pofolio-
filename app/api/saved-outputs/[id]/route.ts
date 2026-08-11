import { NextRequest, NextResponse } from 'next/server';
import { requireUser, AuthRequiredError } from '@/lib/supabase/server';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.from('saved_outputs').delete().eq('id', params.id);
    if (error) return NextResponse.json({ error: 'Could not delete this item.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }
    throw err;
  }
}
