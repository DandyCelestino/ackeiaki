-- Schema de persistencia do aplicativo Achei Aqui.
-- Execute depois de schema_multiloja.sql.
-- O frontend usa somente a chave publica; service_role fica restrita ao backend.

CREATE TABLE IF NOT EXISTS public.app_users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('CLIENTE', 'VENDEDOR', 'MASTER')),
    merchant_id TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    city TEXT,
    phone TEXT,
    membership_tier TEXT,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_merchants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_user_id TEXT,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    city TEXT,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_products (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_services (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_orders (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    customer_id TEXT,
    merchant_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('PRODUTO', 'SERVICO')),
    status TEXT NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_reviews (
    id TEXT PRIMARY KEY,
    author_user_id TEXT,
    target_user_id TEXT,
    merchant_id TEXT,
    order_id TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_notifications (
    id TEXT PRIMARY KEY,
    recipient_user_id TEXT,
    recipient_merchant_id TEXT,
    channel TEXT NOT NULL,
    status TEXT NOT NULL,
    event_type TEXT,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    severity TEXT,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_users_role ON public.app_users(role);
CREATE INDEX IF NOT EXISTS idx_app_users_merchant ON public.app_users(merchant_id);
CREATE INDEX IF NOT EXISTS idx_app_merchants_status ON public.app_merchants(status);
CREATE INDEX IF NOT EXISTS idx_app_products_merchant ON public.app_products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_app_products_category ON public.app_products(category);
CREATE INDEX IF NOT EXISTS idx_app_services_merchant ON public.app_services(merchant_id);
CREATE INDEX IF NOT EXISTS idx_app_orders_customer ON public.app_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_app_orders_merchant ON public.app_orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_app_orders_status ON public.app_orders(status);
CREATE INDEX IF NOT EXISTS idx_app_notifications_recipient ON public.app_notifications(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_app_audit_logs_entity ON public.app_audit_logs(entity_type, entity_id);

CREATE OR REPLACE FUNCTION public.app_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_app_users_updated_at ON public.app_users;
CREATE TRIGGER trg_app_users_updated_at BEFORE UPDATE ON public.app_users FOR EACH ROW EXECUTE FUNCTION public.app_set_updated_at();
DROP TRIGGER IF EXISTS trg_app_merchants_updated_at ON public.app_merchants;
CREATE TRIGGER trg_app_merchants_updated_at BEFORE UPDATE ON public.app_merchants FOR EACH ROW EXECUTE FUNCTION public.app_set_updated_at();
DROP TRIGGER IF EXISTS trg_app_products_updated_at ON public.app_products;
CREATE TRIGGER trg_app_products_updated_at BEFORE UPDATE ON public.app_products FOR EACH ROW EXECUTE FUNCTION public.app_set_updated_at();
DROP TRIGGER IF EXISTS trg_app_services_updated_at ON public.app_services;
CREATE TRIGGER trg_app_services_updated_at BEFORE UPDATE ON public.app_services FOR EACH ROW EXECUTE FUNCTION public.app_set_updated_at();
DROP TRIGGER IF EXISTS trg_app_orders_updated_at ON public.app_orders;
CREATE TRIGGER trg_app_orders_updated_at BEFORE UPDATE ON public.app_orders FOR EACH ROW EXECUTE FUNCTION public.app_set_updated_at();

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Politicas iniciais: leitura publica apenas do catalogo aprovado/ativo.
DROP POLICY IF EXISTS app_products_public_read ON public.app_products;
CREATE POLICY app_products_public_read ON public.app_products FOR SELECT TO anon, authenticated USING (status = 'active');
DROP POLICY IF EXISTS app_services_public_read ON public.app_services;
CREATE POLICY app_services_public_read ON public.app_services FOR SELECT TO anon, authenticated USING (status = 'active');
DROP POLICY IF EXISTS app_merchants_public_read ON public.app_merchants;
CREATE POLICY app_merchants_public_read ON public.app_merchants FOR SELECT TO anon, authenticated USING (status = 'approved');

-- A escrita administrativa deve ocorrer por Edge Function/backend autenticado.
-- Nao conceder INSERT/UPDATE/DELETE a anon. As politicas abaixo permitem ao usuario
-- autenticado consultar somente seu proprio pedido/notificacao; regras de lojista
-- devem ser endurecidas quando o auth.uid() estiver ligado a app_users.id.
DROP POLICY IF EXISTS app_orders_owner_read ON public.app_orders;
CREATE POLICY app_orders_owner_read ON public.app_orders FOR SELECT TO authenticated
  USING (customer_id = auth.uid()::text OR merchant_id IN (SELECT id FROM public.app_merchants WHERE owner_user_id = auth.uid()::text));
DROP POLICY IF EXISTS app_notifications_owner_read ON public.app_notifications;
CREATE POLICY app_notifications_owner_read ON public.app_notifications FOR SELECT TO authenticated
  USING (recipient_user_id = auth.uid()::text);

GRANT SELECT ON public.app_products, public.app_services, public.app_merchants TO anon, authenticated;
GRANT SELECT ON public.app_orders, public.app_notifications TO authenticated;
