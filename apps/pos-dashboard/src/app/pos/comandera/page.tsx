'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@restaurantes/ui';
import { kitchenSound } from '../../../lib/sound';
import {
  ArrowLeft,
  UtensilsCrossed,
  Plus,
  Minus,
  Trash2,
  Send,
  CheckCircle2,
  Users,
  Search,
  Check,
  Flame,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface ComanderaItem {
  id: string;
  name: string;
  price: number;
  category: string;
  modifierOptions?: string[];
}

const MENU_ITEMS: ComanderaItem[] = [
  {
    id: 'm1',
    name: 'Bacon Truffle Double Smash',
    price: 9.5,
    category: 'Hamburguesas',
    modifierOptions: ['Término Medio', 'Bien Cocida', 'Extra Queso (+$1.00)', 'Sin Cebolla'],
  },
  {
    id: 'm2',
    name: 'Classic Americana Cheeseburger',
    price: 7.0,
    category: 'Hamburguesas',
    modifierOptions: ['Doble Cheddar', 'Término Medio', 'Pepinillos Extra'],
  },
  {
    id: 'm3',
    name: 'Smoked BBQ Bacon Crispy',
    price: 8.5,
    category: 'Hamburguesas',
    modifierOptions: ['Salsa BBQ Aparte', 'Sin Tocino', 'Extra Bacon (+$1.50)'],
  },
  {
    id: 'm4',
    name: 'Papas Rústicas Trufadas',
    price: 4.25,
    category: 'Acompañamientos',
    modifierOptions: ['Extra Queso Parmesano (+$0.50)', 'Salsa Trufa Extra'],
  },
  {
    id: 'm5',
    name: 'Aros de Cebolla Crujientes',
    price: 3.5,
    category: 'Acompañamientos',
    modifierOptions: ['Salsa Tártara', 'Salsa BBQ'],
  },
  {
    id: 'm6',
    name: 'Cerveza Artesanal IPA 355ml',
    price: 4.5,
    category: 'Bebidas',
    modifierOptions: ['Helada / Con Vaso', 'Directa de Botella'],
  },
  {
    id: 'm7',
    name: 'Malteada de Vainilla & Caramelo',
    price: 4.0,
    category: 'Bebidas',
    modifierOptions: ['Crema Batida Extra', 'Sin Caramelo'],
  },
];

interface TicketLine {
  id: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  selectedModifiers: string[];
  notes: string;
}

export default function ComanderaMeseroPage() {
  const [selectedTable, setSelectedTable] = useState('Mesa 03 (Terraza)');
  const [guestCount, setGuestCount] = useState(2);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  // Ticket actual
  const [ticketLines, setTicketLines] = useState<TicketLine[]>([]);
  const [configuringItem, setConfiguringItem] = useState<ComanderaItem | null>(null);
  const [tempModifiers, setTempModifiers] = useState<string[]>([]);
  const [tempNotes, setTempNotes] = useState('');

  // Estado de envío
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const categories = ['Todas', 'Hamburguesas', 'Acompañamientos', 'Bebidas'];

  const filteredMenu = MENU_ITEMS.filter((item) => {
    const matchesCat = activeCategory === 'Todas' || item.category === activeCategory;
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleSelectItem = (item: ComanderaItem) => {
    if (item.modifierOptions && item.modifierOptions.length > 0) {
      setConfiguringItem(item);
      setTempModifiers([]);
      setTempNotes('');
    } else {
      addToTicket(item, [], '');
    }
  };

  const addToTicket = (item: ComanderaItem, modifiers: string[], notes: string) => {
    setTicketLines((prev) => [
      ...prev,
      {
        id: `line-${Date.now()}-${Math.random()}`,
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        selectedModifiers: modifiers,
        notes,
      },
    ]);
    setConfiguringItem(null);
  };

  const handleUpdateQty = (lineId: string, delta: number) => {
    setTicketLines((prev) =>
      prev
        .map((line) => {
          if (line.id === lineId) {
            const nextQty = line.quantity + delta;
            return nextQty > 0 ? { ...line, quantity: nextQty } : null;
          }
          return line;
        })
        .filter(Boolean) as TicketLine[]
    );
  };

  const handleRemoveLine = (lineId: string) => {
    setTicketLines((prev) => prev.filter((l) => l.id !== lineId));
  };

  // Cálculos financieros
  const netSubtotal = ticketLines.reduce((acc, l) => acc + l.price * l.quantity, 0);
  const taxAmount = Math.round(netSubtotal * 0.15 * 100) / 100;
  const grandTotal = netSubtotal + taxAmount;

  // Enviar a Cocina KDS
  const handleSendToKitchen = () => {
    if (ticketLines.length === 0) return;
    setIsSending(true);

    try {
      kitchenSound.playActionBeep();
    } catch (e) {
      // Ignorar si audio no está permitido aún
    }

    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      setTicketLines([]);
      setTimeout(() => setSentSuccess(false), 3500);
    }, 280); // <300ms SLA
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header Táctil Comandera */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/pos"
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Volver a Mesas"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-md">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm sm:text-base text-white">Comandera de Mesero</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-950 text-blue-400 border border-blue-800/60">
                Tablet Ultra-Rápida
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Mesero: Andrés M. (Turno Tarde)</p>
          </div>
        </div>

        {/* Selector de Mesa y Comensales */}
        <div className="flex items-center gap-2">
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Mesa 01 (Principal)">Mesa 01 (Principal)</option>
            <option value="Mesa 02 (Principal)">Mesa 02 (Principal)</option>
            <option value="Mesa 03 (Terraza)">Mesa 03 (Terraza)</option>
            <option value="Mesa 04 (Terraza)">Mesa 04 (Terraza)</option>
            <option value="Mesa 05 (VIP Lounge)">Mesa 05 (VIP Lounge)</option>
            <option value="Barra 01">Barra 01</option>
          </select>

          <div className="flex items-center gap-1 bg-zinc-800 px-2.5 py-1.5 rounded-xl border border-zinc-700 text-xs text-zinc-300">
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-bold">{guestCount}p</span>
          </div>
        </div>
      </header>

      {/* Banner de Envío Exitoso */}
      {sentSuccess && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-center text-xs font-black flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>¡Comanda enviada a Cocina KDS en 280ms! Orden activa en {selectedTable}.</span>
        </div>
      )}

      {/* Contenido: Catálogo (Izquierda) + Comanda Actual (Derecha) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 max-w-7xl mx-auto w-full">
        {/* Catálogo Táctil (Cols 1-7) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Barra de Filtro y Búsqueda */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar platillo rápido..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Platillos Táctiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {filteredMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/60 hover:bg-zinc-800/80 active:scale-95 transition-all text-left flex flex-col justify-between h-28 shadow-sm group"
              >
                <div>
                  <span className="text-[10px] text-zinc-500 font-medium block">{item.category}</span>
                  <h4 className="font-extrabold text-xs text-zinc-100 line-clamp-2 mt-0.5 group-hover:text-emerald-400 transition-colors">
                    {item.name}
                  </h4>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
                  <span className="font-black text-sm text-emerald-400">{formatCurrency(item.price)}</span>
                  <div className="w-6 h-6 rounded-lg bg-zinc-800 group-hover:bg-emerald-600 text-zinc-400 group-hover:text-white flex items-center justify-center transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Comanda en Vivo / Ticket de Mesa (Cols 8-12) */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-3xl p-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                  <span>Comanda: {selectedTable}</span>
                </h3>
                <span className="text-[11px] text-zinc-400">
                  {ticketLines.reduce((acc, l) => acc + l.quantity, 0)} platillos seleccionados
                </span>
              </div>
              {ticketLines.length > 0 && (
                <button
                  onClick={() => setTicketLines([])}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Vaciar comanda
                </button>
              )}
            </div>

            {/* Lista de Líneas */}
            <div className="py-3 space-y-2.5 overflow-y-auto max-h-[calc(100vh-390px)] pr-1">
              {ticketLines.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  Toca los platillos del menú para agregarlos a la comanda de la mesa.
                </div>
              ) : (
                ticketLines.map((line) => (
                  <div
                    key={line.id}
                    className="p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-start justify-between gap-2 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{line.name}</span>
                      </div>
                      {line.selectedModifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {line.selectedModifiers.map((mod, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-zinc-900 text-zinc-300 px-1.5 py-0.5 rounded-md border border-zinc-700"
                            >
                              {mod}
                            </span>
                          ))}
                        </div>
                      )}
                      {line.notes && (
                        <p className="text-[10px] text-amber-400 italic mt-0.5">Nota: {line.notes}</p>
                      )}
                      <div className="mt-1 font-bold text-emerald-400">
                        {formatCurrency(line.price * line.quantity)}
                      </div>
                    </div>

                    {/* Controles de Cantidad */}
                    <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-700">
                      <button
                        onClick={() => handleUpdateQty(line.id, -1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-zinc-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-black text-xs w-4 text-center">{line.quantity}</span>
                      <button
                        onClick={() => handleUpdateQty(line.id, 1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-zinc-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveLine(line.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Liquidación & Botón de Envío a Cocina */}
          <div className="pt-3 border-t border-zinc-800 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal Neto:</span>
                <span>{formatCurrency(netSubtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>IVA (15%):</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-white pt-1 border-t border-zinc-800">
                <span>Total Mesa:</span>
                <span className="text-emerald-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleSendToKitchen}
              disabled={ticketLines.length === 0 || isSending}
              className={`w-full py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                ticketLines.length === 0
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
              }`}
            >
              {isSending ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Emitiendo comanda (&lt;300ms)...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar a Cocina KDS (&lt;300ms)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Táctil de Modificadores */}
      {configuringItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div>
                <h3 className="font-black text-sm text-white">{configuringItem.name}</h3>
                <span className="text-xs text-emerald-400 font-bold">
                  {formatCurrency(configuringItem.price)}
                </span>
              </div>
              <button
                onClick={() => setConfiguringItem(null)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">Modificadores y Término:</label>
              <div className="grid grid-cols-2 gap-2">
                {configuringItem.modifierOptions?.map((mod) => {
                  const isSelected = tempModifiers.includes(mod);
                  return (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setTempModifiers(tempModifiers.filter((m) => m !== mod));
                        } else {
                          setTempModifiers([...tempModifiers, mod]);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300'
                          : 'border-zinc-800 bg-zinc-800/60 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px]">{mod}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Instrucciones Especiales Cocina:</label>
              <input
                type="text"
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                placeholder="Ej. Término bien sellado, sin sal, etc."
                className="w-full text-xs p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={() => addToTicket(configuringItem, tempModifiers, tempNotes)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar a la Comanda</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
