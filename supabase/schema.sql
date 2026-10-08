-- Keepin' It Very P — email list
-- Run this once in Supabase: SQL Editor → New query → paste → Run.

create table if not exists public.subscribers (
  id          bigint generated always as identity primary key,
  email       text not null unique check (email = lower(email) and length(email) <= 254),
  source      text not null default 'coming-soon',
  created_at  timestamptz not null default now()
);

-- Lock the table down. With RLS on and no policies, the public "anon" key
-- can't read or write it. Only the server (service role key, used by the
-- /api functions on Vercel) can.
alter table public.subscribers enable row level security;

create index if not exists subscribers_created_at_idx
  on public.subscribers (created_at desc);
