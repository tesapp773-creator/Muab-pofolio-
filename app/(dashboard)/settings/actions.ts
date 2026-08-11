'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/supabase/server';

export interface ProfileActionState {
  error?: string;
  success?: boolean;
}

export async function updateProfile(_prevState: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const { supabase, user } = await requireUser();

  const fullName = String(formData.get('fullName') ?? '').trim().slice(0, 120);
  const businessName = String(formData.get('businessName') ?? '').trim().slice(0, 120);

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName || null, business_name: businessName || null })
    .eq('id', user.id);

  if (error) {
    return { error: 'Could not save your changes. Please try again.' };
  }

  revalidatePath('/settings');
  return { success: true };
}
