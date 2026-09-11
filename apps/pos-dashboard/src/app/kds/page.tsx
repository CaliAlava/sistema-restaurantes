'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { INITIAL_MOCK_ORDERS } from '../../data/mock-orders';
import { kitchenSound } from '../../lib/sound';
import type { OrderRecord, OrderStatus } from '@restaurantes/config';
import {
  Flame,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  Plus,
  Bike,
  Store,
  UtensilsCrossed,
  MessageSquare,
  Globe,
  Radio,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { StockQuickManagerModal } from '../../components/stock-quick-manager-modal';

export default function KDSPage() {
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_MOCK_ORDERS);
  const [filterStatus, setFilterStatus] = useState<string>('active'); // 'active' | 'pending' | 'preparing' | 'ready' | 'all'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showStockModal, setShowStockModal] = useState(false);

  // Reloj en tiempo real
  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtrado de órdenes para la cocina
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (ord.status === 'dispatched' || ord.status === 'cancelled') {
        return filterStatus === 'all';
      }
      if (filterStatus === 'active') {
        return ord.status === 'pending' || ord.status === 'preparing' || ord.status === 'ready';
      }
      return ord.status === filterStatus;
    });
  }, [orders, filterStatus]);

  // Transición de estados de comanda
  const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = currentStatus;
    if (currentStatus === 'pending') nextStatus = 'preparing';
    else if (currentStatus === 'preparing') nextStatus = 'ready';
    else if (currentStatus === 'ready') nextStatus = 'dispatched';

    if (soundEnabled) {
      kitchenSound.playActionBeep();
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: nextStatus,
              updated_at: new Date().toISOString(),
              ready_at: nextStatus === 'ready' ? new Date().toISOString() : o.ready_at,
              dispatched_at: nextStatus === 'dispatched' ? new Date().toISOString() : o.dispatched_at,
            }
          : o
      )
    );
  };

  // Simulación de nueva comanda entrante (para testear sonido y tiempo real)
  const handleSimulateIncomingOrder = () => {
    const nextNumber = Math.max(...orders.map((o) => o.daily_order_number), 42) + 1;
    const newOrder: OrderRecord = {
      id: `ord-${Date.now()}`,
      tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      daily_order_number: nextNumber,
      channel: 'web',
      status: 'pending',
      fulfillment_type: 'delivery',
      customer_name: 'Cliente en Vivo',
      customer_phone: '0990001122',
      delivery_address: 'Av. Juan Tanca Marengo Km 1.5',
      payment_method: 'card',
      payment_status: 'paid',
      net_subtotal: 13.0,
      tax_total: 1.95,
      delivery_fee: 2.5,
      tip_amount: 1.0,
      grand_total: 18.45,
      estimated_minutes: 25,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [
        {
          id: `item-${Date.now()}`,
          product_name: 'Bacon Truffle Double Smash',
          unit_price: 9.5,
          tax_rate: 15.0,
          quantity: 1,
          subtotal: 13.0,
          special_instructions: 'Urgente: cliente tiene prisa.',
          modifiers: [
            {
              modifier_group_name: 'Término de la Carne',
              modifier_option_name: 'Término Medio (Jugosa)',
              price_delta: 0.0,
            },
            {
              modifier_group_name: 'Personaliza y Extras',
              modifier_option_name: 'Convertir en Combo (Papas + Bebida)',
              price_delta: 3.5,
              nested_modifiers: [
                {
                  modifier_group_name: 'Elige la Bebida del Combo',
                  modifier_option_name: 'Coca-Cola Zero 355ml',
                  price_delta: 0.0,
                },
              ],
            },
          ],
        },
      ],
    };

    if (soundEnabled) {
      kitchenSound.playNewOrderChime();
    }

    setOrders((prev) => [newOrder, ...prev]);
  };

  // Calcular minutos transcurridos
  const getElapsedMinutes = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return Math.floor(diff / 60000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header Superior KDS */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Volver al inicio"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-zinc-950 font-black shadow-lg">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg text-white">KDS • Pantalla de Cocina</h1>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                Realtime Activo
              </span>
            </div>
            <p className="text-xs text-zinc-400">Burger Craft & Co. • Salón y Delivery</p>
          </div>
        </div>

        {/* Filtros de Estado */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
          {[
            { id: 'active', label: 'En Vivo' },
            { id: 'pending', label: 'Pendientes' },
            { id: 'preparing', label: 'Preparando' },
            { id: 'ready', label: 'Listas' },
            { id: 'all', label: 'Historial' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === tab.id
                  ? 'bg-amber-500 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Acciones Rápidas y Reloj */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-zinc-800 border-zinc-700 text-amber-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
            title={soundEnabled ? 'Sonido Activado' : 'Sonido Silenciado'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowStockModal(true)}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            title="Pausar o reactivar platos agotados (86)"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Pausar Plato (86)</span>
          </button>

          <button
            onClick={handleSimulateIncomingOrder}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Simular Comanda</span>
          </button>

          <div className="text-right pl-3 border-l border-zinc-800 font-mono text-sm text-zinc-300 font-bold">
            {currentTime ? currentTime.toLocaleTimeString() : '--:--:--'}
          </div>
        </div>
      </header>

      {/* Grid de Comandas KDS */}
      <main className="p-6 flex-1 overflow-x-auto">
        {filteredOrders.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center text-zinc-500">
            <CheckCircle2 className="w-16 h-16 text-zinc-700 stroke-1 mb-3" />
            <h2 className="text-lg font-bold text-zinc-300">¡Cocina al día!</h2>
            <p className="text-xs text-zinc-500 mt-1">No hay comandas pendientes en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start">
            {filteredOrders.map((order) => {
              const elapsed = getElapsedMinutes(order.created_at);
              const isDelayed = elapsed >= 20;
              const isWarning = elapsed >= 10 && elapsed < 20;

              return (
                <div
                  key={order.id}
                  className={`rounded-3xl border flex flex-col overflow-hidden shadow-xl transition-all duration-300 ${
                    order.status === 'ready'
                      ? 'border-emerald-600/80 bg-zinc-900'
                      : isDelayed
                      ? 'border-red-600 bg-zinc-900 ring-2 ring-red-500/20 animate-pulse'
                      : order.status === 'preparing'
                      ? 'border-blue-500/80 bg-zinc-900'
                      : 'border-amber-500/80 bg-zinc-900'
                  }`}
                >
                  {/* Cabecera de la Comanda */}
                  <div
                    className={`p-4 flex items-center justify-between border-b ${
                      order.status === 'ready'
                        ? 'bg-emerald-950/60 border-emerald-900/60 text-emerald-300'
                        : isDelayed
                        ? 'bg-red-950/80 border-red-900 text-red-200'
                        : order.status === 'preparing'
                        ? 'bg-blue-950/60 border-blue-900/60 text-blue-200'
                        : 'bg-amber-950/60 border-amber-900/60 text-amber-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-2xl tracking-tight text-white">
                          #{order.daily_order_number}
                        </span>
                        {/* Canal */}
                        <span className="text-xs opacity-75 flex items-center gap-1 uppercase font-bold tracking-wider">
                          {order.channel === 'web' && <Globe className="w-3.5 h-3.5" />}
                          {order.channel === 'pos' && <UtensilsCrossed className="w-3.5 h-3.5" />}
                          {order.channel === 'whatsapp' && <MessageSquare className="w-3.5 h-3.5" />}
                          {order.channel}
                        </span>
                      </div>
                      <span className="text-xs font-bold mt-0.5 block opacity-90">
                        {order.fulfillment_type === 'dine_in' && `Salón • ${order.table_number || 'Sin mesa'}`}
                        {order.fulfillment_type === 'takeaway' && 'Para Retirar en Barra'}
                        {order.fulfillment_type === 'delivery' && 'Delivery • Domicilio'}
                      </span>
                    </div>

                    {/* Temporizador */}
                    <div
                      className={`px-3 py-1.5 rounded-xl font-mono font-black text-sm flex items-center gap-1.5 shadow-xs ${
                        isDelayed
                          ? 'bg-red-600 text-white'
                          : isWarning
                          ? 'bg-amber-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{elapsed}m</span>
                    </div>
                  </div>

                  {/* Cuerpo: Lista de Platillos y Modificadores Anidados */}
                  <div className="p-4 space-y-4 flex-1">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="space-y-1.5 pb-3 border-b border-zinc-800/80 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <span className="w-6 h-6 rounded-lg bg-zinc-800 text-white font-black text-xs flex items-center justify-center shrink-0 border border-zinc-700">
                              {item.quantity}x
                            </span>
                            <h3 className="font-extrabold text-sm text-zinc-100 leading-snug">
                              {item.product_name}
                            </h3>
                          </div>
                        </div>

                        {/* Modificadores */}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="ml-8 space-y-1 text-xs text-zinc-400">
                            {item.modifiers.map((mod, mIdx) => (
                              <div key={mIdx}>
                                <div className="text-zinc-300 font-medium flex items-center gap-1">
                                  <span>• {mod.modifier_option_name}</span>
                                </div>
                                {/* Modificadores anidados de 2do nivel */}
                                {mod.nested_modifiers?.map((nMod, nIdx) => (
                                  <div
                                    key={nIdx}
                                    className="ml-3 text-emerald-400 font-bold flex items-center gap-1"
                                  >
                                    <span>└ {nMod.modifier_option_name}</span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Instrucción especial en cocina */}
                        {item.special_instructions && (
                          <div className="ml-8 text-[11px] font-bold text-amber-300 bg-amber-950/70 border border-amber-900/60 p-2 rounded-xl mt-1.5">
                            ⚠️ {item.special_instructions}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Notas generales del cliente */}
                    {order.notes && (
                      <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-300">
                        <span className="font-bold block text-zinc-400 text-[10px] uppercase">
                          Nota del cliente:
                        </span>
                        {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Footer con Botón de Acción de Cocina */}
                  <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-zinc-500 font-medium truncate max-w-[120px]">
                      {order.customer_name}
                    </span>

                    <button
                      onClick={() => handleAdvanceStatus(order.id, order.status)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                        order.status === 'pending'
                          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                          : order.status === 'preparing'
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : order.status === 'ready'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {order.status === 'pending' && <span>Empezar a Preparar</span>}
                      {order.status === 'preparing' && <span>Marcar Listo</span>}
                      {order.status === 'ready' && <span>Despachar Comanda</span>}
                      {order.status === 'dispatched' && <span>Completada</span>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de Control Rápido de Stock 86 */}
      <StockQuickManagerModal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
      />
    </div>
  );
}
