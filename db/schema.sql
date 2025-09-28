-- SUPABASE REPAIR SCHEMA (bigint IDs) -------------------------------------------------
-- This script unifies all app tables to use bigint for IDs to match an existing
-- users(id bigint) table. It drops/recreates only app tables (not users).
-- Run in Supabase SQL Editor. If you have important data, back it up first.

begin;

-- 1) Drop dependent tables (safe if empty; preserves public.users)
drop table if exists public.notifications cascade;
drop table if exists public.messages cascade;
drop table if exists public.swipes cascade;
drop table if exists public.marketplace_items cascade;
drop table if exists public.matches cascade;
drop table if exists public.profiles cascade;

-- 2) Profiles (PK mirrors users.id type: bigint)
create table public.profiles (
  id bigint primary key references public.users(id) on delete cascade,
  display_name text,
  bio text,
  interests text[],
  avatar_url text,
  age integer,
  gender text,
  location text,
  preferences jsonb,
  social_links text[],
  updated_at timestamptz not null default now()
);

-- 3) Matches (unique per pair regardless of order)
create table public.matches (
  id bigint primary key generated always as identity,
  user1_id bigint not null references public.users(id) on delete cascade,
  user2_id bigint not null references public.users(id) on delete cascade,
  matched_at timestamptz not null default now(),
  status text not null default 'active', -- active, unmatched, blocked
  initiated_by bigint references public.users(id),
  confirmed boolean not null default false,
  -- Generated columns to enforce uniqueness regardless of order
  user_low_id bigint generated always as (least(user1_id, user2_id)) stored,
  user_high_id bigint generated always as (greatest(user1_id, user2_id)) stored,
  constraint matches_unique_pair_uk unique (user_low_id, user_high_id)
);

-- 4) Messages
create table public.messages (
  id bigint primary key generated always as identity,
  match_id bigint not null references public.matches(id) on delete cascade,
  sender_id bigint not null references public.users(id) on delete cascade,
  content text not null,
  type text not null default 'text', -- text, image, etc.
  deleted boolean not null default false,
  sent_at timestamptz not null default now()
);

create index messages_match_id_idx on public.messages(match_id, sent_at desc);
create index messages_sender_id_idx on public.messages(sender_id, sent_at desc);

-- 5) Marketplace items
create table public.marketplace_items (
  id bigint primary key generated always as identity,
  title text not null,
  description text,
  price numeric,
  category text,
  images text[], -- array of image URLs
  status text not null default 'active', -- active, sold, hidden
  seller_id bigint not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index marketplace_items_seller_idx on public.marketplace_items(seller_id, created_at desc);

-- 6) Swipes
create table public.swipes (
  id bigint primary key generated always as identity,
  swiper_id bigint not null references public.users(id) on delete cascade,
  swiped_id bigint not null references public.users(id) on delete cascade,
  direction text not null check (direction in ('left','right')),
  source text, -- e.g., 'profile', 'marketplace'
  swiped_at timestamptz not null default now()
);

-- Prevent duplicate swipes between same users
create unique index swipes_unique_idx on public.swipes(swiper_id, swiped_id);
create index swipes_swiped_idx on public.swipes(swiped_id, swiped_at desc);

-- 7) Notifications (FKs to matches/messages use bigint)
create table public.notifications (
  id bigint primary key generated always as identity,
  user_id bigint not null references public.users(id) on delete cascade,
  type text not null, -- e.g., 'match', 'message'
  message text,
  is_read boolean not null default false,
  related_match_id bigint references public.matches(id) on delete set null,
  related_message_id bigint references public.messages(id) on delete set null,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications(user_id, is_read, created_at desc);

-- 8) Automation: triggers for matches and notifications

-- When a right-swipe is reciprocal, create a match and notify both users
create or replace function public.handle_reciprocal_swipe() returns trigger as $$
declare
  existing_right boolean;
  m_id bigint;
  u_min bigint;
  u_max bigint;
begin
  if new.direction <> 'right' then
    return new;
  end if;

  -- Check for prior right swipe in opposite direction
  select exists (
    select 1 from public.swipes s
    where s.swiper_id = new.swiped_id
      and s.swiped_id = new.swiper_id
      and s.direction = 'right'
  ) into existing_right;

  if existing_right then
    -- Order users deterministically
    u_min := least(new.swiper_id, new.swiped_id);
    u_max := greatest(new.swiper_id, new.swiped_id);

    -- Create match if not present
  insert into public.matches(user1_id, user2_id, initiated_by, confirmed)
  values (u_min, u_max, new.swiper_id, true)
  on conflict on constraint matches_unique_pair_uk do nothing
    returning id into m_id;

    -- If match was newly created (m_id not null), notify both users
    if m_id is not null then
      insert into public.notifications(user_id, type, message, related_match_id)
      values
        (new.swiper_id, 'match', 'It\'s a match!', m_id),
        (new.swiped_id, 'match', 'It\'s a match!', m_id);
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_handle_reciprocal_swipe on public.swipes;
create trigger trg_handle_reciprocal_swipe
after insert on public.swipes
for each row execute function public.handle_reciprocal_swipe();

-- When a message is sent, notify the other participant
create or replace function public.notify_on_message() returns trigger as $$
declare
  other_user bigint;
  u1 bigint;
  u2 bigint;
begin
  select user1_id, user2_id into u1, u2 from public.matches where id = new.match_id;
  if u1 is null then
    return new; -- match not found; no-op
  end if;
  other_user := case when new.sender_id = u1 then u2 else u1 end;

  insert into public.notifications(user_id, type, message, related_match_id, related_message_id)
  values (other_user, 'message', 'New message received', new.match_id, new.id);

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_notify_on_message on public.messages;
create trigger trg_notify_on_message
after insert on public.messages
for each row execute function public.notify_on_message();

commit;

-- OPTIONAL (RLS): Enable row level security and add policies once you integrate Auth.
-- Supabase Auth typically uses auth.uid() (UUID). Since your users.id is bigint,
-- you should manage access at the API layer or map auth users to your users table.
-- Uncomment and adapt when ready.
-- alter table public.profiles enable row level security;
-- ... define policies ...
