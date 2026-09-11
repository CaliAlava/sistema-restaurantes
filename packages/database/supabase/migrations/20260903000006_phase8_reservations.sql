-- ==============================================================================
-- FASE 8: RESERVAS DE MESAS (STOREFRONT PÚBLICO Y LIBRO DE HOSTESS)
-- ==============================================================================

-- 1. Enumerador de Estados de Reserva
DO $$ BEGIN
    CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'seated', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ------------------------------------------------------------------------------
-- TABLA: reservations (Reservas de Mesas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    party_size INTEGER NOT NULL DEFAULT 2 CHECK (party_size > 0),
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    status reservation_status NOT NULL DEFAULT 'confirmed',
    special_requests TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reservations_tenant_date ON public.reservations (tenant_id, reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations (tenant_id, status);

-- ------------------------------------------------------------------------------
-- TRIGGER: Actualización de updated_at
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS update_reservations_updated_at ON public.reservations;
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Políticas de reservations
DROP POLICY IF EXISTS "Public can create reservations" ON public.reservations;
CREATE POLICY "Public can create reservations" ON public.reservations FOR INSERT TO authenticated, anon WITH CHECK (true);

DROP POLICY IF EXISTS "Staff and public can view reservations" ON public.reservations;
CREATE POLICY "Staff and public can view reservations" ON public.reservations FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Staff can manage reservations" ON public.reservations;
CREATE POLICY "Staff can manage reservations" ON public.reservations FOR ALL TO authenticated
USING (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role, 'cashier'::user_role, 'waiter'::user_role]))
WITH CHECK (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role, 'cashier'::user_role, 'waiter'::user_role]));

-- Habilitar Realtime para reservas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'reservations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
  END IF;
END $$;
