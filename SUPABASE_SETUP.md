npm run dev# Configuracao do Supabase

## 1. Credenciais

Preencha `.env.local` com a URL e a chave publica do projeto Supabase. Nunca coloque `service_role`, `sb_secret` ou outra chave secreta em variaveis `VITE_*`: elas sao enviadas ao navegador.

## 2. Schema

No Supabase Dashboard, abra **SQL Editor**, cole e execute nesta ordem:

1. `schema_multiloja.sql`
2. `supabase_app_schema.sql`
3. `supabase_migration_2026-09-04.sql`

A sincronizacao do painel Master exige que `supabase_app_schema.sql` seja executado
com uma conta administrativa no SQL Editor. Sem esse passo, a API retorna `PGRST205`
porque a tabela `app_settings` ainda nao existe.

O segundo script cria as tabelas `app_*` usadas pela sincronizacao do painel Master. A terceira migracao cria `notification_deliveries`, usada pelo servico de notificacoes, com RLS e indices.

## 3. Verificacao

Execute no SQL Editor:

```sql
select to_regclass('public.lojas') as lojas,
       to_regclass('public.produtos') as produtos,
    to_regclass('public.app_settings') as app_settings,
       to_regclass('public.notification_deliveries') as notificacoes;
```

O resultado esperado e uma linha com os quatro nomes preenchidos.

## Estado atual

O frontend usa `localStorage` como fonte principal para usuarios, lojas, produtos e pedidos. O botao de sincronizacao do painel Master envia um snapshot sob demanda, mas nao deve usar a chave publica do navegador para gravar diretamente nas tabelas de dominio.

Em producao, a escrita deve ser executada por uma Edge Function ou backend autenticado com `service_role`. A chave publica configurada em `VITE_SUPABASE_PUBLISHABLE_KEY` deve permanecer no frontend apenas para leitura permitida pelo RLS.

## Diagnostico verificado em 2026-09-05

A URL e a chave publica configuradas em `.env.local` respondem corretamente. A API retornou `PGRST205` para `public.app_settings`, indicando que o schema da aplicacao ainda nao foi aplicado neste projeto. Execute `supabase_app_schema.sql` no SQL Editor e depois `supabase_migration_2026-09-04.sql`.

Depois disso, o botao **Sincronizacao oficial Master** ainda retornara bloqueio de escrita se for executado diretamente pelo navegador. Para persistencia completa, publique uma Edge Function autenticada e mova a chamada de `syncAppDataToSupabase` para essa funcao.

O login Master atual ainda usa `VITE_MASTER_PASSWORD` no frontend. Essa configuracao e apenas temporaria para o prototipo: qualquer segredo em `VITE_*` fica visivel no navegador. Antes de producao, migre esse login para Supabase Auth ou para uma Edge Function e remova a senha do `.env.local` publico.
