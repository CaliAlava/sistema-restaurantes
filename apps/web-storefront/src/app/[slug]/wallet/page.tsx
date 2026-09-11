'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MOCK_TENANTS } from '../../../data/mock-catalog';
import { formatCurrency } from '@restaurantes/ui';
import {
  ArrowLeft,
  QrCode,
  Sparkles,
  ShieldCheck,
  Gift,
  CheckCircle2,
  Copy,
  Check,
  Star,
  Download,
  Share2,
} from 'lucide-react';

export default function DigitalWalletPassPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'burger-craft';
  const tenant = MOCK_TENANTS[slug] ?? MOCK_TENANTS['burger-craft']!;

  const [copied, setCopied] = useState(false);
  const [downloadedApple, setDownloadedApple] = useState(false);
  const [downloadedGoogle, setDownloadedGoogle] = useState(false);

  const customerData = {
    name: 'Carlos Mendoza',
    code: 'BC-GOLD-9482',
    tier: 'Gold VIP',
    points: 340,
    cashbackValue: 17.0,
    memberSince: 'Marzo 2024',
    totalVisits: 14,
  };

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(customerData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAppleWallet = () => {
    setDownloadedApple(true);
    setTimeout(() => setDownloadedApple(false), 3000);
  };

  const handleGoogleWallet = () => {
    setDownloadedGoogle(true);
    setTimeout(() => setDownloadedGoogle(false), 3000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center p-4 sm:p-6">
      {/* Header de Navegación */}
      <header className="w-full max-w-md flex items-center justify-between pb-4">
        <Link
          href={`/${slug}`}
          className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Menú</span>
        </Link>
        <span className="text-xs font-extrabold text-amber-400 bg-amber-950/80 border border-amber-800/60 px-3 py-1 rounded-full flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          Pase de Fidelidad
        </span>
      </header>

      {/* Pase Digital estilo Apple Wallet / Google Wallet */}
      <div className="w-full max-w-sm space-y-4 animate-in zoom-in-95">
        <div className="relative rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900 to-black border border-amber-500/30 p-6 shadow-2xl shadow-amber-950/20 overflow-hidden">
          {/* Acento dorado superior */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600" />

          {/* Encabezado del Pase */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 block">
                {tenant.name}
              </span>
              <h2 className="text-lg font-black text-white">Burger Club VIP</h2>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black">
              {customerData.tier}
            </div>
          </div>

          {/* Datos del Titular y Saldo de Puntos */}
          <div className="py-5 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">
                  Titular del Pase
                </span>
                <span className="font-extrabold text-base text-zinc-100">{customerData.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">
                  Miembro Desde
                </span>
                <span className="text-xs text-zinc-300 font-semibold">{customerData.memberSince}</span>
              </div>
            </div>

            {/* Tarjeta de Saldo */}
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Puntos Acumulados
                </span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {customerData.points} pts
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Equivalente en Efectivo
                </span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {formatCurrency(customerData.cashbackValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Código QR Táctil */}
          <div className="pt-2 pb-4 flex flex-col items-center justify-center space-y-2 border-t border-zinc-800/80">
            <div className="p-3 bg-white rounded-2xl shadow-lg">
              {/* Representación visual de Código QR de Alta Densidad */}
              <div className="w-36 h-36 bg-zinc-950 p-2 rounded-xl flex items-center justify-center relative">
                <QrCode className="w-32 h-32 text-white" />
                <div className="absolute w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950 font-black text-[10px]">
                  VIP
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="font-mono text-xs font-black text-zinc-300 tracking-wider">
                {customerData.code}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1 rounded-md text-zinc-400 hover:text-white"
                title="Copiar código de fidelidad"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 text-center">
              Muestra este código QR al mesero o cajero para redimir tu saldo de cashback.
            </p>
          </div>
        </div>

        {/* Botones de Integración Oficial Apple Wallet & Google Wallet */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleAppleWallet}
            className="w-full py-3.5 px-4 rounded-2xl bg-black border border-zinc-700 hover:border-zinc-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
          >
            <span className="text-base"></span>
            <span>{downloadedApple ? '¡Añadido a Apple Wallet!' : 'Añadir a Apple Wallet'}</span>
          </button>

          <button
            type="button"
            onClick={handleGoogleWallet}
            className="w-full py-3.5 px-4 rounded-2xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
          >
            <span className="font-black text-blue-400">G</span>
            <span>{downloadedGoogle ? '¡Guardado en Google Wallet!' : 'Guardar en Google Wallet'}</span>
          </button>
        </div>

        {/* Beneficios Activos del Nivel */}
        <div className="p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-2.5">
          <span className="font-extrabold text-zinc-200 block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Tus Beneficios Gold Activos:
          </span>
          <div className="space-y-1.5 text-[11px] text-zinc-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>5% de cashback en cada compra online y en salón.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Hamburguesa Smash de regalo durante el mes de tu cumpleaños.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Prioridad inmediata de asignación de mesa en reservas.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
