'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_DINING_AREAS, MOCK_TABLES } from '../../data/mock-tables';
import {
  type RestaurantTable,
  type TableStatus,
  calculateEquitableSplit,
  generateEscPosReceiptText,
} from '@restaurantes/config';
import { formatCurrency } from '@restaurantes/ui';
import {
  Store,
  Users,
  UtensilsCrossed,
  Receipt,
  Printer,
  X,
  ArrowLeft,
  Flame,
  CheckCircle,
  CheckCircle2,
  Clock,
  Split,
  DollarSign,
  Layers,
  Zap,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { StockQuickManagerModal } from '../../components/stock-quick-manager-modal';

interface OfflineOrder {
  id: string;
  table_number: string;
  total: number;
  items_count: number;
  timestamp: string;
}

export default function POSSalonPage() {
  const [tables, setTables] = useState<RestaurantTable[]>(MOCK_TABLES);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [activeTable, setActiveTable] = useState<RestaurantTable | null>(null);

  // Estados de Resiliencia Offline (Fase 14)
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineOrder[]>([]);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  // Sincronizar cola offline con Supabase Cloud
  const triggerSync = () => {
    try {
      const stored = localStorage.getItem('foodtech_pos_offline_orders');
      if (stored) {
        const queue: OfflineOrder[] = JSON.parse(stored);
        if (queue.length > 0) {
          localStorage.removeItem('foodtech_pos_offline_orders');
          setOfflineQueue([]);
          setSyncStatusMessage(`¡${queue.length} orden(es) offline sincronizadas exitosamente con Supabase Cloud!`);
          setTimeout(() => setSyncStatusMessage(null), 5000);
        }
      }
    } catch (err) {
      console.error('Error syncing offline orders', err);
    }
  };

  // Escuchar estado de red y cargar órdenes locales de emergencia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        triggerSync();
      };
      const handleOffline = () => {
        setIsOnline(false);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      try {
        const stored = localStorage.getItem('foodtech_pos_offline_orders');
        if (stored) {
          setOfflineQueue(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Error loading offline orders', err);
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Guardar orden en cola offline local
  const queueOfflineOrder = (tableNumber: string, total: number, itemsCount: number) => {
    const newOrder: OfflineOrder = {
      id: `off-${Date.now()}`,
      table_number: tableNumber,
      total,
      items_count: itemsCount,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [...offlineQueue, newOrder];
    setOfflineQueue(updated);
    try {
      localStorage.setItem('foodtech_pos_offline_orders', JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving offline order', err);
    }
  };

  // Estados de modal de cobro y división de cuenta
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [splitMode, setSplitMode] = useState<'equal' | 'by_item'>('equal');
  const [itemAssignments, setItemAssignments] = useState<Record<number, number>>({
    0: 1,
    1: 2,
    2: 1,
  });
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [thermalReceiptText, setThermalReceiptText] = useState('');
  const [showStockModal, setShowStockModal] = useState(false);


  // Filtrado por área
  const filteredTables = tables.filter(
    (t) => selectedArea === 'all' || t.area_id === selectedArea
  );

  // Totales de salón
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const billRequestedCount = tables.filter((t) => t.status === 'bill_requested').length;
  const availableCount = tables.filter((t) => t.status === 'available').length;

  const handleTableClick = (table: RestaurantTable) => {
    setActiveTable(table);
  };

  const handleUpdateStatus = (tableId: string, newStatus: TableStatus) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status: newStatus } : t))
    );
    if (activeTable?.id === tableId) {
      setActiveTable((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Simulación de orden demo en mesa seleccionada
  const demoOrderItems = [
    { quantity: 2, name: 'Bacon Truffle Double Smash', subtotal: 19.0, modifiers: ['Término Medio', 'Combo Papas + Soda'] },
    { quantity: 1, name: 'Papas Rústicas Trufadas', subtotal: 4.25 },
    { quantity: 2, name: 'Cerveza Artesanal IPA 355ml', subtotal: 9.0 },
  ];
  const netSubtotal = 32.25;
  const taxTotal = Math.round(netSubtotal * 0.15 * 100) / 100; // 15% IVA
  const grandTotal = netSubtotal + taxTotal;

  // Generar división de cuentas
  const splitShares = calculateEquitableSplit(grandTotal, splitCount);

  // Obtener desglose por comensal (Split Bill por Ítem)
  const getDinerBreakdown = (dinerNum: number) => {
    const assigned = demoOrderItems.filter((_, idx) => (itemAssignments[idx] ?? 1) === dinerNum);
    const subtotal = assigned.reduce((acc, it) => acc + it.subtotal, 0);
    const tax = Math.round(subtotal * 0.15 * 100) / 100;
    const total = subtotal + tax;
    return { items: assigned, subtotal, tax, total };
  };

  // Generar impresión térmica ESC/POS para la mesa completa
  const handlePrintReceipt = (tableNumber: string) => {
    const text = generateEscPosReceiptText({
      restaurantName: 'Burger Craft & Co.',
      restaurantRuc: '0992384756001',
      restaurantAddress: 'Av. Samborondón Km 2.5',
      restaurantPhone: '+593 99 123 4567',
      orderNumber: 44,
      tableNumber,
      waiterName: 'Andrés M. (Mesero)',
      createdAt: new Date().toISOString(),
      items: demoOrderItems,
      netSubtotal,
      taxTotal,
      tipAmount: 0.0,
      grandTotal,
      paymentMethod: 'Efectivo / POS',
    }, 42);

    setThermalReceiptText(text);
    setShowPrintPreview(true);
  };

  // Generar impresión térmica ESC/POS para un comensal individual
  const handlePrintSingleDinerReceipt = (
    dinerNumber: number,
    dinerItems: { quantity: number; name: string; subtotal: number }[],
    dinerNet: number,
    dinerTax: number,
    dinerTotal: number,
    tableNumber: string
  ) => {
    const text = generateEscPosReceiptText({
      restaurantName: 'Burger Craft & Co.',
      restaurantRuc: '0992384756001',
      restaurantAddress: 'Av. Samborondón Km 2.5',
      restaurantPhone: '+593 99 123 4567',
      orderNumber: 44,
      tableNumber: `${tableNumber} - Comensal #${dinerNumber}`,
      waiterName: 'Andrés M. (Mesero)',
      createdAt: new Date().toISOString(),
      items: dinerItems,
      netSubtotal: dinerNet,
      taxTotal: dinerTax,
      tipAmount: 0.0,
      grandTotal: dinerTotal,
      paymentMethod: `Cuenta Separada #${dinerNumber}`,
    }, 42);

    setThermalReceiptText(text);
    setShowPrintPreview(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Barra de Navegación Superior */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Volver al inicio"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-lg text-white">POS Salón & Mesas</h1>
            <p className="text-xs text-zinc-400">Burger Craft & Co. • Control en Vivo de Meseros y Salón</p>
          </div>
        </div>

        {/* Resumen rápido de mesas */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {availableCount} Libres
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/80 text-blue-400 border border-blue-800/60">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            {occupiedCount} Ocupadas
          </span>
          {billRequestedCount > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/60 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {billRequestedCount} Pidiendo Cuenta
            </span>
          )}
        </div>

        {/* Acceso directo a KDS, Comandera y Switch 86 */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/pos/comandera"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all"
            title="Abrir Comandera Táctil para Tablets de Meseros"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Comandera Meseros</span>
          </Link>
          <button
            onClick={() => setShowStockModal(true)}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-extrabold text-xs flex items-center gap-1.5 border border-amber-500/30 shadow-md transition-all"
            title="Pausar o reactivar platos agotados"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Stock 86</span>
          </button>
          <Link
            href="/kds"
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Flame className="w-4 h-4" />
            <span>Cocina KDS</span>
          </Link>

          {/* Selector y Monitor de Resiliencia Offline (Fase 14) */}
          <button
            onClick={() => {
              if (isOnline) {
                setIsOnline(false);
              } else {
                setIsOnline(true);
                triggerSync();
              }
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              isOnline
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400 hover:bg-emerald-900/60'
                : 'bg-amber-950/90 border-amber-500 text-amber-300 animate-pulse'
            }`}
            title="Click para alternar y simular conectividad offline/online en salón"
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">En Línea (Cloud Sync)</span>
                <span className="sm:hidden">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Modo Offline ({offlineQueue.length})</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Banner Dinámico de Estado de Conectividad & Sincronización */}
      {syncStatusMessage && (
        <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncStatusMessage}</span>
          </div>
          <button onClick={() => setSyncStatusMessage(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!isOnline && (
        <div className="bg-amber-500 text-zinc-950 px-6 py-2.5 text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>
              <strong>Modo Offline Activo:</strong> El restaurante opera con almacenamiento local seguro (LocalStorage). Las comandas y cobros se almacenan en cola y se sincronizarán con Supabase Cloud automáticamente al restablecer señal.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-zinc-950 text-amber-400 text-[10px] font-mono font-black">
              {offlineQueue.length} órdenes en cola
            </span>
            <button
              onClick={() => {
                setIsOnline(true);
                triggerSync();
              }}
              className="px-2.5 py-1 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 text-[11px] font-extrabold flex items-center gap-1 shadow-xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reconectar Ahora</span>
            </button>
          </div>
        </div>
      )}

      {isOnline && offlineQueue.length > 0 && !syncStatusMessage && (
        <div className="bg-blue-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
            <span>Conexión restablecida. Hay {offlineQueue.length} orden(es) offline pendientes de sincronizar con Supabase Cloud.</span>
          </div>
          <button
            onClick={triggerSync}
            className="px-3 py-1 rounded-lg bg-white text-blue-900 font-extrabold text-[11px] hover:bg-blue-50 transition-all shadow-xs"
          >
            Sincronizar Ahora
          </button>
        </div>
      )}

      {/* Pestañas de Zonas del Restaurante */}

      <div className="px-6 py-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setSelectedArea('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedArea === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800'
          }`}
        >
          Todas las Zonas
        </button>
        {MOCK_DINING_AREAS.map((area) => (
          <button
            key={area.id}
            onClick={() => setSelectedArea(area.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedArea === area.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800'
            }`}
          >
            {area.name}
          </button>
        ))}
      </div>

      {/* Plano Interactivo de Mesas */}
      <main className="p-6 flex-1 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredTables.map((table) => {
            const isAvailable = table.status === 'available';
            const isOccupied = table.status === 'occupied';
            const isBill = table.status === 'bill_requested';
            const isReserved = table.status === 'reserved';

            return (
              <div
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`p-5 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between h-44 shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
                  isBill
                    ? 'border-amber-500 bg-amber-950/40 hover:bg-amber-950/60 ring-2 ring-amber-500/30 animate-pulse'
                    : isOccupied
                    ? 'border-blue-600 bg-blue-950/30 hover:bg-blue-950/50'
                    : isReserved
                    ? 'border-purple-600 bg-purple-950/30 hover:bg-purple-950/50'
                    : 'border-zinc-800 bg-zinc-900/70 hover:border-emerald-600/70 hover:bg-zinc-900'
                }`}
              >
                {/* Cabecera Mesa */}
                <div className="flex items-center justify-between">
                  <span className="font-black text-base text-white">{table.table_number}</span>
                  <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-bold bg-zinc-800/80 px-2 py-0.5 rounded-md">
                    <Users className="w-3 h-3" />
                    {table.capacity}
                  </span>
                </div>

                {/* Estado */}
                <div className="space-y-1">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${
                      isBill
                        ? 'bg-amber-400 text-zinc-950'
                        : isOccupied
                        ? 'bg-blue-500 text-white'
                        : isReserved
                        ? 'bg-purple-500 text-white'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {isBill && 'Pidiendo Cuenta'}
                    {isOccupied && 'Ocupada'}
                    {isReserved && 'Reservada'}
                    {isAvailable && 'Libre'}
                  </span>

                  {isOccupied && (
                    <div className="font-mono text-xs font-extrabold text-blue-300">
                      Cuenta: ~$37.08
                    </div>
                  )}
                  {isBill && (
                    <div className="font-mono text-xs font-black text-amber-300">
                      Cobro: $37.08
                    </div>
                  )}
                </div>

                {/* Footer Mesa */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>{isAvailable ? 'Tocar p/ abrir' : 'Gestionar'}</span>
                  <Receipt className="w-3.5 h-3.5 opacity-60" />
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal de Comanda y Cobro de Mesa */}
      {activeTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>{activeTable.table_number}</span>
                  <span className="text-xs font-bold text-zinc-400">({activeTable.capacity} personas)</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Control de Comanda y Facturación en Mesa</p>
              </div>
              <button
                onClick={() => setActiveTable(null)}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido según estado */}
            {activeTable.status === 'available' ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto stroke-1" />
                <h3 className="font-bold text-base text-zinc-200">Mesa Disponible</h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Asigna comensales y comienza a tomar la comanda para enviarla en tiempo real a cocina.
                </p>
                <button
                  onClick={() => handleUpdateStatus(activeTable.id, 'occupied')}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all"
                >
                  Abrir Mesa y Tomar Comanda
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Comanda en curso */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                  <span className="font-bold text-zinc-400 text-[10px] uppercase">Comanda Activa:</span>
                  {demoOrderItems.map((item, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-zinc-800/60 last:border-0">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-bold">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-zinc-800 space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>Subtotal Neto:</span>
                      <span>{formatCurrency(netSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>IVA Calculado (15%):</span>
                      <span>{formatCurrency(taxTotal)}</span>
                    </div>
                    <div className="flex justify-between font-black text-sm text-white pt-1">
                      <span>Total Liquidado:</span>
                      <span className="text-emerald-400">{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones de Mesa */}
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {activeTable.status === 'occupied' && (
                    <button
                      onClick={() => handleUpdateStatus(activeTable.id, 'bill_requested')}
                      className="p-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Pedir Cuenta</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowCheckoutModal(true);
                    }}
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Cobrar / Dividir</span>
                  </button>

                  <button
                    onClick={() => handlePrintReceipt(activeTable.table_number)}
                    className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all flex items-center justify-center gap-1.5 col-span-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Pre-cuenta Térmica (ESC/POS)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Cobro & Split Bills */}
      {showCheckoutModal && activeTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <Split className="w-5 h-5 text-emerald-400" />
                <span>Cobro y División de Cuentas ({activeTable.table_number})</span>
              </h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de Modo de División */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSplitMode('equal')}
                className={`py-2 rounded-xl transition-all ${
                  splitMode === 'equal'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                División Equitativa
              </button>
              <button
                type="button"
                onClick={() => setSplitMode('by_item')}
                className={`py-2 rounded-xl transition-all ${
                  splitMode === 'by_item'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Por Platillo (Split por Ítem)
              </button>
            </div>

            {/* Selector de número de comensales */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">
                ¿Entre cuántas personas se divide la cuenta?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSplitCount(num)}
                    className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                      splitCount === num
                        ? 'border-emerald-500 bg-emerald-600 text-white shadow-xs'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {num === 1 ? '1 Persona' : `${num} Personas`}
                  </button>
                ))}
              </div>
            </div>

            {/* Modo 1: División Equitativa */}
            {splitMode === 'equal' ? (
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-zinc-400">
                  <span>Total de la Mesa:</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
                <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                  {splitShares.map((share) => (
                    <div key={share.diner_number} className="flex justify-between items-center text-zinc-200">
                      <span>Persona #{share.diner_number}:</span>
                      <span className="font-mono font-extrabold text-emerald-400">
                        {formatCurrency(share.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Modo 2: División por Ítem Individual */
              <div className="space-y-3">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-400 block">
                    Asigna cada platillo a su respectivo comensal:
                  </span>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1 text-xs">
                    {demoOrderItems.map((item, idx) => {
                      const currentDiner = itemAssignments[idx] ?? 1;
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-zinc-200 block truncate">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="text-[11px] text-emerald-400 font-bold">
                              {formatCurrency(item.subtotal)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {Array.from({ length: splitCount }, (_, i) => i + 1).map((dinerNum) => (
                              <button
                                key={dinerNum}
                                type="button"
                                onClick={() =>
                                  setItemAssignments((prev) => ({ ...prev, [idx]: dinerNum }))
                                }
                                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                                  currentDiner === dinerNum
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                }`}
                              >
                                C{dinerNum}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resumen por comensal con impresión independiente */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5 text-xs">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 block">
                    Pre-cuentas individuales calculadas:
                  </span>
                  {Array.from({ length: splitCount }, (_, i) => i + 1).map((dinerNum) => {
                    const b = getDinerBreakdown(dinerNum);
                    return (
                      <div
                        key={dinerNum}
                        className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold text-white block">Comensal #{dinerNum}</span>
                          <span className="text-[11px] text-zinc-400">
                            {b.items.length} platos • Subtotal {formatCurrency(b.subtotal)} + IVA
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-emerald-400">
                            {formatCurrency(b.total)}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handlePrintSingleDinerReceipt(
                                dinerNum,
                                b.items,
                                b.subtotal,
                                b.tax,
                                b.total,
                                activeTable.table_number
                              )
                            }
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                            title={`Imprimir ticket comensal ${dinerNum}`}
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Botón de Finalizar y Liberar Mesa con Resiliencia Offline */}
            <button
              onClick={() => {
                if (!isOnline) {
                  queueOfflineOrder(activeTable.table_number, grandTotal, demoOrderItems.length);
                  handleUpdateStatus(activeTable.id, 'available');
                  setShowCheckoutModal(false);
                  setActiveTable(null);
                  alert(
                    `⚡ Cobro guardado en MODO OFFLINE para ${activeTable.table_number}.\n\nTotal: ${formatCurrency(
                      grandTotal
                    )}\nAlmacenado de forma segura en LocalStorage. Se sincronizará con Supabase Cloud automáticamente al restablecer conexión.`
                  );
                } else {
                  handleUpdateStatus(activeTable.id, 'available');
                  setShowCheckoutModal(false);
                  setActiveTable(null);
                  alert(`¡Cobro registrado y ${activeTable.table_number} liberada con éxito!`);
                }
              }}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all"
            >
              {!isOnline ? 'Guardar Cobro Localmente (Modo Offline)' : 'Completar Cobro y Liberar Mesa'}
            </button>

          </div>
        </div>
      )}

      {/* Vista Previa de Ticket Térmico ESC/POS */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="font-extrabold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Printer className="w-4 h-4" />
                Vista Previa de Ticket Térmico (80mm)
              </span>
              <button onClick={() => setShowPrintPreview(false)} className="text-zinc-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenedor simulando papel térmico de tickets */}
            <div className="bg-amber-50 text-zinc-900 p-5 rounded-xl font-mono text-[11px] leading-tight overflow-x-auto shadow-inner border border-amber-200">
              <pre className="whitespace-pre">{thermalReceiptText}</pre>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPrintPreview(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Enviar a Impresora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Switch de Stock Rápido (86) */}
      <StockQuickManagerModal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
      />
    </div>
  );
}
