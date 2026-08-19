-- Guardian Vault :: database schema
-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles: one row per auth user. Created by an admin, never self-signup.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  full_name     text not null default '',
  phone         text,
  role          text not null default 'customer' check (role in ('customer', 'admin')),
  status        text not null default 'active'   check (status in ('active', 'suspended')),
  client_ref    text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- What the customer is allowed to see on their dashboard (admin controlled).
-- ---------------------------------------------------------------------------
create table if not exists public.dashboard_settings (
  customer_id       uuid primary key references public.profiles (id) on delete cascade,
  welcome_message   text not null default 'Welcome to your Guardian Vault.',
  show_values       boolean not null default true,
  show_documents    boolean not null default true,
  show_activity     boolean not null default true,
  show_boxes        boolean not null default true,
  support_contact   text not null default 'guardianvault@meruado.uk',
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Physical vault boxes assigned to a customer.
-- ---------------------------------------------------------------------------
create table if not exists public.vault_boxes (
  id                  uuid primary key default gen_random_uuid(),
  customer_id         uuid not null references public.profiles (id) on delete cascade,
  box_number          text not null,
  branch              text not null default 'Head Office',
  size                text not null default 'medium' check (size in ('small', 'medium', 'large', 'custom')),
  status              text not null default 'active' check (status in ('active', 'closed', 'pending')),
  visible_to_customer boolean not null default true,
  opened_at           date not null default current_date,
  renewal_at          date,
  created_at          timestamptz not null default now()
);

create index if not exists vault_boxes_customer_idx on public.vault_boxes (customer_id);

-- ---------------------------------------------------------------------------
-- Items held inside a box. `visible_to_customer` is the admin's kill switch.
-- ---------------------------------------------------------------------------
create table if not exists public.vault_items (
  id                  uuid primary key default gen_random_uuid(),
  customer_id         uuid not null references public.profiles (id) on delete cascade,
  box_id              uuid references public.vault_boxes (id) on delete set null,
  name                text not null,
  category            text not null default 'other'
                        check (category in ('jewellery', 'documents', 'cash', 'metals', 'collectibles', 'electronics', 'other')),
  description         text,
  quantity            integer not null default 1 check (quantity > 0),
  estimated_value     numeric(14, 2),
  currency            text not null default 'USD',
  status              text not null default 'stored' check (status in ('stored', 'withdrawn', 'pending', 'in_transit')),
  visible_to_customer boolean not null default true,
  media_path          text,
  deposited_at        date not null default current_date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists vault_items_customer_idx on public.vault_items (customer_id);
create index if not exists vault_items_box_idx on public.vault_items (box_id);

-- ---------------------------------------------------------------------------
-- Activity feed shown to the customer (entries are written by admins/system).
-- ---------------------------------------------------------------------------
create table if not exists public.activity_log (
  id                  uuid primary key default gen_random_uuid(),
  customer_id         uuid not null references public.profiles (id) on delete cascade,
  actor_id            uuid references public.profiles (id) on delete set null,
  action              text not null,
  detail              text,
  visible_to_customer boolean not null default true,
  created_at          timestamptz not null default now()
);

create index if not exists activity_log_customer_idx on public.activity_log (customer_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Helper: is the current session an admin? SECURITY DEFINER avoids RLS
-- recursion when policies on `profiles` need to check the role.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
  );
$$;

-- Auto-create dashboard settings whenever a profile is created.
create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.dashboard_settings (customer_id)
  values (new.id)
  on conflict (customer_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
after insert on public.profiles
for each row execute function public.handle_new_profile();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.dashboard_settings enable row level security;
alter table public.vault_boxes        enable row level security;
alter table public.vault_items        enable row level security;
alter table public.activity_log       enable row level security;

-- profiles
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_admin_write" on public.profiles;
create policy "profiles_admin_write" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- dashboard_settings
drop policy if exists "settings_select_self_or_admin" on public.dashboard_settings;
create policy "settings_select_self_or_admin" on public.dashboard_settings
  for select using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "settings_admin_write" on public.dashboard_settings;
create policy "settings_admin_write" on public.dashboard_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- vault_boxes
drop policy if exists "boxes_select_visible_own_or_admin" on public.vault_boxes;
create policy "boxes_select_visible_own_or_admin" on public.vault_boxes
  for select using (
    public.is_admin()
    or (customer_id = auth.uid() and visible_to_customer)
  );

drop policy if exists "boxes_admin_write" on public.vault_boxes;
create policy "boxes_admin_write" on public.vault_boxes
  for all using (public.is_admin()) with check (public.is_admin());

-- vault_items
drop policy if exists "items_select_visible_own_or_admin" on public.vault_items;
create policy "items_select_visible_own_or_admin" on public.vault_items
  for select using (
    public.is_admin()
    or (customer_id = auth.uid() and visible_to_customer)
  );

drop policy if exists "items_admin_write" on public.vault_items;
create policy "items_admin_write" on public.vault_items
  for all using (public.is_admin()) with check (public.is_admin());

-- activity_log
drop policy if exists "activity_select_visible_own_or_admin" on public.activity_log;
create policy "activity_select_visible_own_or_admin" on public.activity_log
  for select using (
    public.is_admin()
    or (customer_id = auth.uid() and visible_to_customer)
  );

drop policy if exists "activity_admin_write" on public.activity_log;
create policy "activity_admin_write" on public.activity_log
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Private storage bucket for item photos / scanned documents.
-- Object paths are always: <customer_id>/<item_id>/<filename>
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('vault-media', 'vault-media', false)
on conflict (id) do nothing;

drop policy if exists "vault_media_admin_all" on storage.objects;
create policy "vault_media_admin_all" on storage.objects
  for all using (bucket_id = 'vault-media' and public.is_admin())
  with check (bucket_id = 'vault-media' and public.is_admin());

drop policy if exists "vault_media_customer_read_own" on storage.objects;
create policy "vault_media_customer_read_own" on storage.objects
  for select using (
    bucket_id = 'vault-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
