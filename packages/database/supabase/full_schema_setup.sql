-- ==============================================================================
-- SISTEMA RESTAURANTES: ESQUEMA MAESTRO COMPLETO (FASES 1 A 9)
-- ==============================================================================

-- 1. Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enumeradores de Dominio
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'admin', 'cashier', 'kitchen', 'waiter');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE order_channel AS ENUM ('pos', 'web', 'whatsapp', 'delivery_app');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'ready', 'dispatched', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE fulfillment_type AS ENUM ('dine_in', 'takeaway', 'delivery');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash', 'transfer', 'card');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE table_status AS ENUM ('available', 'occupied', 'bill_requested', 'reserved');
EXCEPTION WHEN duplicate_object THEN null; END $$;


DO $$ BEGIN
    CREATE TYPE customer_tier AS ENUM ('bronze', 'silver', 'gold', 'vip');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'seated', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE shift_status AS ENUM ('open', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE cash_movement_type AS ENUM ('cash_in', 'cash_out');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ------------------------------------------------------------------------------
-- TABLA: tenants (Restaurantes Multi-Tenant)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    custom_domain TEXT UNIQUE,
    logo_url TEXT,
    banner_url TEXT,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    timezone TEXT NOT NULL DEFAULT 'America/Guayaquil',
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
    phone TEXT,
    email TEXT,
    settings JSONB NOT NULL DEFAULT '{
        "allow_pickup": true,
        "allow_delivery": true,
        "allow_dine_in": true,
        "minimum_order": 0.00,
        "tax_calculation": "checkout_exclusive"
    }'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants (slug);

-- ------------------------------------------------------------------------------
-- TABLA: tenant_users (Roles de Usuario)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'cashier',
    display_name TEXT NOT NULL,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_tenant_user UNIQUE (tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON public.tenant_users (tenant_id);

-- ------------------------------------------------------------------------------
-- TABLA: categories (Categorías de Menú)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    available_channels order_channel[] NOT NULL DEFAULT ARRAY['pos'::order_channel, 'web'::order_channel, 'whatsapp'::order_channel],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_category_slug_per_tenant UNIQUE (tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_categories_tenant_order ON public.categories (tenant_id, display_order);

-- ------------------------------------------------------------------------------
-- TABLA: products (Catálogo de Artículos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    sku TEXT,
    base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
    cost_price NUMERIC(10, 2) CHECK (cost_price >= 0),
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    track_inventory BOOLEAN NOT NULL DEFAULT false,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    available_channels order_channel[] NOT NULL DEFAULT ARRAY['pos'::order_channel, 'web'::order_channel, 'whatsapp'::order_channel],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_product_slug_per_tenant UNIQUE (tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_products_tenant_category ON public.products (tenant_id, category_id);

-- ------------------------------------------------------------------------------
-- TABLA: modifier_groups (Grupos de Modificadores)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.modifier_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    min_selections INTEGER NOT NULL DEFAULT 0 CHECK (min_selections >= 0),
    max_selections INTEGER NOT NULL DEFAULT 1 CHECK (max_selections >= min_selections),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- TABLA: modifier_options (Opciones)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.modifier_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    modifier_group_id UUID NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_delta NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price_delta >= 0),
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_available BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- TABLA: product_modifier_groups
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_modifier_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    modifier_group_id UUID NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_product_modifier_group UNIQUE (product_id, modifier_group_id)
);

-- ------------------------------------------------------------------------------
-- TABLA: modifier_option_groups (Modificadores Anidados)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.modifier_option_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    modifier_option_id UUID NOT NULL REFERENCES public.modifier_options(id) ON DELETE CASCADE,
    child_modifier_group_id UUID NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_option_child_group UNIQUE (modifier_option_id, child_modifier_group_id)
);

-- ------------------------------------------------------------------------------
-- TABLA: orders (Órdenes y Comandas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
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

CREATE INDEX IF NOT EXISTS idx_orders_tenant_status ON public.orders (tenant_id, status);

-- ------------------------------------------------------------------------------
-- TABLA: order_items
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
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

-- ------------------------------------------------------------------------------
-- TABLA: order_item_modifiers
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_item_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    parent_order_modifier_id UUID REFERENCES public.order_item_modifiers(id) ON DELETE CASCADE,
    modifier_group_name TEXT NOT NULL,
    modifier_option_name TEXT NOT NULL,
    price_delta NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price_delta >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- TABLA: dining_areas & tables (Salón POS)
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

CREATE TABLE IF NOT EXISTS public.tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    area_id UUID REFERENCES public.dining_areas(id) ON DELETE SET NULL,
    table_number TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 4 CHECK (capacity > 0),
    status table_status NOT NULL DEFAULT 'available',
    current_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    assigned_waiter_id UUID REFERENCES public.tenant_users(id) ON DELETE SET NULL,
    pos_x INTEGER DEFAULT 0,
    pos_y INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_table_per_tenant UNIQUE (tenant_id, table_number)
);


-- ------------------------------------------------------------------------------
-- TABLA: customers, loyalty & coupons (CRM)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    tier customer_tier NOT NULL DEFAULT 'bronze',
    total_orders INTEGER NOT NULL DEFAULT 0 CHECK (total_orders >= 0),
    total_spent NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_spent >= 0),
    loyalty_points INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
    tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_customer_phone_per_tenant UNIQUE (tenant_id, phone)
);

CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'adjustment')),
    points INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    discount_type discount_type NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (min_order_amount >= 0),
    max_discount_amount NUMERIC(10, 2) CHECK (max_discount_amount > 0),
    valid_from TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    valid_until TIMESTAMPTZ,
    usage_limit INTEGER,
    times_used INTEGER NOT NULL DEFAULT 0 CHECK (times_used >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_coupon_code_per_tenant UNIQUE (tenant_id, code)
);

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

-- ------------------------------------------------------------------------------
-- TABLA: cash_shifts & cash_movements (Caja y SRI)
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

CREATE TABLE IF NOT EXISTS public.cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID NOT NULL REFERENCES public.cash_shifts(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    type cash_movement_type NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- TRIGGER COMÚN DE updated_at
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tenants_updated_at ON public.tenants;
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_dining_areas_updated_at ON public.dining_areas;
CREATE TRIGGER update_dining_areas_updated_at BEFORE UPDATE ON public.dining_areas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_tables_updated_at ON public.tables;
CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON public.tables FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_coupons_updated_at ON public.coupons;
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_reservations_updated_at ON public.reservations;
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_cash_shifts_updated_at ON public.cash_shifts;
CREATE TRIGGER update_cash_shifts_updated_at BEFORE UPDATE ON public.cash_shifts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifier_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dining_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_tenant_member(lookup_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tenant_users
        WHERE tenant_id = lookup_tenant_id
          AND user_id = auth.uid()
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_tenant_role(lookup_tenant_id UUID, required_roles user_role[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tenant_users
        WHERE tenant_id = lookup_tenant_id
          AND user_id = auth.uid()
          AND role = ANY(required_roles)
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Políticas de lectura pública de catálogo
DROP POLICY IF EXISTS "Public can view active tenants by slug or domain" ON public.tenants;
CREATE POLICY "Public can view active tenants by slug or domain" ON public.tenants FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Public and members can read active categories" ON public.categories;
CREATE POLICY "Public and members can read active categories" ON public.categories FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Public and members can read products" ON public.products;
CREATE POLICY "Public and members can read products" ON public.products FOR SELECT TO anon, authenticated USING (is_available = true);

DROP POLICY IF EXISTS "Public and members can read active modifier groups" ON public.modifier_groups;
CREATE POLICY "Public and members can read active modifier groups" ON public.modifier_groups FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Public and members can read active modifier options" ON public.modifier_options;
CREATE POLICY "Public and members can read active modifier options" ON public.modifier_options FOR SELECT TO anon, authenticated USING (is_available = true);

DROP POLICY IF EXISTS "Public and members can read product modifier associations" ON public.product_modifier_groups;
CREATE POLICY "Public and members can read product modifier associations" ON public.product_modifier_groups FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public and members can read modifier option groups" ON public.modifier_option_groups;
CREATE POLICY "Public and members can read modifier option groups" ON public.modifier_option_groups FOR SELECT TO anon, authenticated USING (true);

-- Políticas de órdenes y KDS
DROP POLICY IF EXISTS "Public and staff can insert orders" ON public.orders;
CREATE POLICY "Public and staff can insert orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Staff and public can view orders" ON public.orders;
CREATE POLICY "Staff and public can view orders" ON public.orders FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Staff can update orders" ON public.orders;
CREATE POLICY "Staff can update orders" ON public.orders FOR UPDATE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public and staff can insert order items" ON public.order_items;
CREATE POLICY "Public and staff can insert order items" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Staff and public can view order items" ON public.order_items;
CREATE POLICY "Staff and public can view order items" ON public.order_items FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public and staff can insert order modifiers" ON public.order_item_modifiers;
CREATE POLICY "Public and staff can insert order modifiers" ON public.order_item_modifiers FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Staff and public can view order modifiers" ON public.order_item_modifiers;
CREATE POLICY "Staff and public can view order modifiers" ON public.order_item_modifiers FOR SELECT TO anon, authenticated USING (true);

-- Políticas de salón, logística y reservas
DROP POLICY IF EXISTS "Staff can view dining areas" ON public.dining_areas;
CREATE POLICY "Staff can view dining areas" ON public.dining_areas FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Staff can view tables" ON public.tables;
CREATE POLICY "Staff can view tables" ON public.tables FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Staff can update tables" ON public.tables;
CREATE POLICY "Staff can update tables" ON public.tables FOR UPDATE TO authenticated, anon USING (true);


DROP POLICY IF EXISTS "Staff can manage customers" ON public.customers;
CREATE POLICY "Staff can manage customers" ON public.customers FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public and staff can view active coupons" ON public.coupons;
CREATE POLICY "Public and staff can view active coupons" ON public.coupons FOR SELECT TO authenticated, anon USING (is_active = true);

DROP POLICY IF EXISTS "Public can create reservations" ON public.reservations;
CREATE POLICY "Public can create reservations" ON public.reservations FOR INSERT TO authenticated, anon WITH CHECK (true);

DROP POLICY IF EXISTS "Staff and public can view reservations" ON public.reservations;
CREATE POLICY "Staff and public can view reservations" ON public.reservations FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Staff can manage cash shifts" ON public.cash_shifts;
CREATE POLICY "Staff can manage cash shifts" ON public.cash_shifts FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can manage cash movements" ON public.cash_movements;
CREATE POLICY "Staff can manage cash movements" ON public.cash_movements FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- REALTIME
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tables') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'reservations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- DATOS SEMILLA (SEED) CON UUIDs 100% VÁLIDOS (HEXADECIMALES)
-- ------------------------------------------------------------------------------
INSERT INTO public.tenants (id, name, slug, logo_url, banner_url, currency, timezone, tax_rate, phone, email)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Burger Craft & Co.',
    'burger-craft',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=80',
    'USD',
    'America/Guayaquil',
    15.00,
    '+593 99 123 4567',
    'hola@burgercraft.ec'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (id, tenant_id, name, slug, description, display_order)
VALUES 
    ('c1000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Hamburguesas Smash', 'hamburguesas-smash', 'Carne 100% Angus smash en pan brioche', 1),
    ('c1000000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Acompañamientos', 'acompanamientos', 'Papas trufadas y aros de cebolla', 2),
    ('c1000000-0000-0000-0000-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bebidas & Malteadas', 'bebidas', 'Sodas y bebidas heladas', 3)
ON CONFLICT DO NOTHING;

INSERT INTO public.products (id, tenant_id, category_id, name, slug, description, base_price, tax_rate, image_url, is_featured)
VALUES 
    ('b1000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1000000-0000-0000-0000-000000000001', 'Bacon Truffle Double Smash', 'bacon-truffle-double-smash', 'Doble carne smash Angus, queso cheddar, tocino glaseado en maple y alioli de trufa.', 9.50, 15.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', true),
    ('b1000000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1000000-0000-0000-0000-000000000001', 'Classic Americana Cheeseburger', 'classic-americana-cheeseburger', 'Carne smash Angus, doble queso cheddar americano, pepinillos y salsa de la casa.', 7.00, 15.00, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80', false),
    ('b1000000-0000-0000-0000-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1000000-0000-0000-0000-000000000002', 'Papas Rústicas Trufadas', 'papas-rusticas-trufadas', 'Papas corte rústico con aceite de trufa y parmesano reggiano.', 4.25, 15.00, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80', true)
ON CONFLICT DO NOTHING;
