import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MOCK_TENANTS } from '../data/mock-catalog';
import { Store, UtensilsCrossed, ShieldCheck, ArrowRight, Layers, Sparkles } from 'lucide-react';

export default function GlobalLandingPage() {
  const tenantsList = Object.values(MOCK_TENANTS);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-zinc-800/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-900/30">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                FoodTech OS
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                Plataforma Gastronómica SaaS Multi-Tenant
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 px-3 py-1 rounded-full font-bold">
              Fase 1: En Producción
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-16 flex-1 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 mb-6 animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Arquitectura Multi-Tenant con RLS y Modificadores Anidados</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-3xl leading-tight">
          La tecnología que devuelve el control a los <span className="text-emerald-500">restaurantes</span>.
        </h1>

        <p className="mt-5 text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
          Tienda online directa sin pagar el 30% a marketplaces. Catálogo con modificadores de 2do nivel,
          cálculo automático de impuestos (IVA 15%) en el checkout y aislamiento estricto por restaurante.
        </p>

        {/* Directorio de Restaurantes Activos */}
        <div className="w-full max-w-4xl mt-14 text-left">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-400" />
                <span>Restaurantes Demo Disponibles (Pathname Routing)</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Haz clic en cualquier restaurante para acceder a su tienda online independiente:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {tenantsList.map((tenant) => (
              <Link
                key={tenant.id}
                href={`/${tenant.slug}`}
                className="group p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 hover:border-emerald-600/60 hover:bg-zinc-900 transition-all flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center gap-4">
                  {tenant.logo_url && (
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-zinc-800 group-hover:scale-105 transition-transform">
                      <Image src={tenant.logo_url} alt={tenant.name} fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-extrabold text-base text-white group-hover:text-emerald-400 transition-colors">
                      {tenant.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5 font-mono">/{tenant.slug}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md">
                        IVA: {tenant.tax_rate}% en checkout
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-md">
                        Modificadores 2do Nivel
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-xl bg-zinc-800 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-zinc-400 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pilares Técnicos de la Fase 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16 text-left max-w-4xl w-full">
          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Modificadores Recursivos</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Opciones de 1er nivel con sobreprecios y subgrupos anidados (ej: Combo de hamburguesa con selección de bebida).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">PostgreSQL RLS Multi-Tenant</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Seguridad estricta a nivel de fila mediante `tenant_id` y roles (`owner`, `admin`, `cashier`, `kitchen`).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Cálculo de Impuestos</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Precios base netos con liquidación exacta de IVA (15%) y desglose itemizado en la pantalla de checkout.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 px-6 py-6 text-center text-xs text-zinc-500">
        <p>Arquitectura FoodTech B2B • Monorepo Next.js + Supabase + Tailwind CSS + Shadcn</p>
      </footer>
    </div>
  );
}
