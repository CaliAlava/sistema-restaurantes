-- ==============================================================================
-- FASE 3: ESQUEMA DE ÓRDENES, COMANDAS Y COCINA EN TIEMPO REAL (KDS)
-- ==============================================================================

-- 1. Enumeradores para Órdenes y Cocina
CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'ready', 'dispatched', 'cancelled');
CREATE TYPE fulfillment_type AS ENUM ('dine_in', 'takeaway', 'delivery');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'transfer', 'card');

-- ------------------------------------------------------------------------------
-- TABLA: orders (Cabecera de Pedido / Comanda)
-- ------------------------------------------------------------------------------
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    daily_order_number INTEGER NOT NULL,
    channel order_channel NOT NULL DEFAULT 'web',
    status order_status NOT NULL DEFAULT 'pending',
    fulfillment_type fulfillment_type NOT NULL DEFAULT 'delivery',
    table_number TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    delivery_address TEXT,
    delivery_reference TEXT,
    payment_method payment_method NOT NULL DEFAULT 'cash',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    net_subtotal NUMERIC(10, 2) NOT NULL CHECK (net_subtotal >= 0),
    tax_total NUMERIC(10, 2) NOT NULL CHECK (tax_total >= 0),
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
    tip_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (tip_amount >= 0),
    grand_total NUMERIC(10, 2) NOT NULL CHECK (grand_total >= 0),
    notes TEXT,
    estimated_minutes INTEGER NOT NULL DEFAULT 25,
    prepared_at TIMESTAMPTZ,
    ready_at TIMESTAMPTZ,
    dispatched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_orders_tenant_status ON public.orders (tenant_id, status);
CREATE INDEX idx_orders_tenant_created ON public.orders (tenant_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- TABLA: order_items (Líneas de Detalle del Pedido)
-- ------------------------------------------------------------------------------
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    special_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_order_items_order ON public.order_items (order_id);

-- ------------------------------------------------------------------------------
-- TABLA: order_item_modifiers (Modificadores seleccionados con soporte recursivo)
-- ------------------------------------------------------------------------------
CREATE TABLE public.order_item_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    parent_order_modifier_id UUID REFERENCES public.order_item_modifiers(id) ON DELETE CASCADE,
    modifier_group_name TEXT NOT NULL,
    modifier_option_name TEXT NOT NULL,
    price_delta NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price_delta >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_order_modifiers_item ON public.order_item_modifiers (order_item_id);

-- ------------------------------------------------------------------------------
-- TRIGGER: Actualización automática de updated_at para orders
-- ------------------------------------------------------------------------------
CREATE TRIGGER update_orders_updated_at 
BEFORE UPDATE ON public.orders 
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- SEGURIDAD: ROW LEVEL SECURITY (RLS) PARA ÓRDENES Y KDS
-- ==============================================================================

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_modifiers ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: orders
-- 1. Crear órdenes: público (storefront) y meseros/cajeros autenticados
CREATE POLICY "Public and staff can insert orders"
ON public.orders FOR INSERT
TO anon, authenticated
WITH CHECK (
    EXISTS (SELECT 1 FROM public.tenants WHERE id = tenant_id AND is_active = true)
);

-- 2. Staff de cocina, caja, admin y owner pueden ver todas las órdenes de su tenant
CREATE POLICY "Staff can view tenant orders"
ON public.orders FOR SELECT
TO authenticated
USING (
    public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role, 'cashier'::user_role, 'kitchen'::user_role, 'driver'::user_role, 'waiter'::user_role])
);

-- 3. Staff puede actualizar el estado de las órdenes (ej: KDS cambiando a preparing/ready)
CREATE POLICY "Staff can update order status"
ON public.orders FOR UPDATE
TO authenticated
USING (
    public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role, 'cashier'::user_role, 'kitchen'::user_role, 'driver'::user_role])
)
WITH CHECK (
    public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role, 'cashier'::user_role, 'kitchen'::user_role, 'driver'::user_role])
);

-- POLÍTICAS: order_items
CREATE POLICY "Public and staff can insert order items"
ON public.order_items FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Staff can view order items"
ON public.order_items FOR SELECT
TO authenticated
USING (public.is_tenant_member(tenant_id));

-- POLÍTICAS: order_item_modifiers
CREATE POLICY "Public and staff can insert order modifiers"
ON public.order_item_modifiers FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Staff can view order modifiers"
ON public.order_item_modifiers FOR SELECT
TO authenticated
USING (public.is_tenant_member(tenant_id));

-- ==============================================================================
-- HABILITAR SUPABASE REALTIME PARA KDS
-- ==============================================================================
-- Permite que la pantalla de cocina escuche eventos INSERT y UPDATE sin recargar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'order_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
  END IF;
END $$;
