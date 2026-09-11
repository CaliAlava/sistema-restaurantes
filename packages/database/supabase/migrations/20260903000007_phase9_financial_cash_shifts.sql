-- ==============================================================================
-- FASE 9: CIERRE DE CAJA (CORTE X/Z), MOVIMIENTOS Y EXPORTACIÓN CONTABLE
-- ==============================================================================

-- 1. Enumeradores de Caja
DO $$ BEGIN
    CREATE TYPE shift_status AS ENUM ('open', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE cash_movement_type AS ENUM ('cash_in', 'cash_out');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ------------------------------------------------------------------------------
-- TABLA: cash_shifts (Turnos y Cierres de Caja)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cash_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    cashier_name TEXT NOT NULL,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    closed_at TIMESTAMPTZ,
    opening_cash NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (opening_cash >= 0),
    expected_cash NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    counted_cash NUMERIC(10, 2),
    cash_difference NUMERIC(10, 2),
    total_sales_cash NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_sales_card NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_sales_transfer NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_tax_collected NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_tips NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status shift_status NOT NULL DEFAULT 'open',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_cash_shifts_tenant_status ON public.cash_shifts (tenant_id, status);

-- ------------------------------------------------------------------------------
-- TABLA: cash_movements (Entradas y Salidas de Caja Chica)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID NOT NULL REFERENCES public.cash_shifts(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    type cash_movement_type NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_cash_movements_shift ON public.cash_movements (shift_id);

-- ------------------------------------------------------------------------------
-- TRIGGER: Actualización de updated_at
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS update_cash_shifts_updated_at ON public.cash_shifts;
CREATE TRIGGER update_cash_shifts_updated_at BEFORE UPDATE ON public.cash_shifts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.cash_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Staff can manage cash shifts" ON public.cash_shifts;
CREATE POLICY "Staff can manage cash shifts" ON public.cash_shifts FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can manage cash movements" ON public.cash_movements;
CREATE POLICY "Staff can manage cash movements" ON public.cash_movements FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
