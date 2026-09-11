-- ==============================================================================
-- LIMPIEZA / DESMANTELAMIENTO TOTAL DE DRIVER APP Y LOGÍSTICA
-- ==============================================================================

-- 1. Eliminar tablas de logística (deliveries y drivers)
DROP TABLE IF EXISTS public.deliveries CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;

-- 2. Eliminar tipos enumerados asociados a logística
DROP TYPE IF EXISTS public.delivery_status CASCADE;
DROP TYPE IF EXISTS public.driver_status CASCADE;
DROP TYPE IF EXISTS public.dispatch_type CASCADE;

-- 3. Nota: La columna 'dispatched_at' en 'orders' se mantiene intacta para auditoría de cocina KDS.
