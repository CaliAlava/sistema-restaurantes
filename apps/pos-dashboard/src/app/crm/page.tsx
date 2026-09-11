'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { CustomerProfile, Coupon } from '@restaurantes/config';
import { formatCurrency } from '@restaurantes/ui';
import {
  Users,
  Award,
  Tag,
  Gift,
  Search,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  MessageCircle,
  Plus,
  Clock,
  CheckCircle,
} from 'lucide-react';

const MOCK_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'c-01',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    phone: '0991234567',
    name: 'Carlos Álava',
    email: 'carlos@ejemplo.com',
    tier: 'vip',
    total_orders: 28,
    total_spent: 495.2,
    loyalty_points: 340,
    tags: ['fan_smash', 'top_buyer', 'viernes_noche'],
  },
  {
    id: 'c-02',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    phone: '0995551234',
    name: 'Andrés Morales',
    email: 'andres@ejemplo.com',
    tier: 'gold',
    total_orders: 14,
    total_spent: 238.5,
    loyalty_points: 180,
    tags: ['delivery_habitual', 'papas_trufadas'],
  },
  {
    id: 'c-03',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    phone: '0994443322',
    name: 'Sofía Carvajal',
    email: 'sofia@ejemplo.com',
    tier: 'silver',
    total_orders: 7,
    total_spent: 112.0,
    loyalty_points: 95,
    tags: ['fin_de_semana'],
  },
  {
    id: 'c-04',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    phone: '0998889900',
    name: 'Diego Narváez',
    email: 'diego@ejemplo.com',
    tier: 'bronze',
    total_orders: 2,
    total_spent: 31.5,
    loyalty_points: 25,
    tags: ['nuevo_cliente'],
  },
];

const MOCK_COUPONS: Coupon[] = [
  {
    id: 'cp-1',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    code: 'SMASH15',
    discount_type: 'percentage',
    discount_value: 15,
    min_order_amount: 10,
    max_discount_amount: 10,
    times_used: 142,
    is_active: true,
  },
  {
    id: 'cp-2',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    code: 'BURGER5',
    discount_type: 'fixed_amount',
    discount_value: 5.0,
    min_order_amount: 20,
    times_used: 89,
    is_active: true,
  },
  {
    id: 'cp-3',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    code: 'BIENVENIDA',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 8,
    times_used: 230,
    is_active: true,
  },
];

export default function CRMPage() {
  const [customers] = useState<CustomerProfile[]>(MOCK_CUSTOMERS);
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);
    const matchesTier = selectedTier === 'all' || c.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

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
          <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-zinc-950 font-black shadow-lg">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-lg text-white">Loyalty & CRM Gastronómico</h1>
            <p className="text-xs text-zinc-400">Burger Craft & Co. • Retención, Puntos y Cupones</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-800/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5" />
            <span>Burger Club Activo</span>
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-6 flex-1 w-full space-y-8">
        {/* Métricas KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Comensales Registrados</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">1,420</div>
            <p className="text-[11px] text-emerald-400 font-semibold">+18% vs mes anterior</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Tasa de Recompra</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">68.4%</div>
            <p className="text-[11px] text-zinc-400">Compran al menos 2 veces/mes</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Puntos en Circulación</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">24,580 pts</div>
            <p className="text-[11px] text-purple-400 font-semibold">Equivalente a $245 en premios</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Cupones Canjeados</span>
              <Tag className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">461 usos</div>
            <p className="text-[11px] text-blue-400 font-semibold">$1,890 en ventas con cupón</p>
          </div>
        </div>

        {/* Sección de Cupones Activos */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-400" />
              <h2 className="font-black text-base text-white">Cupones Promocionales Activos</h2>
            </div>
            <span className="text-xs text-zinc-400 font-medium">Validación en tiempo real en Storefront</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                    {coupon.code}
                  </span>
                  <span className="text-xs font-bold text-zinc-300">
                    {coupon.discount_type === 'percentage'
                      ? `${coupon.discount_value}% OFF`
                      : `$${coupon.discount_value.toFixed(2)} OFF`}
                  </span>
                </div>

                <div className="text-xs text-zinc-400 space-y-1">
                  <p>Monto mínimo: ${coupon.min_order_amount.toFixed(2)}</p>
                  <p className="font-bold text-zinc-300">Usado: {coupon.times_used} veces</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Directorio de Clientes con Segmentación */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-black text-base text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Directorio y Segmentación de Comensales</span>
              </h2>
              <p className="text-xs text-zinc-400">Clientes fidelizados con historial de consumo y puntos</p>
            </div>

            {/* Buscador y Filtro de Tier */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre o teléfono..."
                  className="text-xs bg-zinc-950 rounded-xl pl-9 pr-4 py-2.5 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 w-64"
                />
              </div>

              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="text-xs bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl px-3 py-2.5 focus:outline-none"
              >
                <option value="all">Todos los Niveles</option>
                <option value="vip">Nivel VIP</option>
                <option value="gold">Nivel Oro</option>
                <option value="silver">Nivel Plata</option>
                <option value="bronze">Nivel Bronce</option>
              </select>
            </div>
          </div>

          {/* Tabla de Clientes */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-bold">
                  <th className="pb-3">Comensal</th>
                  <th className="pb-3">Teléfono</th>
                  <th className="pb-3">Nivel (Tier)</th>
                  <th className="pb-3">Total Pedidos</th>
                  <th className="pb-3">Consumo Histórico</th>
                  <th className="pb-3">Puntos Club</th>
                  <th className="pb-3 text-right">Contacto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredCustomers.map((customer) => {
                  const isVip = customer.tier === 'vip';
                  const isGold = customer.tier === 'gold';
                  const isSilver = customer.tier === 'silver';

                  return (
                    <tr key={customer.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 font-bold text-white flex items-center gap-2">
                        <span>{customer.name}</span>
                        {isVip && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                      </td>
                      <td className="py-3 font-mono text-zinc-400">{customer.phone}</td>
                      <td className="py-3">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isVip
                              ? 'bg-amber-400/20 text-amber-400 border border-amber-500/30'
                              : isGold
                              ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-500/30'
                              : isSilver
                              ? 'bg-zinc-400/20 text-zinc-300 border border-zinc-500/30'
                              : 'bg-orange-400/20 text-orange-400 border border-orange-500/30'
                          }`}
                        >
                          {customer.tier}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-zinc-300">{customer.total_orders} órdenes</td>
                      <td className="py-3 font-bold text-emerald-400">
                        {formatCurrency(customer.total_spent)}
                      </td>
                      <td className="py-3 font-bold text-purple-300">
                        {customer.loyalty_points} pts
                      </td>
                      <td className="py-3 text-right">
                        <a
                          href={`https://wa.me/593${customer.phone.replace(/^0/, '')}?text=Hola%20${encodeURIComponent(
                            customer.name
                          )},%20te%20escribimos%20de%20Burger%20Craft%20para%20regalarte%20un%20cup%C3%B3n%20SMASH15`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
