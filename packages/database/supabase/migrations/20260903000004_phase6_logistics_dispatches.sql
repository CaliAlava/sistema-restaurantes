-- ==============================================================================
-- FASE 6: LOGÍSTICA, REPARTIDORES Y DESPACHOS
-- ==============================================================================

-- 1. Enumeradores de Logística
DO $$ BEGIN
    CREATE TYPE driver_status AS ENUM ('available', 'busy', 'offline');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE delivery_status AS ENUM ('assigned', 'picked_up', 'in_transit', 'delivered', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE dispatch_type AS ENUM ('internal_driver', 'on_demand_uber');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ------------------------------------------------------------------------------
-- TABLA: drivers (Repartidores del Local)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    vehicle_type TEXT NOT NULL DEFAULT 'motorcycle', -- motorcycle, bicycle, car
    license_plate TEXT,
    status driver_status NOT NULL DEFAULT 'available',
    current_location JSONB, -- { "lat": -2.145, "lng": -79.912, "updated_at": "..." }
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_drivers_tenant ON public.drivers (tenant_id, status);

-- ------------------------------------------------------------------------------
-- TABLA: deliveries (Despachos y Envíos de Pedidos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    dispatch_type dispatch_type NOT NULL DEFAULT 'internal_driver',
    status delivery_status NOT NULL DEFAULT 'assigned',
    tracking_code TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_reference TEXT,
    delivery_notes TEXT,
    estimated_arrival_minutes INTEGER DEFAULT 20,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    proof_of_delivery_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_deliveries_tenant_status ON public.deliveries (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_deliveries_tracking_code ON public.deliveries (tracking_code);

-- ------------------------------------------------------------------------------
-- TRIGGER: Actualización de updated_at
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS update_drivers_updated_at ON public.drivers;
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_deliveries_updated_at ON public.deliveries;
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON public.deliveries FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Políticas de drivers
DROP POLICY IF EXISTS "Staff and drivers can view drivers" ON public.drivers;
CREATE POLICY "Staff and drivers can view drivers" ON public.drivers FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Admins can manage drivers" ON public.drivers;
CREATE POLICY "Admins can manage drivers" ON public.drivers FOR ALL TO authenticated
USING (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]))
WITH CHECK (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]));

-- Políticas de deliveries
DROP POLICY IF EXISTS "Staff and drivers can view deliveries" ON public.deliveries;
CREATE POLICY "Staff and drivers can view deliveries" ON public.deliveries FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Drivers and staff can update deliveries" ON public.deliveries;
CREATE POLICY "Drivers and staff can update deliveries" ON public.deliveries FOR UPDATE TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Public can view delivery by tracking code" ON public.deliveries;
CREATE POLICY "Public can view delivery by tracking code" ON public.deliveries FOR SELECT TO anon USING (true);

-- Habilitar Realtime para despachos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'deliveries') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.deliveries;
  END IF;
END $$;
