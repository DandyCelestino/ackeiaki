-- Configuracao segura do perfil Master no Supabase.
-- Execute depois de criar o usuario em Authentication > Users.
-- A senha deve ser definida pelo Supabase Auth; nunca grave senha em app_users.

INSERT INTO public.app_users (
  id, email, name, role, status, city, phone, data
)
SELECT
  id::text,
  email,
  COALESCE(raw_user_meta_data->>'name', 'Administrador Master'),
  'MASTER',
  'active',
  'Cachoeiras de Macacu, RJ',
  COALESCE(raw_user_meta_data->>'phone', ''),
  jsonb_build_object('source', 'supabase_auth', 'role', 'MASTER')
FROM auth.users
WHERE lower(email) = lower('telecom.david@gmail.com')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = 'MASTER',
  status = 'active',
  data = public.app_users.data || jsonb_build_object('role', 'MASTER');

-- Verificacao: deve retornar exatamente uma linha com role MASTER.
SELECT id, email, role, status
FROM public.app_users
WHERE lower(email) = lower('telecom.david@gmail.com');
