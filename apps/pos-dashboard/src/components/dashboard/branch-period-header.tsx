'use client';

import React from 'react';
import Link from 'next/link';
import {
  Store,
  MapPin,
  Calendar,
  Flame,
  LayoutGrid,
  Bot,
  Award,
  CalendarDays,
  DollarSign,
  Wifi,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import {
  BRANCH_OPTIONS,
  PERIOD_OPTIONS,
  type BranchId,
  type PeriodId,
} from '../../data/mock-analytics';

interface BranchPeriodHeaderProps {
  selectedBranch: BranchId;
  selectedPeriod: PeriodId;
  onSelectBranch: (branch: BranchId) => void;
  onSelectPeriod: (period: PeriodId) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const TABS = [
  { id: 'overview', label: '1. Visión Ejecutiva' },
  { id: 'attraction_conversion', label: '2. Atracción & Conversión' },
  { id: 'customers', label: '3. Clientes & Fidelización' },
  { id: 'operations', label: '4. Operación & Delivery' },
  { id: 'marketing', label: '5. Marketing & Atribución' },
] as const;

export function BranchPeriodHeader({
  selectedBranch,
  selectedPeriod,
  onSelectBranch,
  onSelectPeriod,
  activeTab,
  onSelectTab,
}: BranchPeriodHeaderProps) {
  return (
    <div className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 shadow-lg">
      {/* Barra Superior: Marca, Sucursales y Períodos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-900">
        {/* Identidad de Marca */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-black shadow-inner">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-100 tracking-tight">
                Burger Craft & Co.
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60 text-[10px] font-bold">
                Executive OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Panel Unificado del Propietario • Sola Vista de Negocio
            </p>
          </div>
        </div>

        {/* Selectores de Sucursal y Período */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de Sucursal */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <select
                value={selectedBranch}
                onChange={(e) => onSelectBranch(e.target.value as BranchId)}
                aria-label="Seleccionar sucursal"
                className="bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer pr-4"
              >
                {BRANCH_OPTIONS.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-slate-100">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector de Período Temporal */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            {PERIOD_OPTIONS.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectPeriod(p.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedPeriod === p.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Estado de Operación en Vivo */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>KDS & Flota 100% Operativos</span>
          </div>
        </div>
      </div>

      {/* Barra de Pestañas de Vista Unificada + Accesos Rápidos a Módulos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Navegación Estratégica por Pestañas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-blue-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Accesos Rápidos a Módulos Operativos (Enlaces a las rutas existentes) */}
        <div className="flex items-center gap-1.5 text-xs">
          <Link
            href="/kds"
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
            title="Pantalla de Cocina"
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span className="hidden md:inline">Cocina</span> KDS
          </Link>

          <Link
            href="/pos"
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
            title="Punto de Venta Salón"
          >
            <LayoutGrid className="w-3 h-3 text-blue-400" />
            <span className="hidden md:inline">Mesas</span> POS
          </Link>

          <Link
            href="/commander"
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
            title="Bot WhatsApp AI"
          >
            <Bot className="w-3 h-3 text-emerald-400" />
            <span>WhatsApp</span>
          </Link>

          <Link
            href="/crm"
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
            title="Loyalty & CRM"
          >
            <Award className="w-3 h-3 text-indigo-400" />
            <span>CRM</span>
          </Link>

          <Link
            href="/reservas"
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
            title="Libro de Reservas"
          >
            <CalendarDays className="w-3 h-3 text-sky-400" />
            <span>Reservas</span>
          </Link>

          <Link
            href="/caja"
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
            title="Caja y Reporte SRI"
          >
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span>Caja SRI</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
