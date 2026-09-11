'use client';

import React, { useState } from 'react';
import {
  QrCode,
  Users,
  Target,
  Search,
  Globe,
  TrendingUp,
  DollarSign,
  Filter,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '@restaurantes/ui';
import type { DashboardAnalyticsData } from '../../data/mock-analytics';
import type { AttributionSource } from '@restaurantes/config';

interface MarketingAttributionTableProps {
  data: DashboardAnalyticsData;
}

export function MarketingAttributionTable({ data }: MarketingAttributionTableProps) {
  const { marketingAttribution } = data;
  const [filterSource, setFilterSource] = useState<string>('all');

  const filteredSources =
    filterSource === 'all'
      ? marketingAttribution.sourcesTable
      : marketingAttribution.sourcesTable.filter((s) => s.source === filterSource);

  // Cálculos totales
  const totalInvestment = marketingAttribution.sourcesTable.reduce((acc, s) => acc + s.investment, 0);
  const totalRevenueAttributed = marketingAttribution.sourcesTable.reduce((acc, s) => acc + s.revenue, 0);
  const totalOrdersAttributed = marketingAttribution.sourcesTable.reduce((acc, s) => acc + s.orders, 0);
  const averageRoas = totalRevenueAttributed / (totalInvestment || 1);

  return (
    <div className="space-y-6">
      {/* 1. CARDS RESUMEN DE ATRIBUCIÓN */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Inversión en Marketing
          </span>
          <span className="text-xl font-black text-slate-100 font-mono">
            {formatCurrency(totalInvestment)}
          </span>
          <span className="text-[10px] text-slate-400 block">Pauta + Creadores + QR</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Venta Neta Atribuida
          </span>
          <span className="text-xl font-black text-emerald-400 font-mono">
            {formatCurrency(totalRevenueAttributed)}
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold block">
            {totalOrdersAttributed} órdenes rastreadas
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            ROAS Promedio
          </span>
          <span className="text-xl font-black text-blue-400 font-mono">
            {averageRoas.toFixed(1)}x
          </span>
          <span className="text-[10px] text-slate-400 block">
            Retorno sobre cada $1 invertido
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Canal Estrella
          </span>
          <span className="text-base font-black text-slate-100 block truncate">
            QR Empaque Delivery
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold block">
            78.4x ROAS • Recompra sin costo
          </span>
        </div>
      </div>

      {/* 2. TABLA RÁPIDA DE ATRIBUCIÓN MULTICANAL */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              <h4 className="font-extrabold text-base text-slate-100">
                Atribución de Ventas por Canal y Campaña
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Trazabilidad del origen exacto de cada venta (QR en mesas, influencers, pauta digital y orgánico).
            </p>
          </div>

          {/* Filtros por tipo de fuente */}
          <div className="flex items-center gap-1 overflow-x-auto bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'qr_table', label: 'QR Mesas' },
              { key: 'qr_packaging', label: 'QR Delivery' },
              { key: 'influencer', label: 'Influencers' },
              { key: 'meta_ads', label: 'Meta Ads' },
              { key: 'google_ads', label: 'Google' },
              { key: 'organic', label: 'Orgánico' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterSource(f.key)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filterSource === f.key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla Fast-to-read */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-2.5">Fuente / Canal</th>
                <th className="py-2.5">Campaña / Detalle</th>
                <th className="py-2.5 text-right">Inversión</th>
                <th className="py-2.5 text-right">Leads</th>
                <th className="py-2.5 text-right">Órdenes</th>
                <th className="py-2.5 text-right">Venta Generada</th>
                <th className="py-2.5 text-right">CAC ($)</th>
                <th className="py-2.5 text-right">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredSources.map((item) => {
                const isQr = item.source === 'qr_table' || item.source === 'qr_packaging';
                const isInfluencer = item.source === 'influencer';
                const isPaid = item.source === 'meta_ads' || item.source === 'google_ads';

                return (
                  <tr key={item.id} className="hover:bg-slate-950/50 transition-colors">
                    <td className="py-3 font-sans font-bold text-slate-100 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isQr
                            ? 'bg-blue-400'
                            : isInfluencer
                            ? 'bg-indigo-400'
                            : isPaid
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <span>{item.sourceLabel}</span>
                    </td>
                    <td className="py-3 font-sans text-slate-300">
                      {item.campaignOrPartner}
                    </td>
                    <td className="py-3 text-right text-slate-400">
                      ${item.investment.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-slate-300">{item.leads}</td>
                    <td className="py-3 text-right font-bold text-slate-100">{item.orders}</td>
                    <td className="py-3 text-right font-bold text-emerald-400">
                      {formatCurrency(item.revenue)}
                    </td>
                    <td className="py-3 text-right text-slate-300">
                      ${item.cac.toFixed(2)}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`font-black px-2 py-0.5 rounded text-[11px] ${
                          item.roas >= 30
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                            : item.roas >= 10
                            ? 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.roas.toFixed(1)}x
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footnote Analítico */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 border-t border-slate-800/60">
          <span>
            📌 <strong>CAC:</strong> Costo de Adquisición de Cliente • <strong>ROAS:</strong> Retorno de la Inversión en Pauta/Canjes.
          </span>
          <span className="font-semibold text-slate-300">
            Total Órdenes Directas Atribuidas: {totalOrdersAttributed}
          </span>
        </div>
      </div>
    </div>
  );
}
