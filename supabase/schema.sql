-- TyniTales database setup.
-- Paste this whole file into Supabase → SQL Editor → New query, then press Run.
-- Safe to run more than once.

-- ─────────────────────────── Gifts ───────────────────────────
-- One row per published gift. Gifts are written only by the server (with the
-- secret key) and can't be changed after they go live.
create table if not exists public.gifts (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references auth.users (id) on delete cascade,
  -- The public link: tynitales.gift/for/<slug>, e.g. "maya-k3x9p2".
  slug            text not null unique,
  template_slug   text not null,
  name            text not null,
  recipient       text not null,
  sender          text not null,
  -- The whole gift (pages, words, photo links). Cleared when the gift expires.
  story           jsonb,
  -- Accent colours, kept after expiry so the "wrapped up" page still matches.
  palette         jsonb not null default '{}'::jsonb,
  -- Storage folder holding this gift's photos and songs: "<owner_id>/<uuid>".
  media_folder    text,
  status          text not null default 'live' check (status in ('live', 'expired')),
  price_paise     integer not null,
  paid            boolean not null default false,
  unlock_at       timestamptz not null default now(),
  expires_at      timestamptz not null,
  created_at      timestamptz not null default now()
);

create index if not exists gifts_owner_idx on public.gifts (owner_id, created_at desc);
create index if not exists gifts_expiring_idx on public.gifts (expires_at) where status = 'live';

alter table public.gifts enable row level security;

-- Senders can see their own gifts (for the "My gifts" page). Nobody can list
-- anyone else's. Recipients read a single gift through the server instead.
drop policy if exists "Owners can read their gifts" on public.gifts;
create policy "Owners can read their gifts"
  on public.gifts for select
  to authenticated
  using ((select auth.uid()) = owner_id);

-- ─────────────────────── Photos & songs ───────────────────────
-- Public bucket: files have long random paths, so only someone with the gift
-- link can find them. 5 MB per file; images and audio only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gift-media',
  'gift-media',
  true,
  5242880,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/wav', 'audio/x-wav',
    'audio/ogg', 'audio/webm', 'audio/flac', 'audio/opus'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Signed-in senders can upload only into their own folder ("<their id>/...").
drop policy if exists "Senders upload to their own folder" on storage.objects;
create policy "Senders upload to their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'gift-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ──────────────────── Added: versions & opens ────────────────────
-- Which version of the gift pages a gift was made with (see GIFT_SCHEMA_VERSION).
alter table public.gifts add column if not exists schema_version integer not null default 1;
-- How often the recipient has opened it (the sender's own opens aren't counted).
alter table public.gifts add column if not exists open_count integer not null default 0;
alter table public.gifts add column if not exists first_opened_at timestamptz;
alter table public.gifts add column if not exists last_opened_at timestamptz;

-- Counts an open. Only the server (secret key) may call it.
create or replace function public.record_gift_open(p_slug text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.gifts
     set open_count = open_count + 1,
         first_opened_at = coalesce(first_opened_at, now()),
         last_opened_at = now()
   where slug = p_slug
     and status = 'live'
     and unlock_at <= now()
     and expires_at > now();
$$;
revoke execute on function public.record_gift_open(text) from public, anon, authenticated;

-- ─────────────────────────── Profiles ───────────────────────────
-- One per account, filled from Google on first sign-in.
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text,
  avatar_url    text,
  -- How they sign their gifts ("From: …"); pre-fills new gifts.
  sign_off      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "People can read their own profile" on public.profiles;
create policy "People can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "People can update their own profile" on public.profiles;
create policy "People can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Only the sign-off can be edited from the browser. Names and photos come from Google.
revoke update on public.profiles from authenticated;
grant update (sign_off, updated_at) on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Profiles for anyone who signed in before this table existed.
insert into public.profiles (id, display_name, avatar_url)
select id,
       coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name'),
       coalesce(raw_user_meta_data ->> 'avatar_url', raw_user_meta_data ->> 'picture')
  from auth.users
on conflict (id) do nothing;
