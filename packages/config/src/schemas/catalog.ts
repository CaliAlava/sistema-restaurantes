import { z } from 'zod';

// ==============================================================================
// 1. ENUMS Y CONSTANTES DE DOMINIO
// ==============================================================================

export const UserRoleSchema = z.enum([
  'owner',
  'admin',
  'cashier',
  'kitchen',
  'waiter',
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const OrderChannelSchema = z.enum(['pos', 'web', 'whatsapp', 'delivery_app']);
export type OrderChannel = z.infer<typeof OrderChannelSchema>;

// ==============================================================================
// 2. TENANT (RESTAURANTE / MULTI-TENANT)
// ==============================================================================

export const TenantSettingsSchema = z.object({
  allow_pickup: z.boolean().default(true),
  allow_delivery: z.boolean().default(true),
  allow_dine_in: z.boolean().default(true),
  minimum_order: z.number().nonnegative().default(0.0),
  tax_calculation: z.enum(['checkout_exclusive', 'inclusive']).default('checkout_exclusive'),
});
export type TenantSettings = z.infer<typeof TenantSettingsSchema>;

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug inválido: solo minúsculas, números y guiones'),
  custom_domain: z.string().nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  banner_url: z.string().url().nullable().optional(),
  currency: z.string().length(3).default('USD'),
  timezone: z.string().default('America/Guayaquil'),
  tax_rate: z.number().nonnegative().default(15.0),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  settings: TenantSettingsSchema.default({}),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type Tenant = z.infer<typeof TenantSchema>;

// ==============================================================================
// 3. USUARIOS Y PERFILES DENTRO DEL TENANT
// ==============================================================================

export const TenantUserSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: UserRoleSchema.default('cashier'),
  display_name: z.string().min(1, 'El nombre para mostrar es requerido'),
  phone: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type TenantUser = z.infer<typeof TenantUserSchema>;

// ==============================================================================
// 4. CATEGORÍAS
// ==============================================================================

export const CategorySchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string().min(1, 'El nombre de la categoría es requerido'),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  display_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
  available_channels: z.array(OrderChannelSchema).default(['pos', 'web', 'whatsapp']),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type Category = z.infer<typeof CategorySchema>;

// ==============================================================================
// 5. MODIFICADORES Y SUBNIVELES ANIDADOS (2DO NIVEL)
// ==============================================================================

export interface ModifierOption {
  id: string;
  tenant_id: string;
  modifier_group_id: string;
  name: string;
  price_delta: number;
  is_default: boolean;
  is_available: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
  nested_groups?: ModifierGroup[];
}

export interface ModifierGroup {
  id: string;
  tenant_id: string;
  name: string;
  description?: string | null;
  min_selections: number;
  max_selections: number;
  is_active: boolean;
  options?: ModifierOption[];
  created_at?: string;
  updated_at?: string;
}

export const ModifierOptionSchema: z.ZodType<ModifierOption, z.ZodTypeDef, unknown> = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    modifier_group_id: z.string().uuid(),
    name: z.string().min(1, 'Nombre de la opción requerido'),
    price_delta: z.number().nonnegative().default(0.0),
    is_default: z.boolean().default(false),
    is_available: z.boolean().default(true),
    display_order: z.number().int().default(0),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
    nested_groups: z.array(ModifierGroupSchema).optional(),
  })
);

export const ModifierGroupSchema: z.ZodType<ModifierGroup, z.ZodTypeDef, unknown> = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    name: z.string().min(1, 'Nombre del grupo requerido'),
    description: z.string().nullable().optional(),
    min_selections: z.number().int().nonnegative().default(0),
    max_selections: z.number().int().positive().default(1),
    is_active: z.boolean().default(true),
    options: z.array(ModifierOptionSchema).optional(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
  })
);

// ==============================================================================
// 6. PRODUCTOS Y PLATOS
// ==============================================================================

export const ProductSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  category_id: z.string().uuid().nullable(),
  name: z.string().min(1, 'Nombre del producto requerido'),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  base_price: z.number().nonnegative('El precio base neto no puede ser negativo'),
  cost_price: z.number().nonnegative().nullable().optional(),
  tax_rate: z.number().nonnegative().default(15.0),
  image_url: z.string().url().nullable().optional(),
  is_available: z.boolean().default(true),
  track_inventory: z.boolean().default(false),
  stock_quantity: z.number().int().default(0),
  display_order: z.number().int().default(0),
  is_featured: z.boolean().default(false),
  available_channels: z.array(OrderChannelSchema).default(['pos', 'web', 'whatsapp']),
  modifier_groups: z.array(ModifierGroupSchema).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type Product = z.infer<typeof ProductSchema>;
