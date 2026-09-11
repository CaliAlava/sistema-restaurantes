import { z } from 'zod';
import { OrderChannelSchema } from './catalog';
import { AttributionSourceSchema, CancellationReasonSchema } from './marketing';

// ==============================================================================
// 1. ENUMS DE ÓRDENES Y COCINA
// ==============================================================================

export const OrderStatusSchema = z.enum([
  'pending',
  'preparing',
  'ready',
  'dispatched',
  'cancelled',
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const FulfillmentTypeSchema = z.enum(['dine_in', 'takeaway', 'delivery']);
export type FulfillmentType = z.infer<typeof FulfillmentTypeSchema>;

export const PaymentStatusSchema = z.enum(['pending', 'paid', 'failed', 'refunded']);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const PaymentMethodSchema = z.enum(['cash', 'transfer', 'card']);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

// ==============================================================================
// 2. MODIFICADORES DE LÍNEA DE ORDEN (RECURSIVOS)
// ==============================================================================

export interface OrderItemModifierRecord {
  id?: string;
  order_item_id?: string;
  parent_order_modifier_id?: string | null;
  modifier_group_name: string;
  modifier_option_name: string;
  price_delta: number;
  nested_modifiers?: OrderItemModifierRecord[];
}

export const OrderItemModifierRecordSchema: z.ZodType<OrderItemModifierRecord, z.ZodTypeDef, unknown> = z.lazy(() =>
  z.object({
    id: z.string().uuid().optional(),
    order_item_id: z.string().uuid().optional(),
    parent_order_modifier_id: z.string().uuid().nullable().optional(),
    modifier_group_name: z.string(),
    modifier_option_name: z.string(),
    price_delta: z.number().nonnegative().default(0.0),
    nested_modifiers: z.array(OrderItemModifierRecordSchema).optional(),
  })
);

// ==============================================================================
// 3. LÍNEAS DE PEDIDO (ORDER ITEMS)
// ==============================================================================

export const OrderItemRecordSchema = z.object({
  id: z.string().uuid().optional(),
  order_id: z.string().uuid().optional(),
  product_id: z.string().uuid().nullable().optional(),
  product_name: z.string(),
  unit_price: z.number().nonnegative(),
  tax_rate: z.number().nonnegative().default(15.0),
  quantity: z.number().int().positive(),
  subtotal: z.number().nonnegative(),
  special_instructions: z.string().nullable().optional(),
  modifiers: z.array(OrderItemModifierRecordSchema).default([]),
});
export type OrderItemRecord = z.infer<typeof OrderItemRecordSchema>;

// ==============================================================================
// 4. CABECERA DE ORDEN (ORDER RECORD)
// ==============================================================================

export const OrderRecordSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  daily_order_number: z.number().int().positive(),
  channel: OrderChannelSchema.default('web'),
  status: OrderStatusSchema.default('pending'),
  fulfillment_type: FulfillmentTypeSchema.default('delivery'),
  table_number: z.string().nullable().optional(),
  customer_name: z.string().min(1),
  customer_phone: z.string().min(6),
  customer_email: z.string().email().nullable().optional(),
  delivery_address: z.string().nullable().optional(),
  delivery_reference: z.string().nullable().optional(),
  payment_method: PaymentMethodSchema.default('cash'),
  payment_status: PaymentStatusSchema.default('pending'),
  net_subtotal: z.number().nonnegative(),
  tax_total: z.number().nonnegative(),
  delivery_fee: z.number().nonnegative().default(0.0),
  tip_amount: z.number().nonnegative().default(0.0),
  grand_total: z.number().nonnegative(),
  notes: z.string().nullable().optional(),
  estimated_minutes: z.number().int().positive().default(25),
  prepared_at: z.string().datetime().nullable().optional(),
  ready_at: z.string().datetime().nullable().optional(),
  dispatched_at: z.string().datetime().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  items: z.array(OrderItemRecordSchema).optional(),
  // Atribución de Marketing y Operación
  attribution_source: AttributionSourceSchema.optional(),
  attribution_campaign: z.string().nullable().optional(),
  influencer_code: z.string().nullable().optional(),
  qr_code_id: z.string().nullable().optional(),
  branch_id: z.string().nullable().optional(),
  branch_name: z.string().nullable().optional(),
  kitchen_time_minutes: z.number().nonnegative().nullable().optional(),
  delivery_transit_minutes: z.number().nonnegative().nullable().optional(),
  cancellation_reason: CancellationReasonSchema.nullable().optional(),
});
export type OrderRecord = z.infer<typeof OrderRecordSchema>;

