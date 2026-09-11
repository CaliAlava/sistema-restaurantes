# 🍔 FoodTech OS — Plataforma SaaS Gastronómica Todo-en-Uno

> **Sistema Operativo Gastronómico Multi-Tenant Empresarial** inspirado en Justo y Toast POS.  
> Diseñado para restaurantes, cadenas y franquicias que buscan eliminar comisiones de intermediarios (Rappi / PedidosYa), unificar operaciones de salón y cocina en tiempo real y cumplir con la normativa tributaria ecuatoriana (SRI 15% IVA).

---

## 📑 Tabla de Contenidos

1. [Visión General del Sistema](#-visión-general-del-sistema)
2. [Arquitectura del Monorepo](#-arquitectura-del-monorepo)
3. [Aplicaciones y Módulos en Vivo](#-aplicaciones-y-módulos-en-vivo)
4. [Flujos Operativos de Extremo a Extremo](#-flujos-operativos-de-extremo-a-extremo)
5. [Base de Datos & Supabase](#-base-de-datos--supabase)
6. [Normativa Fiscal y Financiera (SRI Ecuador)](#-normativa-fiscal-y-financiera-sri-ecuador)
7. [Guía para Desarrolladores: Cómo Entender y Modificar el Código](#-guía-para-desarrolladores-cómo-entender-y-modificar-el-código)
8. [Comandos de Desarrollo y Verificación](#-comandos-de-desarrollo-y-verificación)
9. [Mapa de Rutas y Puertos](#-mapa-de-rutas-y-puertos)
10. [Historial de Cambios y Versiones](#-historial-de-cambios-y-versiones)

---

## 🌟 Visión General del Sistema

**FoodTech OS** es una solución multi-tenant que unifica todos los puntos de contacto de un restaurante en una sola infraestructura:

- **Canales de Venta Directa (0% comisiones a terceros):** Tienda Web optimizada para móviles y Agente de Inteligencia Artificial en WhatsApp para toma de pedidos conversacional.
- **Operación de Salón y Cocina:** Punto de Venta (POS) con mapa de mesas interactivo, comandera táctil para tablets de meseros, división de cuentas (*Split Bill* por ítem) y Pantalla de Cocina (KDS) con alertas sonoras Web Audio en tiempo real.
- **Fidelización (Loyalty & CRM):** Segmentación RFM (VIP, Frecuentes, Nuevos, En Riesgo), cashback por puntos y Pase Digital de fidelidad instalable en Apple Wallet y Google Wallet.
- **Control Financiero & Fiscal:** Dashboard ejecutivo con desglose de Venta Neta vs. Bruta, cálculo de Ahorro vs. Marketplaces, Arqueo Ciego anti-fraude, Control de Mermas/Cortesías y exportación del Libro de Ventas en formato CSV para el SRI.
- **Resiliencia Offline:** Modo de contingencia sin conexión a internet que almacena comandas en `localStorage` y las auto-sincroniza en segundo plano al recuperar señal.

---

## 🏗 Arquitectura del Monorepo

El proyecto está estructurado como un **Monorepo gobernado por Turborepo y pnpm workspaces**, garantizando máxima reutilización de código, tipos compartidos y compilaciones en paralelo:

```text
sistema-restaurantes/
├── apps/
│   ├── web-storefront/          # Puerto 3000 — E-Commerce Web, Checkout, Wallet y Webhooks
│   └── pos-dashboard/           # Puerto 3001 — Dashboard Ejecutivo, POS, Comandera, KDS, Caja y CRM
│
├── packages/
│   ├── config/                  # Esquemas Zod, Tipos TypeScript, Funciones de Negocio Compartidas
│   ├── database/                # Cliente Supabase, Consultas PostgreSQL y Políticas RLS
│   └── ui/                      # Componentes visuales atómicos, Formateadores ($ USD) y Estilos
│
├── scripts/
│   └── verify-supabase.mjs      # Verificador de tablas e integridad en Supabase Cloud (8 tablas)
│
├── packages/database/supabase/
│   └── migrations/              # Migraciones SQL completas (Esquema, RLS, Mock Data y Permisos)
│
├── package.json                 # Scripts globales del monorepo
├── pnpm-workspace.yaml          # Configuración de workspaces
├── turbo.json                   # Pipeline de compilación y caching de Turborepo
└── tsconfig.base.json           # Configuración base de TypeScript (strict: true)
```

### Tecnologías Principales:
- **Framework Web:** Next.js 15 (App Router) con React 19.
- **Lenguaje:** TypeScript 5.8 (Modo estricto `strict: true` en los 5 paquetes).
- **Estilos:** Tailwind CSS con componentes oscuros de alto rendimiento táctil.
- **Base de Datos & Realtime:** Supabase Cloud (PostgreSQL 15 con Row Level Security).
- **Gestión de Estado:** Zustand para persistencia de carrito (`foodtech-cart-storage`) y estados locales reactivos.
- **Iconografía:** Lucide React.
- **Validación de Datos:** Zod para esquemas de API, pedidos y formularios.

---

## 📱 Aplicaciones y Módulos en Vivo

### 1. `apps/web-storefront` (Puerto 3000)
- **URL Base:** `http://localhost:3000`
- **Catálogo Dinámico por Restaurante:** `http://localhost:3000/burger-craft`
  - Filtro por categorías (Hamburguesas Smash, Acompañamientos, Bebidas).
  - Modificadores anidados (Término de la carne, extras de queso, salsas, combos).
  - Detección visual de platos agotados vía **Switch 86** (`🔴 Agotado`).
- **Checkout Inteligente:** `http://localhost:3000/burger-craft/checkout`
  - Selector de método: Delivery vs. Pick-up (Retiro en local).
  - **Tarificación dinámica por kilómetro/geocerca:** Slider interactivo (0.5 a 15 km) con recálculo automático del costo de envío.
  - Métodos de pago: Tarjeta de crédito/débito, Efectivo y **Transferencia Bancaria / Deuna** con carga de foto de comprobante (*Voucher Upload*) y copiado de cuenta en 1 clic.
  - Cupones promocionales (`SMASH15`, `BURGER5`) con desglose de descuento antes de impuestos.
- **Pase Digital Apple & Google Wallet:** `http://localhost:3000/burger-craft/wallet`
  - Tarjeta VIP dorada con saldo de puntos en vivo, código QR `BC-GOLD-9482` y botones nativos para añadir a billeteras móviles.
- **Tracking de Pedido en Tiempo Real:** `http://localhost:3000/burger-craft/tracking/BC-8492`
  - Estados del pedido (Recibido $\rightarrow$ Cocina $\rightarrow$ En camino $\rightarrow$ Entregado) con mapa y contacto del repartidor.
- **Reservas Web Públicas:** `http://localhost:3000/burger-craft/reservas`
  - Selección de fecha, hora, número de personas y zona (Terraza, Salón, Barra).
- **Webhook de WhatsApp Meta API:** `http://localhost:3000/api/webhooks/whatsapp`
  - Endpoint preparado para recepción y respuesta de mensajes de clientes con WhatsApp Cloud API.

---

### 2. `apps/pos-dashboard` (Puerto 3001)
- **Dashboard Ejecutivo & Finanzas:** `http://localhost:3001`
  - **Desglose Financiero Formal:**
    $$\text{Venta Neta} = \text{Venta Bruta (\$2,185.00)} - \text{Descuentos (\$124.50)} - \text{IVA 15\% (\$218.00)} = \mathbf{\$1,842.50}$$
  - **Tarjeta de Ahorro vs. Marketplaces:** Demuestra la retención del 25% de comisiones por canal directo (+\$307.25 netos hoy para el restaurante).
  - **Liquidación de Pasarelas:** Conciliación de Stripe (3.5%), Payphone Ecuador (3.5%) y Efectivo (0%).
  - **Balance de Delivery Propio:** Cobrado a clientes (\$185.00) vs. costo operativo de despachos.
  - **Matriz 2x2 de Ingeniería de Menú (BCG):**
    - 🌟 **Estrellas:** Bacon Truffle Double Smash (Margen 60%, 48u) $\rightarrow$ Proteger receta.
    - 🐎 **Caballos de Batalla:** Papas Rústicas Trufadas (Margen 28%, 52u) $\rightarrow$ Subir +\$0.50 sutilmente.
    - 🧩 **Puzzles:** Smoked BBQ Bacon Double (Margen 65%, 12u) $\rightarrow$ Impulsar en combos de WhatsApp.
    - 🐕 **Perros:** Malteada Vainilla Clásica (Margen 20%, 3u) $\rightarrow$ Pausar con Switch 86.
  - Gráfica de franjas horarias con detección de horas pico (13:00 y 20:00).
- **Punto de Venta de Salón & Mesas:** `http://localhost:3001/pos`
  - Mapa interactivo de mesas con filtrado por zonas (Salón Principal, Terraza, Barra VIP).
  - Estados en vivo: *Libre (Verde)*, *Ocupada (Azul)*, *Pidiendo Cuenta (Ámbar)*, *Reservada (Rosa)*.
  - **División de Cuenta (Split Bill):**
    - *Modo Equitativo:* Divide el total en partes iguales (2 a 6 comensales).
    - *Modo por Ítem:* Asigna platos específicos a cada comensal (C1, C2, C3) con subtotal, IVA y tickets individuales.
  - Impresión térmica ESC/POS para comandas y tickets de 80mm.
  - **Botón Switch 86:** Modal rápido para pausar y reactivar platillos agotados al instante.
  - **Resiliencia Offline:** Botón de simulación y monitor de conectividad (`🟢 En Línea` / `🟡 Modo Offline`). Guarda comandas en `localStorage` si se corta el internet y las auto-sincroniza con Supabase al reconectar.
- **Comandera Táctil para Tablets:** `http://localhost:3001/pos/comandera`
  - Diseñada exclusivamente para meseros con iPad o tablet Android: selección de mesa en 1 toque, tarjetas de platos gigantes, modificadores y botón flotante de envío a cocina con audio.
- **Pantalla de Cocina KDS (Kitchen Display):** `http://localhost:3001/kds`
  - Kanban de cocina en tiempo real con semáforo por colores según tiempo de preparación:
    - 🟢 < 10 minutos (A tiempo)
    - 🟡 10 - 20 minutos (Atención)
    - 🔴 > 20 minutos (Demora crítica)
  - Botones táctiles para avanzar estado: *Pendiente* $\rightarrow$ *En Preparación* $\rightarrow$ *Listo para Despacho*.
  - Sonido de alerta sintetizado por navegador (*Web Audio API*) al ingresar comanda.
- **Caja, Arqueo Ciego & Reportes SRI:** `http://localhost:3001/caja`
  - Control de turnos de caja (apertura con fondo inicial, ventas en efectivo, tarjeta y transferencias).
  - Registro de movimientos de caja chica (entradas y salidas de efectivo justificadas).
  - **Arqueo Ciego (Auditoría Anti-Fraude):**
    1. El cajero ingresa el conteo físico de gaveta sin ver el monto teórico del sistema.
    2. Al confirmar, el sistema revela el saldo teórico y calcula sobrante o faltante.
    3. Si hay faltante, exige **justificación obligatoria** antes de generar el Corte Z.
  - **Control de Mermas y Cortesías:** Registro formal con motivos obligatorios (*Error de cocina*, *Cortesía de gerencia*, *Plato devuelto*, *Rotura accidental*, *Insumo vencido*) para auditoría de costos sin alterar el IVA SRI.
  - Emisión de comprobantes no fiscales (Corte X) y definitivos (Corte Z).
  - **Exportación de Libro de Ventas SRI en CSV:** Descarga lista para el Formulario 104 con desglose de base 0%, base 15%, IVA 15% y medio de pago.
- **Loyalty & CRM Gastronómico:** `http://localhost:3001/crm`
  - Directorio de clientes con clasificación por niveles (VIP, Frecuentes, Nuevos, En Riesgo).
  - Historial de consumo, saldo de cashback en dólares y emisión de cupones de descuento.
- **Libro de Reservas:** `http://localhost:3001/reservas`
  - Gestión de reservas con fecha, hora, estado de mesa y botón de acción directa "Sentar Comensal".
  - **Recordatorios por WhatsApp (3h antes):** Simulador de mensaje interactivo con botones `[Confirmar Asistencia ✅]` y `[Cancelar Reserva ❌]`.
- **Commander (Simulador de WhatsApp IA):** `http://localhost:3001/commander`
  - Interfaz estilo WhatsApp Web para interactuar en vivo con el bot conversacional de IA.

---

## 🔄 Flujos Operativos de Extremo a Extremo

### Flujo A: Pedido E-Commerce a Domicilio
1. **Cliente:** Ingresa a `http://localhost:3000/burger-craft`, selecciona su hamburguesa favorita, personaliza modificadores (ej. "Término Medio", "Extra Tocino") y va al checkout.
2. **Checkout:** El cliente ajusta el slider de distancia (ej. 3.5 km $\rightarrow$ \$2.50 de envío), sube el comprobante de su transferencia bancaria y presiona *Completar Pedido*.
3. **Cocina (KDS):** En `http://localhost:3001/kds`, suena una campana auditiva y aparece el ticket con el temporizador corriendo.
4. **Cocina & Despacho:** El chef presiona *Marcar Listo* al finalizar la preparación; la orden avanza a estado listo y despachado.
5. **Cliente:** Sigue el estado en tiempo real en la página de tracking `/[slug]/tracking/BC-XXXX` con estimación de llegada.
6. **Caja:** El ingreso de la venta y el valor de delivery quedan registrados automáticamente en `http://localhost:3001/caja`.

### Flujo B: Operación de Salón y Meseros
1. **Mesero:** Con una tablet en mano en `http://localhost:3001/pos/comandera`, selecciona la Mesa #04, toca 2 hamburguesas smash y papas trufadas, y presiona *Enviar a Cocina (<300ms)*.
2. **Salón (POS):** En `http://localhost:3001/pos`, la Mesa #04 cambia automáticamente de color verde a azul (*Ocupada*).
3. **Cierre de Cuenta:** Los clientes piden la cuenta separada. El cajero abre el modal de cobro, selecciona *División por Ítem Individual*, asigna qué plato consumió cada persona e imprime tickets térmicos independientes para cada comensal.
4. **Liberación:** Al completar el pago, la mesa vuelve a estar disponible (verde).
5. **Contingencia sin Internet:** Si el router de salón se desconecta, el cajero puede activar el *Modo Offline*; la comanda se guarda de forma segura en el almacenamiento local y se sincroniza con la nube en cuanto regresa el WiFi.

---

## 🗄 Base de Datos & Supabase

El sistema utiliza **Supabase Cloud** con PostgreSQL 15, esquema relacional optimizado con claves foráneas UUID y políticas RLS (*Row Level Security*).

### Tablas Principales (8 tablas activas):
1. **`tenants`:** Restaurantes registrados (Nombre, slug, RUC, dirección, teléfono, configuración de IVA).
2. **`categories`:** Categorías del menú ordenadas por posición (`sort_order`).
3. **`products`:** Platillos con precio, costo de materia prima, imagen, disponibilidad (`is_available`) y modificadores anidados JSONB.
4. **`tables`:** Mesas del restaurante con número, capacidad, área asociada y estado operativo actual (`status`).
5. **`orders`:** Pedidos del sistema (Canal de origen, desglose tributario SRI, método de pago, comprobante de transferencia y estado de despacho).
6. **`customers`:** Directorio de comensales fidelizados con nivel (Tier), cashback acumulado y código de pase Wallet.
7. **`reservations`:** Reservas de mesas con fecha, hora, personas, comensal y estado de confirmación.
8. **`cash_shifts`:** Turnos de caja para control de arqueo, movimientos de efectivo y declaración tributaria.

### Verificación de la Base de Datos:
Para comprobar que las 8 tablas estén activas y enlazadas a tu proyecto de Supabase, ejecuta:
```bash
node scripts/verify-supabase.mjs
```

---

## ⚖️ Normativa Fiscal y Financiera (SRI Ecuador)

El sistema está configurado según las exigencias del **Servicio de Rentas Internas (SRI) del Ecuador**:

- **Tasa de IVA Vigente:** 15.00% (*Impuesto al Valor Agregado*).
- **Desglose Obligatorio en Recibos y CSV:**
  - Subtotal Tarifa 0% (Alimentos no procesados, insumos exentos).
  - Subtotal Tarifa 15% (Platos elaborados en restaurante).
  - Monto IVA 15%.
  - Propina voluntaria (10% de servicio).
  - Valor Total Pagado.
- **Tipos de Identificación SRI:**
  - `04`: RUC (13 dígitos, Sociedades y Personas Naturales con negocio).
  - `05`: Cédula de Identidad (10 dígitos).
  - `07`: Consumidor Final (para compras sin datos fiscales).
- **Tratamiento de Mermas:** Las bajas de inventario por platos devueltos o errores de cocina no generan hecho generador de IVA; se deducen como costo de ventas contable.
- **Exportación:** Desde `/caja`, el botón *Descargar CSV para Contador / SRI* genera el archivo tabulado con punto y coma (`;`) listo para importar en el software contable o declarar en el Formulario 104.

---

## 🛠 Guía para Desarrolladores: Cómo Entender y Modificar el Código

### 1. ¿Dónde modificar los datos del restaurante o agregar productos?
- **Base de Datos:** Edita directamente en Supabase Cloud o modifica las migraciones en `packages/database/supabase/migrations/`.
- **Datos de Prueba Iniciales (Mocks):**
  - Mesas y Áreas: `apps/pos-dashboard/src/data/mock-tables.ts`
  - Menú y Productos de prueba: `apps/web-storefront/src/data/mock-catalog.ts`
  - Pedidos activos de cocina: `apps/pos-dashboard/src/data/mock-orders.ts`

### 2. ¿Dónde modificar la tasa de IVA o las reglas de cálculo de precios?
- Abre `packages/config/src/schemas/checkout.ts`.
- La función `calculateOrderSummary()` desglosa el subtotal, descuento, base imponible gravada y el 15% de IVA.
- En `packages/config/src/schemas/loyalty.ts`, la función `applyCouponDiscount()` aplica cupones comerciales y recalcula el IVA 15% sobre la base neta descontada.

### 3. ¿Dónde agregar un nuevo campo o tipo de datos en todo el sistema?
- Los modelos de datos se encuentran en `packages/config/src/schemas/`:
  - `catalog.ts`: Categorías, productos y modificadores.
  - `orders.ts`: Estados de pedido y detalles de comanda.
  - `financial.ts`: Arqueos de caja, mermas y matriz BCG.
  - `loyalty.ts`: Puntos y pases Wallet.
  - `reservations.ts`: Reservas de mesas.
  - `marketing.ts`: Atribución de marketing, motivos de cancelación operativa y campañas.
- Si agregas un nuevo campo, añádelo en su esquema correspondiente y ejecuta `pnpm run type-check` para que TypeScript valide que no rompiste ningún módulo.

### 4. ¿Cómo personalizar el diseño y los colores?
- Cada app cuenta con su archivo `src/app/globals.css` y `tailwind.config.ts`.
- La paleta principal utiliza la gama moderna de `zinc-950` (fondo oscuro profundo) con acentos en `amber-500` (alimentos y KDS), `emerald-500` (ventas, finanzas y éxito) y `blue-600` (POS y comandera).

### 5. ¿Cómo conectar las credenciales reales de WhatsApp Meta?
- En `.env.local`, reemplaza las variables:
  ```env
  WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
  WHATSAPP_ACCESS_TOKEN=tu_access_token_de_desarrollador
  WHATSAPP_WEBHOOK_VERIFY_TOKEN=tu_token_de_verificacion_webhook
  ```
- El webhook receptor procesará automáticamente las intenciones en `apps/web-storefront/src/app/api/webhooks/whatsapp/route.ts`.

---

## 💻 Comandos de Desarrollo y Verificación

Todos los comandos se ejecutan desde la raíz del proyecto (`/Users/carlosalava/Desktop/sistema-restaurantes`):

```bash
# 1. Instalar todas las dependencias del monorepo
pnpm install

# 2. Iniciar los servidores de desarrollo en simultáneo (Puertos 3000 y 3001)
pnpm dev

# 3. Validar tipado estricto en los 5 paquetes (0 errores garantizados)
pnpm run type-check

# 4. Compilar todos los paquetes para producción
pnpm run build

# 5. Ejecutar verificación de conexión con Supabase Cloud (8 tablas activas)
node scripts/verify-supabase.mjs
```

---

## 🗺 Mapa de Rutas y Puertos

| Módulo / Función | Aplicación | Puerto y Enlace Directo |
| :--- | :--- | :--- |
| **Tienda Digital (Menú Público)** | `web-storefront` | [http://localhost:3000/burger-craft](http://localhost:3000/burger-craft) |
| **Checkout & Pagos con Delivery por km** | `web-storefront` | [http://localhost:3000/burger-craft/checkout](http://localhost:3000/burger-craft/checkout) |
| **Pase Digital Apple & Google Wallet VIP** | `web-storefront` | [http://localhost:3000/burger-craft/wallet](http://localhost:3000/burger-craft/wallet) |
| **Tracking de Pedido en Vivo** | `web-storefront` | [http://localhost:3000/burger-craft/tracking/BC-8492](http://localhost:3000/burger-craft/tracking/BC-8492) |
| **Reservas Online Públicas** | `web-storefront` | [http://localhost:3000/burger-craft/reservas](http://localhost:3000/burger-craft/reservas) |
| **Webhook WhatsApp Cloud API** | `web-storefront` | [http://localhost:3000/api/webhooks/whatsapp](http://localhost:3000/api/webhooks/whatsapp) |
| **Dashboard Ejecutivo & Matriz BCG** | `pos-dashboard` | [http://localhost:3001](http://localhost:3001) |
| **POS Salón & Mesas (con Modo Offline)** | `pos-dashboard` | [http://localhost:3001/pos](http://localhost:3001/pos) |
| **Comandera Táctil para Tablets de Meseros** | `pos-dashboard` | [http://localhost:3001/pos/comandera](http://localhost:3001/pos/comandera) |
| **Cocina KDS con Semáforo y Sonido** | `pos-dashboard` | [http://localhost:3001/kds](http://localhost:3001/kds) |
| **Caja, Arqueo Ciego, Mermas y SRI** | `pos-dashboard` | [http://localhost:3001/caja](http://localhost:3001/caja) |
| **Loyalty, CRM & Clientes Frecuentes** | `pos-dashboard` | [http://localhost:3001/crm](http://localhost:3001/crm) |
| **Hostess: Libro de Reservas & WhatsApp** | `pos-dashboard` | [http://localhost:3001/reservas](http://localhost:3001/reservas) |
| **Simulador de WhatsApp IA (Commander)** | `pos-dashboard` | [http://localhost:3001/commander](http://localhost:3001/commander) |

---

## 📜 Historial de Cambios y Versiones

### [2026-09-08] — Desmantelamiento Total de `driver-app`
- **Eliminación de Aplicativo:** Se borró por completo el directorio `apps/driver-app/` y se cerró el puerto `3002`.
- **Limpieza de Esquemas:** Eliminado `packages/config/src/schemas/logistics.ts` y su export en `packages/config/src/index.ts`.
- **Roles:** Removido el rol `'driver'` de `UserRoleSchema` en `@restaurantes/config` y `database.ts`.
- **Base de Datos:** Creada migración SQL `20260908000001_drop_logistics_driver.sql` para remover tablas `deliveries`, `drivers` y sus tipos enumerados en Supabase. Actualizado `full_schema_setup.sql` y `scripts/verify-supabase.mjs` (8 tablas activas).
- **Entorno:** Removida variable `NEXT_PUBLIC_DRIVER_URL` de `.env.example`.
- **Certificación:** `pnpm run type-check` superado exitosamente con 0 errores en los 5 paquetes activos.

---

> **© 2026 FoodTech OS.** Diseñado y desarrollado con arquitectura de software empresarial, alta resiliencia y conformidad fiscal completa.
