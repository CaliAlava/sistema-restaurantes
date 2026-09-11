import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppWebhookPayloadSchema } from '@restaurantes/config';
import { processWhatsAppMessage } from '../../../../lib/whatsapp/agent';

/**
 * Verificación del Webhook de WhatsApp Cloud API (Meta GET Challenge)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'restaurantes_secret_verify_token';

  if (mode === 'subscribe' && token === expectedToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Token de verificación inválido' }, { status: 403 });
}

/**
 * Recepción y procesamiento de mensajes entrantes de WhatsApp Cloud API
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parsed = WhatsAppWebhookPayloadSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json({ status: 'ignored_unsupported_payload' }, { status: 200 });
    }

    const messageData = parsed.data.entry?.[0]?.changes?.[0]?.value;
    const message = messageData?.messages?.[0];
    const contact = messageData?.contacts?.[0];

    if (!message || message.type !== 'text' || !message.text?.body) {
      return NextResponse.json({ status: 'no_text_message' }, { status: 200 });
    }

    const customerPhone = message.from;
    const customerName = contact?.profile?.name || 'Comensal';
    const messageText = message.text.body;

    // Procesar con el motor conversacional AI
    const reply = await processWhatsAppMessage(customerPhone, customerName, messageText, 'burger-craft');

    // Si estuvieran configuradas las credenciales de envío de Meta, enviaríamos el POST a graph.facebook.com:
    if (process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN) {
      await fetch(
        `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: customerPhone,
            type: 'text',
            text: { body: reply.text },
          }),
        }
      );
    }

    return NextResponse.json({
      status: 'success',
      reply,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno procesando webhook de WhatsApp', details: String(error) },
      { status: 500 }
    );
  }
}
