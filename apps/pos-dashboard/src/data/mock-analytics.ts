import type {
  CampaignRecord,
  InfluencerPartner,
  RetentionCohort,
  BranchPerformance,
  BirthdayReminder,
  CancellationReason,
  AttributionSource,
} from '@restaurantes/config';

export type BranchId = 'all' | 'samborondon' | 'urdesa' | 'cumbaya';
export type PeriodId = 'today' | 'week' | 'month';

export interface DashboardAnalyticsData {
  branchId: BranchId;
  branchName: string;
  period: PeriodId;
  kpis: {
    grossSales: number;
    netSales: number;
    discounts: number;
    vat15: number;
    totalOrders: number;
    avgTicket: number;
    netSalesDeltaPct: number;
    ordersDeltaPct: number;
    marketplaceSavings: number;
    directSalesPct: number;
  };
  attraction: {
    totalReach: number;
    impressions: number;
    websiteVisits: number;
    clickThroughRate: number;
    socialGrowthFollowers: number;
    topCampaigns: CampaignRecord[];
    influencers: InfluencerPartner[];
  };
  conversion: {
    funnel: {
      impressions: number;
      websiteVisits: number;
      whatsappLeads: number;
      checkoutsStarted: number;
      paidOrders: number;
      overallConversionRate: number;
      visitToLeadRate: number;
      leadToCheckoutRate: number;
      checkoutToPaidRate: number;
    };
    whatsappBot: {
      totalConversations: number;
      automatedClosedOrders: number;
      automationRatePct: number;
      avgResponseSeconds: number;
      humanHandOffCount: number;
    };
    reservations: {
      totalRequested: number;
      confirmed: number;
      seated: number;
      noShows: number;
      fulfillmentRatePct: number;
    };
    cartAbandonmentRatePct: number;
  };
  customers: {
    newCustomersCount: number;
    recurrentCustomersCount: number;
    newCustomersPct: number;
    recurrentCustomersPct: number;
    avgOrderFrequencyDays: number;
    avgOrdersPerMonth: number;
    upcomingBirthdays: BirthdayReminder[];
    avgTicketBySegment: {
      newClients: number;
      frequentClients: number;
      vipClients: number;
    };
    topPreferences: Array<{
      tag: string;
      count: number;
      percentage: number;
    }>;
  };
  operations: {
    totalDishesCooked: number;
    hourlyThroughput: Array<{
      hour: string;
      amount: number;
      orders: number;
      isPeak: boolean;
      avgWaitMinutes: number;
    }>;
    branchesComparison: BranchPerformance[];
    deliveryLogistics: {
      avgKitchenMinutes: number;
      avgTransitMinutes: number;
      totalDeliveryMinutes: number;
      onTimeRatePct: number;
      activeDriversCount: number;
      deliveryRevenue: number;
      driversCost: number;
      netLogisticsBalance: number;
    };
    cancellations: {
      totalCancelled: number;
      cancellationRatePct: number;
      lostRevenue: number;
      reasons: Array<{
        reason: CancellationReason;
        label: string;
        count: number;
        cost: number;
        mitigation: string;
      }>;
    };
  };
  loyalty: {
    benefitsUsed: {
      couponsRedeemedCount: number;
      discountsTotal: number;
      pointsRedeemedTotal: number;
      revenueGeneratedWithPromos: number;
      roiDiscountMultiplier: number;
    };
    activePromos: Array<{
      code: string;
      description: string;
      timesUsed: number;
      discountAmount: number;
      revenueAttributed: number;
      status: 'active' | 'scheduled' | 'expired';
    }>;
    topVipCustomers: Array<{
      id: string;
      name: string;
      tier: 'vip' | 'gold';
      phone: string;
      totalOrders: number;
      totalSpent: number;
      points: number;
      favoriteDish: string;
      lastVisitDate: string;
    }>;
    retentionCohorts: RetentionCohort[];
    winbackRadar: {
      atRiskCount: number;
      unclaimedPoints: number;
      potentialLossRevenue: number;
    };
  };
  marketingAttribution: {
    sourcesTable: Array<{
      id: string;
      source: AttributionSource;
      sourceLabel: string;
      campaignOrPartner: string;
      investment: number;
      leads: number;
      orders: number;
      revenue: number;
      cac: number;
      roas: number;
      trend: 'up' | 'down' | 'stable';
    }>;
  };
}

