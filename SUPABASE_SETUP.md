# Supabase - Carol Graber Numerologia

## Estrutura obrigatória

O projeto usa:

- `auth.users`: autenticação nativa do Supabase.
- `public.profiles`: vínculo entre usuário e papel `admin` ou `cliente`.
- `public.deliveries`: pedidos, dados do cliente, status e referência do PDF.
- `public.pdf_files`: histórico dos arquivos gerados.
- bucket privado `pdfs`: PDFs das entregas.
- bucket privado `carol-pdfs`: PDFs gerados na ferramenta interna de Perfis.

A estrutura, o gatilho de criação de perfil, a função segura do formulário e as políticas RLS estão em:

`supabase/migrations/20260622_000001_customer_admin_flow.sql`

## Aplicação

1. Execute primeiro `supabase/schema.sql` em um projeto novo.
2. Execute as migrations em ordem, incluindo `20260622_000001_customer_admin_flow.sql`.
3. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no ambiente do app.
4. Crie a conta da Carol pelo Auth e promova somente essa conta:

```sql
update public.profiles
set role = 'admin', updated_at = now()
where email = 'EMAIL_DA_CAROL';
```

## Segurança e fluxo

- Clientes podem ler somente seu perfil, seus pedidos e seus PDFs.
- Clientes podem criar pedidos próprios apenas nos status iniciais.
- Clientes não atualizam pagamento, status ou PDF diretamente.
- O formulário usa a RPC `submit_customer_delivery_data`, que aceita somente pedidos próprios e já liberados.
- Admins podem acompanhar e atualizar todos os pedidos e armazenar PDFs.
- Os buckets `pdfs` e `carol-pdfs` são privados; o app cria links assinados temporários.
- Nenhum bucket de PDF precisa ou deve ser público.

## Demonstração local

`VITE_DEMO_MODE=true` ativa dados locais somente para uma apresentação sem Supabase. Nesse modo, e-mails contendo `carol` ou `admin` entram como admin; outros e-mails entram como cliente. Esse modo não pode ser habilitado em produção.
