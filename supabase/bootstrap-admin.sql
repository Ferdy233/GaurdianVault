-- Guardian Vault :: create your first admin
--
-- 1. Supabase Dashboard -> Authentication -> Users -> "Add user"
--    Email: admin@guardianvault.com  (use your own)
--    Password: pick a strong one, and tick "Auto Confirm User".
-- 2. Run the statement below (edit the email + name first).

insert into public.profiles (id, email, full_name, role, status)
select u.id, u.email, 'Vault Administrator', 'admin', 'active'
from auth.users u
where u.email = 'Richlove764366@yahoo.com'
on conflict (id) do update
  set role = 'admin',
      status = 'active',
      full_name = excluded.full_name;
