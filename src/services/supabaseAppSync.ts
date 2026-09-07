import { supabase } from '../lib/supabase';
import { AuditLog, InAppNotification, Order, PaymentReceiptAudit, Product, ServiceItem, StoreMerchant, SystemSettings, User } from '../types';

export interface SupabaseSyncInput {
  users: User[];
  merchants: StoreMerchant[];
  products: Product[];
  services: ServiceItem[];
  orders: Order[];
  notifications?: InAppNotification[];
  auditLogs?: AuditLog[];
  paymentReceipts?: PaymentReceiptAudit[];
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

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return { ok: false, synced: {}, error: 'Sessao Supabase ausente. Entre novamente com a conta Master autenticada.' };
    }

    const payload: SupabaseSyncInput = {
      ...input,
      users: input.users.map((user) => withoutSecrets(user as unknown as Record<string, unknown>) as unknown as User)
    };
    const { data, error } = await supabase.functions.invoke('sync-app-data', { body: payload });
    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes('failed to send') || message.includes('fetch')) {
        throw new Error('Nao foi possivel conectar a Edge Function de sincronizacao. Verifique a implantacao e a URL do Supabase.');
      }
      throw new Error(error.message);
    }
    return data as SupabaseSyncResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Falha ao sincronizar dados.';
    return { ok: false, synced: {}, error: errorMessage };
  }
}
