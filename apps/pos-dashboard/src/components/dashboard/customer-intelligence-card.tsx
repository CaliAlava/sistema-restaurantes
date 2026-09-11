'use client';

import React, { useState } from 'react';
import {
  Users,
  Repeat,
  UserPlus,
  Cake,
  TrendingUp,
  Heart,
  Send,
  CheckCircle2,
  Tag,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency } from '@restaurantes/ui';
import type { DashboardAnalyticsData } from '../../data/mock-analytics';
import type { BirthdayReminder } from '@restaurantes/config';

interface CustomerIntelligenceCardProps {
  data: DashboardAnalyticsData;
}

export function CustomerIntelligenceCard({ data }: CustomerIntelligenceCardProps) {
  const { customers } = data;
  const [birthdays, setBirthdays] = useState<BirthdayReminder[]>(customers.upcomingBirthdays);
  const [notifiedId, setNotifiedId] = useState<string | null>(null);

  const handleSendBirthdayGreeting = (customerId: string) => {
    setBirthdays((prev) =>
      prev.map((b) => (b.customer_id === customerId ? { ...b, already_notified: true } : b))
    );
    setNotifiedId(customerId);
    setTimeout(() => setNotifiedId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. SECCIÓN SUPERIOR: NUEVOS VS RECURRENTES + FRECUENCIA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Proporción Clientes Nuevos vs Recurrentes */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h4 className="font-extrabold text-base text-slate-100">
                  Composición de Clientes
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-medium">Salud de Cartera</span>
            </div>
            <p className="text-xs text-slate-400">
              Equilibrio entre adquisición de nuevos comensales y retención de comensales habituales.
            </p>
          </div>

          {/* Gráfico de Barra Bicolor Proporcional */}
          <div className="space-y-2">
            <div className="w-full h-5 rounded-xl bg-slate-800 overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${customers.newCustomersPct}%` }}
                className="h-full bg-blue-500 transition-all flex items-center justify-center text-[10px] font-bold text-white"
                title={`Nuevos: ${customers.newCustomersPct}%`}
              >
                {customers.newCustomersPct}%
              </div>
              <div
                style={{ width: `${customers.recurrentCustomersPct}%` }}
                className="h-full bg-indigo-500 transition-all flex items-center justify-center text-[10px] font-bold text-white"
                title={`Recurrentes: ${customers.recurrentCustomersPct}%`}
              >
                {customers.recurrentCustomersPct}%
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-300 font-semibold">
                  Nuevos ({customers.newCustomersCount} clientes)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-slate-300 font-semibold">
                  Recurrentes ({customers.recurrentCustomersCount} clientes)
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>Frecuencia Promedio de Compra:</span>
            <span className="font-mono font-bold text-blue-400">
              Cada {customers.avgOrderFrequencyDays} días ({customers.avgOrdersPerMonth} órdenes/mes)
            </span>
          </div>
        </div>

        {/* Comparativo de Ticket Promedio por Segmento */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h4 className="font-extrabold text-base text-slate-100">
                Ticket Promedio por Segmento
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">
              Rentabilidad por Nivel
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Los clientes fidelizados gastan significativamente más que un comprador ocasional.
          </p>

          <div className="space-y-2.5">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300 font-medium">Comensal Nuevo (1ra compra):</span>
              </div>
              <span className="font-mono font-bold text-slate-100">
                {formatCurrency(customers.avgTicketBySegment.newClients)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Repeat className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300 font-medium">Cliente Frecuente (Tier Silver/Gold):</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-400 font-bold">+33%</span>
                <span className="font-mono font-bold text-slate-100">
                  {formatCurrency(customers.avgTicketBySegment.frequentClients)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-100 font-bold">Cliente VIP (Burger Club Top):</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-400 font-bold">+129%</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  {formatCurrency(customers.avgTicketBySegment.vipClients)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RADAR DE CUMPLEAÑOS & PREFERENCIAS DE GUSTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar de Cumpleaños de la Semana */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cake className="w-5 h-5 text-amber-400" />
              <h4 className="font-extrabold text-base text-slate-100">
                Radar de Cumpleaños (Próximos 7 Días)
              </h4>
            </div>
            <span className="text-xs text-amber-400 font-bold bg-amber-950/70 border border-amber-800/60 px-2.5 py-0.5 rounded-full">
              {birthdays.length} Comensales
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Envío automatizado de felicitación personalizada y cupón de consumo para celebrar en el local o delivery.
          </p>

          <div className="space-y-2.5">
            {birthdays.map((b) => (
              <div
                key={b.customer_id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">{b.customer_name}</span>
                    <span
                      className={`text-[9px] uppercase font-black px-2 py-0.2 rounded-full ${
                        b.tier === 'vip'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      }`}
                    >
                      {b.tier}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    🎂 Fecha: <strong className="text-slate-200">{b.birthday_date}</strong> • En {b.days_until} días
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                    {b.suggested_gift_coupon}
                  </span>
                  <button
                    onClick={() => handleSendBirthdayGreeting(b.customer_id)}
                    disabled={b.already_notified}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      b.already_notified
                        ? 'bg-slate-800 text-slate-500 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    }`}
                  >
                    {b.already_notified ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Enviado</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {notifiedId && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>¡Felicitación y cupón de cumpleaños enviados exitosamente por WhatsApp!</span>
            </div>
          )}
        </div>

        {/* Preferencias de Consumo y Gustos Recurrentes */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400" />
                <h4 className="font-extrabold text-base text-slate-100">
                  Preferencias del Comensal
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-medium">Modificadores</span>
            </div>
            <p className="text-xs text-slate-400">
              Gustos e ingredientes extras más solicitados por los clientes registrados.
            </p>
          </div>

          <div className="space-y-2.5">
            {customers.topPreferences.map((pref, i) => (
              <div key={i} className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200">{pref.tag}</span>
                  <span className="font-mono text-blue-400 font-bold">{pref.percentage}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${pref.percentage}%` }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            💡 <strong>Estrategia de Upselling:</strong> El 41% de clientes añade tocino y queso extra si el bot lo sugiere antes del checkout.
          </div>
        </div>
      </div>
    </div>
  );
}
