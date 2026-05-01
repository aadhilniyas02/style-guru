-- Fix FK constraints on existing tables
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run

-- ── Fix wardrobe_items FK ─────────────────────────────────────────────────────
alter table wardrobe_items
  drop constraint if exists wardrobe_items_user_id_fkey;

alter table wardrobe_items
  add constraint wardrobe_items_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

-- ── Fix outfit_suggestions FK ─────────────────────────────────────────────────
alter table outfit_suggestions
  drop constraint if exists outfit_suggestions_user_id_fkey;

alter table outfit_suggestions
  add constraint outfit_suggestions_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

-- ── Auto-create profile on signup (trigger) ───────────────────────────────────
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

-- ── Ensure existing users have a profile row ──────────────────────────────────
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;
