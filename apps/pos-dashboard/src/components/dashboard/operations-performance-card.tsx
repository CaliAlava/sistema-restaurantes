'use client';

import React from 'react';
import {
  Clock,
  Bike,
  Flame,
  AlertTriangle,
  Building2,
  CheckCircle2,
  TrendingDown,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';
import { formatCurrency } from '@restaurantes/ui';
import type { DashboardAnalyticsData } from '../../data/mock-analytics';

interface OperationsPerformanceCardProps {
  data: DashboardAnalyticsData;
}

export function OperationsPerformanceCard({ data }: OperationsPerformanceCardProps) {
  const { operations } = data;
  const { deliveryLogistics, cancellations, branchesComparison, hourlyThroughput } = operations;
  const maxAmount = Math.max(...hourlyThroughput.map((h) => h.amount));

  return (
    <div className="space-y-6">
      {/* 1. SECCIÓN SUPERIOR: TIEMPO DE ENTREGA DESGLOSADO & HORAS PICO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Desglose de Tiempo de Entrega (KDS Cocina vs Motorizado en Tránsito) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <h4 className="font-extrabold text-base text-slate-100">
                  Desglose del Tiempo de Entrega
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60 font-bold">
                SLA: &lt; 35 min
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Separación técnica entre tiempo de preparación en cocina y tiempo de ruta en moto.
            </p>
          </div>

          <div className="space-y-3">
            {/* Medidor visual de tiempo total */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Tiempo Total de Despacho al Cliente:</span>
                <span className="font-mono font-black text-slate-100 text-base">
                  {deliveryLogistics.totalDeliveryMinutes} min
                </span>
              </div>

              {/* Barra segmentada */}
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
                <div
                  style={{
                    width: `${(deliveryLogistics.avgKitchenMinutes / deliveryLogistics.totalDeliveryMinutes) * 100}%`,
                  }}
                  className="h-full bg-amber-500 transition-all"
                  title={`Cocina KDS: ${deliveryLogistics.avgKitchenMinutes} min`}
                />
                <div
                  style={{
                    width: `${(deliveryLogistics.avgTransitMinutes / deliveryLogistics.totalDeliveryMinutes) * 100}%`,
                  }}
                  className="h-full bg-blue-500 transition-all"
                  title={`En Tránsito: ${deliveryLogistics.avgTransitMinutes} min`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Cocina KDS:</span>
                  </div>
                  <span className="font-mono font-extrabold text-slate-100 text-sm block mt-1">
                    {deliveryLogistics.avgKitchenMinutes} min
                  </span>
                  <span className="text-[10px] text-slate-400">Meta: 15 min</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
                    <Bike className="w-3.5 h-3.5" />
                    <span>En Moto (Ruta):</span>
                  </div>
                  <span className="font-mono font-extrabold text-slate-100 text-sm block mt-1">
                    {deliveryLogistics.avgTransitMinutes} min
                  </span>
                  <span className="text-[10px] text-slate-400">Meta: 20 min</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Puntualidad en Entregas:</span>
              </span>
              <span className="font-mono font-black">{deliveryLogistics.onTimeRatePct}% a tiempo</span>
            </div>
          </div>
        </div>

        {/* Gráfico de Barras: Ventas y Flujo por Horas Pico */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h4 className="font-extrabold text-base text-slate-100">
                Flujo Operativo por Franjas Horarias
              </h4>
            </div>
            <span className="text-xs text-slate-400 font-medium">Horas Pico: 13h y 20h</span>
          </div>

          <p className="text-xs text-slate-400">
            Detección de sobrecarga en cocina para optimizar turnos de meseros y repartidores.
          </p>

          {/* Gráfico de barras SVG/CSS */}
          <div className="h-48 flex items-end justify-between gap-1 pt-6 border-b border-slate-800 pb-2">
            {hourlyThroughput.map((d, i) => {
              const heightPct = Math.round((d.amount / maxAmount) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-9 bg-slate-800 text-slate-100 text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg whitespace-nowrap z-10">
                    ${d.amount} ({d.orders} órd. • {d.avgWaitMinutes}m espera)
                  </div>

                  {/* Bar */}
                  <div className="w-full bg-slate-800/70 rounded-t-md h-36 flex items-end overflow-hidden p-0.5">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 group-hover:brightness-125 ${
                        d.isPeak ? 'bg-blue-500' : 'bg-slate-600'
                      }`}
                    />
                  </div>

                  {/* Label */}
                  <span className="text-[10px] text-slate-500 font-mono">
                    {d.hour.slice(0, 2)}h
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                <span>Horas Pico (&gt; $350)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-600" />
                <span>Flujo Regular</span>
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-300">
              Total Platos Preparados: <strong>{operations.totalDishesCooked} unid.</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. COMPARATIVA DE SUCURSALES & CONTROL DE PEDIDOS CANCELADOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tabla Comparativa de Sucursales */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <h4 className="font-extrabold text-base text-slate-100">
                Desempeño Comparativo de Sucursales
              </h4>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-mono">
              3 Locales Activos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-2.5">Sucursal</th>
                  <th className="py-2.5 text-right">Venta Neta</th>
                  <th className="py-2.5 text-right">Órdenes</th>
                  <th className="py-2.5 text-right">Ticket Prom.</th>
                  <th className="py-2.5 text-right">Cocina (m)</th>
                  <th className="py-2.5 text-right">Cancel.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {branchesComparison.map((b) => (
                  <tr key={b.branch_id} className="hover:bg-slate-950/50 transition-colors">
                    <td className="py-3 font-sans font-bold text-slate-100 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          b.status === 'open'
                            ? 'bg-emerald-500'
                            : b.status === 'busy'
                            ? 'bg-amber-500'
                            : 'bg-slate-600'
                        }`}
                      />
                      <span>{b.branch_name}</span>
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-400">
                      {formatCurrency(b.net_sales)}
                    </td>
                    <td className="py-3 text-right text-slate-200">{b.total_orders}</td>
                    <td className="py-3 text-right text-slate-300">${b.avg_ticket.toFixed(2)}</td>
                    <td className="py-3 text-right text-slate-400">{b.avg_prep_time_minutes}m</td>
                    <td className="py-3 text-right text-rose-400">{b.cancellation_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Auditoría de Pedidos Cancelados con Motivos Reales */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h4 className="font-extrabold text-base text-slate-100">
                  Control de Pedidos Cancelados
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60">
                {cancellations.cancellationRatePct}% tasa
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Total: {cancellations.totalCancelled} cancelaciones • Pérdida estimada: {formatCurrency(cancellations.lostRevenue)}
            </p>
          </div>

          <div className="space-y-2.5">
            {cancellations.reasons.map((r, i) => (
              <div key={i} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-200">{r.label}</span>
                  <span className="text-rose-400 font-mono">-{formatCurrency(r.cost)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Acción preventiva:</span>
                  <span className="text-blue-400 font-medium">{r.mitigation}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-[11px] text-rose-300">
            ⚠️ <strong>Impacto Financiero:</strong> El 60% de cancelaciones se evitan manteniendo actualizado el Switch 86 de platillos agotados en salón y tienda web.
          </div>
        </div>
      </div>
    </div>
  );
}
