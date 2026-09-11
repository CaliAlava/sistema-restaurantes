'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@restaurantes/ui';
import {
  X,
  Zap,
  Search,
  CheckCircle2,
  Ban,
  AlertTriangle,
  UtensilsCrossed,
  Filter,
} from 'lucide-react';

export interface QuickStockItem {
  id: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
  stockCount?: number;
}

const INITIAL_STOCK_ITEMS: QuickStockItem[] = [
  {
    id: 'p1-bacon-truffle',
    name: 'Bacon Truffle Double Smash',
    category: 'Hamburguesas Smash',
    price: 9.5,
    isAvailable: true,
    stockCount: 18,
  },
  {
    id: 'p2-classic-americana',
    name: 'Classic Americana Cheeseburger',
    category: 'Hamburguesas Smash',
    price: 7.0,
    isAvailable: true,
    stockCount: 24,
  },
  {
    id: 'p3-papas-trufadas',
    name: 'Papas Rústicas Trufadas',
    category: 'Acompañamientos',
    price: 4.25,
    isAvailable: true,
    stockCount: 30,
  },
  {
    id: 'p4-aros-cebolla',
    name: 'Aros de Cebolla Crujientes',
    category: 'Acompañamientos',
    price: 3.5,
    isAvailable: true,
    stockCount: 15,
  },
  {
    id: 'p5-cerveza-ipa',
    name: 'Cerveza Artesanal IPA 355ml',
    category: 'Bebidas & Malteadas',
    price: 4.5,
    isAvailable: true,
    stockCount: 40,
  },
  {
    id: 'p6-malteada-vainilla',
    name: 'Malteada de Vainilla & Caramelo',
    category: 'Bebidas & Malteadas',
    price: 4.0,
    isAvailable: false, // Ejemplo pausado
    stockCount: 0,
  },
];

interface StockQuickManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StockQuickManagerModal({ isOpen, onClose }: StockQuickManagerModalProps) {
  const [items, setItems] = useState<QuickStockItem[]>(INITIAL_STOCK_ITEMS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lastActionNotice, setLastActionNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = Array.from(new Set(items.map((i) => i.category)));

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const availableCount = items.filter((i) => i.isAvailable).length;
  const pausedCount = items.filter((i) => !i.isAvailable).length;

  const handleToggleAvailability = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const nextState = !item.isAvailable;
          setLastActionNotice(
            nextState
              ? `Plato "${item.name}" ACTIVADO (Disponible en Storefront y POS)`
              : `Plato "${item.name}" MARCADO COMO 86 / AGOTADO (Ocultado de venta)`
          );
          setTimeout(() => setLastActionNotice(null), 3000);
          return { ...item, isAvailable: nextState };
        }
        return item;
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
        {/* Encabezado */}
        <div className="px-6 py-4 bg-zinc-800/80 border-b border-zinc-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Control Rápido de Stock 86
                <span className="text-[10px] uppercase tracking-wider bg-rose-950/80 text-rose-400 border border-rose-800/60 px-2 py-0.5 rounded-full font-bold">
                  Pausar en 1 Clic
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Pausa platos agotados al instante. Los cambios se sincronizan en tiempo real con el Storefront y POS.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen & Buscador */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                🟢 {availableCount} Activos
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-800/60">
                🔴 {pausedCount} Pausados (86)
              </span>
            </div>

            {/* Categorías */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Input de Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar plato para pausar o reactivar..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Banner de Acción Inmediata */}
          {lastActionNotice && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in-50">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{lastActionNotice}</span>
            </div>
          )}
        </div>

        {/* Lista de Platos para Switch */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {filteredItems.map((item) => {
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  item.isAvailable
                    ? 'bg-zinc-800/50 border-zinc-700/60 hover:border-zinc-600'
                    : 'bg-rose-950/20 border-rose-800/40 opacity-80'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-black text-sm ${
                        item.isAvailable ? 'text-zinc-100' : 'text-rose-300 line-through'
                      }`}
                    >
                      {item.name}
                    </span>
                    {!item.isAvailable && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white">
                        86 / Agotado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span className="font-bold text-zinc-200">{formatCurrency(item.price)}</span>
                    <span>•</span>
                    <span className="text-[11px] text-zinc-500">
                      Stock: {item.stockCount ?? 'N/A'} un.
                    </span>
                  </div>
                </div>

                {/* Botón de 1 Clic */}
                <button
                  type="button"
                  onClick={() => handleToggleAvailability(item.id)}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 ${
                    item.isAvailable
                      ? 'bg-emerald-600 hover:bg-rose-600 text-white'
                      : 'bg-rose-600 hover:bg-emerald-600 text-white'
                  }`}
                  title={item.isAvailable ? 'Clic para pausar (86)' : 'Clic para reactivar'}
                >
                  {item.isAvailable ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>DISPONIBLE</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4" />
                      <span>PAUSADO (86)</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="text-center py-10 text-zinc-500 text-xs">
              No se encontraron platos que coincidan con &quot;{search}&quot;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-800/80 border-t border-zinc-700/60 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            Los platos en estado <strong>86</strong> quedan inmediatamente bloqueados en el catálogo.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-xs transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
