import { z } from 'zod';
import { CartItemSchema } from './checkout';

// ==============================================================================
// 1. ESQUEMA DE WEBHOOK DE WHATSAPP CLOUD API (META)
// ==============================================================================

export const WhatsAppMessageBodySchema = z.object({
  from: z.string(),
  id: z.string(),
  timestamp: z.string(),
  text: z.object({
    body: z.string(),
  }).optional(),
  type: z.enum(['text', 'interactive', 'button', 'image', 'location', 'unknown']).default('text'),
});
export type WhatsAppMessageBody = z.infer<typeof WhatsAppMessageBodySchema>;

export const WhatsAppWebhookPayloadSchema = z.object({
  object: z.literal('whatsapp_business_account').optional(),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            messaging_product: z.literal('whatsapp'),
            metadata: z.object({
              display_phone_number: z.string().optional(),
              phone_number_id: z.string().optional(),
            }),
            contacts: z.array(
              z.object({
                profile: z.object({
                  name: z.string(),
                }),
                wa_id: z.string(),
              })
            ).optional(),
            messages: z.array(WhatsAppMessageBodySchema).optional(),
          }),
          field: z.literal('messages'),
        })
      ),
    })
  ),
});
export type WhatsAppWebhookPayload = z.infer<typeof WhatsAppWebhookPayloadSchema>;

// ==============================================================================
// 2. CONTEXTO CONVERSACIONAL DEL AGENTE GASTRONÓMICO
// ==============================================================================

export const AgentStateSchema = z.enum([
  'greeting',
  'browsing_menu',
  'selecting_modifiers',
  'awaiting_delivery_info',
  'order_confirmed',
]);
export type AgentState = z.infer<typeof AgentStateSchema>;

export const ConversationContextSchema = z.object({
  customerPhone: z.string(),
  customerName: z.string().default('Cliente'),
  tenantSlug: z.string(),
  state: AgentStateSchema.default('greeting'),
  pendingCartItems: z.array(CartItemSchema).default([]),
  deliveryAddress: z.string().optional(),
  lastInteraction: z.string().datetime().optional(),
});
export type ConversationContext = z.infer<typeof ConversationContextSchema>;

// ==============================================================================
// 3. RESPUESTAS DEL AGENTE (OUTBOUND)
// ==============================================================================

export interface AgentReply {
  text: string;
  quickReplies?: string[];
  actionExecuted?: 'search_menu' | 'add_to_cart' | 'calculate_quote' | 'create_order';
  checkoutUrl?: string;
}
