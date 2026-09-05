import { supabase } from '../lib/supabase';
import { AuditLog, InAppNotification, Order, Product, ServiceItem, StoreMerchant, SystemSettings, User } from '../types';

export interface SupabaseSyncInput {
  users: User[];
  merchants: StoreMerchant[];
  products: Product[];
  services: ServiceItem[];
  orders: Order[];
  notifications?: InAppNotification[];
  auditLogs?: AuditLog[];
  systemSettings?: SystemSettings;
}

export interface SupabaseSyncResult {
  ok: boolean;
  synced: Record<string, number>;
  error?: string;
}

function withoutSecrets<T extends Record<string, unknown>>(value: T): T {
  const copy = { ...value };
  delete copy.password;
  return copy;
}

export async function syncAppDataToSupabase(input: SupabaseSyncInput): Promise<SupabaseSyncResult> {
  if (!supabase) {
    return { ok: false, synced: {}, error: 'Supabase nao configurado no .env.local.' };
  }

  const synced: Record<string, number> = {};
  const upsert = async (table: string, rows: Record<string, unknown>[]) => {
    if (rows.length === 0) return;
    const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
    if (error) throw new Error(`${table}: ${error.message}`);
    synced[table] = rows.length;
  };

  try {
    // A chave publica nao deve receber permissao de escrita nas tabelas de dominio.
    // A sincronizacao completa deve ser executada por uma Edge Function autenticada.
    const { error: permissionCheckError } = await supabase
      .from('app_settings')
      .select('id')
      .limit(1);
    if (permissionCheckError) {
      throw new Error(`Supabase indisponivel ou schema ausente: ${permissionCheckError.message}`);
    }

    await upsert('app_users', input.users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      merchant_id: user.merchantId || null,
      status: user.status || 'active',
      city: user.city,
      phone: user.phone,
      membership_tier: user.membershipTier || null,
      data: withoutSecrets(user as unknown as Record<string, unknown>)
    })));

    await upsert('app_merchants', input.merchants.map((merchant) => ({
      id: merchant.id,
      name: merchant.name,
      owner_user_id: null,
      category: merchant.category,
      status: merchant.status,
      city: merchant.city,
      data: merchant
    })));

    await upsert('app_products', input.products.map((product) => ({
      id: product.id,
      merchant_id: product.merchantId,
      name: product.name,
      category: product.category,
      status: product.status,
      price: product.price,
      stock: product.stock,
      data: product
    })));

    await upsert('app_services', input.services.map((service) => ({
      id: service.id,
      merchant_id: service.merchantId,
      title: service.title,
      category: service.category,
      status: service.status,
      price: service.price,
      data: service
    })));

    await upsert('app_orders', input.orders.map((order) => ({
      id: order.id,
      code: order.code,
      customer_id: order.customerId || order.userId || null,
      merchant_id: order.merchantId,
      type: order.type,
      status: order.status,
      total_amount: order.totalAmount,
      data: order
    })));

    await upsert('app_notifications', (input.notifications || []).map((notification) => ({
      id: notification.id,
      recipient_user_id: notification.recipientUserId || null,
      recipient_merchant_id: notification.recipientMerchantId || null,
      channel: 'IN_APP',
      status: notification.readBy?.length ? 'READ' : 'PENDING',
      event_type: notification.category,
      data: notification
    })));

    await upsert('app_audit_logs', (input.auditLogs || []).map((log) => ({
      id: log.id,
      user_id: log.userId,
      user_role: log.userRole || null,
      action: log.action,
      entity_type: log.entityType || null,
      entity_id: log.entityId || null,
      severity: log.severity || null,
      data: log
    })));

    if (input.systemSettings) {
      await upsert('app_settings', [{ id: 'global', data: input.systemSettings }]);
    }

    return { ok: true, synced };
  } catch (error) {
    return { ok: false, synced, error: error instanceof Error ? error.message : 'Falha ao sincronizar dados.' };
  }
}
