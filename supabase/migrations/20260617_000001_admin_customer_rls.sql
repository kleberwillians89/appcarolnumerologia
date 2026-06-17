create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null,
  email text,
  full_name text,
  name text,
  role text not null default 'cliente' check (role in ('admin', 'cliente')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.deliveries enable row level security;
alter table public.pdf_files enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "deliveries_select_own_or_admin" on public.deliveries;
create policy "deliveries_select_own_or_admin"
on public.deliveries
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "deliveries_insert_own_or_admin" on public.deliveries;
create policy "deliveries_insert_own_or_admin"
on public.deliveries
for insert
to authenticated
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "deliveries_update_own_or_admin" on public.deliveries;
create policy "deliveries_update_own_or_admin"
on public.deliveries
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "pdf_files_select_own_or_admin" on public.pdf_files;
create policy "pdf_files_select_own_or_admin"
on public.pdf_files
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "pdf_files_insert_own_or_admin" on public.pdf_files;
create policy "pdf_files_insert_own_or_admin"
on public.pdf_files
for insert
to authenticated
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "pdf_files_update_own_or_admin" on public.pdf_files;
create policy "pdf_files_update_own_or_admin"
on public.pdf_files
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());
