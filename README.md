# Carol Graber Numerologia

Plataforma Vite + React para produtos numerologicos da Carol Graber.

- Site institucional: `carolgraber.com.br`
- App/plataforma: `app.carolgraber.com.br`

## Configuracao local

Crie um arquivo `.env.local` na raiz do projeto:

```bash
cp .env.example .env.local
```

Preencha:

```bash
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY
VITE_ENABLE_GOOGLE_SHEETS_SYNC=false
VITE_ENABLE_WHATSAPP_MOCK=true
VITE_APP_URL=https://app.carolgraber.com.br
VITE_WHATSAPP_URL=
```

As chaves ficam apenas em `.env.local`. Nao coloque chaves reais no codigo.

## Supabase

O app espera estas estruturas:

- `profiles`
- `deliveries`
- `pdf_files`
- `app_settings`
- bucket privado `pdfs`

O frontend usa a `anon key`, entao as regras de RLS precisam proteger os dados:

- Admin ve todas as entregas.
- Cliente ve apenas entregas com `user_id = auth.uid()`.
- Cliente nao deve alterar campos internos como `status`, `link_pdf`, `observacoes_carol` e `data_envio`.

## Criar usuario admin da Carol

1. Crie a conta no Supabase Auth.
2. Na tabela `profiles`, garanta um registro com:

```text
user_id = id do usuario Auth
email = email da Carol
full_name = Carol Graber
role = admin
```

Usuarios criados pela tela "Criar acesso" entram como `cliente`.

## Rodar local

```bash
npm install
npm run dev
```

Acesse a URL indicada pelo Vite.

## Testar login admin

1. Configure `.env.local`.
2. Crie o usuario admin no Supabase.
3. Entre em `/login`.
4. Use e-mail e senha do Supabase Auth.
5. O admin deve ver: Mapa, Ano Pessoal, Perfis, Entregas e Configuracoes.

## Testar login cliente

1. Entre em `/login`.
2. Clique em "Criar acesso, se for cliente".
3. Cadastre nome, e-mail e senha.
4. Depois do login, o cliente deve ver "Minha area".
5. Preencha nome, telefone, data de nascimento, produto e observacoes.
6. A entrega deve ser criada/atualizada em `deliveries` com `user_id` do usuario logado.

## Entregas

Admin:

- Le entregas reais do Supabase quando `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` existem.
- Usa fallback local apenas quando Supabase nao esta configurado ou em `DEV_MODE`.
- Gera PDF pelo fluxo atual.
- Tenta fazer upload no bucket privado `pdfs`.
- Salva `link_pdf`, `file_name`, `pdf_storage_path` e status `PDF_GERADO`.
- Registra `pdf_files` quando possivel.

Cliente:

- Busca apenas entregas do usuario logado.
- Mostra status, dados preenchidos e link assinado do PDF quando existir.

## Google Sheets

Na aba Configuracoes, salve:

- URL do Webhook Google Sheets
- Ativar envio para Google Sheets

Para envio real:

```bash
VITE_ENABLE_GOOGLE_SHEETS_SYNC=true
```

Com a flag desligada, o service apenas simula/ignora o envio real.

## WhatsApp

Por enquanto, o WhatsApp real continua mockado:

```bash
VITE_ENABLE_WHATSAPP_MOCK=true
```

O frontend nunca deve guardar token do WhatsApp Cloud API. A integracao real precisa entrar depois por backend/API segura.

## Ainda mockado/preparado

- WhatsApp API real.
- Pagamento Mercado Pago.
- Upload final de PDF depende do bucket `pdfs` e politicas RLS/Storage estarem corretos.

## Build

```bash
npm run build
```
