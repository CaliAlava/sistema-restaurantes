'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MOCK_TENANTS } from '../../../data/mock-catalog';
import {
  CalendarDays,
  Clock,
  Users,
  UtensilsCrossed,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const TIME_SLOTS = [
  '12:30', '13:00', '13:30', '14:00',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
];

export default function CustomerReservationPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'burger-craft';
  const defaultTenant = MOCK_TENANTS['burger-craft']!;
  const tenant = MOCK_TENANTS[slug] ?? defaultTenant;

  const [partySize, setPartySize] = useState(2);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState('20:00');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationConfirmed, setReservationConfirmed] = useState(false);
  const [resCode, setResCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Por favor ingresa tu nombre y número de WhatsApp');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const code = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
      setResCode(code);
      setReservationConfirmed(true);
      setIsSubmitting(false);
    }, 1000);
  };

  if (reservationConfirmed) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-900 dark:text-zinc-100">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 rounded-full flex items-center justify-center mx-auto text-rose-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-3 py-1 rounded-full">
              ¡Mesa Reservada!
            </span>
            <h1 className="text-2xl font-black mt-2">Te esperamos, {name}</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Código de confirmación: <strong className="font-mono text-zinc-800 dark:text-zinc-200">{resCode}</strong>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 text-xs space-y-2.5 text-left">
            <div className="flex justify-between">
              <span className="text-zinc-400 font-medium">Restaurante:</span>
              <span className="font-bold">{tenant.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400 font-medium">Comensales:</span>
              <span className="font-bold">{partySize} personas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400 font-medium">Fecha y Hora:</span>
              <span className="font-bold text-rose-500">{selectedDate} a las {selectedTime}</span>
            </div>
            {specialRequests && (
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-400">
                Petición especial: &quot;{specialRequests}&quot;
              </div>
            )}
          </div>

          <div className="space-y-2">
            <a
              href={`https://wa.me/593991234567?text=Hola,%20tengo%20la%20reserva%20${resCode}%20a%20nombre%20de%20${encodeURIComponent(name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Confirmar por WhatsApp con el Local</span>
            </a>

            <Link
              href={`/${slug}`}
              className="w-full py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:opacity-90 transition-all block"
            >
              Volver al Menú
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href={`/${slug}`}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la carta</span>
          </Link>
          <div className="text-right">
            <span className="font-extrabold text-sm text-zinc-900 dark:text-white block">{tenant.name}</span>
            <span className="text-[10px] text-zinc-400">Reservación de Mesas</span>
          </div>
        </div>
      </header>

      {/* Main Reservation Form */}
      <main className="max-w-2xl mx-auto p-6 w-full flex-1 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-xs font-bold text-rose-600 dark:text-rose-400">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Reserva en Línea Inmediata</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Reserva tu Mesa</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Asegura tu lugar en el salón o terraza sin filas de espera. Confirmación directa en segundos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-6">
          {/* Número de comensales */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-500" />
              <span>Número de Personas</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPartySize(size)}
                  className={`py-3 rounded-2xl text-xs font-extrabold border transition-all ${
                    partySize === size
                      ? 'border-rose-600 bg-rose-600 text-white shadow-md'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                  }`}
                >
                  {size} {size === 8 ? '+' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha y Franja Horaria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Fecha de Reserva *
              </label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Hora de Llegada *
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold"
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t} hs
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Datos del Comensal */}
          <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Tus Datos de Contacto
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  WhatsApp / Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="099 123 4567"
                  className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Petición especial o notas (Opcional)
              </label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Ej. Mesa en terraza, cumpleaños, silla para bebé..."
                className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Confirmando reserva...</span>
            ) : (
              <>
                <CalendarDays className="w-4 h-4" />
                <span>Confirmar Reserva para {partySize} Personas</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
