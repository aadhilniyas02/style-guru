-- StyleGuru Database Schema
-- Safe to re-run — drops existing policies before recreating them
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run

-- ── profiles ─────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text not null,
  skin_tone   text check (skin_tone in ('fair', 'medium', 'tan', 'dark')),
  body_type   text check (body_type in ('slim', 'average', 'athletic', 'broad')),
  created_at  timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Users can read own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── wardrobe_items ────────────────────────────────────────────────────────────
create table if not exists wardrobe_items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  photo_url      text not null,
  clothing_type  text check (clothing_type in ('shirt', 'tshirt', 'trousers', 'shorts', 'shoes', 'jacket', 'traditional', 'innerwear', 'dress', 'accessory')),
  primary_category text check (primary_category in ('shirt', 'tshirt', 'trousers', 'shorts', 'shoes', 'jacket', 'traditional', 'innerwear', 'dress', 'accessory')),
  specific_label text,
  colors         text[] default '{}',
  formality      text check (formality in ('casual', 'smart-casual', 'formal')),
  pattern        text check (pattern in ('plain', 'striped', 'checked', 'printed')),
  season         text check (season in ('all', 'summer', 'winter')) default 'all',
  tags           text[] default '{}',
  created_at     timestamptz default now()
);

alter table wardrobe_items enable row level security;

drop policy if exists "Users can read own wardrobe" on wardrobe_items;
drop policy if exists "Users can insert own wardrobe items" on wardrobe_items;
drop policy if exists "Users can delete own wardrobe items" on wardrobe_items;

create policy "Users can read own wardrobe"
  on wardrobe_items for select using (auth.uid() = user_id);
create policy "Users can insert own wardrobe items"
  on wardrobe_items for insert with check (auth.uid() = user_id);
create policy "Users can delete own wardrobe items"
  on wardrobe_items for delete using (auth.uid() = user_id);

-- ── outfit_suggestions ────────────────────────────────────────────────────────
create table if not exists outfit_suggestions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  occasion     text not null,
  item_ids     uuid[] default '{}',
  feedback     text check (feedback in ('liked', 'disliked')),
  weather_temp integer,
  created_at   timestamptz default now()
);

alter table outfit_suggestions enable row level security;

drop policy if exists "Users can read own suggestions" on outfit_suggestions;
drop policy if exists "Users can insert own suggestions" on outfit_suggestions;
drop policy if exists "Users can update own suggestions" on outfit_suggestions;

create policy "Users can read own suggestions"
  on outfit_suggestions for select using (auth.uid() = user_id);
create policy "Users can insert own suggestions"
  on outfit_suggestions for insert with check (auth.uid() = user_id);
create policy "Users can update own suggestions"
  on outfit_suggestions for update using (auth.uid() = user_id);
