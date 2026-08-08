-- Kashmiri Gold — run this once in the Supabase SQL Editor.

create table if not exists public.waitlist (
  id          bigint generated always as identity primary key,
  email       text not null unique,
  source      text,
  created_at  timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id          bigint generated always as identity primary key,
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  created_at  timestamptz not null default now()
);

-- Lock both tables down. The API routes use the service role key,
-- which bypasses RLS, so nothing else can read or write these.
alter table public.waitlist enable row level security;
alter table public.contact_messages enable row level security;

-- No policies are created deliberately: with RLS on and no policies,
-- the public anon key has no access at all.