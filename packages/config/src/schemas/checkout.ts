import { z } from 'zod';

// ==============================================================================
// ESQUEMA DE SELECCIÓN DE MODIFICADORES EN EL CARRITO (SOPORTE ANIDADO)
// ==============================================================================

export interface SelectedModifier {
  modifier_group_id: string;
  modifier_group_name: string;
  modifier_option_id: string;
  modifier_option_name: string;
  price_delta: number;
  nested_selections?: SelectedModifier[];
}

export const SelectedModifierSchema: z.ZodType<SelectedModifier, z.ZodTypeDef, unknown> = z.lazy(() =>
  z.object({
    modifier_group_id: z.string().uuid(),
    modifier_group_name: z.string(),
    modifier_option_id: z.string().uuid(),
    modifier_option_name: z.string(),
    price_delta: z.number().nonnegative(),
    nested_selections: z.array(SelectedModifierSchema).optional(),
  })
);

// ==============================================================================
// ESQUEMA DE LÍNEA DE PEDIDO (CART ITEM)
// ==============================================================================

export const CartItemSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string(),
  base_price: z.number().nonnegative(),
  tax_rate: z.number().nonnegative().default(15.0),
  quantity: z.number().int().positive(),
  selected_modifiers: z.array(SelectedModifierSchema).default([]),
  special_instructions: z.string().max(250).optional(),
});
export type CartItem = z.infer<typeof CartItemSchema>;

// ==============================================================================
// DESGLOSE Y LIQUIDACIÓN EN CHECKOUT (TAX-EXCLUSIVE)
// ==============================================================================

export const TaxRateBreakdownSchema = z.object({
  rate: z.number().nonnegative(),
  taxable_subtotal: z.number().nonnegative(),
  tax_amount: z.number().nonnegative(),
});
export type TaxRateBreakdown = z.infer<typeof TaxRateBreakdownSchema>;

export const OrderSummarySchema = z.object({
  net_subtotal: z.number().nonnegative(),
  taxes: z.array(TaxRateBreakdownSchema),
  tax_total: z.number().nonnegative(),
  delivery_fee: z.number().nonnegative().default(0.0),
  tip_amount: z.number().nonnegative().default(0.0),
  grand_total: z.number().nonnegative(),
});
export type OrderSummary = z.infer<typeof OrderSummarySchema>;

function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function sumModifiersPrice(modifiers: SelectedModifier[]): number {
  return modifiers.reduce((acc, mod) => {
    const nestedSum = mod.nested_selections ? sumModifiersPrice(mod.nested_selections) : 0;
    return acc + mod.price_delta + nestedSum;
  }, 0);
}

/**
 * Calcula el desglose del pedido aplicando impuestos en checkout de acuerdo al tax_rate individual
 */
export function calculateOrderSummary(
  items: CartItem[],
  deliveryFee: number = 0,
  tipAmount: number = 0
): OrderSummary {
  let netSubtotal = 0;
  const taxMap = new Map<number, number>();

  for (const item of items) {
    const modifiersDelta = sumModifiersPrice(item.selected_modifiers);
    const unitPrice = item.base_price + modifiersDelta;
    const itemSubtotal = unitPrice * item.quantity;

    netSubtotal += itemSubtotal;

    const currentTaxable = taxMap.get(item.tax_rate) || 0;
    taxMap.set(item.tax_rate, currentTaxable + itemSubtotal);
  }

  const taxes: TaxRateBreakdown[] = [];
  let taxTotal = 0;

  taxMap.forEach((taxableAmount, rate) => {
    const roundedTaxable = roundToTwo(taxableAmount);
    const calculatedTax = roundToTwo(roundedTaxable * (rate / 100));
    taxes.push({
      rate,
      taxable_subtotal: roundedTaxable,
      tax_amount: calculatedTax,
    });
    taxTotal += calculatedTax;
  });

  const roundedNetSubtotal = roundToTwo(netSubtotal);
  const roundedTaxTotal = roundToTwo(taxTotal);
  const roundedDeliveryFee = roundToTwo(deliveryFee);
  const roundedTipAmount = roundToTwo(tipAmount);

  const grandTotal = roundToTwo(
    roundedNetSubtotal + roundedTaxTotal + roundedDeliveryFee + roundedTipAmount
  );

  return {
    net_subtotal: roundedNetSubtotal,
    taxes,
    tax_total: roundedTaxTotal,
    delivery_fee: roundedDeliveryFee,
    tip_amount: roundedTipAmount,
    grand_total: grandTotal,
  };
}

/**
 * Tarificación dinámica de delivery por kilómetro / geocerca
 * @param distanceKm Distancia estimada en kilómetros
 * @param baseFee Tarifa base mínima (ej: $1.50 cubre hasta 2 km)
 * @param perExtraKmFee Tarifa adicional por km excedente (ej: $0.50/km)
 * @param includedKm Kilómetros incluidos en la tarifa base (por defecto 2.0 km)
 */
export function calculateDynamicDeliveryFee(
  distanceKm: number,
  baseFee: number = 1.50,
  perExtraKmFee: number = 0.50,
  includedKm: number = 2.0
): { fee: number; estimatedMinutes: number; distanceKm: number } {
  const safeDistance = Math.max(0.5, distanceKm);
  let fee = baseFee;
  if (safeDistance > includedKm) {
    const extraKm = safeDistance - includedKm;
    fee += extraKm * perExtraKmFee;
  }
  const roundedFee = roundToTwo(fee);
  // Estimación de tiempo: 15 min de cocina + 3 min por km de trayecto
  const estimatedMinutes = Math.round(15 + safeDistance * 3);
  return {
    fee: roundedFee,
    estimatedMinutes,
    distanceKm: safeDistance,
  };
}

