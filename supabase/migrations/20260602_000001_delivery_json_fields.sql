create extension if not exists pgcrypto;

alter table public.deliveries
alter column id set default gen_random_uuid();

alter table public.deliveries
add column if not exists user_id uuid;

alter table public.deliveries
add column if not exists link_pdf text;

alter table public.deliveries
add column if not exists pdf_data_url text;

alter table public.deliveries
add column if not exists pdf_storage_path text;

alter table public.deliveries
add column if not exists file_name text;

alter table public.deliveries
add column if not exists tipo_produto text;

alter table public.deliveries
add column if not exists dados_numerologicos jsonb default '{}'::jsonb;

alter table public.deliveries
add column if not exists dados_cliente jsonb default '{}'::jsonb;

notify pgrst, 'reload schema';
