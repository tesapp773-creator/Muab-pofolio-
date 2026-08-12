'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateProfile, type ProfileActionState } from '@/app/(dashboard)/settings/actions';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/Toaster';

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
    >
      {pending ? 'Saving…' : 'Save changes'}
    </button>
  );
}

export function ProfileForm({
  initialFullName,
  initialBusinessName,
  email,
}: {
  initialFullName: string;
  initialBusinessName: string;
  email: string;
}) {
  const [state, formAction] = useFormState<ProfileActionState, FormData>(updateProfile, {});
  const { push: toast } = useToast();

  useEffect(() => {
    if (state.success) toast('Profile updated.', 'success');
  }, [state.success, toast]);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-surface-muted bg-white p-4 sm:p-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
        <input
          disabled
          value={email}
          className="w-full rounded-xl border border-gray-200 bg-surface-subtle px-3.5 py-2.5 text-sm text-gray-500"
        />
      </div>
      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-gray-700">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          defaultValue={initialFullName}
          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none ring-brand-400 focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="businessName" className="mb-1.5 block text-sm font-medium text-gray-700">
          Business name
        </label>
        <input
          id="businessName"
          name="businessName"
          type="text"
          defaultValue={initialBusinessName}
          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none ring-brand-400 focus:ring-2"
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <SaveButton />
    </form>
  );
}
