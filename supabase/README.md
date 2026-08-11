# Supabase

This app is wired to the Supabase project named **Mkjbuismees**
(`https://vjbeddrucltyfuekgvpx.supabase.co`).

`migrations/0001_init.sql` is the canonical schema already applied to that
project — 5 tables (`profiles`, `conversations`, `messages`, `saved_outputs`,
`usage_logs`), RLS enabled and enforced on every table, all policies scoped
to `(select auth.uid())`. Security and performance advisors both report zero
issues on this schema as of when it was written.

To apply it to a different/fresh Supabase project:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

or paste the file's contents into the Supabase SQL editor and run it once.

Don't hand-edit tables in the dashboard without also updating this file —
it's meant to stay the source of truth for the schema.
