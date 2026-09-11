import { z } from 'zod';

// ==============================================================================
// 1. FUENTES DE ATRIBUCIÓN DE MARKETING
// ==============================================================================

export const AttributionSourceSchema = z.enum([
  'qr_table',
  'qr_packaging',
  'influencer',
  'meta_ads',
  'google_ads',
  'organic',
  'direct',
  'whatsapp_broadcast',
]);
export type AttributionSource = z.infer<typeof AttributionSourceSchema>;

export const ATTRIBUTION_SOURCE_LABELS: Record<AttributionSource, string> = {
  qr_table: 'QR Mesa en Salón',
  qr_packaging: 'QR en Empaque (Delivery)',
  influencer: 'Influencer / Creador Aliado',
  meta_ads: 'Meta Ads (Instagram / Facebook)',
  google_ads: 'Google Ads (Search & Maps)',
  organic: 'Orgánico / Búsqueda Directa',
  direct: 'Directo / Recomendación',
  whatsapp_broadcast: 'Difusión WhatsApp CRM',
};

// ==============================================================================
// 2. MOTIVOS DE CANCELACIÓN OPERATIVA
// ==============================================================================

export const CancellationReasonSchema = z.enum([
  'stock_out',
  'kitchen_delay',
  'customer_cancelled',
  'out_of_range',
  'payment_failed',
]);
export type CancellationReason = z.infer<typeof CancellationReasonSchema>;

export const CANCELLATION_REASON_LABELS: Record<CancellationReason, string> = {
  stock_out: 'Falta de stock o insumo agotado',
  kitchen_delay: 'Demora crítica en cocina (KDS)',
  customer_cancelled: 'Desistimiento voluntario del cliente',
  out_of_range: 'Dirección fuera de cobertura logística',
  payment_failed: 'Falla o rechazo en pasarela de pago',
};

// ==============================================================================
// 3. CAMPAÑAS Y RENDIMIENTO DE MARKETING
// ==============================================================================

export const CampaignRecordSchema = z.object({
  id: z.string().uuid().or(z.string()),
  name: z.string(),
  source: AttributionSourceSchema,
  channel_name: z.string(),
  budget_spent: z.number().nonnegative(),
  impressions: z.number().int().nonnegative(),
  clicks: z.number().int().nonnegative(),
  leads_generated: z.number().int().nonnegative(),
  orders_attributed: z.number().int().nonnegative(),
  revenue_generated: z.number().nonnegative(),
  roas: z.number().nonnegative(),
  cac: z.number().nonnegative(),
  status: z.enum(['active', 'paused', 'completed']),
  start_date: z.string(),
  end_date: z.string().nullable().optional(),
});
export type CampaignRecord = z.infer<typeof CampaignRecordSchema>;

// ==============================================================================
// 4. CREADORES DE CONTENIDO & INFLUENCERS
// ==============================================================================

export const InfluencerPartnerSchema = z.object({
  id: z.string().uuid().or(z.string()),
  name: z.string(),
  handle: z.string(),
  platform: z.enum(['instagram', 'tiktok', 'youtube']),
  promo_code: z.string(),
  free_meals_cost: z.number().nonnegative(),
  orders_generated: z.number().int().nonnegative(),
  revenue_generated: z.number().nonnegative(),
  roi_percentage: z.number(),
  last_post_date: z.string(),
  status: z.enum(['active', 'pending_collab', 'inactive']),
});
export type InfluencerPartner = z.infer<typeof InfluencerPartnerSchema>;

// ==============================================================================
// 5. COHORTES DE RETENCIÓN DE CLIENTES (30 / 60 / 90 DÍAS)
// ==============================================================================

export const RetentionCohortSchema = z.object({
  cohort_month: z.string(), // Ej: "Mayo 2026"
  total_acquired: z.number().int().positive(),
  retained_30d: z.number().int().nonnegative(),
  rate_30d: z.number().nonnegative(),
  retained_60d: z.number().int().nonnegative(),
  rate_60d: z.number().nonnegative(),
  retained_90d: z.number().int().nonnegative(),
  rate_90d: z.number().nonnegative(),
});
export type RetentionCohort = z.infer<typeof RetentionCohortSchema>;

// ==============================================================================
// 6. SUCURSALES & DESEMPEÑO
// ==============================================================================

export const BranchPerformanceSchema = z.object({
  branch_id: z.string(),
  branch_name: z.string(),
  gross_sales: z.number().nonnegative(),
  net_sales: z.number().nonnegative(),
  total_orders: z.number().int().nonnegative(),
  avg_ticket: z.number().nonnegative(),
  avg_prep_time_minutes: z.number().nonnegative(),
  avg_delivery_time_minutes: z.number().nonnegative(),
  cancellation_rate: z.number().nonnegative(),
  status: z.enum(['open', 'busy', 'closed']),
});
export type BranchPerformance = z.infer<typeof BranchPerformanceSchema>;

// ==============================================================================
// 7. RECORDATORIOS DE CUMPLEAÑOS
// ==============================================================================

export const BirthdayReminderSchema = z.object({
  customer_id: z.string(),
  customer_name: z.string(),
  customer_phone: z.string(),
  birthday_date: z.string(), // "MM-DD" o "YYYY-MM-DD"
  days_until: z.number().int(),
  tier: z.enum(['bronze', 'silver', 'gold', 'vip']),
  suggested_gift_coupon: z.string(),
  already_notified: z.boolean().default(false),
});
export type BirthdayReminder = z.infer<typeof BirthdayReminderSchema>;
