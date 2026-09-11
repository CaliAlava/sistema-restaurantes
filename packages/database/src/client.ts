import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Cliente anónimo / público para uso en navegador y componentes de cliente
 */
export function createBrowserClient(
  supabaseUrl: string,
  supabaseAnonKey: string
): TypedSupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan variables de entorno para inicializar el cliente Supabase (URL o Anon Key)');
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/**
 * Cliente con privilegios de administrador (Service Role)
 * EXCLUSIVO para Server Actions, Webhooks de pagos, Workers o migraciones.
 * NUNCA exponer al cliente / navegador.
 */
export function createAdminClient(
  supabaseUrl: string,
  serviceRoleKey: string
): TypedSupabaseClient {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Faltan variables de entorno requeridas para Supabase Admin Client (Service Role)');
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
