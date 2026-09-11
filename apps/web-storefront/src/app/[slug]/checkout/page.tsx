'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '../../../store/use-cart-store';
import { MOCK_TENANTS } from '../../../data/mock-catalog';
import { formatCurrency } from '@restaurantes/ui';
import {
  type Coupon,
  applyCouponDiscount,
  calculateDynamicDeliveryFee,
} from '@restaurantes/config';
import {
  ArrowLeft,
  Bike,
  Store,
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  ReceiptText,
  Tag,
  Sparkles,
  Gift,
  ExternalLink,
  MapPin,
  Navigation,
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  Trash2,
  Info,
} from 'lucide-react';

const AVAILABLE_COUPONS: Record<string, Coupon> = {
  SMASH15: {
    id: 'cp-01',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    code: 'SMASH15',
    discount_type: 'percentage',
    discount_value: 15,
    min_order_amount: 10,
    max_discount_amount: 10,
    is_active: true,
  },
  BURGER5: {
    id: 'cp-02',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    code: 'BURGER5',
    discount_type: 'fixed_amount',
    discount_value: 5.0,
    min_order_amount: 20,
    is_active: true,
  },
};

export default function CheckoutPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'burger-craft';
  const defaultTenant = MOCK_TENANTS['burger-craft']!;
  const tenant = MOCK_TENANTS[slug] ?? defaultTenant;

  const {
    items,
    fulfillmentType,
    setFulfillmentType,
    setDeliveryFee,
    tipAmount,
    setTipAmount,
    getSummary,
    clearCart,
  } = useCartStore();

  const rawSummary = getSummary();

  // Distancia y Geocerca de Delivery
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number>(2.5);
  const dynamicDelivery = calculateDynamicDeliveryFee(deliveryDistanceKm);
  const activeDeliveryFee = fulfillmentType === 'delivery' ? dynamicDelivery.fee : 0;

  // Sincronizar costo de envío al store del carrito
  React.useEffect(() => {
    setDeliveryFee(activeDeliveryFee);
  }, [activeDeliveryFee, setDeliveryFee]);

  // Cupones y Loyalty
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  // Cálculo financiero con descuento e impuestos SRI
  const discountedFinancials = applyCouponDiscount(
    rawSummary.net_subtotal,
    activeDeliveryFee,
    appliedCoupon
  );

  const finalGrandTotal =
    discountedFinancials.grand_total + (tipAmount > 0 ? tipAmount : 0);

  // Formulario del cliente
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    idNumber: '',
    address: '',
    reference: '',
    paymentMethod: 'cash',
    notes: '',
  });

  // Estado para subida de comprobante bancario
  const [voucherImage, setVoucherImage] = useState<string | null>(null);
  const [voucherFileName, setVoucherFileName] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleVoucherUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVoucherFileName(file.name);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setVoucherImage(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [trackingCode, setTrackingCode] = useState('');

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <ReceiptText className="w-16 h-16 text-zinc-300 stroke-1 mb-4" />
        <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
          No hay productos en tu pedido
        </h1>
        <p className="text-xs text-zinc-500 mt-2 max-w-xs">
          Regresa al catálogo del restaurante para seleccionar tus platillos favoritos.
        </p>
        <Link
          href={`/${slug}`}
          className="mt-6 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 transition-all"
        >
          Explorar el Menú
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError('');

    if (!code) {
      setAppliedCoupon(null);
      return;
    }

    const found = AVAILABLE_COUPONS[code];
    if (!found) {
      setCouponError('Cupón inválido o expirado.');
      setAppliedCoupon(null);
      return;
    }

    if (rawSummary.net_subtotal < found.min_order_amount) {
      setCouponError(`Monto mínimo para este cupón: $${found.min_order_amount.toFixed(2)}`);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(found);
    setCouponInput(code);
  };

  const handleTipPercentage = (percent: number) => {
    const tip = Math.round(discountedFinancials.discounted_subtotal * (percent / 100) * 100) / 100;
    setTipAmount(tip);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Por favor ingresa tu nombre y número de teléfono');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const generatedTracking = `TRK-${Math.floor(10000 + Math.random() * 90000)}`;
      setOrderId(generatedId);
      setTrackingCode(generatedTracking);
      setOrderPlaced(true);
      setIsSubmitting(false);
      clearCart();
    }, 1000);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-8 shadow-xl text-center space-y-5 animate-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-full">
              ¡Pedido Recibido!
            </span>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-2">
              Gracias por tu compra, {formData.name}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Tu orden <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">#{orderId}</span> ya está siendo preparada en cocina.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-zinc-500">Restaurante:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{tenant.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Tipo de Entrega:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {fulfillmentType === 'delivery'
                  ? `Delivery (${deliveryDistanceKm.toFixed(1)} km • ~${dynamicDelivery.estimatedMinutes} min)`
                  : 'Para Retiro en Local'}
              </span>
            </div>
            {voucherImage && (
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60">
                <span className="flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Comprobante de Pago:
                </span>
                <span className="font-mono text-[11px] bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Adjuntado (En revisión)
                </span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-500">Total Liquidado:</span>
              <span className="font-black text-emerald-600">{formatCurrency(finalGrandTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Puntos Ganados:</span>
              <span className="font-bold text-amber-500">+{discountedFinancials.points_earned} Puntos Burger Club</span>
            </div>
          </div>

          {/* Botón de Seguimiento en Vivo */}
          <Link
            href={`/${slug}/tracking/${trackingCode}`}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Ver Seguimiento en Tiempo Real</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href={`/${slug}`}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la tienda</span>
          </Link>
          <div className="text-right">
            <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">{tenant.name}</span>
            <span className="text-[10px] text-zinc-400 block">Checkout Seguro</span>
          </div>
        </div>
      </header>

      {/* Checkout Container */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 w-full flex-1">
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Opciones de Entrega y Datos */}
          <div className="lg:col-span-7 space-y-6">
            {/* Modalidad de Entrega */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                <span>1. Tipo de Entrega</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    fulfillmentType === 'delivery'
                      ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200 font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <Bike className="w-6 h-6 text-emerald-600" />
                  <span className="text-xs">A Domicilio (Delivery)</span>
                  <span className="text-[10px] text-zinc-400 font-normal">
                    {deliveryDistanceKm.toFixed(1)} km • {formatCurrency(dynamicDelivery.fee)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('pickup')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    fulfillmentType === 'pickup'
                      ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200 font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <Store className="w-6 h-6 text-emerald-600" />
                  <span className="text-xs">Para Llevar (Pickup)</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Sin costo extra</span>
                </button>
              </div>

              {fulfillmentType === 'delivery' && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Dirección de Entrega *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Calle principal, número y secundaria"
                      className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Referencia de entrega
                    </label>
                    <input
                      type="text"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      placeholder="Color de casa, garita, piso, oficina"
                      className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Selector Dinámico de Geocerca y Distancia */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        Distancia estimada de entrega
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full">
                        {deliveryDistanceKm.toFixed(1)} km • {formatCurrency(dynamicDelivery.fee)}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0.5"
                      max="15.0"
                      step="0.5"
                      value={deliveryDistanceKm}
                      onChange={(e) => setDeliveryDistanceKm(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />

                    {/* Presets de Zona */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setDeliveryDistanceKm(1.5)}
                        className={`text-[10px] py-1.5 px-2 rounded-lg border transition-all ${
                          deliveryDistanceKm <= 2
                            ? 'bg-emerald-600 text-white font-bold border-emerald-600'
                            : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        Cerca (&lt;2km) • $1.50
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryDistanceKm(4.0)}
                        className={`text-[10px] py-1.5 px-2 rounded-lg border transition-all ${
                          deliveryDistanceKm > 2 && deliveryDistanceKm <= 6
                            ? 'bg-emerald-600 text-white font-bold border-emerald-600'
                            : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        Media (4km) • $2.50
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryDistanceKm(8.0)}
                        className={`text-[10px] py-1.5 px-2 rounded-lg border transition-all ${
                          deliveryDistanceKm > 6
                            ? 'bg-emerald-600 text-white font-bold border-emerald-600'
                            : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        Extendida (8km) • $4.50
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200/60 dark:border-zinc-700/40">
                      <span>Tarifa: $1.50 base (hasta 2 km) + $0.50/km adicional</span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">
                        ~{dynamicDelivery.estimatedMinutes} min
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Datos Personales */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                2. Datos del Cliente
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tu nombre y apellido"
                    className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    WhatsApp / Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="099 123 4567"
                    className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Método de Pago */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                3. Método de Pago
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                    formData.paymentMethod === 'cash'
                      ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold">Efectivo</span>
                  <span className="text-[10px] text-zinc-400">Contra-entrega</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'transfer' })}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                    formData.paymentMethod === 'transfer'
                      ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold">Deuna / Banco</span>
                  <span className="text-[10px] text-zinc-400">Transferencia</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                    formData.paymentMethod === 'card'
                      ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold">Tarjeta Online</span>
                  <span className="text-[10px] text-zinc-400">Stripe / Payphone</span>
                </button>
              </div>

              {/* Sección de Datos Bancarios y Comprobante si elige Transferencia */}
              {formData.paymentMethod === 'transfer' && (
                <div className="mt-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-4 animate-in fade-in-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      Datos para Transferencia Directa o Deuna
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                      Paso Obligatorio
                    </span>
                  </div>

                  {/* Ficha Bancaria con Copiar al Portapapeles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-medium">Banco & Tipo</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">Banco Pichincha (Cta. Corriente)</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-medium">Número de Cuenta</span>
                        <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">2100482910</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('2100482910', 'acc')}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600"
                        title="Copiar cuenta"
                      >
                        {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-medium">RUC / Identificación</span>
                        <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">0992384756001</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('0992384756001', 'ruc')}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600"
                        title="Copiar RUC"
                      >
                        {copiedField === 'ruc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-medium">Deuna / Celular</span>
                        <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">099 123 4567</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('0991234567', 'phone')}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600"
                        title="Copiar celular"
                      >
                        {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Subir Comprobante con Vista Previa */}
                  <div className="pt-1">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Adjuntar Comprobante o Captura de Pago:
                    </label>

                    {voucherImage ? (
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-500/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={voucherImage}
                            alt="Comprobante"
                            className="w-12 h-12 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700"
                          />
                          <div>
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Comprobante adjuntado
                            </span>
                            <span className="text-[10px] text-zinc-400 block truncate max-w-[180px]">
                              {voucherFileName || 'comprobante_bancario.jpg'}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setVoucherImage(null);
                            setVoucherFileName('');
                          }}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Eliminar comprobante"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 text-center transition-colors bg-white/50 dark:bg-zinc-900/50">
                        <Upload className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                          Haz clic para subir comprobante
                        </span>
                        <span className="text-[10px] text-zinc-400">PNG, JPG o captura de pantalla</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleVoucherUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Resumen, Cupones y Loyalty */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5">
              <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                <span>Resumen de tu Pedido</span>
                <span className="text-xs font-normal text-zinc-400">{items.length} ítems</span>
              </h2>

              {/* Lista de Ítems */}
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
                    <div className="flex-1 pr-2">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {item.quantity}x {item.name}
                      </span>
                    </div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(item.base_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Input de Cupones de Descuento */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-zinc-800 dark:text-zinc-200">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>¿Tienes un cupón de descuento?</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Ej. SMASH15"
                    className="flex-1 text-xs uppercase font-mono p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs hover:opacity-90 transition-all"
                  >
                    Aplicar
                  </button>
                </div>

                {/* Cupones Sugeridos */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-zinc-400 font-medium">Prueba:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon('SMASH15')}
                    className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md hover:underline"
                  >
                    SMASH15 (-15%)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon('BURGER5')}
                    className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md hover:underline"
                  >
                    BURGER5 (-$5)
                  </button>
                </div>

                {couponError && (
                  <p className="text-[11px] text-red-500 font-medium">{couponError}</p>
                )}
                {appliedCoupon && (
                  <p className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                    ✓ Cupón {appliedCoupon.code} aplicado con éxito
                  </p>
                )}
              </div>

              {/* Loyalty Club Banner */}
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-500" />
                  <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                    Burger Club: Acumulas
                  </span>
                </div>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">
                  +{discountedFinancials.points_earned} Puntos
                </span>
              </div>

              {/* Liquidación Financiera */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal Neto</span>
                  <span className="font-semibold">{formatCurrency(rawSummary.net_subtotal)}</span>
                </div>

                {discountedFinancials.discount_applied > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Descuento Comercial ({appliedCoupon?.code})</span>
                    <span>-{formatCurrency(discountedFinancials.discount_applied)}</span>
                  </div>
                )}

                {/* IVA 15% SRI */}
                <div className="flex justify-between text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl">
                  <div className="flex flex-col">
                    <span className="font-bold">IVA Calculado (15.00%)</span>
                    <span className="text-[10px] text-zinc-400">Sobre subtotal con descuento</span>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(discountedFinancials.tax_total)}
                  </span>
                </div>

                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Costo de Envío</span>
                  <span className="font-semibold">{formatCurrency(discountedFinancials.delivery_fee)}</span>
                </div>

                {tipAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Propina</span>
                    <span>{formatCurrency(tipAmount)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-base font-black text-zinc-900 dark:text-zinc-50">
                  <span>Total a Pagar</span>
                  <span className="text-emerald-600 text-lg">
                    {formatCurrency(finalGrandTotal)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Procesando pedido...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Confirmar y Pagar {formatCurrency(finalGrandTotal)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
