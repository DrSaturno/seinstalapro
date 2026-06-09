// ============================================================
// SUPABASE ADMIN CLIENT (Service Role)
// SOLO para uso en Server Actions y Route Handlers
// NUNCA exponer en el cliente
// ============================================================

import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
