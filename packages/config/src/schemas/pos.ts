import { z } from 'zod';

// ==============================================================================
// 1. ENUMS Y MODELOS DE MESAS
// ==============================================================================

export const TableStatusSchema = z.enum([
  'available',
  'occupied',
  'bill_requested',
  'reserved',
]);
export type TableStatus = z.infer<typeof TableStatusSchema>;

export const DiningAreaSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string().min(1),
  display_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});
export type DiningArea = z.infer<typeof DiningAreaSchema>;

export interface RestaurantTable {
  id: string;
  tenant_id: string;
  area_id?: string | null;
  table_number: string;
  capacity: number;
  status: TableStatus;
  current_order_id?: string | null;
  assigned_waiter_id?: string | null;
  pos_x?: number;
  pos_y?: number;
  is_active: boolean;
}

export const RestaurantTableSchema: z.ZodType<RestaurantTable, z.ZodTypeDef, unknown> = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  area_id: z.string().uuid().nullable().optional(),
  table_number: z.string().min(1),
  capacity: z.number().int().positive().default(4),
  status: TableStatusSchema.default('available'),
  current_order_id: z.string().uuid().nullable().optional(),
  assigned_waiter_id: z.string().uuid().nullable().optional(),
  pos_x: z.number().optional().default(0),
  pos_y: z.number().optional().default(0),
  is_active: z.boolean().default(true),
});

// ==============================================================================
// 2. DIVISIÓN DE CUENTAS (SPLIT BILLS)
// ==============================================================================

export interface SplitShare {
  diner_number: number;
  amount: number;
}

/**
 * Divide equitativamente un total entre N comensales ajustando centavos residuales
 */
export function calculateEquitableSplit(total: number, dinersCount: number): SplitShare[] {
  if (dinersCount <= 0) return [];
  const baseShare = Math.floor((total / dinersCount) * 100) / 100;
  const remainder = Math.round((total - baseShare * dinersCount) * 100);

  const shares: SplitShare[] = [];
  for (let i = 1; i <= dinersCount; i++) {
    const extraCent = i <= remainder ? 0.01 : 0.0;
    const finalAmount = Math.round((baseShare + extraCent) * 100) / 100;
    shares.push({
      diner_number: i,
      amount: finalAmount,
    });
  }
  return shares;
}

// ==============================================================================
// 3. FORMATEADOR DE TICKETS PARA IMPRESIÓN TÉRMICA ESC/POS
// ==============================================================================

export interface ReceiptData {
  restaurantName: string;
  restaurantRuc?: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  orderNumber: number;
  tableNumber?: string;
  waiterName?: string;
  createdAt: string;
  items: {
    quantity: number;
    name: string;
    subtotal: number;
    modifiers?: string[];
  }[];
  netSubtotal: number;
  taxTotal: number;
  tipAmount: number;
  grandTotal: number;
  paymentMethod: string;
}

/**
 * Formatea los datos de la orden en texto plano alineado para impresoras térmicas de 58mm o 80mm
 */
export function generateEscPosReceiptText(data: ReceiptData, widthChars: number = 42): string {
  const line = '='.repeat(widthChars);
  const thinLine = '-'.repeat(widthChars);

  function center(text: string): string {
    const pad = Math.max(0, Math.floor((widthChars - text.length) / 2));
    return ' '.repeat(pad) + text;
  }

  function row(left: string, right: string): string {
    const space = Math.max(1, widthChars - left.length - right.length);
    return left + ' '.repeat(space) + right;
  }

  const lines: string[] = [];
  lines.push(center(data.restaurantName.toUpperCase()));
  if (data.restaurantRuc) lines.push(center(`RUC: ${data.restaurantRuc}`));
  if (data.restaurantAddress) lines.push(center(data.restaurantAddress));
  if (data.restaurantPhone) lines.push(center(`Tel: ${data.restaurantPhone}`));
  lines.push(line);

  lines.push(row(`ORDEN: #${data.orderNumber}`, data.tableNumber ? `MESA: ${data.tableNumber}` : 'DELIVERY/PARA LLEVAR'));
  if (data.waiterName) lines.push(row('MESERO:', data.waiterName));
  lines.push(row('FECHA:', new Date(data.createdAt).toLocaleString('es-EC')));
  lines.push(thinLine);

  lines.push(row('CANT DESCRIPCION', 'VALOR'));
  lines.push(thinLine);

  for (const item of data.items) {
    const itemLeft = `${item.quantity}x ${item.name}`;
    const itemRight = `$${item.subtotal.toFixed(2)}`;
    lines.push(row(itemLeft.slice(0, widthChars - 10), itemRight));
    if (item.modifiers && item.modifiers.length > 0) {
      for (const mod of item.modifiers) {
        lines.push(`   * ${mod}`.slice(0, widthChars));
      }
    }
  }

  lines.push(thinLine);
  lines.push(row('SUBTOTAL NETO:', `$${data.netSubtotal.toFixed(2)}`));
  lines.push(row('IVA (15%):', `$${data.taxTotal.toFixed(2)}`));
  if (data.tipAmount > 0) {
    lines.push(row('PROPINA VOLUNTARIA:', `$${data.tipAmount.toFixed(2)}`));
  }
  lines.push(line);
  lines.push(row('TOTAL A PAGAR:', `$${data.grandTotal.toFixed(2)}`));
  lines.push(row('FORMA DE PAGO:', data.paymentMethod.toUpperCase()));
  lines.push(line);
  lines.push(center('¡GRACIAS POR SU PREFERENCIA!'));
  lines.push(center('Comprobante Interno Sin Validez Tributaria'));

  return lines.join('\n');
}
