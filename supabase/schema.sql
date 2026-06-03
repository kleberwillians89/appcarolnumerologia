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
