'use client';

import React from 'react';
import {
  TrendingUp,
  Globe,
  Smartphone,
  MessageSquare,
  Users,
  Target,
  ArrowRight,
  Sparkles,
  Bot,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency } from '@restaurantes/ui';
import type { DashboardAnalyticsData } from '../../data/mock-analytics';

interface AttractionFunnelCardProps {
  data: DashboardAnalyticsData;
}

export function AttractionFunnelCard({ data }: AttractionFunnelCardProps) {
  const { attraction, conversion } = data;
  const funnel = conversion.funnel;

  return (
    <div className="space-y-6">
      {/* 1. KPIs DE ATRACCIÓN & TRÁFICO */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Alcance Total</span>
            <Users className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100">
            {attraction.totalReach.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold block">
            +18.4% vs período anterior
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Impresiones Redes</span>
            <Target className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100">
            {attraction.impressions.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            Meta Ads & TikTok
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tráfico Web Único</span>
            <Globe className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100">
            {attraction.websiteVisits.toLocaleString()}
          </div>
          <span className="text-[10px] text-blue-400 font-semibold block">
            Sesiones en tienda online
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">CTR Promedio</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100">
            {attraction.clickThroughRate}%
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold block">
            Tasa de clic en pauta
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Nuevos Seguidores</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100">
            +{attraction.socialGrowthFollowers}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            Instagram & TikTok
          </span>
        </div>
      </div>

      {/* 2. EMBUDO INTEGRAL DE CONVERSIÓN */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <h3 className="font-extrabold text-base text-slate-100">
                Embudo Integral de Conversión
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Desde la primera impresión hasta el pago completado en tienda y WhatsApp
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Conversión Global:</span>
            <span className="font-mono font-black text-emerald-400">
              {funnel.overallConversionRate}%
            </span>
          </div>
        </div>

        {/* Pasos Visuales del Embudo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
          {/* Paso 1: Tráfico */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 relative group hover:border-blue-500/50 transition-all">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                Paso 1 • Tráfico
              </span>
              <span className="w-2 h-2 rounded-full bg-slate-600" />
            </div>
            <div className="text-2xl font-black text-slate-100 font-mono">
              {funnel.websiteVisits.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Visitas únicas a la tienda web y perfiles
            </p>
            <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-[10px]">
              <span className="text-slate-500">Base total:</span>
              <span className="font-mono font-bold text-slate-300">100%</span>
            </div>
          </div>

          {/* Paso 2: Leads WhatsApp */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 relative group hover:border-blue-500/50 transition-all">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">
                Paso 2 • Leads & Chats
              </span>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-100 font-mono">
              {funnel.whatsappLeads.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Chats iniciados y consultas de menú
            </p>
            <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-[10px]">
              <span className="text-slate-500">Paso 1 → 2:</span>
              <span className="font-mono font-bold text-blue-400">
                {funnel.visitToLeadRate}%
              </span>
            </div>
          </div>

          {/* Paso 3: Carrito / Checkout */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 relative group hover:border-blue-500/50 transition-all">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold">
                Paso 3 • Intención de Compra
              </span>
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-100 font-mono">
              {funnel.checkoutsStarted.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Carritos armados o reservas solicitadas
            </p>
            <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-[10px]">
              <span className="text-slate-500">Paso 2 → 3:</span>
              <span className="font-mono font-bold text-indigo-400">
                {funnel.leadToCheckoutRate}%
              </span>
            </div>
          </div>

          {/* Paso 4: Pagados / Convertidos */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-2 relative group hover:border-emerald-500/60 transition-all">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                Paso 4 • Pedidos Pagados
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {funnel.paidOrders.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Órdenes confirmadas y cobradas
            </p>
            <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-[10px]">
              <span className="text-slate-500">Paso 3 → 4:</span>
              <span className="font-mono font-bold text-emerald-400">
                {funnel.checkoutToPaidRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Proporción Gráfica de Retención en el Embudo */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Tasa de Abandono de Checkout:</span>
            <span className="font-mono font-bold text-slate-300">
              {conversion.cartAbandonmentRatePct}% (Recuperables vía WhatsApp)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              style={{ width: `${funnel.checkoutToPaidRate}%` }}
              className="h-full bg-emerald-500 rounded-full"
              title="Convertidos a Pago"
            />
            <div
              style={{ width: `${conversion.cartAbandonmentRatePct}%` }}
              className="h-full bg-amber-500/70"
              title="Carritos Abandonados"
            />
          </div>
        </div>
      </div>

      {/* 3. DOS TARJETAS CLAVE: CONVERSIÓN WHATSAPP Y RESERVAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rendimiento del Bot WhatsApp AI */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              <h4 className="font-extrabold text-sm text-slate-100">
                Conversión WhatsApp (Commander AI)
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">
              {conversion.whatsappBot.automationRatePct}% Automatizado
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Chats Totales</span>
              <span className="font-mono font-bold text-slate-100 text-sm">
                {conversion.whatsappBot.totalConversations}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Órdenes Cerradas</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {conversion.whatsappBot.automatedClosedOrders}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Tiempo Respuesta</span>
              <span className="font-mono font-bold text-blue-400 text-sm">
                {conversion.whatsappBot.avgResponseSeconds}s
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Commander AI cerró <strong>{conversion.whatsappBot.automatedClosedOrders} pedidos</strong> sin
            requerir atención humana de cajeros o meseros, liberando personal para el salón.
          </p>
        </div>

        {/* Rendimiento de Reservas Web y Salón */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-sky-400" />
              <h4 className="font-extrabold text-sm text-slate-100">
                Conversión de Reservas
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/60 font-bold">
              {conversion.reservations.fulfillmentRatePct}% Asistencia
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Solicitadas</span>
              <span className="font-mono font-bold text-slate-100">
                {conversion.reservations.totalRequested}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Confirmadas</span>
              <span className="font-mono font-bold text-blue-400">
                {conversion.reservations.confirmed}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Sentadas</span>
              <span className="font-mono font-bold text-emerald-400">
                {conversion.reservations.seated}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">No-Shows</span>
              <span className="font-mono font-bold text-rose-400">
                {conversion.reservations.noShows}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Los recordatorios interactivos enviados por WhatsApp 3h antes redujeron la tasa de no-shows a solo <strong>{((conversion.reservations.noShows / conversion.reservations.totalRequested) * 100).toFixed(1)}%</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
