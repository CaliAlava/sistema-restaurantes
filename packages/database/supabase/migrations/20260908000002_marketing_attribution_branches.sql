-- ==============================================================================
-- FASE 15: ATRIBUCIÓN DE MARKETING, SUCURSALES Y ANALÍTICA DE OPERACIONES
-- ==============================================================================

-- 1. Nuevos tipos enumerados
DO $$ BEGIN
    CREATE TYPE attribution_source AS ENUM (
        'qr_table',
        'qr_packaging',
        'influencer',
        'meta_ads',
        'google_ads',
        'organic',
        'direct',
        'whatsapp_broadcast'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE cancellation_reason AS ENUM (
        'stock_out',
        'kitchen_delay',
        'customer_cancelled',
        'out_of_range',
        'payment_failed'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Alterar tabla orders para incluir métricas de marketing, despacho y cancelación
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS attribution_source attribution_source,
ADD COLUMN IF NOT EXISTS attribution_campaign TEXT,
ADD COLUMN IF NOT EXISTS influencer_code TEXT,
ADD COLUMN IF NOT EXISTS qr_code_id TEXT,
ADD COLUMN IF NOT EXISTS branch_id TEXT,
ADD COLUMN IF NOT EXISTS branch_name TEXT,
ADD COLUMN IF NOT EXISTS kitchen_time_minutes NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS delivery_transit_minutes NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS cancellation_reason cancellation_reason;

CREATE INDEX IF NOT EXISTS idx_orders_attribution ON public.orders (tenant_id, attribution_source);
CREATE INDEX IF NOT EXISTS idx_orders_branch ON public.orders (tenant_id, branch_id);

-- 3. Alterar tabla customers para perfilado de cumpleaños y canal de adquisición
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS birthday TEXT,
ADD COLUMN IF NOT EXISTS acquisition_source TEXT,
ADD COLUMN IF NOT EXISTS preferred_category TEXT,
ADD COLUMN IF NOT EXISTS average_days_between_orders NUMERIC(5, 1),
ADD COLUMN IF NOT EXISTS first_order_date TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_customers_birthday ON public.customers (tenant_id, birthday);
