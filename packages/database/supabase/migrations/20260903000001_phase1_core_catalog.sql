-- ==============================================================================
-- FASE 1: CORE MULTI-TENANT, USUARIOS/ROLES, CATEGORÍAS, PRODUCTOS Y MODIFICADORES
-- ==============================================================================

-- 1. Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enumeradores de Dominio
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'cashier', 'kitchen', 'driver', 'waiter');
CREATE TYPE order_channel AS ENUM ('pos', 'web', 'whatsapp', 'delivery_app');

-- ------------------------------------------------------------------------------
-- TABLA: tenants (Restaurantes / Marcas)
-- ------------------------------------------------------------------------------
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    custom_domain TEXT UNIQUE,
    logo_url TEXT,
    banner_url TEXT,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    timezone TEXT NOT NULL DEFAULT 'America/Guayaquil',
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 15.00, -- IVA Ecuador (15%) por defecto
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

CREATE INDEX idx_tenants_slug ON public.tenants (slug);
CREATE INDEX idx_tenants_custom_domain ON public.tenants (custom_domain);

-- ------------------------------------------------------------------------------
-- TABLA: tenant_users (Mapeo de Usuarios a Tenants con Roles)
-- ------------------------------------------------------------------------------
CREATE TABLE public.tenant_users (
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

CREATE INDEX idx_tenant_users_user ON public.tenant_users (user_id);
CREATE INDEX idx_tenant_users_tenant ON public.tenant_users (tenant_id);

-- ------------------------------------------------------------------------------
-- TABLA: categories (Categorías de Menú)
-- ------------------------------------------------------------------------------
CREATE TABLE public.categories (
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

CREATE INDEX idx_categories_tenant_order ON public.categories (tenant_id, display_order);

-- ------------------------------------------------------------------------------
-- TABLA: products (Catálogo de Artículos y Platos - Precios Netos sin impuestos)
-- ------------------------------------------------------------------------------
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    sku TEXT,
    base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0), -- Precio neto antes de impuestos
    cost_price NUMERIC(10, 2) CHECK (cost_price >= 0),
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 15.00,             -- % de IVA aplicable en checkout
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

CREATE INDEX idx_products_tenant_category ON public.products (tenant_id, category_id);
CREATE INDEX idx_products_tenant_available ON public.products (tenant_id, is_available);

-- ------------------------------------------------------------------------------
-- TABLA: modifier_groups (Grupos de Modificadores: e.g. Término, Salsa, Adicionales)
-- ------------------------------------------------------------------------------
CREATE TABLE public.modifier_groups (
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

CREATE INDEX idx_modifier_groups_tenant ON public.modifier_groups (tenant_id);

-- ------------------------------------------------------------------------------
-- TABLA: modifier_options (Opciones dentro de un grupo)
-- ------------------------------------------------------------------------------
CREATE TABLE public.modifier_options (
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

CREATE INDEX idx_modifier_options_group ON public.modifier_options (modifier_group_id);

-- ------------------------------------------------------------------------------
-- TABLA: product_modifier_groups (Asociación N:M Producto <-> Grupos de Modificadores)
-- ------------------------------------------------------------------------------
CREATE TABLE public.product_modifier_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    modifier_group_id UUID NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_product_modifier_group UNIQUE (product_id, modifier_group_id)
);

CREATE INDEX idx_pmg_product ON public.product_modifier_groups (product_id);

-- ------------------------------------------------------------------------------
-- TABLA: modifier_option_groups (Modificadores Anidados de 2do Nivel)
-- Una opción (ej: "Hamburguesa Doble") puede desencadenar un grupo hijo (ej: "Término 2da Carne")
-- ------------------------------------------------------------------------------
CREATE TABLE public.modifier_option_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    modifier_option_id UUID NOT NULL REFERENCES public.modifier_options(id) ON DELETE CASCADE,
    child_modifier_group_id UUID NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_option_child_group UNIQUE (modifier_option_id, child_modifier_group_id)
);

CREATE INDEX idx_mog_option ON public.modifier_option_groups (modifier_option_id);

-- ------------------------------------------------------------------------------
-- TRIGGER HELPER: Actualización automática de updated_at
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_tenant_users_updated_at BEFORE UPDATE ON public.tenant_users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_modifier_groups_updated_at BEFORE UPDATE ON public.modifier_groups FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_modifier_options_updated_at BEFORE UPDATE ON public.modifier_options FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifier_option_groups ENABLE ROW LEVEL SECURITY;

-- Funciones de Seguridad RLS
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

-- POLÍTICAS: tenants
CREATE POLICY "Public can view active tenants by slug or domain"
ON public.tenants FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Owners and Admins can update their tenant"
ON public.tenants FOR UPDATE
TO authenticated
USING (public.has_tenant_role(id, ARRAY['owner'::user_role, 'admin'::user_role]))
WITH CHECK (public.has_tenant_role(id, ARRAY['owner'::user_role, 'admin'::user_role]));

-- POLÍTICAS: tenant_users
CREATE POLICY "Tenant members can view their peers"
ON public.tenant_users FOR SELECT
TO authenticated
USING (public.is_tenant_member(tenant_id) OR user_id = auth.uid());

CREATE POLICY "Owners and Admins can manage tenant users"
ON public.tenant_users FOR ALL
TO authenticated
USING (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]))
WITH CHECK (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]));

-- POLÍTICAS: categories
CREATE POLICY "Public and members can read active categories"
ON public.categories FOR SELECT
TO anon, authenticated
USING (is_active = true OR public.is_tenant_member(tenant_id));

CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
TO authenticated
USING (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]))
WITH CHECK (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]));

-- POLÍTICAS: products
CREATE POLICY "Public and members can read products"
ON public.products FOR SELECT
TO anon, authenticated
USING (is_available = true OR public.is_tenant_member(tenant_id));

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
TO authenticated
USING (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]))
WITH CHECK (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]));

-- POLÍTICAS: modifier_groups, modifier_options, product_modifier_groups, modifier_option_groups
CREATE POLICY "Public and members can read active modifier groups"
ON public.modifier_groups FOR SELECT
TO anon, authenticated
USING (is_active = true OR public.is_tenant_member(tenant_id));

CREATE POLICY "Admins can manage modifier groups"
ON public.modifier_groups FOR ALL
TO authenticated
USING (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]))
WITH CHECK (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]));

CREATE POLICY "Public and members can read active modifier options"
ON public.modifier_options FOR SELECT
TO anon, authenticated
USING (is_available = true OR public.is_tenant_member(tenant_id));

CREATE POLICY "Admins can manage modifier options"
ON public.modifier_options FOR ALL
TO authenticated
USING (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]))
WITH CHECK (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]));

CREATE POLICY "Public and members can read product modifier associations"
ON public.product_modifier_groups FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage product modifier associations"
ON public.product_modifier_groups FOR ALL
TO authenticated
USING (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]))
WITH CHECK (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]));

CREATE POLICY "Public and members can read modifier option groups"
ON public.modifier_option_groups FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage modifier option groups"
ON public.modifier_option_groups FOR ALL
TO authenticated
USING (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]))
WITH CHECK (public.has_tenant_role(tenant_id, ARRAY['owner'::user_role, 'admin'::user_role]));
