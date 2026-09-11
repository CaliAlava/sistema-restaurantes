import { z } from 'zod';

// ==============================================================================
// 1. MODELOS DE RESERVAS DE MESAS
// ==============================================================================

export const ReservationStatusSchema = z.enum([
  'pending',
  'confirmed',
  'seated',
  'cancelled',
  'no_show',
]);
export type ReservationStatus = z.infer<typeof ReservationStatusSchema>;

export interface Reservation {
  id: string;
  tenant_id: string;
  customer_id?: string | null;
  table_id?: string | null;
  table_number?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  party_size: number;
  reservation_date: string; // YYYY-MM-DD
  reservation_time: string; // HH:MM
  status: ReservationStatus;
  special_requests?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const ReservationSchema: z.ZodType<Reservation, z.ZodTypeDef, unknown> = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  customer_id: z.string().uuid().nullable().optional(),
  table_id: z.string().uuid().nullable().optional(),
  table_number: z.string().nullable().optional(),
  customer_name: z.string().min(1),
  customer_phone: z.string().min(6),
  customer_email: z.string().email().nullable().optional(),
  party_size: z.number().int().positive().default(2),
  reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reservation_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  status: ReservationStatusSchema.default('confirmed'),
  special_requests: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
