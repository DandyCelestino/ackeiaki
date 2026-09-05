-- Achei Aqui: complementos necessários para a integração do frontend.
-- Execute no Supabase SQL Editor com uma conta administrativa.

CREATE TABLE IF NOT EXISTS public.notification_deliveries (
    id VARCHAR(128) PRIMARY KEY,
    event_type VARCHAR(80) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(40),
    recipient_email VARCHAR(255),
    recipient_user_id VARCHAR(128),
    recipient_merchant_id VARCHAR(128),
    audience VARCHAR(50),
    channel VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    order_id VARCHAR(128),
    order_code VARCHAR(80),
    merchant_id VARCHAR(128),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_created_at
    ON public.notification_deliveries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_recipient_user
    ON public.notification_deliveries (recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_merchant
    ON public.notification_deliveries (merchant_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status
    ON public.notification_deliveries (status);

ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;

-- O frontend pode registrar uma entrega, mas não pode consultar o histórico inteiro.
DROP POLICY IF EXISTS notification_deliveries_insert_anon ON public.notification_deliveries;
CREATE POLICY notification_deliveries_insert_anon
    ON public.notification_deliveries
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS notification_deliveries_select_authenticated ON public.notification_deliveries;
CREATE POLICY notification_deliveries_select_authenticated
    ON public.notification_deliveries
    FOR SELECT
    TO authenticated
    USING (true);

GRANT INSERT ON public.notification_deliveries TO anon, authenticated;
GRANT SELECT ON public.notification_deliveries TO authenticated;

-- Atualização consistente do timestamp quando um registro é alterado.
CREATE OR REPLACE FUNCTION public.set_notification_deliveries_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.created_at = COALESCE(OLD.created_at, NEW.created_at);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notification_deliveries_timestamps
    ON public.notification_deliveries;
CREATE TRIGGER trg_notification_deliveries_timestamps
    BEFORE UPDATE ON public.notification_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION public.set_notification_deliveries_updated_at();

COMMENT ON TABLE public.notification_deliveries IS
    'Logs de notificacoes transacionais do Achei Aqui; leitura protegida por RLS.';
