'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Coins,
  ShieldCheck,
  Receipt,
  Truck,
  UtensilsCrossed,
  Flame,
  ArrowUpRight,
  Sparkles,
  Award,
  Users,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '@restaurantes/ui';
import type { BcgMenuItem, BcgQuadrant } from '@restaurantes/config';

import {
  getDashboardAnalytics,
  type BranchId,
  type PeriodId,
} from '../data/mock-analytics';
import { BranchPeriodHeader } from '../components/dashboard/branch-period-header';
import { AttractionFunnelCard } from '../components/dashboard/attraction-funnel-card';
import { CustomerIntelligenceCard } from '../components/dashboard/customer-intelligence-card';
import { OperationsPerformanceCard } from '../components/dashboard/operations-performance-card';
import { LoyaltyCohortsCard } from '../components/dashboard/loyalty-cohorts-card';
import { MarketingAttributionTable } from '../components/dashboard/marketing-attribution-table';

export default function ExecutiveDashboardPage() {
  const [selectedBranch, setSelectedBranch] = useState<BranchId>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodId>('today');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [bcgFilter, setBcgFilter] = useState<'all' | BcgQuadrant>('all');

  // Datos reactivos según Sucursal y Período
  const analytics = useMemo(
    () => getDashboardAnalytics(selectedBranch, selectedPeriod),
    [selectedBranch, selectedPeriod]
  );

  const { kpis, operations, loyalty } = analytics;

  // Matriz BCG de Ingeniería de Menú
  const bcgMenuItems: BcgMenuItem[] = [
    {
      id: 'bcg-1',
      name: 'Bacon Truffle Double Smash',
      category: 'Smash Burgers',
      price: 9.5,
      cost: 3.8,
      units_sold: Math.round(48 * (selectedPeriod === 'today' ? 1 : selectedPeriod === 'week' ? 6 : 24)),
      revenue: 456.0 * (selectedPeriod === 'today' ? 1 : selectedPeriod === 'week' ? 6 : 24),
      margin_percentage: 60,
      margin_amount: 5.7,
      quadrant: 'star',
      recommendation:
        '🌟 Estrella: Proteger insumos premium. Mantener en portada de Tienda Web y Commander AI.',
    },
    {
      id: 'bcg-2',
      name: 'Papas Rústicas Trufadas',
      category: 'Acompañamientos',
      price: 4.25,
      cost: 3.06,
      units_sold: Math.round(52 * (selectedPeriod === 'today' ? 1 : selectedPeriod === 'week' ? 6 : 24)),
      revenue: 221.0 * (selectedPeriod === 'today' ? 1 : selectedPeriod === 'week' ? 6 : 24),
      margin_percentage: 28,
      margin_amount: 1.19,
      quadrant: 'plowhorse',
      recommendation:
        '🐎 Caballo de Batalla: Alta rotación pero margen ajustado. Incrementar sutilmente +$0.50 en combo.',
    },
    {
      id: 'bcg-3',
      name: 'Smoked BBQ Bacon Double',
      category: 'Smash Burgers',
      price: 11.5,
      cost: 4.02,
      units_sold: Math.round(12 * (selectedPeriod === 'today' ? 1 : selectedPeriod === 'week' ? 6 : 24)),
      revenue: 138.0 * (selectedPeriod === 'today' ? 1 : selectedPeriod === 'week' ? 6 : 24),
      margin_percentage: 65,
      margin_amount: 7.48,
      quadrant: 'puzzle',
      recommendation:
        '🧩 Enigma: Alto margen ($7.48/u) pero baja popularidad. Impulsar en WhatsApp y promociones.',
    },
    {
      id: 'bcg-4',
      name: 'Malteada Vainilla Clásica',
      category: 'Bebidas & Postres',
      price: 4.5,
      cost: 3.6,
      units_sold: Math.round(3 * (selectedPeriod === 'today' ? 1 : selectedPeriod === 'week' ? 6 : 24)),
      revenue: 13.5 * (selectedPeriod === 'today' ? 1 : selectedPeriod === 'week' ? 6 : 24),
      margin_percentage: 20,
      margin_amount: 0.9,
      quadrant: 'dog',
      recommendation:
        '🐕 Perro: Bajo margen y venta mínima. Pausar con Switch 86 para optimizar merma láctea.',
    },
  ];

  const filteredBcgItems =
    bcgFilter === 'all' ? bcgMenuItems : bcgMenuItems.filter((item) => item.quadrant === bcgFilter);

  // Liquidación de Pasarelas de Pago
  const gatewaySettlements = [
    {
      name: 'Stripe (Tarjetas E-Commerce)',
      processed: kpis.grossSales * 0.37,
      fee: kpis.grossSales * 0.37 * 0.035,
      net: kpis.grossSales * 0.37 * 0.965,
      rate: '3.5%',
      status: 'Acreditado',
    },
    {
      name: 'Payphone Ecuador (QR / Tarjetas)',
      processed: kpis.grossSales * 0.25,
      fee: kpis.grossSales * 0.25 * 0.035,
      net: kpis.grossSales * 0.25 * 0.965,
      rate: '3.5%',
      status: 'Acreditado',
    },
    {
      name: 'Efectivo / Deuna Directo (0% Comisión)',
      processed: kpis.grossSales * 0.38,
      fee: 0.0,
      net: kpis.grossSales * 0.38,
      rate: '0.0%',
      status: 'En Caja',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* 1. CABECERA EJECUTIVA UNIFICADA (SUCURSALES + PERÍODOS + TABS) */}
      <BranchPeriodHeader
        selectedBranch={selectedBranch}
        selectedPeriod={selectedPeriod}
        onSelectBranch={setSelectedBranch}
        onSelectPeriod={setSelectedPeriod}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* 2. CONTENIDO PRINCIPAL SEGÚN PESTAÑA ACTIVA */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 flex-1 w-full space-y-8">
        {/* BANNER INFORMATIVO EJECUTIVO */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>
                Sucursal:{' '}
                <strong className="text-slate-200">{analytics.branchName}</strong> • Período:{' '}
                <strong className="text-slate-200">
                  {selectedPeriod === 'today'
                    ? 'Hoy en Vivo'
                    : selectedPeriod === 'week'
                    ? 'Últimos 7 Días'
                    : 'Este Mes'}
                </strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              {activeTab === 'overview' && 'Control Ejecutivo & Rendimiento 360°'}
              {activeTab === 'attraction_conversion' && 'Embudo de Atracción & Conversión'}
              {activeTab === 'customers' && 'Inteligencia de Clientes & Retención'}
              {activeTab === 'operations' && 'Operación, Delivery & Sucursales'}
              {activeTab === 'marketing' && 'Atribución de Marketing & Fuentes'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Canal Directo Propio:</span>
            <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-800/60">
              {kpis.directSalesPct}% sin comisiones de intermediarios
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VISTA 1: OVERVIEW (SINGLE PANE OF GLASS EJECUTIVO) */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 4 MACRO KPIS EJECUTIVOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Venta Neta */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Venta Neta Operativa
                  </span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-slate-100 font-mono">
                  {formatCurrency(kpis.netSales)}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+{kpis.netSalesDeltaPct}% (Bruta: {formatCurrency(kpis.grossSales)})</span>
                </div>
              </div>

              {/* Card 2: Órdenes Despachadas */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Órdenes Despachadas
                  </span>
                  <ShoppingBag className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-slate-100 font-mono">
                  {kpis.totalOrders} pedidos
                </div>
                <div className="text-[11px] text-slate-400 font-semibold">
                  Ticket Promedio: <strong className="text-slate-100 font-mono">${kpis.avgTicket.toFixed(2)}</strong>
                </div>
              </div>

              {/* Card 3: Ahorro Comisiones vs Marketplaces */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Ahorro vs Marketplaces
                  </span>
                  <Coins className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  +{formatCurrency(kpis.marketplaceSavings)}
                </div>
                <div className="text-[11px] text-emerald-400 font-bold">
                  25% de comisiones retenido
                </div>
              </div>

              {/* Card 4: Tiempo Total de Entrega */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Tiempo de Despacho
                  </span>
                  <Truck className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-black text-slate-100 font-mono">
                  {operations.deliveryLogistics.totalDeliveryMinutes} min
                </div>
                <div className="text-[11px] text-slate-400 font-semibold">
                  Cocina: <strong className="text-slate-200">{operations.deliveryLogistics.avgKitchenMinutes}m</strong> • Ruta: <strong className="text-slate-200">{operations.deliveryLogistics.avgTransitMinutes}m</strong>
                </div>
              </div>
            </div>

            {/* SECCIÓN: EMBUDO PREVIEW + INTELIGENCIA DE CLIENTES PREVIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Preview del Embudo */}
              <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Embudo de Conversión Rápido</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('attraction_conversion')}
                    className="text-xs text-blue-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Ver Embudo Completo</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Visitas</span>
                    <span className="font-mono font-bold text-slate-100 text-sm">
                      {analytics.conversion.funnel.websiteVisits}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Leads WA</span>
                    <span className="font-mono font-bold text-blue-400 text-sm">
                      {analytics.conversion.funnel.whatsappLeads}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Checkouts</span>
                    <span className="font-mono font-bold text-indigo-400 text-sm">
                      {analytics.conversion.funnel.checkoutsStarted}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/40">
                    <span className="text-[10px] text-emerald-400 block uppercase font-bold">Pagados</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {analytics.conversion.funnel.paidOrders}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center text-slate-300">
                  <span>Tasa de Conversión Global:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">
                    {analytics.conversion.funnel.overallConversionRate}%
                  </span>
                </div>
              </div>

              {/* Preview de Clientes Nuevos vs Recurrentes */}
              <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>Clientes Nuevos vs Recurrentes</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('customers')}
                    className="text-xs text-blue-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Ver Cohortes & Radar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-full h-4 rounded-full bg-slate-800 overflow-hidden flex">
                  <div
                    style={{ width: `${analytics.customers.newCustomersPct}%` }}
                    className="h-full bg-blue-500 font-mono text-[9px] text-white flex items-center justify-center font-bold"
                  >
                    {analytics.customers.newCustomersPct}%
                  </div>
                  <div
                    style={{ width: `${analytics.customers.recurrentCustomersPct}%` }}
                    className="h-full bg-indigo-500 font-mono text-[9px] text-white flex items-center justify-center font-bold"
                  >
                    {analytics.customers.recurrentCustomersPct}%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Nuevos Clientes:</span>
                    <span className="font-bold text-slate-100 text-sm">
                      {analytics.customers.newCustomersCount} (Ticket: ${analytics.customers.avgTicketBySegment.newClients.toFixed(2)})
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Recurrentes Fidelizados:</span>
                    <span className="font-bold text-slate-100 text-sm">
                      {analytics.customers.recurrentCustomersCount} (Ticket: ${analytics.customers.avgTicketBySegment.frequentClients.toFixed(2)})
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center text-slate-400">
                  <span>🎂 Radar Cumpleaños Esta Semana:</span>
                  <span className="font-bold text-amber-400">
                    {analytics.customers.upcomingBirthdays.length} comensales (Enviar cupón)
                  </span>
                </div>
              </div>
            </div>

            {/* SECCIÓN FINANCIERA & FISCAL SRI ECUADOR */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Desglose Venta Neta vs Bruta */}
              <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-extrabold text-base text-slate-100">
                      Desglose Financiero SRI
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    Ecuador 15% IVA
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>(+) Venta Bruta Facturada:</span>
                    <span className="font-mono font-bold text-slate-100">
                      {formatCurrency(kpis.grossSales)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>(-) Descuentos & Cupones de Fidelización:</span>
                    <span className="font-mono font-bold text-amber-400">
                      -{formatCurrency(kpis.discounts)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>(-) IVA 15% (Retenido para Declaración):</span>
                    <span className="font-mono font-bold text-rose-400">
                      -{formatCurrency(kpis.vat15)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-black text-sm text-slate-100 block">
                        (=) Venta Neta Operativa:
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Ingreso real de operación
                      </span>
                    </div>
                    <span className="font-mono font-black text-lg text-emerald-400">
                      {formatCurrency(kpis.netSales)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    El IVA ({formatCurrency(kpis.vat15)}) queda reservado para la declaración contable mensual.
                  </span>
                </div>
              </div>

              {/* Liquidación de Pasarelas de Pago */}
              <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                    <span>Liquidación de Pasarelas</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold">Conciliación Diaria</span>
                </div>

                <div className="space-y-2">
                  {gatewaySettlements.map((gw, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-200 block">{gw.name}</span>
                        <span className="text-[10px] text-slate-400">
                          Comisión: {gw.rate} • Estado:{' '}
                          <span className="text-emerald-400 font-bold">{gw.status}</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Bruto: {formatCurrency(gw.processed)}
                        </span>
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          Neto: {formatCurrency(gw.net)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MATRIZ BCG DE MENÚ (2X2) */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-blue-400" />
                    <h3 className="font-extrabold text-base text-slate-100">
                      Ingeniería de Menú (Matriz BCG 2x2)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Clasificación de platillos por Rentabilidad (Margen %) vs Popularidad (Volumen)
                  </p>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {(
                    [
                      { key: 'all', label: 'Todos' },
                      { key: 'star', label: '🌟 Estrellas' },
                      { key: 'plowhorse', label: '🐎 Caballos' },
                      { key: 'puzzle', label: '🧩 Enigmas' },
                      { key: 'dog', label: '🐕 Perros' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setBcgFilter(f.key)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        bcgFilter === f.key
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBcgItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                          {item.quadrant === 'star' && '🌟 Estrella'}
                          {item.quadrant === 'plowhorse' && '🐎 Caballo de Batalla'}
                          {item.quadrant === 'puzzle' && '🧩 Enigma / Puzzle'}
                          {item.quadrant === 'dog' && '🐕 Perro'}
                        </span>
                        <h4 className="font-extrabold text-slate-100 text-sm mt-1.5">{item.name}</h4>
                        <span className="text-[11px] text-slate-400">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-100 text-sm block">
                          {formatCurrency(item.revenue)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.units_sold} unidades
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800/60 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">PVP / Costo</span>
                        <span className="font-mono font-bold text-slate-200">
                          ${item.price.toFixed(2)} / ${item.cost.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Margen %</span>
                        <span className="font-mono font-bold text-blue-400">
                          {item.margin_percentage}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Ganancia/u</span>
                        <span className="font-mono font-bold text-emerald-400">
                          +${item.margin_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{item.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 2: ATRACCIÓN & CONVERSIÓN */}
        {/* ========================================================================= */}
        {activeTab === 'attraction_conversion' && <AttractionFunnelCard data={analytics} />}

        {/* ========================================================================= */}
        {/* VISTA 3: CLIENTES & FIDELIZACIÓN */}
        {/* ========================================================================= */}
        {activeTab === 'customers' && (
          <div className="space-y-8">
            <CustomerIntelligenceCard data={analytics} />
            <LoyaltyCohortsCard data={analytics} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 4: OPERACIÓN, DELIVERY & SUCURSALES */}
        {/* ========================================================================= */}
        {activeTab === 'operations' && <OperationsPerformanceCard data={analytics} />}

        {/* ========================================================================= */}
        {/* VISTA 5: MARKETING & ATRIBUCIÓN */}
        {/* ========================================================================= */}
        {activeTab === 'marketing' && <MarketingAttributionTable data={analytics} />}
      </main>

      {/* 3. FOOTER MINIMALISTA */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-6 py-4 text-center text-xs text-slate-500">
        <p>
          FoodTech OS • Executive Restaurant Control • {analytics.branchName} •{' '}
          {selectedPeriod === 'today' ? 'Hoy' : selectedPeriod === 'week' ? 'Semana' : 'Mes'}
        </p>
      </footer>
    </div>
  );
}
