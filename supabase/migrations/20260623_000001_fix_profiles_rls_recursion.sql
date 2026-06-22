-- Corrige a recursao causada por policies de profiles que chamavam is_admin(),
-- enquanto is_admin() consultava a propria tabela profiles.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_update_own_or_admin" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (user_id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid() and role = 'cliente');

-- Demais tabelas podem consultar is_admin(), pois a funcao e SECURITY DEFINER,
-- desliga RLS internamente e nao reentra nas policies de profiles.
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
with check (
  public.is_admin()
  or (
    user_id = auth.uid()
    and status in ('PEDIDO_CRIADO', 'AGUARDANDO_PAGAMENTO')
  )
);

drop policy if exists "deliveries_admin_update" on public.deliveries;
create policy "deliveries_admin_update"
on public.deliveries
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "pdf_files_select_own_or_admin" on public.pdf_files;
create policy "pdf_files_select_own_or_admin"
on public.pdf_files
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "pdf_files_admin_write" on public.pdf_files;
create policy "pdf_files_admin_write"
on public.pdf_files
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

notify pgrst, 'reload schema';

-- Execute separadamente, substituindo pelo e-mail real da Carol:
-- update public.profiles
-- set role = 'admin', updated_at = now()
-- where email = 'EMAIL_DA_CAROL';