// ------------------------------------------------------------------------------
// BANCO DE DATOS ANALÍTICOS (SIMULADOR DE RENDIMIENTO GASTRONÓMICO)
// ------------------------------------------------------------------------------

export const BRANCH_OPTIONS = [
  { id: 'all', name: 'Todas las Sucursales (Consolidado)' },
  { id: 'samborondon', name: 'Matriz Samborondón (Km 2.5)' },
  { id: 'urdesa', name: 'Sucursal Urdesa Central (Guayaquil)' },
  { id: 'cumbaya', name: 'Sucursal Cumbayá (Valle de Quito)' },
] as const;

export const PERIOD_OPTIONS = [
  { id: 'today', label: 'Hoy en Vivo' },
  { id: 'week', label: 'Últimos 7 Días' },
  { id: 'month', label: 'Este Mes' },
] as const;

// Función generadora de datos reactiva según Sucursal y Período
export function getDashboardAnalytics(
  branch: BranchId = 'all',
  period: PeriodId = 'today'
): DashboardAnalyticsData {
  // Factores de escala para simular períodos y sucursales
  const periodMultiplier = period === 'today' ? 1 : period === 'week' ? 6.2 : 24.5;
  const branchMultiplier =
    branch === 'all' ? 1 : branch === 'samborondon' ? 0.48 : branch === 'urdesa' ? 0.32 : 0.20;

  const baseGross = 2185.0 * periodMultiplier * branchMultiplier;
  const baseDiscounts = 124.5 * periodMultiplier * branchMultiplier;
  const baseVat = baseGross * (0.15 / 1.15); // IVA 15% desglose SRI
  const baseNet = baseGross - baseDiscounts - baseVat;
  const baseOrders = Math.round(94 * periodMultiplier * branchMultiplier);
  const baseAvgTicket = baseGross / (baseOrders || 1);

  const directSales = baseGross * 0.73;
  const marketplaceCommissionAvoided = directSales * 0.25;
  const saasCost = 29.0 * (period === 'today' ? 1 : period === 'week' ? 7 : 30);
  const netSavings = marketplaceCommissionAvoided - saasCost;

  return {
    branchId: branch,
    branchName:
      branch === 'all'
        ? 'Todas las Sucursales'
        : branch === 'samborondon'
        ? 'Matriz Samborondón'
        : branch === 'urdesa'
        ? 'Sucursal Urdesa'
        : 'Sucursal Cumbayá',
    period,
    kpis: {
      grossSales: baseGross,
      netSales: baseNet,
      discounts: baseDiscounts,
      vat15: baseVat,
      totalOrders: baseOrders,
      avgTicket: baseAvgTicket,
      netSalesDeltaPct: 14.2,
      ordersDeltaPct: 8.5,
      marketplaceSavings: netSavings,
      directSalesPct: 73.4,
    },
    attraction: {
      totalReach: Math.round(142500 * periodMultiplier * branchMultiplier),
      impressions: Math.round(385000 * periodMultiplier * branchMultiplier),
      websiteVisits: Math.round(4820 * periodMultiplier * branchMultiplier),
      clickThroughRate: 3.42,
      socialGrowthFollowers: Math.round(145 * (period === 'today' ? 1 : period === 'week' ? 6 : 22)),
      topCampaigns: [
        {
          id: 'cmp-01',
          name: 'Viernes Smash & Beer Fest',
          source: 'meta_ads',
          channel_name: 'Instagram / Facebook Ads',
          budget_spent: 120.0 * (period === 'today' ? 1 : period === 'week' ? 5 : 18),
          impressions: Math.round(48000 * (period === 'today' ? 1 : period === 'week' ? 5 : 18)),
          clicks: Math.round(1620 * (period === 'today' ? 1 : period === 'week' ? 5 : 18)),
          leads_generated: Math.round(340 * (period === 'today' ? 1 : period === 'week' ? 5 : 18)),
          orders_attributed: Math.round(92 * (period === 'today' ? 1 : period === 'week' ? 5 : 18)),
          revenue_generated: 1680.0 * (period === 'today' ? 1 : period === 'week' ? 5 : 18),
          roas: 14.0,
          cac: 1.30,
          status: 'active',
          start_date: '2026-09-01',
        },
        {
          id: 'cmp-02',
          name: 'Búsqueda Local "Mejor Hamburguesa"',
          source: 'google_ads',
          channel_name: 'Google Search & Maps',
          budget_spent: 85.0 * (period === 'today' ? 1 : period === 'week' ? 5 : 18),
          impressions: Math.round(18500 * (period === 'today' ? 1 : period === 'week' ? 5 : 18)),
          clicks: Math.round(980 * (period === 'today' ? 1 : period === 'week' ? 5 : 18)),
          leads_generated: Math.round(210 * (period === 'today' ? 1 : period === 'week' ? 5 : 18)),
          orders_attributed: Math.round(58 * (period === 'today' ? 1 : period === 'week' ? 5 : 18)),
          revenue_generated: 1045.0 * (period === 'today' ? 1 : period === 'week' ? 5 : 18),
          roas: 12.3,
          cac: 1.46,
          status: 'active',
          start_date: '2026-09-02',
        },
        {
          id: 'cmp-03',
          name: 'Colaboración TikTok Foodies',
          source: 'influencer',
          channel_name: 'TikTok Creators Reels',
          budget_spent: 60.0 * (period === 'today' ? 1 : period === 'week' ? 4 : 12),
          impressions: Math.round(89000 * (period === 'today' ? 1 : period === 'week' ? 4 : 12)),
          clicks: Math.round(3100 * (period === 'today' ? 1 : period === 'week' ? 4 : 12)),
          leads_generated: Math.round(580 * (period === 'today' ? 1 : period === 'week' ? 4 : 12)),
          orders_attributed: Math.round(145 * (period === 'today' ? 1 : period === 'week' ? 4 : 12)),
          revenue_generated: 2610.0 * (period === 'today' ? 1 : period === 'week' ? 4 : 12),
          roas: 43.5,
          cac: 0.41,
          status: 'active',
          start_date: '2026-09-03',
        },
      ],
      influencers: [
        {
          id: 'inf-1',
          name: 'Diego Narváez',
          handle: '@burger_hunter_ec',
          platform: 'instagram',
          promo_code: 'HUNTER15',
          free_meals_cost: 38.0,
          orders_generated: 46,
          revenue_generated: 915.0,
          roi_percentage: 2307,
          last_post_date: 'Ayer 19:30',
          status: 'active',
        },
        {
          id: 'inf-2',
          name: 'Valeria & Gastón',
          handle: '@foodies_gye',
          platform: 'tiktok',
          promo_code: 'FOODIEGYE',
          free_meals_cost: 45.0,
          orders_generated: 78,
          revenue_generated: 1560.0,
          roi_percentage: 3366,
          last_post_date: 'Hace 3 días',
          status: 'active',
        },
        {
          id: 'inf-3',
          name: 'Sofi Carvajal',
          handle: '@sofi_lifestyle',
          platform: 'instagram',
          promo_code: 'SOFIBURGER',
          free_meals_cost: 25.0,
          orders_generated: 21,
          revenue_generated: 420.0,
          roi_percentage: 1580,
          last_post_date: 'Hace 5 días',
          status: 'pending_collab',
        },
      ],
    },
    conversion: {
      funnel: {
        impressions: Math.round(48200 * periodMultiplier * branchMultiplier),
        websiteVisits: Math.round(4820 * periodMultiplier * branchMultiplier),
        whatsappLeads: Math.round(980 * periodMultiplier * branchMultiplier),
        checkoutsStarted: Math.round(412 * periodMultiplier * branchMultiplier),
        paidOrders: baseOrders,
        overallConversionRate: 3.85,
        visitToLeadRate: 20.3,
        leadToCheckoutRate: 42.0,
        checkoutToPaidRate: 45.1,
      },
      whatsappBot: {
        totalConversations: Math.round(184 * periodMultiplier * branchMultiplier),
        automatedClosedOrders: Math.round(151 * periodMultiplier * branchMultiplier),
        automationRatePct: 82.0,
        avgResponseSeconds: 1.8,
        humanHandOffCount: Math.round(12 * periodMultiplier * branchMultiplier),
      },
      reservations: {
        totalRequested: Math.round(28 * periodMultiplier * branchMultiplier),
        confirmed: Math.round(25 * periodMultiplier * branchMultiplier),
        seated: Math.round(23 * periodMultiplier * branchMultiplier),
        noShows: Math.round(2 * periodMultiplier * branchMultiplier),
        fulfillmentRatePct: 92.0,
      },
      cartAbandonmentRatePct: 21.8,
    },
    customers: {
      newCustomersCount: Math.round(baseOrders * 0.34),
      recurrentCustomersCount: Math.round(baseOrders * 0.66),
      newCustomersPct: 34.0,
      recurrentCustomersPct: 66.0,
      avgOrderFrequencyDays: 11.4,
      avgOrdersPerMonth: 2.7,
      upcomingBirthdays: [
        {
          customer_id: 'c-01',
          customer_name: 'Carlos Álava',
          customer_phone: '0991234567',
          birthday_date: '12 de Septiembre',
          days_until: 4,
          tier: 'vip',
          suggested_gift_coupon: 'CUPON_CUMPLE_VIP_25%',
          already_notified: false,
        },
        {
          customer_id: 'c-02',
          customer_name: 'María Belén Noboa',
          customer_phone: '0998881122',
          birthday_date: '14 de Septiembre',
          days_until: 6,
          tier: 'gold',
          suggested_gift_coupon: 'POSTRE_GRATIS_CUMPLE',
          already_notified: true,
        },
        {
          customer_id: 'c-05',
          customer_name: 'Andrés Morales',
          customer_phone: '0995551234',
          birthday_date: '15 de Septiembre',
          days_until: 7,
          tier: 'gold',
          suggested_gift_coupon: 'COMBO_AMIGOS_20%',
          already_notified: false,
        },
      ],
      avgTicketBySegment: {
        newClients: 16.8,
        frequentClients: 22.4,
        vipClients: 38.5,
      },
      topPreferences: [
        { tag: 'Extra Tocino & Doble Cheddar', count: Math.round(48 * periodMultiplier * branchMultiplier), percentage: 41 },
        { tag: 'Carne Término Medio (Jugosa)', count: Math.round(39 * periodMultiplier * branchMultiplier), percentage: 34 },
        { tag: 'Papas Rústicas Trufadas', count: Math.round(52 * periodMultiplier * branchMultiplier), percentage: 45 },
        { tag: 'Cerveza Artesanal IPA 355ml', count: Math.round(28 * periodMultiplier * branchMultiplier), percentage: 24 },
        { tag: 'Sin Cebolla / Con Salsa Extra', count: Math.round(19 * periodMultiplier * branchMultiplier), percentage: 16 },
      ],
    },
    operations: {
      totalDishesCooked: Math.round(186 * periodMultiplier * branchMultiplier),
      hourlyThroughput: [
        { hour: '11:00', amount: 85, orders: 4, isPeak: false, avgWaitMinutes: 9.5 },
        { hour: '12:00', amount: 240, orders: 12, isPeak: false, avgWaitMinutes: 11.2 },
        { hour: '13:00', amount: 390, orders: 19, isPeak: true, avgWaitMinutes: 15.8 },
        { hour: '14:00', amount: 310, orders: 16, isPeak: false, avgWaitMinutes: 13.5 },
        { hour: '15:00', amount: 110, orders: 6, isPeak: false, avgWaitMinutes: 10.0 },
        { hour: '16:00', amount: 65, orders: 3, isPeak: false, avgWaitMinutes: 8.8 },
        { hour: '17:00', amount: 95, orders: 5, isPeak: false, avgWaitMinutes: 9.4 },
        { hour: '18:00', amount: 180, orders: 9, isPeak: false, avgWaitMinutes: 11.0 },
        { hour: '19:00', amount: 385, orders: 18, isPeak: true, avgWaitMinutes: 14.6 },
        { hour: '20:00', amount: 480, orders: 24, isPeak: true, avgWaitMinutes: 16.2 },
        { hour: '21:00', amount: 320, orders: 15, isPeak: false, avgWaitMinutes: 13.0 },
        { hour: '22:00', amount: 140, orders: 7, isPeak: false, avgWaitMinutes: 10.5 },
      ],
      branchesComparison: [
        {
          branch_id: 'samborondon',
          branch_name: 'Matriz Samborondón',
          gross_sales: 1048.8,
          net_sales: 884.4,
          total_orders: 45,
          avg_ticket: 23.3,
          avg_prep_time_minutes: 13.2,
          avg_delivery_time_minutes: 14.0,
          cancellation_rate: 1.8,
          status: 'open',
        },
        {
          branch_id: 'urdesa',
          branch_name: 'Sucursal Urdesa',
          gross_sales: 699.2,
          net_sales: 589.6,
          total_orders: 31,
          avg_ticket: 22.5,
          avg_prep_time_minutes: 14.5,
          avg_delivery_time_minutes: 15.2,
          cancellation_rate: 2.3,
          status: 'busy',
        },
        {
          branch_id: 'cumbaya',
          branch_name: 'Sucursal Cumbayá',
          gross_sales: 437.0,
          net_sales: 368.5,
          total_orders: 18,
          avg_ticket: 24.2,
          avg_prep_time_minutes: 13.8,
          avg_delivery_time_minutes: 14.8,
          cancellation_rate: 1.5,
          status: 'open',
        },
      ],
      deliveryLogistics: {
        avgKitchenMinutes: 13.8,
        avgTransitMinutes: 14.5,
        totalDeliveryMinutes: 28.3,
        onTimeRatePct: 94.6,
        activeDriversCount: 4,
        deliveryRevenue: 185.0 * periodMultiplier * branchMultiplier,
        driversCost: 168.5 * periodMultiplier * branchMultiplier,
        netLogisticsBalance: 16.5 * periodMultiplier * branchMultiplier,
      },
      cancellations: {
        totalCancelled: Math.round(4 * periodMultiplier * branchMultiplier),
        cancellationRatePct: 2.1,
        lostRevenue: 68.5 * periodMultiplier * branchMultiplier,
        reasons: [
          {
            reason: 'stock_out',
            label: 'Falta de stock de insumo (Pan brioche artesanal)',
            count: 1,
            cost: 18.5,
            mitigation: 'Switch 86 activado inmediatamente',
          },
          {
            reason: 'customer_cancelled',
            label: 'Cliente desistió por cambio de planes',
            count: 2,
            cost: 32.0,
            mitigation: 'Notificación de comanda enviada a WhatsApp',
          },
          {
            reason: 'out_of_range',
            label: 'Dirección fuera de la geocerca de 12 km',
            count: 1,
            cost: 18.0,
            mitigation: 'Ajuste dinámico de geocerca en checkout',
          },
        ],
      },
    },
    loyalty: {
      benefitsUsed: {
        couponsRedeemedCount: Math.round(38 * periodMultiplier * branchMultiplier),
        discountsTotal: baseDiscounts,
        pointsRedeemedTotal: Math.round(420 * periodMultiplier * branchMultiplier),
        revenueGeneratedWithPromos: baseGross * 0.43,
        roiDiscountMultiplier: 7.5,
      },
      activePromos: [
        {
          code: 'SMASH15',
          description: '15% de descuento en pedidos web > $10',
          timesUsed: 24,
          discountAmount: 48.0,
          revenueAttributed: 320.0,
          status: 'active',
        },
        {
          code: 'BURGER5',
          description: '$5 de descuento fijo en compras > $20',
          timesUsed: 11,
          discountAmount: 55.0,
          revenueAttributed: 265.0,
          status: 'active',
        },
        {
          code: 'BIENVENIDA',
          description: '10% de bienvenida para nuevos comensales',
          timesUsed: 18,
          discountAmount: 21.5,
          revenueAttributed: 215.0,
          status: 'active',
        },
      ],
      topVipCustomers: [
        {
          id: 'c-01',
          name: 'Carlos Álava',
          tier: 'vip',
          phone: '0991234567',
          totalOrders: 28,
          totalSpent: 495.2,
          points: 340,
          favoriteDish: 'Bacon Truffle Double Smash',
          lastVisitDate: 'Ayer',
        },
        {
          id: 'c-02',
          name: 'Andrés Morales',
          tier: 'gold',
          phone: '0995551234',
          totalOrders: 14,
          totalSpent: 238.5,
          points: 180,
          favoriteDish: 'Papas Rústicas Trufadas',
          lastVisitDate: 'Hace 2 días',
        },
        {
          id: 'c-03',
          name: 'Sofía Carvajal',
          tier: 'gold',
          phone: '0994443322',
          totalOrders: 11,
          totalSpent: 198.0,
          points: 145,
          favoriteDish: 'Classic Americana Smash',
          lastVisitDate: 'Hace 3 días',
        },
        {
          id: 'c-06',
          name: 'María Belén Noboa',
          tier: 'vip',
          phone: '0998881122',
          totalOrders: 19,
          totalSpent: 385.0,
          points: 290,
          favoriteDish: 'Bacon Truffle Double Smash',
          lastVisitDate: 'Hace 4 días',
        },
      ],
      retentionCohorts: [
        {
          cohort_month: 'Junio 2026',
          total_acquired: 380,
          retained_30d: 168,
          rate_30d: 44.2,
          retained_60d: 118,
          rate_60d: 31.0,
          retained_90d: 91,
          rate_90d: 24.0,
        },
        {
          cohort_month: 'Julio 2026',
          total_acquired: 412,
          retained_30d: 192,
          rate_30d: 46.6,
          retained_60d: 136,
          rate_60d: 33.0,
          retained_90d: 107,
          rate_90d: 26.0,
        },
        {
          cohort_month: 'Agosto 2026',
          total_acquired: 460,
          retained_30d: 225,
          rate_30d: 48.9,
          retained_60d: 161,
          rate_60d: 35.0,
          retained_90d: 0,
          rate_90d: 0.0,
        },
      ],
      winbackRadar: {
        atRiskCount: 34,
        unclaimedPoints: 840,
        potentialLossRevenue: 1420.0,
      },
    },
    marketingAttribution: {
      sourcesTable: [
        {
          id: 'attr-1',
          source: 'qr_table',
          sourceLabel: 'QR Mesas (Salón)',
          campaignOrPartner: 'Acrílicos de Mesa en Local',
          investment: 45.0, // Inversión en impresión acrílicos
          leads: 480,
          orders: 142,
          revenue: 2840.0,
          cac: 0.32,
          roas: 63.1,
          trend: 'up',
        },
        {
          id: 'attr-2',
          source: 'qr_packaging',
          sourceLabel: 'QR Empaque Delivery',
          campaignOrPartner: 'Sticker en Bolsa "Pide Directo"',
          investment: 25.0,
          leads: 310,
          orders: 98,
          revenue: 1960.0,
          cac: 0.25,
          roas: 78.4,
          trend: 'up',
        },
        {
          id: 'attr-3',
          source: 'meta_ads',
          sourceLabel: 'Meta Ads (Instagram)',
          campaignOrPartner: 'Reels Pauta "Smash Fest Viernes"',
          investment: 120.0,
          leads: 340,
          orders: 92,
          revenue: 1680.0,
          cac: 1.30,
          roas: 14.0,
          trend: 'up',
        },
        {
          id: 'attr-4',
          source: 'influencer',
          sourceLabel: 'Influencer Aliado',
          campaignOrPartner: '@burger_hunter_ec (Código HUNTER15)',
          investment: 38.0,
          leads: 190,
          orders: 46,
          revenue: 915.0,
          cac: 0.82,
          roas: 24.1,
          trend: 'stable',
        },
        {
          id: 'attr-5',
          source: 'influencer',
          sourceLabel: 'Creador TikTok',
          campaignOrPartner: '@foodies_gye (Código FOODIEGYE)',
          investment: 45.0,
          leads: 310,
          orders: 78,
          revenue: 1560.0,
          cac: 0.57,
          roas: 34.6,
          trend: 'up',
        },
        {
          id: 'attr-6',
          source: 'google_ads',
          sourceLabel: 'Google Ads (Search & Maps)',
          campaignOrPartner: 'Palabra Clave: "Hamburguesas Artesanales"',
          investment: 85.0,
          leads: 210,
          orders: 58,
          revenue: 1045.0,
          cac: 1.46,
          roas: 12.3,
          trend: 'stable',
        },
        {
          id: 'attr-7',
          source: 'organic',
          sourceLabel: 'Orgánico / Boca a Boca',
          campaignOrPartner: 'Búsqueda Directa y Enlaces Compartidos',
          investment: 0.0,
          leads: 620,
          orders: 184,
          revenue: 3680.0,
          cac: 0.0,
          roas: 99.9,
          trend: 'up',
        },
      ],
    },
  };
}
