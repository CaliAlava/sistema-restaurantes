import { z } from 'zod';

// ==============================================================================
// 1. MODELOS DE TURNOS Y CIERRE DE CAJA
// ==============================================================================

export const ShiftStatusSchema = z.enum(['open', 'closed']);
export type ShiftStatus = z.infer<typeof ShiftStatusSchema>;

export const CashMovementTypeSchema = z.enum(['cash_in', 'cash_out']);
export type CashMovementType = z.infer<typeof CashMovementTypeSchema>;

export interface CashShift {
  id: string;
  tenant_id: string;
  user_id?: string | null;
  cashier_name: string;
  opened_at: string;
  closed_at?: string | null;
  opening_cash: number;
  expected_cash: number;
  counted_cash?: number | null;
  cash_difference?: number | null;
  total_sales_cash: number;
  total_sales_card: number;
  total_sales_transfer: number;
  total_tax_collected: number;
  total_tips: number;
  status: ShiftStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const CashShiftSchema: z.ZodType<CashShift, z.ZodTypeDef, unknown> = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid().nullable().optional(),
  cashier_name: z.string().min(1),
  opened_at: z.string().datetime(),
  closed_at: z.string().datetime().nullable().optional(),
  opening_cash: z.number().default(0.0),
  expected_cash: z.number().default(0.0),
  counted_cash: z.number().nullable().optional(),
  cash_difference: z.number().nullable().optional(),
  total_sales_cash: z.number().default(0.0),
  total_sales_card: z.number().default(0.0),
  total_sales_transfer: z.number().default(0.0),
  total_tax_collected: z.number().default(0.0),
  total_tips: z.number().default(0.0),
  status: ShiftStatusSchema.default('open'),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export interface CashMovement {
  id: string;
  shift_id: string;
  tenant_id: string;
  type: CashMovementType;
  amount: number;
  reason: string;
  created_at: string;
}

export const CashMovementSchema: z.ZodType<CashMovement, z.ZodTypeDef, unknown> = z.object({
  id: z.string().uuid(),
  shift_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  type: CashMovementTypeSchema,
  amount: z.number().positive(),
  reason: z.string().min(1),
  created_at: z.string().datetime(),
});

// ==============================================================================
// 2. EXPORTACIÓN TRIBUTARIA SRI (ECUADOR - LIBRO DE VENTAS E IVA)
// ==============================================================================

export interface SriSaleRecord {
  fecha: string; // YYYY-MM-DD
  numero_factura: string;
  tipo_identificacion: '04' | '05' | '07'; // 04: RUC, 05: Cédula, 07: Consumidor Final
  identificacion: string;
  cliente: string;
  subtotal_0: number;
  subtotal_15: number;
  monto_iva_15: number;
  propina: number;
  total_pagado: number;
  medio_pago: string;
}

/**
 * Genera el archivo CSV formateado con cabecera y codificación lista para declaración SRI
 */
export function generateSriSalesCsv(records: SriSaleRecord[]): string {
  const headers = [
    'Fecha',
    'Numero_Comprobante',
    'Tipo_ID',
    'Identificacion',
    'Razon_Social',
    'Subtotal_0%',
    'Subtotal_15%',
    'Monto_IVA_15%',
    'Propina',
    'Total_General',
    'Medio_Pago',
  ];

  const rows = records.map((r) => [
    r.fecha,
    r.numero_factura,
    r.tipo_identificacion,
    r.identificacion,
    `"${r.cliente.replace(/"/g, '""')}"`,
    r.subtotal_0.toFixed(2),
    r.subtotal_15.toFixed(2),
    r.monto_iva_15.toFixed(2),
    r.propina.toFixed(2),
    r.total_pagado.toFixed(2),
    r.medio_pago,
  ]);

  return [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\r\n');
}

// ==============================================================================
// 3. CONTROL DE MERMAS Y CORTESÍAS (AUDITORÍA FISCAL Y COSTOS)
// ==============================================================================

export const WasteReasonSchema = z.enum([
  'error_cocina',
  'cortesia_gerencia',
  'plato_devuelto',
  'rotura_insumos',
  'vencimiento_insumo',
]);
export type WasteReason = z.infer<typeof WasteReasonSchema>;

export const WASTE_REASON_LABELS: Record<WasteReason, string> = {
  error_cocina: 'Error de Cocina / Comanda Equivocada',
  cortesia_gerencia: 'Cortesía de Gerencia / Cliente VIP',
  plato_devuelto: 'Plato Devuelto por Comensal',
  rotura_insumos: 'Rotura o Derrame Accidental',
  vencimiento_insumo: 'Insumo Vencido / Merma en Frío',
};

export interface WasteRecord {
  id: string;
  product_name: string;
  quantity: number;
  cost_incurred: number;
  reason: WasteReason;
  authorized_by: string;
  created_at: string;
  notes?: string;
}

// ==============================================================================
// 4. INGENIERÍA DE MENÚ - MATRIZ BCG (BOSTON CONSULTING GROUP)
// ==============================================================================

export type BcgQuadrant = 'star' | 'plowhorse' | 'puzzle' | 'dog';

export interface BcgMenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  units_sold: number;
  revenue: number;
  margin_percentage: number;
  margin_amount: number;
  quadrant: BcgQuadrant;
  recommendation: string;
}

