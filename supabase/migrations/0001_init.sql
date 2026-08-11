-- MKJ Business AI — initial schema (canonical, matches what's applied to the
-- "Mkjbuismees" Supabase project). Safe to re-run against a fresh project.
--
-- Tables: profiles, conversations, messages, saved_outputs, usage_logs
-- All tables have RLS enabled; every policy scopes to (select auth.uid()).

create extension if not exists "pgcrypto";

-- ── profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  business_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free','pro','business')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check ((select auth.uid()) = id);

-- Auto-create a profile row when a new auth user signs up.
-- SECURITY DEFINER is required so the trigger can insert into public.profiles
-- on behalf of a brand-new user; execute is revoked from anon/authenticated
-- below so it can only run via the trigger, never as a direct RPC call.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.set_updated_at() from public;

-- ── conversations ───────────────────────────────────────────
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation',
  kind text not null default 'chat' check (kind in ('chat','tool')),
  tool_slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_user_id_idx on public.conversations(user_id, updated_at desc);

alter table public.conversations enable row level security;

create policy "conversations_select_own" on public.conversations
  for select using ((select auth.uid()) = user_id);
create policy "conversations_insert_own" on public.conversations
  for insert with check ((select auth.uid()) = user_id);
create policy "conversations_update_own" on public.conversations
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "conversations_delete_own" on public.conversations
  for delete using ((select auth.uid()) = user_id);

create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

-- ── messages ────────────────────────────────────────────────
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  model text,
  provider text,
  tokens_estimate integer,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on public.messages(conversation_id, created_at asc);

alter table public.messages enable row level security;

create policy "messages_select_own" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = (select auth.uid())
    )
  );
create policy "messages_insert_own" on public.messages
  for insert with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = (select auth.uid())
    )
  );
create policy "messages_delete_own" on public.messages
  for delete using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = (select auth.uid())
    )
  );

-- Keep conversations.updated_at fresh whenever a message is added.
create or replace function public.touch_conversation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();

revoke execute on function public.touch_conversation() from public;

-- ── saved_outputs (business tools results users choose to keep) ─
create table if not exists public.saved_outputs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_slug text not null,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists saved_outputs_user_id_idx on public.saved_outputs(user_id, created_at desc);

alter table public.saved_outputs enable row level security;

create policy "saved_outputs_select_own" on public.saved_outputs
  for select using ((select auth.uid()) = user_id);
create policy "saved_outputs_insert_own" on public.saved_outputs
  for insert with check ((select auth.uid()) = user_id);
create policy "saved_outputs_delete_own" on public.saved_outputs
  for delete using ((select auth.uid()) = user_id);

-- ── usage_logs (lightweight usage/cost tracking) ───────────────
create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('chat','tool')),
  provider text,
  model text,
  tokens_estimate integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists usage_logs_user_id_idx on public.usage_logs(user_id, created_at desc);

alter table public.usage_logs enable row level security;

create policy "usage_logs_select_own" on public.usage_logs
  for select using ((select auth.uid()) = user_id);
create policy "usage_logs_insert_own" on public.usage_logs
  for insert with check ((select auth.uid()) = user_id);
