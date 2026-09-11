'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '../store/use-cart-store';
import { formatCurrency } from '@restaurantes/ui';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Bike, Store } from 'lucide-react';

interface CartDrawerProps {
  tenantSlug: string;
}

export function CartDrawer({ tenantSlug }: CartDrawerProps) {
  const {
    items,
    isOpen,
    setIsOpen,
    fulfillmentType,
    setFulfillmentType,
    updateQuantity,
    removeItem,
    getSummary,
  } = useCartStore();

  if (!isOpen) return null;

  const summary = getSummary();

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h2 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100">Tu Pedido</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
              {items.length} {items.length === 1 ? 'ítem' : 'ítems'}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector Tipo de Entrega */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800">
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-200/70 dark:bg-zinc-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFulfillmentType('delivery')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                fulfillmentType === 'delivery'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Bike className="w-4 h-4" />
              Delivery ($2.50)
            </button>
            <button
              onClick={() => setFulfillmentType('pickup')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                fulfillmentType === 'pickup'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Store className="w-4 h-4" />
              Para Retiro ($0.00)
            </button>
          </div>
        </div>

        {/* Lista de Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 p-8">
              <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-3 text-zinc-300" />
              <p className="font-medium text-sm">Tu carrito está vacío</p>
              <p className="text-xs text-zinc-400 mt-1">Agrega platillos del menú para empezar</p>
            </div>
          ) : (
            items.map((item, index) => {
              const modifiersDelta = item.selected_modifiers.reduce((acc, m) => {
                const nested = m.nested_selections?.reduce((nAcc, n) => nAcc + n.price_delta, 0) || 0;
                return acc + m.price_delta + nested;
              }, 0);
              const itemTotal = (item.base_price + modifiersDelta) * item.quantity;

              return (
                <div
                  key={`${item.product_id}-${index}`}
                  className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{item.name}</span>
                    <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(itemTotal)}
                    </span>
                  </div>

                  {/* Modificadores */}
                  {item.selected_modifiers.length > 0 && (
                    <div className="text-[11px] text-zinc-500 space-y-0.5">
                      {item.selected_modifiers.map((mod, mIdx) => (
                        <div key={mIdx} className="flex flex-col">
                          <span className="text-zinc-700 dark:text-zinc-300">
                            • {mod.modifier_option_name}
                            {mod.price_delta > 0 && ` (+${formatCurrency(mod.price_delta)})`}
                          </span>
                          {/* Modificadores anidados */}
                          {mod.nested_selections?.map((nMod, nIdx) => (
                            <span key={nIdx} className="ml-3 text-emerald-600 dark:text-emerald-400">
                              └ {nMod.modifier_option_name}
                              {nMod.price_delta > 0 && ` (+${formatCurrency(nMod.price_delta)})`}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {item.special_instructions && (
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-md">
                      Nota: {item.special_instructions}
                    </p>
                  )}

                  {/* Controles de cantidad */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-700/60 mt-1">
                    <button
                      onClick={() => removeItem(index)}
                      className="text-zinc-400 hover:text-red-500 p-1 text-xs flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer con cálculo de impuestos en checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 space-y-3">
            <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal neto</span>
                <span className="font-semibold">{formatCurrency(summary.net_subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
                <span className="flex items-center gap-1">
                  IVA (15%) <span className="text-[10px] text-zinc-400">(Checkout)</span>
                </span>
                <span className="font-semibold">{formatCurrency(summary.tax_total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Entrega ({fulfillmentType === 'delivery' ? 'Moto' : 'Retiro'})</span>
                <span className="font-semibold">{formatCurrency(summary.delivery_fee)}</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-sm font-extrabold text-zinc-900 dark:text-zinc-50">
                <span>Total a Pagar</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-base">
                  {formatCurrency(summary.grand_total)}
                </span>
              </div>
            </div>

            <Link
              href={`/${tenantSlug}/checkout`}
              onClick={() => setIsOpen(false)}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all text-center"
            >
              <span>Continuar al Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
