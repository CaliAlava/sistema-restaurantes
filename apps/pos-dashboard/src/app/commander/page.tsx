'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Bot,
  User,
  Send,
  Sparkles,
  ArrowLeft,
  Flame,
  CheckCircle2,
  Terminal,
  ExternalLink,
  PhoneCall,
  MoreVertical,
  ChevronRight,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  actionExecuted?: string;
  checkoutUrl?: string;
}

export default function CommanderSimulatorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'agent',
      text: '¡Hola Carlos! 👋 Bienvenido a *Burger Craft & Co.*\n\nSoy *Commander*, tu asistente de pedidos por WhatsApp con IA.\n\n¿Qué te gustaría ordenar hoy? Puedes pedirme recomendaciones o pedir directamente: _"Quiero una Bacon Truffle en combo"_',
      timestamp: '17:30',
      actionExecuted: 'init_session',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [functionLogs, setFunctionLogs] = useState<string[]>([
    '🤖 [Commander AI] Sesión iniciada con éxito para comensal +593991234567',
    '📊 [Context] Tenant resuelto: "burger-craft"',
    '⚡ [Realtime Ready] Conexión abierta hacia KDS y Supabase',
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    const lower = text.toLowerCase();
    setFunctionLogs((prev) => [
      ...prev,
      `📨 [Inbound Message] "${text}" recibido por Webhook`,
      '🔍 [Function Calling] Analizando intenciones y extrayendo modificadores...',
    ]);

    // Simulación del motor conversacional
    setTimeout(() => {
      let replyText = '';
      let action = 'search_menu';
      let link: string | undefined;

      if (lower.includes('bacon') || lower.includes('combo') || lower.includes('smash')) {
        action = 'calculate_order_quote';
        replyText =
          '✅ ¡Excelente elección! He agregado a tu pedido:\n\n*1x Bacon Truffle Double Smash* 🍟🥤 _(En Combo con Coca-Cola Zero)_\n\n📊 *Liquidación Financiera:*\n• Subtotal Neto: $13.00\n• IVA (15% SRI): $1.95\n• Delivery Moto: $2.50\n• *Total a Pagar: $17.45*\n\n📍 Por favor indícame tu *dirección exacta* para enviarlo.';
        setFunctionLogs((prev) => [
          ...prev,
          '🍔 [Tool: get_product_details] Producto "Bacon Truffle Double Smash" seleccionado',
          '🍟 [Tool: resolve_nested_modifier] Combo activo -> Opción hija: "Coca-Cola Zero"',
          '💵 [Tool: calculate_order_summary] Subtotal: $13.00 | IVA 15%: $1.95 | Total: $17.45',
        ]);
      } else if (
        lower.includes('av') ||
        lower.includes('calle') ||
        lower.includes('samborondon') ||
        lower.includes('urdesa') ||
        lower.length > 15
      ) {
        action = 'create_order';
        link = 'http://localhost:3000/burger-craft/checkout?phone=0991234567';
        replyText = `🎉 ¡Pedido Registrado con Éxito! 🎉\n\n*Orden #45*\n🍽️ *Restaurante:* Burger Craft & Co.\n📍 *Entrega en:* ${text}\n⏱️ *Tiempo estimado:* 25-35 minutos\n\n💰 *Total a Cobrar:* $17.45 (IVA 15% incluido)\n\nTu comanda ya ingresó a la pantalla de cocina (KDS). Puedes pagar en efectivo contra-entrega o con tarjeta online aquí:\n👉 ${link}`;
        setFunctionLogs((prev) => [
          ...prev,
          `📍 [Tool: set_delivery_address] Dirección asignada: "${text}"`,
          '🚀 [Tool: create_order] Insertando orden en tabla "orders" con status "pending"',
          '🔔 [Supabase Realtime] Evento broadcast emitido hacia KDS (Kitchen Display System)',
        ]);
      } else if (lower.includes('menu') || lower.includes('menú') || lower.includes('carta')) {
        action = 'search_menu';
        replyText =
          '🍔 *Bacon Truffle Double Smash* - $9.50 (+IVA)\n_Carne Angus smash, queso cheddar, tocino maple y alioli de trufa._\n\n🍔 *Classic Americana* - $7.00 (+IVA)\n_Carne Angus smash, doble cheddar americano y salsa especial._\n\n🍟 *Papas Rústicas Trufadas* - $4.25 (+IVA)\n_Con aceite de trufa y queso parmesano reggiano._\n\n¿Cuál te gustaría ordenar?';
        setFunctionLogs((prev) => [
          ...prev,
          '📋 [Tool: search_menu] Consultando categorías activas del tenant "burger-craft"',
        ]);
      } else {
        replyText =
          '¿Te gustaría ordenar una hamburguesa con papas o prefieres ver nuestro menú digital completo?';
      }

      const agentMsg: ChatMessage = {
        id: `agt-${Date.now()}`,
        sender: 'agent',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionExecuted: action,
        checkoutUrl: link,
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-lg">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg text-white">Commander • WhatsApp AI Agent</h1>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                Function Calling Activo
              </span>
            </div>
            <p className="text-xs text-zinc-400">Simulador de toma de pedidos automatizada y webhook</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/kds"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <Flame className="w-4 h-4" />
            <span>Ver Comandas en KDS</span>
          </Link>
        </div>
      </header>

      {/* Cuerpo: Simulador de WhatsApp + Consola de Function Calling */}
      <main className="max-w-6xl mx-auto p-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Mockup Teléfono WhatsApp */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-sm rounded-[40px] border-4 border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden flex flex-col h-[650px]">
            {/* Barra superior de WhatsApp */}
            <div className="bg-emerald-800 px-4 py-3 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full bg-white flex items-center justify-center text-emerald-800 font-bold overflow-hidden shadow-xs">
                  <Bot className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">Burger Craft AI</h3>
                  <span className="text-[10px] text-emerald-200">En línea • Cuenta de Empresa</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-emerald-100">
                <PhoneCall className="w-4 h-4" />
                <MoreVertical className="w-4 h-4" />
              </div>
            </div>

            {/* Chat Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0c1317] bg-opacity-95">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-md ${
                        isUser
                          ? 'bg-[#005c4b] text-white rounded-tr-none'
                          : 'bg-[#202c33] text-zinc-100 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      {msg.checkoutUrl && (
                        <div className="mt-2 pt-2 border-t border-zinc-700/60">
                          <a
                            href={msg.checkoutUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-bold text-emerald-400 hover:underline"
                          >
                            <span>Completar Pago Seguro</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      <div className="text-[9px] text-zinc-400 text-right mt-1 opacity-70">
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-1 bg-[#202c33] text-zinc-400 p-2.5 rounded-2xl w-24 text-[11px]">
                  <span className="animate-pulse">Escribiendo</span>
                  <span className="animate-bounce">...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Respuestas rápidas sugeridas */}
            <div className="p-2 bg-[#1f2c34] flex gap-1.5 overflow-x-auto border-t border-zinc-800 scrollbar-none">
              {[
                'Ver el menú',
                'Quiero una Bacon Truffle en combo con Coca-Cola Zero',
                'Av. Samborondón Km 2.5 Edificio Platinum',
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(suggestion)}
                  className="px-2.5 py-1 rounded-full bg-zinc-800 text-[10px] text-emerald-400 font-semibold whitespace-nowrap hover:bg-zinc-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-2.5 bg-[#202c33] flex items-center gap-2 border-t border-zinc-800"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 text-xs bg-[#2a3942] rounded-2xl px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white transition-all shadow-md shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Columna Derecha: Consola de Function Calling y Arquitectura */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-sm text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Consola en Vivo: Function Calling & Webhook</span>
              </h2>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="bg-black/90 p-4 rounded-2xl font-mono text-[11px] leading-relaxed text-zinc-300 space-y-1.5 h-72 overflow-y-auto border border-zinc-800">
              {functionLogs.map((log, i) => (
                <div key={i} className="animate-in fade-in">
                  <span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span>{' '}
                  <span
                    className={
                      log.includes('Tool')
                        ? 'text-amber-400 font-bold'
                        : log.includes('Realtime')
                        ? 'text-emerald-400 font-bold'
                        : 'text-zinc-300'
                    }
                  >
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3 text-xs">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Cómo opera en Producción con Meta Cloud API</span>
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              1. <strong>Endpoint Webhook:</strong> Meta envía los eventos a{' '}
              <code className="bg-zinc-800 text-emerald-400 px-1.5 py-0.5 rounded">
                /api/webhooks/whatsapp
              </code>.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              2. <strong>Extracción de Modificadores:</strong> El agente reconoce solicitudes complejas (hamburguesa con término y combo con bebida específica).
            </p>
            <p className="text-zinc-400 leading-relaxed">
              3. <strong>Sincronización Automática:</strong> El pedido se inserta con canal <code className="text-white">whatsapp</code> e ingresa instantáneamente al KDS de cocina con alerta auditiva.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
