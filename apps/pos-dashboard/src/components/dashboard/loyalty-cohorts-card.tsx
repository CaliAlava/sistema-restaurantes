'use client';

import React, { useState } from 'react';
import {
  Award,
  Gift,
  Tag,
  Repeat,
  ShieldCheck,
  AlertCircle,
  Zap,
  ArrowUpRight,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '@restaurantes/ui';
import type { DashboardAnalyticsData } from '../../data/mock-analytics';

interface LoyaltyCohortsCardProps {
  data: DashboardAnalyticsData;
}

export function LoyaltyCohortsCard({ data }: LoyaltyCohortsCardProps) {
  const { loyalty } = data;
  const { benefitsUsed, activePromos, topVipCustomers, retentionCohorts, winbackRadar } = loyalty;
  const [winbackSent, setWinbackSent] = useState(false);

  return (
    <div className="space-y-6">
      {/* 1. BENEFICIOS UTILIZADOS & PROMOCIONES ACTIVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Retorno Financiero de Beneficios y Cupones Utilizados */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-indigo-400" />
              <h4 className="font-extrabold text-base text-slate-100">
                Beneficios & Cupones Utilizados
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60 font-bold">
              ROI: {benefitsUsed.roiDiscountMultiplier}x
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Cuantificación del impacto de descuentos frente a la facturación real generada.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">
                Descuentos Otorgados
              </span>
              <span className="font-mono font-black text-rose-400 text-lg">
                -{formatCurrency(benefitsUsed.discountsTotal)}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {benefitsUsed.couponsRedeemedCount} cupones canjeados
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">
                Venta Neta Generada
              </span>
              <span className="font-mono font-black text-emerald-400 text-lg">
                +{formatCurrency(benefitsUsed.revenueGeneratedWithPromos)}
              </span>
              <span className="text-[10px] text-slate-400 block">
                Por comensales fidelizados
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-300 flex items-center justify-between">
            <span>Puntos Cashback Redimidos:</span>
            <span className="font-mono font-bold text-white">
              {benefitsUsed.pointsRedeemedTotal} pts (Equivale a $42.00)
            </span>
          </div>
        </div>

        {/* Desglose de Promociones Activas */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-400" />
              <h4 className="font-extrabold text-base text-slate-100">
                Rendimiento de Códigos Promocionales
              </h4>
            </div>
            <span className="text-xs text-slate-400 font-medium">3 Activos</span>
          </div>

          <div className="space-y-2.5">
            {activePromos.map((p, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-blue-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {p.code}
                    </span>
                    <span className="text-[11px] text-slate-300 font-medium">{p.description}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Usado {p.timesUsed} veces • Descuento total: -${p.discountAmount.toFixed(2)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-mono font-black text-emerald-400 block">
                    +{formatCurrency(p.revenueAttributed)}
                  </span>
                  <span className="text-[10px] text-slate-400">Facturación</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MATRIZ DE COHORTES DE RETENCIÓN (30 / 60 / 90 DÍAS) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Repeat className="w-5 h-5 text-indigo-400" />
              <h4 className="font-extrabold text-base text-slate-100">
                Retorno y Cohortes de Retención (30 / 60 / 90 Días)
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Porcentaje de comensales adquiridos que regresan a comprar al restaurante con el paso del tiempo.
            </p>
          </div>

          <span className="text-xs text-indigo-400 bg-indigo-950/70 border border-indigo-800/60 px-3 py-1 rounded-xl font-bold">
            Benchmark Industria Gastronómica: 25-35%
          </span>
        </div>

        {/* Tabla Heatmap de Cohortes */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-2.5">Mes de Captación</th>
                <th className="py-2.5 text-center">Nuevos Clientes</th>
                <th className="py-2.5 text-center">Retorno 30 Días</th>
                <th className="py-2.5 text-center">Retorno 60 Días</th>
                <th className="py-2.5 text-center">Retorno 90 Días</th>
                <th className="py-2.5 text-center">Tendencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {retentionCohorts.map((c, i) => (
                <tr key={i} className="hover:bg-slate-950/50 transition-colors">
                  <td className="py-3 font-sans font-bold text-slate-100">{c.cohort_month}</td>
                  <td className="py-3 text-center text-slate-200">{c.total_acquired} comensales</td>

                  {/* 30 Días Heatmap Cell */}
                  <td className="py-3 text-center">
                    <span className="inline-block px-3 py-1 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-300 font-bold">
                      {c.rate_30d}% ({c.retained_30d})
                    </span>
                  </td>

                  {/* 60 Días Heatmap Cell */}
                  <td className="py-3 text-center">
                    <span className="inline-block px-3 py-1 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 font-bold">
                      {c.rate_60d}% ({c.retained_60d})
                    </span>
                  </td>

                  {/* 90 Días Heatmap Cell */}
                  <td className="py-3 text-center">
                    {c.rate_90d > 0 ? (
                      <span className="inline-block px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-bold">
                        {c.rate_90d}% ({c.retained_90d})
                      </span>
                    ) : (
                      <span className="text-slate-500 font-sans italic text-[11px]">En curso...</span>
                    )}
                  </td>

                  <td className="py-3 text-center">
                    <span className="text-emerald-400 font-bold text-[11px]">↗ Creciente</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. TOP CLIENTES VIP & CAMPAÑAS DE RECOMPRA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Clientes VIP */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h4 className="font-extrabold text-base text-slate-100">
                Top Clientes VIP (Burger Club)
              </h4>
            </div>
            <span className="text-xs text-slate-400 font-medium">Mayor Gasto Acumulado</span>
          </div>

          <div className="space-y-2.5">
            {topVipCustomers.map((vip) => (
              <div
                key={vip.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">{vip.name}</span>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.2 rounded border border-amber-800/60">
                      ★ {vip.tier.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Favorito: <strong className="text-slate-200">{vip.favoriteDish}</strong> • {vip.lastVisitDate}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-mono font-black text-emerald-400 text-sm block">
                    {formatCurrency(vip.totalSpent)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {vip.totalOrders} pedidos • {vip.points} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campañas de Recompra Automatizadas (Winback) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <h4 className="font-extrabold text-base text-slate-100">
                  Campaña de Recompra (Winback)
                </h4>
              </div>
              <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60">
                {winbackRadar.atRiskCount} en Riesgo
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Comensales que no han realizado un pedido en más de 45 días.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Comensales Inactivos Detectados:</span>
              <span className="font-mono font-bold text-slate-100">{winbackRadar.atRiskCount} personas</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Puntos Acumulados sin Canjear:</span>
              <span className="font-mono font-bold text-amber-400">{winbackRadar.unclaimedPoints} pts</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between text-xs font-bold text-slate-200">
              <span>Facturación en Riesgo de Pérdida:</span>
              <span className="font-mono text-rose-400">~{formatCurrency(winbackRadar.potentialLossRevenue)}</span>
            </div>
          </div>

          <button
            onClick={() => setWinbackSent(true)}
            disabled={winbackSent}
            className={`w-full py-3 rounded-2xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
              winbackSent
                ? 'bg-slate-800 text-slate-500 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {winbackSent ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Difusión Enviada a {winbackRadar.atRiskCount} Comensales</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Disparar Campaña "Te Extrañamos 20% OFF"</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
