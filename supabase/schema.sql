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

-- ──────────────── Added: forever links, 7-day edits, passwords ────────────────
-- Gifts never expire now. expires_at stays for old rows but is no longer set.
alter table public.gifts alter column expires_at drop not null;
update public.gifts set expires_at = null where status = 'live';
drop index if exists gifts_expiring_idx;

-- The sender can change a live gift until this moment (7 days after it went live).
alter table public.gifts add column if not exists edit_until timestamptz;
update public.gifts set edit_until = created_at + interval '7 days' where edit_until is null;
alter table public.gifts add column if not exists updated_at timestamptz;

-- Optional password. Only a salted hash is kept, and only the server can read it.
alter table public.gifts add column if not exists password_hash text;
alter table public.gifts add column if not exists has_password boolean
  generated always as (password_hash is not null) stored;

-- Senders read their own gifts from the browser, but never the password hash.
revoke select on public.gifts from authenticated;
grant select (
  id, owner_id, slug, template_slug, name, recipient, sender, story, palette, media_folder,
  status, price_paise, paid, unlock_at, expires_at, created_at, schema_version,
  open_count, first_opened_at, last_opened_at, edit_until, updated_at, has_password
) on public.gifts to authenticated;

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
     and unlock_at <= now();
$$;
revoke execute on function public.record_gift_open(text) from public, anon, authenticated;

-- ─────────────────────────── Drafts ───────────────────────────
-- Gifts in progress, for signed-in senders (everyone also keeps a copy on
-- their device). `data` is the whole draft; its photos are links into
-- gift-media/<user id>/drafts/. Removed when the gift goes live, or after 60
-- days untouched (see /api/cron/expire).
create table if not exists public.drafts (
  id            text primary key,
  user_id       uuid not null references auth.users (id) on delete cascade,
  template_slug text not null,
  name          text not null,
  recipient     text,
  data          jsonb not null,
  updated_at    timestamptz not null default now()
);

create index if not exists drafts_user_updated on public.drafts (user_id, updated_at desc);

alter table public.drafts enable row level security;

drop policy if exists "People manage their own drafts" on public.drafts;
create policy "People manage their own drafts"
  on public.drafts for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ─────────────────────────── Payments ───────────────────────────
-- Razorpay: the order and payment behind each paid gift. The order id is
-- unique, so one payment can't publish two gifts.
alter table public.gifts add column if not exists razorpay_order_id text;
alter table public.gifts add column if not exists razorpay_payment_id text;
create unique index if not exists gifts_razorpay_order_id_key on public.gifts (razorpay_order_id);

-- Every Razorpay payment we've been told about (by the checkout or by
-- Razorpay's webhook), and the gift it paid for. A paid row with no gift
-- means someone paid but their gift never saved: they can finish it without
-- paying again, or be refunded. Server-only: no browser access.
create table if not exists public.payments (
  order_id      text primary key,
  payment_id    text,
  user_id       uuid references auth.users (id) on delete set null,
  template_slug text,
  amount_paise  integer not null,
  status        text not null default 'paid',
  gift_slug     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists payments_unused on public.payments (user_id, template_slug) where gift_slug is null;
alter table public.payments enable row level security;

-- ─────────────────────────── Rate limits ───────────────────────────
-- Recent attempts at things worth throttling (gift passwords, the contact
-- form, song lookups). Keys hold a keyed hash of the IP address, never the IP
-- itself. Rows older than a day are deleted by the daily cron. Server-only.
create table if not exists public.rate_events (
  key text        not null,
  at  timestamptz not null default now()
);
create index if not exists rate_events_key_at on public.rate_events (key, at desc);
alter table public.rate_events enable row level security;

-- One attempt: true if it's within the limit (and records it), false if not.
create or replace function public.rate_limit_hit(p_key text, p_window_seconds integer, p_max integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  -- One attempt at a time per key, so parallel requests can't slip past the count.
  perform pg_advisory_xact_lock(hashtext(p_key));
  select count(*) into n
    from public.rate_events
   where key = p_key
     and at > now() - make_interval(secs => p_window_seconds);
  if n >= p_max then
    return false;
  end if;
  insert into public.rate_events (key) values (p_key);
  return true;
end;
$$;
revoke execute on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;

-- Draft photos nobody uses any more: older than 60 days, and in no gift and no draft.
create or replace function public.stale_draft_media()
returns setof text
language sql
security definer
set search_path = ''
as $$
  select o.name
    from storage.objects o
   where o.bucket_id = 'gift-media'
     and o.name like '%/drafts/%'
     and o.created_at < now() - interval '60 days'
     and not exists (select 1 from public.gifts g where g.story::text like '%' || o.name || '%')
     and not exists (select 1 from public.drafts d where d.data::text like '%' || o.name || '%')
   limit 500;
$$;
revoke execute on function public.stale_draft_media() from public, anon, authenticated;

-- People can correct the name we show on their profile (not just their sign-off).
grant update (display_name) on public.profiles to authenticated;
