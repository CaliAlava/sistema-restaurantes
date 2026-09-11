'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MOCK_TENANTS, MOCK_CATEGORIES, MOCK_PRODUCTS } from '../../data/mock-catalog';
import { ModifierModal } from '../../components/modifier-modal';
import { CartDrawer } from '../../components/cart-drawer';
import { useCartStore } from '../../store/use-cart-store';
import { formatCurrency } from '@restaurantes/ui';
import type { Product } from '@restaurantes/config';
import { ShoppingBag, Search, Clock, MapPin, Sparkles, ChevronRight, Store, Ban, QrCode } from 'lucide-react';

export default function TenantStorefrontPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'burger-craft';

  const defaultTenant = MOCK_TENANTS['burger-craft']!;
  const tenant = MOCK_TENANTS[slug] ?? defaultTenant;
  const categories = MOCK_CATEGORIES[slug] ?? MOCK_CATEGORIES['burger-craft'] ?? [];
  const products = MOCK_PRODUCTS[slug] ?? MOCK_PRODUCTS['burger-craft'] ?? [];

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [configuringProduct, setConfiguringProduct] = useState<Product | null>(null);

  const { setIsOpen, getTotalItemsCount, getSummary, addItem } = useCartStore();
  const totalItems = getTotalItemsCount();
  const summary = getSummary();

  // Filtrado de catálogo
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category_id === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Boolean(product.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleProductClick = (product: Product) => {
    if (product.is_available === false) {
      return;
    }
    if (product.modifier_groups && product.modifier_groups.length > 0) {
      setConfiguringProduct(product);
    } else {
      addItem({
        product_id: product.id,
        name: product.name,
        base_price: product.base_price,
        tax_rate: product.tax_rate,
        quantity: 1,
        selected_modifiers: [],
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-28">
      {/* Barra superior de navegación */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {tenant.logo_url ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-xs">
                <Image src={tenant.logo_url} alt={tenant.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Store className="w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 leading-none">
                {tenant.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Abierto ahora
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 25-35 min
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/${slug}/wallet`}
              className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 font-black text-xs flex items-center gap-1.5 transition-all shadow-xs"
              title="Ver mi pase de fidelidad digital (Apple / Google Wallet)"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Pase Club</span>
            </Link>

            <button
              onClick={() => setIsOpen(true)}
              className="relative px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-bold text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-2 transition-all shadow-xs"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Carrito</span>
              {totalItems > 0 && (
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[11px]">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Banner del Restaurante */}
      {tenant.banner_url && (
        <div className="relative h-48 md:h-64 w-full bg-zinc-900 overflow-hidden">
          <Image
            src={tenant.banner_url}
            alt={tenant.name}
            fill
            priority
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
          <div className="absolute bottom-6 left-0 right-0 max-w-5xl mx-auto px-4 text-white">
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-600/90 backdrop-blur-xs px-3 py-1 rounded-full inline-block mb-2">
              Tienda Oficial Sin Comisiones
            </span>
            <h2 className="text-2xl md:text-3xl font-black">{tenant.name}</h2>
            <p className="text-xs text-zinc-300 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Precios directos de local • Delivery propio y Retiro
            </p>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto px-4 mt-6">
        {/* Buscador */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por hamburguesa, acompañamiento o bebida..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Pestañas de categorías */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
            }`}
          >
            Todos los platos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Catálogo de Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((product) => {
            const isPaused86 = product.is_available === false;
            return (
              <div
                key={product.id}
                onClick={() => !isPaused86 && handleProductClick(product)}
                className={`group p-4 rounded-3xl bg-white dark:bg-zinc-900 border transition-all flex gap-4 items-center justify-between ${
                  isPaused86
                    ? 'border-zinc-200 dark:border-zinc-800 opacity-60 grayscale cursor-not-allowed select-none'
                    : 'border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-md cursor-pointer'
                }`}
              >
                <div className="flex-1 space-y-1.5 pr-2">
                  <div className="flex items-center gap-2">
                    {isPaused86 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <Ban className="w-2.5 h-2.5" /> Agotado (86)
                      </span>
                    ) : product.is_featured ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full uppercase">
                        <Sparkles className="w-2.5 h-2.5" /> Más vendido
                      </span>
                    ) : null}
                  </div>
                  <h3 className={`font-extrabold text-sm md:text-base transition-colors ${
                    isPaused86
                      ? 'text-zinc-500 dark:text-zinc-500 line-through'
                      : 'text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600'
                  }`}>
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                  <div className="pt-2 flex items-center gap-3">
                    <span className="font-black text-sm text-zinc-900 dark:text-zinc-50">
                      {formatCurrency(product.base_price)}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      + IVA en checkout
                    </span>
                    {product.modifier_groups && product.modifier_groups.length > 0 && !isPaused86 && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        Personalizable
                      </span>
                    )}
                  </div>
                </div>

                {product.image_url && (
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-800">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className={`object-cover ${isPaused86 ? 'grayscale' : 'group-hover:scale-105 transition-transform duration-300'}`}
                    />
                    <div className={`absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
                      isPaused86
                        ? 'bg-zinc-700 text-zinc-400'
                        : 'bg-emerald-600 text-white group-hover:bg-emerald-700'
                    }`}>
                      {isPaused86 ? <Ban className="w-3.5 h-3.5" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Barra flotante de carrito */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-40 max-w-lg mx-auto px-4 animate-in slide-in-from-bottom-4">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full py-4 px-6 rounded-2xl bg-zinc-900 dark:bg-emerald-600 text-white font-extrabold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {totalItems}
              </div>
              <span className="text-sm">Ver Pedido</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{formatCurrency(summary.grand_total)}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Modal de Modificadores */}
      {configuringProduct && (
        <ModifierModal
          product={configuringProduct}
          onClose={() => setConfiguringProduct(null)}
        />
      )}

      {/* Carrito Lateral */}
      <CartDrawer tenantSlug={slug} />
    </div>
  );
}
