-- ==============================================================================
-- FASE 4: POS DE SALÓN, MESAS, COMANDAS DE MESEROS Y CAJA
-- ==============================================================================

-- 1. Enumerador de Estados de Mesas
DO $$ BEGIN
    CREATE TYPE table_status AS ENUM ('available', 'occupied', 'bill_requested', 'reserved');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ------------------------------------------------------------------------------
-- TABLA: dining_areas (Áreas / Zonas del Local: ej. Terraza, Planta Baja, VIP)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dining_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_dining_areas_tenant ON public.dining_areas (tenant_id, display_order);

-- ------------------------------------------------------------------------------
-- TABLA: tables (Mesas del Salón)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    area_id UUID REFERENCES public.dining_areas(id) ON DELETE SET NULL,
    table_number TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 4 CHECK (capacity > 0),
    status table_status NOT NULL DEFAULT 'available',
    current_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    assigned_waiter_id UUID REFERENCES public.tenant_users(id) ON DELETE SET NULL,
    pos_x INTEGER DEFAULT 0, -- Coordenadas en el mapa interactivo del salón
    pos_y INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_table_per_tenant UNIQUE (tenant_id, table_number)
);

CREATE INDEX IF NOT EXISTS idx_tables_tenant_area ON public.tables (tenant_id, area_id);
CREATE INDEX IF NOT EXISTS idx_tables_status ON public.tables (tenant_id, status);

-- ------------------------------------------------------------------------------
-- TRIGGER: Actualización de updated_at
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS update_dining_areas_updated_at ON public.dining_areas;
CREATE TRIGGER update_dining_areas_updated_at BEFORE UPDATE ON public.dining_areas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_tables_updated_at ON public.tables;
CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON public.tables FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.dining_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- Políticas de dining_areas
DROP POLICY IF EXISTS "Staff can view dining areas" ON public.dining_areas;
CREATE POLICY "Staff can view dining areas" ON public.dining_areas FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Admins can manage dining areas" ON public.dining_areas;
CREATE POLICY "Admins can manage dining areas" ON public.dining_areas FOR ALL TO authenticated
USING (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]))
WITH CHECK (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]));

-- Políticas de tables
DROP POLICY IF EXISTS "Staff can view tables" ON public.tables;
CREATE POLICY "Staff can view tables" ON public.tables FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Staff can update table status" ON public.tables;
CREATE POLICY "Staff can update table status" ON public.tables FOR UPDATE TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Admins can manage tables" ON public.tables;
CREATE POLICY "Admins can manage tables" ON public.tables FOR ALL TO authenticated
USING (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]))
WITH CHECK (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]));

-- Habilitar Realtime para actualización en vivo del plano de mesas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tables') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
  END IF;
END $$;
