'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Reservation, ReservationStatus } from '@restaurantes/config';
import {
  CalendarDays,
  Clock,
  Users,
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sparkles,
  MessageCircle,
  Phone,
  Search,
  Filter,
  AlertCircle,
  Zap,
  X,
  Send,
} from 'lucide-react';

const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-1',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    table_id: 'tbl-5',
    table_number: 'Mesa 5',
    customer_name: 'Familia Mendoza',
    customer_phone: '0991234567',
    party_size: 6,
    reservation_date: new Date().toISOString().split('T')[0]!,
    reservation_time: '20:00',
    status: 'confirmed',
    special_requests: 'Celebración de cumpleaños. Solicitan mesa amplia.',
  },
  {
    id: 'res-2',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    table_id: 'tbl-2',
    table_number: 'Mesa 2',
    customer_name: 'Esteban Rivas',
    customer_phone: '0995554321',
    party_size: 2,
    reservation_date: new Date().toISOString().split('T')[0]!,
    reservation_time: '19:30',
    status: 'seated',
    special_requests: 'Pareja, mesa tranquila.',
  },
  {
    id: 'res-3',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    table_id: 'tbl-6',
    table_number: 'Terraza 1',
    customer_name: 'Valeria Gómez',
    customer_phone: '0998881122',
    party_size: 4,
    reservation_date: new Date().toISOString().split('T')[0]!,
    reservation_time: '20:30',
    status: 'confirmed',
    special_requests: 'Preferencia en terraza exterior.',
  },
  {
    id: 'res-4',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    table_id: null,
    table_number: null,
    customer_name: 'Lucas Zambrano',
    customer_phone: '0997776655',
    party_size: 3,
    reservation_date: new Date().toISOString().split('T')[0]!,
    reservation_time: '13:00',
    status: 'no_show',
    special_requests: null,
  },
];

