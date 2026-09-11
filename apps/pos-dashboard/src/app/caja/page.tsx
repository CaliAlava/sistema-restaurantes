'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Banknote,
  CreditCard,
  QrCode,
  DollarSign,
  Receipt,
  Download,
  ArrowLeft,
  Printer,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Lock,
  Unlock,
  X,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  EyeOff,
  Eye,
} from 'lucide-react';
import { formatCurrency } from '@restaurantes/ui';
import {
  generateSriSalesCsv,
  type SriSaleRecord,
  type WasteRecord,
  type WasteReason,
  WASTE_REASON_LABELS,
} from '@restaurantes/config';

// Ventas demo para el reporte tributario SRI
const DEMO_SRI_SALES: SriSaleRecord[] = [
  {
    fecha: '2026-09-03',
    numero_factura: '001-001-000001041',
    tipo_identificacion: '05',
    identificacion: '0928374651',
    cliente: 'Carlos Álava',
    subtotal_0: 0.0,
    subtotal_15: 19.5,
    monto_iva_15: 2.93,
    propina: 0.0,
    total_pagado: 22.43,
    medio_pago: 'Tarjeta de Crédito',
  },
  {
    fecha: '2026-09-03',
    numero_factura: '001-001-000001042',
    tipo_identificacion: '07',
    identificacion: '9999999999999',
    cliente: 'Consumidor Final',
    subtotal_0: 0.0,
    subtotal_15: 13.0,
    monto_iva_15: 1.95,
    propina: 1.0,
    total_pagado: 15.95,
    medio_pago: 'Efectivo',
  },
  {
    fecha: '2026-09-03',
    numero_factura: '001-001-000001043',
    tipo_identificacion: '04',
    identificacion: '0992384756001',
    cliente: 'Corporación Gastronómica S.A.',
    subtotal_0: 0.0,
    subtotal_15: 45.0,
    monto_iva_15: 6.75,
    propina: 0.0,
    total_pagado: 51.75,
    medio_pago: 'Transferencia Bancaria',
  },
  {
    fecha: '2026-09-03',
    numero_factura: '001-001-000001044',
    tipo_identificacion: '05',
    identificacion: '1718293847',
    cliente: 'María Belén Noboa',
    subtotal_0: 0.0,
    subtotal_15: 28.5,
    monto_iva_15: 4.28,
    propina: 2.0,
    total_pagado: 34.78,
    medio_pago: 'Tarjeta de Débito',
  },
];

