create extension if not exists pgcrypto;

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  nome text not null,
  telefone text,
  telefone_normalizado text,
  email text,
  produto text not null,
  tipo_produto text,
  data_nascimento date,
  status text not null default 'DADOS_RECEBIDOS',
  origem text not null default 'plataforma',
  observacoes_cliente text default '',
  observacoes_carol text default '',
  link_pdf text,
  pdf_data_url text,
  pdf_storage_path text,
  file_name text,
  dados_cliente jsonb default '{}'::jsonb,
  dados_numerologicos jsonb default '{}'::jsonb,
  data_criacao timestamptz default now(),
  data_envio timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.pdf_files (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid references public.deliveries(id) on delete cascade,
  user_id uuid,
  file_name text,
  storage_path text,
  signed_url text,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text,
  full_name text,
  name text,
  role text not null default 'cliente' check (role in ('admin', 'cliente')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists user_id uuid,
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists name text,
  add column if not exists role text default 'cliente',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.profiles p
set user_id = p.id
where p.user_id is null
  and exists (select 1 from auth.users u where u.id = p.id);

create unique index if not exists profiles_user_id_key on public.profiles(user_id);

alter table public.deliveries
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.pdf_files
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.deliveries
  add column if not exists pdf_data_url text,
  add column if not exists pdf_storage_path text,
  add column if not exists file_name text,
  add column if not exists dados_cliente jsonb default '{}'::jsonb,
  add column if not exists dados_numerologicos jsonb default '{}'::jsonb,
  add column if not exists updated_at timestamptz default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'deliveries_user_id_fkey' and conrelid = 'public.deliveries'::regclass) then
    alter table public.deliveries
      add constraint deliveries_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'pdf_files_user_id_fkey' and conrelid = 'public.pdf_files'::regclass) then
    alter table public.pdf_files
      add constraint pdf_files_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email),
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', new.email),
    'cliente'
  )
  on conflict (user_id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    name = coalesce(public.profiles.name, excluded.name),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email, raw_user_meta_data on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (user_id, email, full_name, name, role)
select
  id,
  email,
  coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', email),
  coalesce(raw_user_meta_data ->> 'name', raw_user_meta_data ->> 'full_name', email),
  'cliente'
from auth.users
on conflict (user_id) do nothing;

alter table public.profiles enable row level security;
alter table public.deliveries enable row level security;
alter table public.pdf_files enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and role = 'cliente');

drop policy if exists "deliveries_select_own_or_admin" on public.deliveries;
create policy "deliveries_select_own_or_admin" on public.deliveries
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "deliveries_insert_own_or_admin" on public.deliveries;
create policy "deliveries_insert_own_or_admin" on public.deliveries
  for insert to authenticated
  with check (
    public.is_admin()
    or (user_id = auth.uid() and status in ('PEDIDO_CRIADO', 'AGUARDANDO_PAGAMENTO'))
  );

drop policy if exists "deliveries_admin_update" on public.deliveries;
create policy "deliveries_admin_update" on public.deliveries
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "pdf_files_select_own_or_admin" on public.pdf_files;
create policy "pdf_files_select_own_or_admin" on public.pdf_files
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "pdf_files_admin_write" on public.pdf_files;
create policy "pdf_files_admin_write" on public.pdf_files
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.submit_customer_delivery_data(
  p_delivery_id uuid,
  p_nome text,
  p_telefone text,
  p_telefone_normalizado text,
  p_email text,
  p_data_nascimento date,
  p_observacoes_cliente text,
  p_dados_cliente jsonb
)
returns setof public.deliveries
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Sessao obrigatoria';
  end if;

  return query
  update public.deliveries
  set
    nome = trim(p_nome),
    telefone = p_telefone,
    telefone_normalizado = p_telefone_normalizado,
    email = p_email,
    data_nascimento = p_data_nascimento,
    observacoes_cliente = coalesce(p_observacoes_cliente, ''),
    dados_cliente = coalesce(p_dados_cliente, '{}'::jsonb),
    status = 'DADOS_RECEBIDOS',
    updated_at = now()
  where id = p_delivery_id
    and user_id = auth.uid()
    and status in ('PAGAMENTO_CONFIRMADO', 'AGUARDANDO_DADOS', 'PAGO')
  returning *;

  if not found then
    raise exception 'Pedido nao encontrado ou formulario ainda nao liberado';
  end if;
end;
$$;

revoke all on function public.submit_customer_delivery_data(uuid, text, text, text, text, date, text, jsonb) from public;
grant execute on function public.submit_customer_delivery_data(uuid, text, text, text, text, date, text, jsonb) to authenticated;

insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', false)
on conflict (id) do update set public = false;

insert into storage.buckets (id, name, public)
values ('carol-pdfs', 'carol-pdfs', false)
on conflict (id) do update set public = false;

drop policy if exists "pdfs_read_own_or_admin" on storage.objects;
create policy "pdfs_read_own_or_admin" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'pdfs'
    and (
      public.is_admin()
      or exists (
        select 1 from public.deliveries d
        where d.user_id = auth.uid()
          and d.pdf_storage_path = storage.objects.name
      )
    )
  );

drop policy if exists "pdfs_admin_insert" on storage.objects;
create policy "pdfs_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pdfs' and public.is_admin());

drop policy if exists "pdfs_admin_update" on storage.objects;
create policy "pdfs_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'pdfs' and public.is_admin())
  with check (bucket_id = 'pdfs' and public.is_admin());

drop policy if exists "carol_pdfs_admin_read" on storage.objects;
create policy "carol_pdfs_admin_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'carol-pdfs' and public.is_admin());

drop policy if exists "carol_pdfs_admin_insert" on storage.objects;
create policy "carol_pdfs_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'carol-pdfs' and public.is_admin());

drop policy if exists "carol_pdfs_admin_update" on storage.objects;
create policy "carol_pdfs_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'carol-pdfs' and public.is_admin())
  with check (bucket_id = 'carol-pdfs' and public.is_admin());
