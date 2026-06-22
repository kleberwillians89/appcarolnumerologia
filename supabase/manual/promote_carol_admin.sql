-- Substitua EMAIL_DA_CAROL pelo e-mail exato cadastrado em Authentication > Users.
-- Este script nao le, altera ou exibe senha.

begin;

select id, email, created_at
from auth.users
where lower(email) = lower('EMAIL_DA_CAROL');

update public.profiles
set role = 'admin', updated_at = now()
where lower(email) = lower('EMAIL_DA_CAROL')
  and exists (
    select 1
    from auth.users u
    where u.id = public.profiles.user_id
      and lower(u.email) = lower('EMAIL_DA_CAROL')
  );

select user_id, email, role, updated_at
from public.profiles
where lower(email) = lower('EMAIL_DA_CAROL');

commit;
