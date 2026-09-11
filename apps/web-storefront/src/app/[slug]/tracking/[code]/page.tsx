'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  ArrowLeft,
  UtensilsCrossed,
  ShieldCheck,
} from 'lucide-react';

export default function CustomerOrderTrackingPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'burger-craft';
  const code = (params?.code as string) || 'TRK-83921';

  // Simulación de estado de entrega en vivo
  const currentStep = 3; // 1: Recibido, 2: Cocina, 3: En Camino, 4: Entregado

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-between pb-12">
      {/* Header */}
      <header className="w-full bg-zinc-900 border-b border-zinc-800 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link
            href={`/${slug}`}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la tienda</span>
          </Link>
          <span className="font-extrabold text-sm text-white">Seguimiento en Vivo</span>
          <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/60">
            {code}
          </span>
        </div>
      </header>

      {/* Tarjeta de Estado en Vivo */}
      <main className="max-w-xl w-full p-4 space-y-6 mt-4 flex-1">
        {/* Banner de ETA */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-zinc-900 to-zinc-900 border border-emerald-800/60 shadow-xl text-center space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-900/60 px-3 py-1 rounded-full inline-block">
            Tu repartidor está en camino
          </span>
          <h1 className="text-3xl font-black text-white">Llega en ~15 minutos</h1>
          <p className="text-xs text-zinc-400">
            El pedido ya salió de la cocina y se encuentra en ruta a tu dirección.
          </p>
        </div>

        {/* Stepper de Progreso */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-6">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
            Progreso del Pedido
          </h2>

          <div className="space-y-6 relative pl-6 border-l-2 border-zinc-800 ml-3">
            {/* Paso 1 */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                ✓
              </span>
              <h3 className="font-extrabold text-sm text-white">Pedido Recibido</h3>
              <p className="text-xs text-zinc-400">Tu orden fue aceptada y procesada por el sistema.</p>
            </div>

            {/* Paso 2 */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                ✓
              </span>
              <h3 className="font-extrabold text-sm text-white">Preparado en Cocina (KDS)</h3>
              <p className="text-xs text-zinc-400">Platillos cocinados al momento con tus modificadores.</p>
            </div>

            {/* Paso 3 (Activo) */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-black shadow-lg animate-pulse">
                <Bike className="w-3.5 h-3.5" />
              </span>
              <h3 className="font-black text-sm text-emerald-400">Repartidor en Camino</h3>
              <p className="text-xs text-zinc-300">
                Juan Pérez se desplaza hacia tu ubicación en Moto #04.
              </p>
            </div>

            {/* Paso 4 */}
            <div className="relative opacity-40">
              <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center text-xs font-bold">
                4
              </span>
              <h3 className="font-extrabold text-sm text-zinc-400">Entregado</h3>
              <p className="text-xs text-zinc-500">Entrega en tu puerta o garita.</p>
            </div>
          </div>
        </div>

        {/* Tarjeta del Repartidor */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-emerald-400 font-bold border border-zinc-700">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">Juan Pérez</h3>
              <p className="text-xs text-zinc-400">Repartidor Oficial • Moto #04</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:0998887777"
              className="p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 transition-colors"
              title="Llamar al repartidor"
            >
              <Phone className="w-4 h-4" />
            </a>
            <a
              href="https://wa.me/593998887777"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              title="WhatsApp del repartidor"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Destino de Entrega */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3 text-xs">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-white block">Destino de Entrega:</span>
            <p className="text-zinc-300">Av. Samborondón Km 2.5, Edificio Platinum, Piso 4</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-zinc-500 mt-6">
        <p>FoodTech OS • Seguimiento de Pedidos y Logística en Vivo</p>
      </footer>
    </div>
  );
}
