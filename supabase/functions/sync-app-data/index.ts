import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const withoutSecrets = (value: Record<string, unknown>) => {
  const copy = { ...value };
  delete copy.password;
  return copy;
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Metodo nao permitido.' }, 405);

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Autenticacao obrigatoria.' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Configuracao segura da funcao ausente.' }, 500);

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const token = authorization.slice('Bearer '.length);
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return json({ error: 'Sessao Supabase invalida ou expirada.' }, 401);

  const { data: master, error: masterError } = await admin
    .from('app_users')
    .select('role, status')
    .eq('email', userData.user.email || '')
    .maybeSingle();
  if (masterError) return json({ error: `Falha ao validar permissao: ${masterError.message}` }, 500);
  if (master?.role !== 'MASTER' || master.status !== 'active') return json({ error: 'Apenas usuarios Master ativos podem sincronizar.' }, 403);

  const input = await request.json();
  const synced: Record<string, number> = {};
  const upsert = async (table: string, rows: Record<string, unknown>[]) => {
    if (!rows.length) return;
    const { error } = await admin.from(table).upsert(rows, { onConflict: 'id' });
    if (error) throw new Error(`${table}: ${error.message}`);
    synced[table] = rows.length;
  };

  try {
    await upsert('app_users', (input.users || []).map((user: Record<string, unknown>) => ({
      id: user.id, email: user.email, name: user.name, role: user.role,
      merchant_id: user.merchantId || null, status: user.status || 'active', city: user.city,
      phone: user.phone, membership_tier: user.membershipTier || null, data: withoutSecrets(user)
    })));
    await upsert('app_merchants', (input.merchants || []).map((merchant: Record<string, unknown>) => ({
      id: merchant.id, name: merchant.name, owner_user_id: null, category: merchant.category,
      status: merchant.status, city: merchant.city, data: merchant
    })));
    await upsert('app_products', (input.products || []).map((product: Record<string, unknown>) => ({
      id: product.id, merchant_id: product.merchantId, name: product.name, category: product.category,
      status: product.status, price: product.price, stock: product.stock, data: product
    })));
    await upsert('app_services', (input.services || []).map((service: Record<string, unknown>) => ({
      id: service.id, merchant_id: service.merchantId, title: service.title, category: service.category,
      status: service.status, price: service.price, data: service
    })));
    await upsert('app_orders', (input.orders || []).map((order: Record<string, unknown>) => ({
      id: order.id, code: order.code, customer_id: order.customerId || order.userId || null,
      merchant_id: order.merchantId, type: order.type, status: order.status,
      total_amount: order.totalAmount, data: order
    })));
    await upsert('app_notifications', (input.notifications || []).map((notification: Record<string, unknown>) => ({
      id: notification.id, recipient_user_id: notification.recipientUserId || null,
      recipient_merchant_id: notification.recipientMerchantId || null, channel: 'IN_APP',
      status: Array.isArray(notification.readBy) && notification.readBy.length ? 'READ' : 'PENDING',
      event_type: notification.category, data: notification
    })));
    await upsert('app_audit_logs', (input.auditLogs || []).map((log: Record<string, unknown>) => ({
      id: log.id, user_id: log.userId, user_role: log.userRole || null, action: log.action,
      entity_type: log.entityType || null, entity_id: log.entityId || null, severity: log.severity || null, data: log
    })));
    if (input.systemSettings) await upsert('app_settings', [{ id: 'global', data: input.systemSettings }]);
    return json({ ok: true, synced });
  } catch (error) {
    return json({ ok: false, synced, error: error instanceof Error ? error.message : 'Falha ao sincronizar dados.' }, 500);
  }
});