export default function CashRegisterPage() {
  const [openingCash, setOpeningCash] = useState(150.0);
  const [cashSales] = useState(480.0);
  const [cardSales] = useState(810.0);
  const [transferSales] = useState(552.5);
  const [taxCollected] = useState(276.38); // 15% IVA acumulado
  const [tipsTotal] = useState(45.0);

  // Movimientos de caja chica
  const [movements, setMovements] = useState([
    { id: 'm1', type: 'cash_in', amount: 20.0, reason: 'Cambio de billete inicial', time: '11:15 AM' },
    { id: 'm2', type: 'cash_out', amount: 35.0, reason: 'Compra de 2 bolsas de hielo de emergencia', time: '14:20 PM' },
  ]);

  // Mermas y Cortesías (Fase 14)
  const [wastes, setWastes] = useState<WasteRecord[]>([
    {
      id: 'w-1',
      product_name: 'Bacon Truffle Double Smash',
      quantity: 1,
      cost_incurred: 3.8,
      reason: 'error_cocina',
      authorized_by: 'Chef Daniel R.',
      created_at: '13:45',
      notes: 'Comanda sin trufa por error de mesero en comandera',
    },
    {
      id: 'w-2',
      product_name: 'Classic Americana Cheeseburger',
      quantity: 1,
      cost_incurred: 2.9,
      reason: 'plato_devuelto',
      authorized_by: 'Capitán de Salón',
      created_at: '14:30',
      notes: 'Comensal solicitó carne término bien cocido',
    },
    {
      id: 'w-3',
      product_name: 'Papas Rústicas Trufadas',
      quantity: 2,
      cost_incurred: 6.12,
      reason: 'cortesia_gerencia',
      authorized_by: 'Gerencia General',
      created_at: '15:10',
      notes: 'Degustación mesa VIP influencers gastronómicos',
    },
  ]);
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [wasteProduct, setWasteProduct] = useState('Bacon Truffle Double Smash');
  const [wasteQuantity, setWasteQuantity] = useState(1);
  const [wasteCost, setWasteCost] = useState('3.80');
  const [wasteReason, setWasteReason] = useState<WasteReason>('error_cocina');
  const [wasteAuthorizedBy, setWasteAuthorizedBy] = useState('Chef Ejecutivo');
  const [wasteNotes, setWasteNotes] = useState('');

  // Modales
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementType, setMovementType] = useState<'cash_in' | 'cash_out'>('cash_out');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');

  // Arqueo Ciego (Fase 14)
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [blindStep, setBlindStep] = useState<'count' | 'revealed'>('count');
  const [countedCashInput, setCountedCashInput] = useState('');
  const [shortageReason, setShortageReason] = useState('');
  const [isShiftClosed, setIsShiftClosed] = useState(false);
  const [showCorteXModal, setShowCorteXModal] = useState(false);


  // Cálculos de efectivo esperado
  const totalCashIn = movements.filter((m) => m.type === 'cash_in').reduce((acc, m) => acc + m.amount, 0);
  const totalCashOut = movements.filter((m) => m.type === 'cash_out').reduce((acc, m) => acc + m.amount, 0);
  const expectedCashInDrawer = openingCash + cashSales + totalCashIn - totalCashOut;
  const totalGrossSales = cashSales + cardSales + transferSales;

  // Manejar nuevo movimiento
  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(movementAmount);
    if (isNaN(amt) || amt <= 0 || !movementReason) {
      alert('Por favor completa un monto válido y motivo');
      return;
    }

    setMovements((prev) => [
      ...prev,
      {
        id: `mov-${Date.now()}`,
        type: movementType,
        amount: amt,
        reason: movementReason,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setMovementAmount('');
    setMovementReason('');
    setShowMovementModal(false);
  };

  // Total costo de mermas
  const totalWasteCost = wastes.reduce((acc, w) => acc + w.cost_incurred, 0);

  // Manejar registro de merma / cortesía (Fase 14)
  const handleAddWaste = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(wasteCost);
    if (isNaN(cost) || cost <= 0 || !wasteProduct) {
      alert('Por favor especifica un producto y costo válido');
      return;
    }

    const newWaste: WasteRecord = {
      id: `w-${Date.now()}`,
      product_name: wasteProduct,
      quantity: wasteQuantity,
      cost_incurred: cost,
      reason: wasteReason,
      authorized_by: wasteAuthorizedBy,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: wasteNotes,
    };

    setWastes((prev) => [newWaste, ...prev]);
    setShowWasteModal(false);
    setWasteNotes('');
  };


  // Exportar archivo CSV para el SRI
  const handleDownloadSriCsv = () => {
    const csvContent = generateSriSalesCsv(DEMO_SRI_SALES);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ventas_SRI_IVA15_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-lg">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-lg text-white">Caja, Arqueo & Reportes SRI</h1>
            <p className="text-xs text-zinc-400">Burger Craft & Co. • Control Fiscal, Cortes X/Z y Conciliación</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadSriCsv}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Libro SRI (CSV)</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-6 flex-1 w-full space-y-6">
        {/* Banner de Estado de Turno */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${isShiftClosed ? 'bg-zinc-800 text-zinc-500' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {isShiftClosed ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-white">
                  Turno de Caja: Andrés Morales
                </span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${isShiftClosed ? 'bg-zinc-800 text-zinc-400' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                  {isShiftClosed ? 'Turno Cerrado (Corte Z)' : '🟢 Turno Abierto'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">Iniciado hoy a las 11:00 AM • Caja Principal #01</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isShiftClosed ? (
              <>
                <button
                  onClick={() => setShowMovementModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  <span>Movimiento Caja Chica</span>
                </button>

                <button
                  onClick={() => setShowWasteModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-500/30 transition-all"
                  title="Registrar merma, cortesía de gerencia o plato devuelto"
                >
                  <Trash2 className="w-4 h-4 text-amber-400" />
                  <span>Registrar Merma / Baja</span>
                </button>

                <button
                  onClick={() => setShowCorteXModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Corte X (Lectura Parcial)</span>
                </button>

                <button
                  onClick={() => {
                    setBlindStep('count');
                    setCountedCashInput('');
                    setShortageReason('');
                    setShowCloseShiftModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Lock className="w-4 h-4" />
                  <span>Arqueo Ciego & Corte Z</span>
                </button>
              </>
            ) : (
              <span className="text-xs font-bold text-zinc-400">
                Turno finalizado con éxito. Genera el reporte contable abajo.
              </span>
            )}
          </div>

        </div>

        {/* Resumen de Medios de Pago & Conciliación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase">
              <span>Efectivo en Gaveta</span>
              <Banknote className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{formatCurrency(expectedCashInDrawer)}</div>
            <p className="text-[11px] text-zinc-400">
              Fondo inicial: ${openingCash.toFixed(2)} + Ventas: ${cashSales.toFixed(2)}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase">
              <span>Tarjetas Online & POS</span>
              <CreditCard className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{formatCurrency(cardSales)}</div>
            <p className="text-[11px] text-zinc-400">Conciliado con datáfono y Stripe</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase">
              <span>Deuna / Transferencias</span>
              <QrCode className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{formatCurrency(transferSales)}</div>
            <p className="text-[11px] text-zinc-400">Cobros por QR y banco directo</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase">
              <span>IVA SRI Recaudado (15%)</span>
              <FileSpreadsheet className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400">{formatCurrency(taxCollected)}</div>
            <p className="text-[11px] text-zinc-400">Declaración Formulario 104</p>
          </div>
        </div>

        {/* Sección: Movimientos de Caja Chica y Detalle de Ventas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Movimientos de Caja Chica */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-base text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Movimientos de Caja Chica del Turno</span>
              </h2>
              <span className="text-xs text-zinc-400 font-bold">{movements.length} registros</span>
            </div>

            <div className="space-y-2.5">
              {movements.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    {m.type === 'cash_in' ? (
                      <PlusCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <MinusCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-white block">{m.reason}</span>
                      <span className="text-[10px] text-zinc-500">{m.time}</span>
                    </div>
                  </div>
                  <span className={`font-mono font-black ${m.type === 'cash_in' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {m.type === 'cash_in' ? '+' : '-'}${m.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reporte Fiscal SRI y Facturación Electrónica */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-base text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Resumen Tributario SRI (Ecuador)</span>
                </h2>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                  IVA 15.00%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Base Imponible Gravada (15%):</span>
                  <span className="font-mono font-bold text-white">
                    {formatCurrency(totalGrossSales - taxCollected)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Monto Total de IVA (15%):</span>
                  <span className="font-mono font-bold text-rose-400">
                    {formatCurrency(taxCollected)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Propinas Recaudadas:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatCurrency(tipsTotal)}
                  </span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between font-black text-sm text-white">
                  <span>Ventas Brutas Totales:</span>
                  <span className="font-mono text-emerald-400">
                    {formatCurrency(totalGrossSales + tipsTotal)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadSriCsv}
              className="w-full py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Descargar CSV para Contador / SRI</span>
            </button>
          </div>
        </div>

        {/* FASE 14: CONTROL DE MERMAS, BAJAS Y CORTESÍAS DE GERENCIA */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-base text-white">
                  Control de Mermas, Bajas & Cortesías de Gerencia
                </h2>
                <p className="text-xs text-zinc-400">
                  Auditoría obligatoria de productos dados de baja, platos devueltos o cortesías autorizadas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block font-semibold">Costo Total Incurrido</span>
                <span className="font-mono font-black text-rose-400 text-base">
                  {formatCurrency(totalWasteCost)}
                </span>
              </div>
              <button
                onClick={() => setShowWasteModal(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar Merma</span>
              </button>
            </div>
          </div>

          {/* Lista de Registros de Merma */}
          <div className="space-y-2.5">
            {wastes.map((w) => (
              <div
                key={w.id}
                className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 font-bold shrink-0 mt-0.5">
                    {w.quantity}x
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{w.product_name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-400 border border-amber-800/60">
                        {WASTE_REASON_LABELS[w.reason]}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-[11px]">
                      {w.notes || 'Sin observaciones adicionales'}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                      <span>Autorizado por: <strong className="text-zinc-300">{w.authorized_by}</strong></span>
                      <span>•</span>
                      <span>Hora: {w.created_at}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block">Costo Materia Prima</span>
                  <span className="font-mono font-black text-rose-400 text-sm">
                    -{formatCurrency(w.cost_incurred)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Normativa Fiscal SRI:</strong> Las bajas por merma no constituyen venta ni trasladan IVA al cliente final; se registran exclusivamente como costo de inventario para deducción en el Impuesto a la Renta anual.
            </span>
          </div>
        </div>
      </main>


      {/* Modal: Nuevo Movimiento de Caja Chica */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleAddMovement}
            className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-black text-base text-white">Movimiento de Caja Chica</h3>
              <button
                type="button"
                onClick={() => setShowMovementModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMovementType('cash_out')}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  movementType === 'cash_out'
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                Salida (Gasto)
              </button>
              <button
                type="button"
                onClick={() => setMovementType('cash_in')}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  movementType === 'cash_in'
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                Entrada (Ingreso)
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Monto en Dólares ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={movementAmount}
                onChange={(e) => setMovementAmount(e.target.value)}
                placeholder="0.00"
                className="w-full text-xs p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Motivo / Justificación</label>
              <input
                type="text"
                required
                value={movementReason}
                onChange={(e) => setMovementReason(e.target.value)}
                placeholder="Ej. Compra de limones, taxi de urgencia..."
                className="w-full text-xs p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all"
            >
              Registrar en Turno
            </button>
          </form>
        </div>
      )}

      {/* Modal: Corte X */}
      {showCorteXModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="font-extrabold text-xs uppercase text-blue-400 flex items-center gap-1.5">
                <Receipt className="w-4 h-4" />
                Corte X (Lectura de Turno Parcial)
              </span>
              <button onClick={() => setShowCorteXModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 text-zinc-900 p-4 rounded-xl font-mono text-[11px] leading-tight space-y-1 shadow-inner border border-amber-200">
              <p className="font-bold text-center">BURGER CRAFT & CO.</p>
              <p className="text-center">CORTE X - NO FISCAL</p>
              <p className="text-center text-[10px]">{new Date().toLocaleString('es-EC')}</p>
              <p>----------------------------------------</p>
              <p>CAJERO: Andrés Morales</p>
              <p>FONDO INICIAL: ${openingCash.toFixed(2)}</p>
              <p>VENTAS EFECTIVO: ${cashSales.toFixed(2)}</p>
              <p>VENTAS TARJETA: ${cardSales.toFixed(2)}</p>
              <p>VENTAS TRANSFER: ${transferSales.toFixed(2)}</p>
              <p>----------------------------------------</p>
              <p className="font-bold">TOTAL VENTAS: ${totalGrossSales.toFixed(2)}</p>
              <p>IVA (15%): ${taxCollected.toFixed(2)}</p>
              <p>----------------------------------------</p>
              <p className="font-bold">EFECTIVO EN GAVETA: ${expectedCashInDrawer.toFixed(2)}</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCorteXModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cerrar Turno (Arqueo Ciego & Corte Z) */}
      {showCloseShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="font-extrabold text-xs uppercase text-rose-500 flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                Arqueo Ciego & Cierre de Turno (Corte Z)
              </span>
              <button
                onClick={() => setShowCloseShiftModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {blindStep === 'count' ? (
              /* PASO 1: CONTEO FÍSICO CIEGO (MONTO ESPERADO OCULTO) */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <EyeOff className="w-4 h-4 shrink-0" />
                    <span>Protocolo de Arqueo Ciego Activo</span>
                  </div>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    Por políticas de auditoría interna y prevención de fraudes, el saldo teórico calculado por el sistema se mantiene estrictamente <strong>oculto</strong>. Cuenta el dinero físico real de la gaveta antes de revelar el balance.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Efectivo Total Físico Contado en Gaveta ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={countedCashInput}
                    onChange={(e) => setCountedCashInput(e.target.value)}
                    placeholder="0.00 (Cuenta billetes y monedas)"
                    className="w-full text-base p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white font-mono font-black focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Botones de incremento rápido de denominaciones */}
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 font-semibold block">Suma rápida de billetes:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[20, 10, 5, 1, 0.5, 0.25].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          const curr = parseFloat(countedCashInput) || 0;
                          setCountedCashInput((curr + val).toFixed(2));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs font-bold transition-all"
                      >
                        +${val}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCountedCashInput('')}
                      className="px-2 py-1 rounded-lg bg-rose-950/60 text-rose-300 text-[10px] font-bold"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!countedCashInput || parseFloat(countedCashInput) < 0}
                  onClick={() => setBlindStep('revealed')}
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Declarar Efectivo y Revelar Diferencia</span>
                </button>
              </div>
            ) : (
              /* PASO 2: REVELACIÓN DE AUDITORÍA Y JUSTIFICACIÓN */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Efectivo Declarado por Cajero:</span>
                    <span className="font-mono font-bold text-white">
                      ${parseFloat(countedCashInput || '0').toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-zinc-400">
                    <span>Efectivo Teórico por Sistema:</span>
                    <span className="font-mono font-bold text-white">
                      ${expectedCashInDrawer.toFixed(2)}
                    </span>
                  </div>

                  {(() => {
                    const declared = parseFloat(countedCashInput || '0');
                    const diff = Math.round((declared - expectedCashInDrawer) * 100) / 100;
                    const isExact = diff === 0;
                    const isSurplus = diff > 0;

                    return (
                      <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
                        <span className="font-bold text-white">Resultado de Auditoría:</span>
                        <span
                          className={`font-mono font-black text-sm ${
                            isExact
                              ? 'text-emerald-400'
                              : isSurplus
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {isExact
                            ? '✅ Cuadre Exacto ($0.00)'
                            : isSurplus
                            ? `🟢 Sobrante: +$${diff.toFixed(2)}`
                            : `🔴 Faltante: -$${Math.abs(diff).toFixed(2)}`}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Si hay faltante, justificación obligatoria */}
                {parseFloat(countedCashInput || '0') < expectedCashInDrawer && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-rose-400">
                      Justificación Obligatoria de Faltante *
                    </label>
                    <input
                      type="text"
                      required
                      value={shortageReason}
                      onChange={(e) => setShortageReason(e.target.value)}
                      placeholder="Ej. Error en cambio mesa 4, billete deteriorado..."
                      className="w-full text-xs p-3 rounded-xl border border-rose-500/50 bg-zinc-950 text-white focus:outline-none focus:border-rose-400"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBlindStep('count')}
                    className="w-1/3 py-3 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300"
                  >
                    Recontar
                  </button>

                  <button
                    type="button"
                    disabled={
                      parseFloat(countedCashInput || '0') < expectedCashInDrawer &&
                      !shortageReason.trim()
                    }
                    onClick={() => {
                      setIsShiftClosed(true);
                      setShowCloseShiftModal(false);
                      const declared = parseFloat(countedCashInput || '0');
                      const diff = declared - expectedCashInDrawer;
                      alert(
                        `¡Turno cerrado con éxito!\n\nDeclarado: $${declared.toFixed(
                          2
                        )}\nEsperado: $${expectedCashInDrawer.toFixed(
                          2
                        )}\nDiferencia: $${diff.toFixed(2)}\nCorte Z impreso y archivado.`
                      );
                    }}
                    className="w-2/3 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black text-xs shadow-md transition-all"
                  >
                    Confirmar Arqueo y Cerrar Turno
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Registrar Merma, Baja o Cortesía (Fase 14) */}
      {showWasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleAddWaste}
            className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-base text-white">Registrar Merma o Cortesía</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWasteModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Producto / Insumo *</label>
              <select
                value={wasteProduct}
                onChange={(e) => {
                  setWasteProduct(e.target.value);
                  if (e.target.value === 'Bacon Truffle Double Smash') setWasteCost('3.80');
                  else if (e.target.value === 'Classic Americana Cheeseburger') setWasteCost('2.90');
                  else if (e.target.value === 'Papas Rústicas Trufadas') setWasteCost('3.06');
                  else setWasteCost('2.50');
                }}
                className="w-full text-xs p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Bacon Truffle Double Smash">Bacon Truffle Double Smash</option>
                <option value="Classic Americana Cheeseburger">Classic Americana Cheeseburger</option>
                <option value="Smoked BBQ Bacon Double">Smoked BBQ Bacon Double</option>
                <option value="Papas Rústicas Trufadas">Papas Rústicas Trufadas</option>
                <option value="Malteada Vainilla Clásica">Malteada Vainilla Clásica</option>
                <option value="Cerveza Artesanal IPA">Cerveza Artesanal IPA 355ml</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Cantidad *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={wasteQuantity}
                  onChange={(e) => setWasteQuantity(parseInt(e.target.value) || 1)}
                  className="w-full text-xs p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Costo Total ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={wasteCost}
                  onChange={(e) => setWasteCost(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Motivo Obligatorio *</label>
              <select
                value={wasteReason}
                onChange={(e) => setWasteReason(e.target.value as WasteReason)}
                className="w-full text-xs p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:border-amber-500"
              >
                {Object.entries(WASTE_REASON_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Autorizado por *</label>
              <input
                type="text"
                required
                value={wasteAuthorizedBy}
                onChange={(e) => setWasteAuthorizedBy(e.target.value)}
                placeholder="Nombre del chef o supervisor"
                className="w-full text-xs p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Observaciones / Incidencia</label>
              <input
                type="text"
                value={wasteNotes}
                onChange={(e) => setWasteNotes(e.target.value)}
                placeholder="Detalle específico del incidente"
                className="w-full text-xs p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs shadow-md transition-all"
            >
              Registrar Incidencia de Merma
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