export default function ReservationsHostessPage() {
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reminderModalRes, setReminderModalRes] = useState<Reservation | null>(null);

  const handleUpdateStatus = (id: string, newStatus: ReservationStatus) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const handleAssignTable = (id: string, tableNumber: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, table_number: tableNumber } : r))
    );
  };

  const filtered = reservations.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch =
      r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer_phone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const confirmedCount = reservations.filter((r) => r.status === 'confirmed').length;
  const seatedCount = reservations.filter((r) => r.status === 'seated').length;
  const totalGuests = reservations
    .filter((r) => r.status !== 'cancelled' && r.status !== 'no_show')
    .reduce((acc, r) => acc + r.party_size, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white font-black shadow-lg">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-lg text-white">Libro de Reservas & Hostess</h1>
            <p className="text-xs text-zinc-400">Burger Craft & Co. • Asignación de Mesas en Salón</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/pos"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Ver Salón POS</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 flex-1 w-full space-y-6">
        {/* Métricas del día */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Reservas Confirmadas</span>
            <div className="text-2xl font-black text-white">{confirmedCount} reservas</div>
            <p className="text-[11px] text-rose-400">Por recibir en salón hoy</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Comensales en Salón</span>
            <div className="text-2xl font-black text-emerald-400">{seatedCount} mesas sentadas</div>
            <p className="text-[11px] text-zinc-400">Comiendo activamente</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Comensales Esperados</span>
            <div className="text-2xl font-black text-amber-400">{totalGuests} personas</div>
            <p className="text-[11px] text-zinc-400">Capacidad reservada</p>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {['all', 'confirmed', 'seated', 'no_show'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === status
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {status === 'all' && 'Todas'}
                {status === 'confirmed' && 'Confirmadas'}
                {status === 'seated' && 'Sentadas'}
                {status === 'no_show' && 'No-Show'}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por comensal..."
              className="text-xs bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500 w-56"
            />
          </div>
        </div>

        {/* Tabla / Lista de Reservas */}
        <div className="space-y-3">
          {filtered.map((res) => {
            const isConfirmed = res.status === 'confirmed';
            const isSeated = res.status === 'seated';
            const isNoShow = res.status === 'no_show';

            return (
              <div
                key={res.id}
                className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-wrap items-center justify-between gap-4 transition-all hover:border-zinc-700"
              >
                {/* Hora & Invitados */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-center">
                    <Clock className="w-4 h-4 text-rose-500 mb-0.5" />
                    <span className="font-mono font-black text-sm text-white leading-none">
                      {res.reservation_time}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base text-white">{res.customer_name}</h3>
                      <span className="text-xs font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Users className="w-3 h-3 text-rose-400" />
                        {res.party_size} pax
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                      <span>{res.customer_phone}</span>
                      {res.table_number && (
                        <span className="text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                          Asignada: {res.table_number}
                        </span>
                      )}
                    </div>

                    {res.special_requests && (
                      <p className="text-[11px] text-amber-300/90 pt-0.5">
                        💬 &quot;{res.special_requests}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Acciones de Hostess */}
                <div className="flex items-center gap-2 text-xs font-bold">
                  {/* Selector de Mesa */}
                  <select
                    value={res.table_number || ''}
                    onChange={(e) => handleAssignTable(res.id, e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-zinc-300 focus:outline-none"
                  >
                    <option value="">Sin mesa asignada</option>
                    <option value="Mesa 1">Mesa 1 (4 pax)</option>
                    <option value="Mesa 2">Mesa 2 (2 pax)</option>
                    <option value="Mesa 3">Mesa 3 (6 pax)</option>
                    <option value="Mesa 5">Mesa 5 (8 pax)</option>
                    <option value="Terraza 1">Terraza 1 (4 pax)</option>
                    <option value="Barra 1">Barra 1 (2 pax)</option>
                  </select>

                  {/* WhatsApp Directo */}
                  <a
                    href={`https://wa.me/593${res.customer_phone.replace(/^0/, '')}?text=Hola%20${encodeURIComponent(
                      res.customer_name
                    )},%20te%20escribimos%20de%20Burger%20Craft%20para%20confirmar%20tu%20reserva%20de%20hoy%20a%20las%20${res.reservation_time}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 transition-colors"
                    title="Escribir por WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  {/* Recordatorio 3h con Botones Interactivos */}
                  <button
                    type="button"
                    onClick={() => setReminderModalRes(res)}
                    className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors flex items-center gap-1.5"
                    title="Simular Plantilla Interactiva Meta WhatsApp (3h antes)"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[10px]">Recordatorio 3h</span>
                  </button>

                  {isConfirmed && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(res.id, 'seated')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <UtensilsCrossed className="w-3.5 h-3.5" />
                        <span>Sentar Comensal</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(res.id, 'no_show')}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-red-950 hover:text-red-400 text-zinc-400 transition-colors"
                        title="Marcar como No-Show"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {isSeated && (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sentados en Salón</span>
                    </span>
                  )}

                  {isNoShow && (
                    <span className="px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-800/40 text-red-400 flex items-center gap-1 font-bold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>No-Show</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal de Simulación de Plantilla Interactiva Meta WhatsApp */}
      {reminderModalRes && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-black text-sm text-white">Recordatorio WhatsApp (3h Antes)</h3>
              </div>
              <button
                onClick={() => setReminderModalRes(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Burbuja estilo WhatsApp */}
            <div className="bg-[#0b141a] p-4 rounded-2xl border border-emerald-900/30 text-xs text-zinc-200 space-y-3 font-sans shadow-md">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-800 pb-1.5">
                <span className="font-bold text-emerald-400">BURGER CRAFT &amp; CO. OFICIAL</span>
                <span>Hoy • Plantilla Meta</span>
              </div>

              <p className="leading-relaxed text-zinc-300">
                ¡Hola <strong>{reminderModalRes.customer_name}</strong>! 👋 Te recordamos que tienes una reserva programada para hoy a las <strong>{reminderModalRes.reservation_time}</strong> para <strong>{reminderModalRes.party_size} personas</strong> {reminderModalRes.table_number ? `(${reminderModalRes.table_number})` : ''}.
              </p>
              <p className="text-zinc-400 text-[11px]">
                Por favor confírmanos si asistes para mantener tu mesa reservada y lista.
              </p>

              {/* Botones Interactivos de WhatsApp */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateStatus(reminderModalRes.id, 'confirmed');
                    setReminderModalRes(null);
                    alert(`✅ ¡Reserva de ${reminderModalRes.customer_name} CONFIRMADA vía WhatsApp!`);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>[Confirmar Asistencia ✅]</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleUpdateStatus(reminderModalRes.id, 'cancelled');
                    handleAssignTable(reminderModalRes.id, '');
                    setReminderModalRes(null);
                    alert(`❌ Reserva de ${reminderModalRes.customer_name} CANCELADA. Mesa liberada.`);
                  }}
                  className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>[Cancelar Reserva ❌]</span>
                </button>
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 text-center">
              Al interactuar con los botones de la plantilla, el estado de la reserva y la mesa se actualizan automáticamente en el libro de la Hostess.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
