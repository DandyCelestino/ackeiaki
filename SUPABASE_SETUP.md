# Configuracao do Supabase

## 1. Credenciais

Preencha `.env.local` com a URL e a chave publica do projeto Supabase. Nunca coloque `service_role`, `sb_secret` ou outra chave secreta em variaveis `VITE_*`: elas sao enviadas ao navegador.

## 2. Schema

No Supabase Dashboard, abra **SQL Editor**, cole e execute nesta ordem:

1. `schema_multiloja.sql`
2. `supabase_migration_2026-09-04.sql`

A segunda migracao cria `notification_deliveries`, usada pelo servico de notificacoes, com RLS e indices.

## 3. Verificacao

Execute no SQL Editor:

```sql
select to_regclass('public.lojas') as lojas,
       to_regclass('public.produtos') as produtos,
       to_regclass('public.notification_deliveries') as notificacoes;
```

O resultado esperado e uma linha com os tres nomes preenchidos.

## Estado atual

O frontend usa `localStorage` como fonte principal para usuarios, lojas, produtos e pedidos. O Supabase esta preparado para persistencia de notificacoes, mas ainda nao substitui automaticamente esses dados locais. Para migrar o sistema inteiro, e necessario criar uma camada de repositorio que leia e grave essas entidades no banco, com autenticacao Supabase e politicas RLS por loja.

O botao de sincronizacao do painel Master faz a verificacao do schema e tenta enviar o snapshot atual. Em producao, a escrita das tabelas de dominio deve ser movida para uma Edge Function autenticada com `service_role`; a chave publica do navegador deve permanecer somente com permissao de leitura/catalogo.

## Diagnostico observado

A URL configurada `https://xootmi7yjqr7.supabase.co` nao respondeu por DNS no ambiente local. Confirme no Dashboard se o projeto ainda existe e copie novamente a URL em **Project Settings > API**. Depois reinicie `npm run dev`.
