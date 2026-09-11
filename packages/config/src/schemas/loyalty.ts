import { z } from 'zod';

// ==============================================================================
// 1. NIVELES DE FIDELIZACIÓN (TIERS)
// ==============================================================================

export const CustomerTierSchema = z.enum(['bronze', 'silver', 'gold', 'vip']);
export type CustomerTier = z.infer<typeof CustomerTierSchema>;

export interface CustomerProfile {
  id: string;
  tenant_id: string;
  phone: string;
  name: string;
  email?: string | null;
  tier: CustomerTier;
  total_orders: number;
  total_spent: number;
  loyalty_points: number;
  tags: string[];
  birthday?: string | null; // "MM-DD" o "YYYY-MM-DD"
  acquisition_source?: string | null;
  preferred_category?: string | null;
  average_days_between_orders?: number | null;
  first_order_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const CustomerProfileSchema: z.ZodType<CustomerProfile, z.ZodTypeDef, unknown> = z.object({
  id: z.string(),
  tenant_id: z.string(),
  phone: z.string().min(6),
  name: z.string().min(1),
  email: z.string().email().nullable().optional(),
  tier: CustomerTierSchema.default('bronze'),
  total_orders: z.number().int().default(0),
  total_spent: z.number().default(0.0),
  loyalty_points: z.number().int().default(0),
  tags: z.array(z.string()).default([]),
  birthday: z.string().nullable().optional(),
  acquisition_source: z.string().nullable().optional(),
  preferred_category: z.string().nullable().optional(),
  average_days_between_orders: z.number().nullable().optional(),
  first_order_date: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// ==============================================================================
// 2. CUPONES DE DESCUENTO
// ==============================================================================

export const DiscountTypeSchema = z.enum(['percentage', 'fixed_amount']);
export type DiscountType = z.infer<typeof DiscountTypeSchema>;

export interface Coupon {
  id: string;
  tenant_id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number | null;
  valid_until?: string | null;
  times_used?: number;
  is_active: boolean;
}

export const CouponSchema: z.ZodType<Coupon, z.ZodTypeDef, unknown> = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  code: z.string().min(2),
  discount_type: DiscountTypeSchema.default('percentage'),
  discount_value: z.number().positive(),
  min_order_amount: z.number().default(0.0),
  max_discount_amount: z.number().positive().nullable().optional(),
  valid_until: z.string().datetime().nullable().optional(),
  times_used: z.number().int().default(0).optional(),
  is_active: z.boolean().default(true),
});

// ==============================================================================
// 3. CÁLCULO FINANCIERO CON DESCUENTO E IVA 15%
// ==============================================================================

export interface DiscountedOrderResult {
  original_subtotal: number;
  discount_applied: number;
  discounted_subtotal: number;
  tax_total: number;
  delivery_fee: number;
  grand_total: number;
  points_earned: number; // 1 punto por cada $1 gastado
}

/**
 * Aplica cupón comercial y recalcula el IVA 15% estrictamente sobre la base imponible neta con descuento (Cumplimiento SRI Ecuador)
 */
export function applyCouponDiscount(
  netSubtotal: number,
  deliveryFee: number = 2.5,
  coupon?: Coupon | null
): DiscountedOrderResult {
  let discount = 0;

  if (coupon && coupon.is_active && netSubtotal >= coupon.min_order_amount) {
    if (coupon.discount_type === 'percentage') {
      discount = Math.round(((netSubtotal * coupon.discount_value) / 100) * 100) / 100;
      if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
        discount = coupon.max_discount_amount;
      }
    } else {
      discount = Math.min(coupon.discount_value, netSubtotal);
    }
  }

  const discountedSubtotal = Math.max(0, Math.round((netSubtotal - discount) * 100) / 100);
  const taxTotal = Math.round(discountedSubtotal * 0.15 * 100) / 100; // IVA 15%
  const grandTotal = Math.round((discountedSubtotal + taxTotal + deliveryFee) * 100) / 100;
  const pointsEarned = Math.floor(discountedSubtotal);

  return {
    original_subtotal: netSubtotal,
    discount_applied: discount,
    discounted_subtotal: discountedSubtotal,
    tax_total: taxTotal,
    delivery_fee: deliveryFee,
    grand_total: grandTotal,
    points_earned: pointsEarned,
  };
}
