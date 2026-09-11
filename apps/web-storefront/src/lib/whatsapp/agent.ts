import {
  type ConversationContext,
  type AgentReply,
  type CartItem,
  type SelectedModifier,
  calculateOrderSummary,
} from '@restaurantes/config';
import { MOCK_PRODUCTS, MOCK_TENANTS } from '../../data/mock-catalog';

const activeConversations = new Map<string, ConversationContext>();

export function getOrCreateContext(
  customerPhone: string,
  customerName: string = 'Cliente',
  tenantSlug: string = 'burger-craft'
): ConversationContext {
  const existing = activeConversations.get(customerPhone);
  if (existing) return existing;

  const newContext: ConversationContext = {
    customerPhone,
    customerName,
    tenantSlug,
    state: 'greeting',
    pendingCartItems: [],
    lastInteraction: new Date().toISOString(),
  };
  activeConversations.set(customerPhone, newContext);
  return newContext;
}

/**
 * Motor conversacional gastronómico con Function Calling emulado
 */
export async function processWhatsAppMessage(
  customerPhone: string,
  customerName: string,
  messageText: string,
  tenantSlug: string = 'burger-craft'
): Promise<AgentReply> {
  const context = getOrCreateContext(customerPhone, customerName, tenantSlug);
  const text = messageText.trim().toLowerCase();
  const defaultTenant = MOCK_TENANTS['burger-craft']!;
  const tenant = MOCK_TENANTS[tenantSlug] ?? defaultTenant;
  const products = MOCK_PRODUCTS[tenantSlug] ?? MOCK_PRODUCTS['burger-craft'] ?? [];

  // 1. INTENCIÓN: Saludo o Menú inicial
  if (
    text.includes('hola') ||
    text.includes('menu') ||
    text.includes('menú') ||
    text.includes('buenas') ||
    text.includes('que tienen') ||
    text.includes('carta')
  ) {
    context.state = 'browsing_menu';
    const productList = products
      .map((p) => `🍔 *${p.name}* - $${p.base_price.toFixed(2)} (+IVA)\n_${p.description}_`)
      .join('\n\n');

    return {
      text: `¡Hola ${customerName}! 👋 Bienvenido a *${tenant.name}*.\n\nSoy tu asistente virtual. Te comparto nuestros platillos más pedidos hoy:\n\n${productList}\n\n💬 *¿Qué te gustaría ordenar hoy?* Puedes decirme por ejemplo: _"Quiero una Bacon Truffle en combo"_`,
      actionExecuted: 'search_menu',
      quickReplies: ['Quiero una Bacon Truffle', 'Papas Trufadas', 'Ver el carrito'],
    };
  }

  // 2. INTENCIÓN: Pedir una hamburguesa con modificador / combo
  if (
    text.includes('bacon truffle') ||
    text.includes('bacon') ||
    text.includes('smash') ||
    text.includes('combo')
  ) {
    const product = products.find((p) => p.slug === 'bacon-truffle-double-smash') || products[0]!;
    const isCombo = text.includes('combo');
    const isCokeZero = text.includes('cero') || text.includes('zero') || text.includes('coca');

    const selectedModifiers: SelectedModifier[] = [
      {
        modifier_group_id: 'mg-doneness',
        modifier_group_name: 'Término de la Carne',
        modifier_option_id: 'opt-medium',
        modifier_option_name: 'Término Medio (Jugosa)',
        price_delta: 0.0,
      },
    ];

    if (isCombo) {
      selectedModifiers.push({
        modifier_group_id: 'mg-extras',
        modifier_group_name: 'Personaliza y Extras',
        modifier_option_id: 'opt-upgrade-combo',
        modifier_option_name: 'Convertir en Combo (Papas + Bebida)',
        price_delta: 3.5,
        nested_selections: [
          {
            modifier_group_id: 'mg-combo-drink',
            modifier_group_name: 'Elige la Bebida del Combo',
            modifier_option_id: isCokeZero ? 'opt-coca-cola' : 'opt-ice-tea',
            modifier_option_name: isCokeZero ? 'Coca-Cola Zero 355ml' : 'Té Helado de Frutos Rojos',
            price_delta: isCokeZero ? 0.0 : 0.5,
          },
        ],
      });
    }

    const cartItem: CartItem = {
      product_id: product.id,
      name: product.name,
      base_price: product.base_price,
      tax_rate: product.tax_rate,
      quantity: 1,
      selected_modifiers: selectedModifiers,
    };

    context.pendingCartItems.push(cartItem);
    context.state = 'awaiting_delivery_info';

    const summary = calculateOrderSummary(context.pendingCartItems, 2.5, 0);

    return {
      text: `✅ ¡Excelente elección! He agregado a tu pedido:\n\n*1x ${product.name}* ${
        isCombo ? '🍟🥤 _(En Combo con ' + (isCokeZero ? 'Coca-Cola Zero' : 'Té Helado') + ')_' : ''
      }\n\n📊 *Resumen Actual:*\n• Subtotal Neto: $${summary.net_subtotal.toFixed(2)}\n• IVA (15%): $${summary.tax_total.toFixed(2)}\n• Delivery: $${summary.delivery_fee.toFixed(2)}\n• *Total a Pagar: $${summary.grand_total.toFixed(2)}*\n\n📍 Por favor compárteme tu *dirección de entrega* para completar el pedido.`,
      actionExecuted: 'add_to_cart',
      quickReplies: ['Agregar Papas Trufadas', 'Confirmar Dirección', 'Cancelar'],
    };
  }

  // 3. INTENCIÓN: Agregar Papas extras
  if (text.includes('papas') || text.includes('trufadas')) {
    const fries = products.find((p) => p.slug === 'papas-rusticas-trufadas');
    if (fries) {
      context.pendingCartItems.push({
        product_id: fries.id,
        name: fries.name,
        base_price: fries.base_price,
        tax_rate: fries.tax_rate,
        quantity: 1,
        selected_modifiers: [],
      });
    }

    const summary = calculateOrderSummary(context.pendingCartItems, 2.5, 0);
    return {
      text: `🍟 ¡Papas rústicas trufadas agregadas!\n\nTu nuevo total es: *$${summary.grand_total.toFixed(2)}* (incluye IVA y delivery).\n\n¿A qué dirección te lo enviamos?`,
      actionExecuted: 'add_to_cart',
    };
  }

  // 4. INTENCIÓN: Dirección o Confirmación de pedido
  if (
    context.pendingCartItems.length > 0 &&
    (text.includes('av') ||
      text.includes('calle') ||
      text.includes('km') ||
      text.includes('urdesa') ||
      text.includes('samborondon') ||
      text.includes('casa') ||
      text.includes('confirmar') ||
      text.length > 10)
  ) {
    context.deliveryAddress = messageText;
    context.state = 'order_confirmed';

    const summary = calculateOrderSummary(context.pendingCartItems, 2.5, 0);
    const orderNumber = Math.floor(10 + Math.random() * 89);
    const checkoutLink = `http://localhost:3000/${tenantSlug}/checkout?phone=${encodeURIComponent(customerPhone)}`;

    return {
      text: `🎉 ¡Pedido Registrado con Éxito! 🎉\n\n*Orden #${orderNumber}*\n🍽️ *Restaurante:* ${tenant.name}\n📍 *Entrega en:* ${messageText}\n⏱️ *Tiempo estimado:* 25-35 minutos\n\n💰 *Total a Cobrar:* $${summary.grand_total.toFixed(2)} (IVA 15% incluido)\n\nTu comanda ya está en la pantalla de cocina (KDS). Si prefieres pagar con tarjeta online o revisar el detalle, entra aquí:\n👉 ${checkoutLink}`,
      actionExecuted: 'create_order',
      checkoutUrl: checkoutLink,
      quickReplies: ['Pagar en Efectivo', 'Ver Estado del Pedido'],
    };
  }

  // Fallback conversacional
  return {
    text: `Disculpa, no entendí completamente tu mensaje. ¿Deseas ver el menú de *${tenant.name}* o consultar el estado de tu orden?`,
    quickReplies: ['Ver el Menú', 'Consultar mi Pedido', 'Hablar con una persona'],
  };
}
