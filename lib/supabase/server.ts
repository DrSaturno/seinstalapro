// ============================================================
// SUPABASE SERVER CLIENT
// Para uso en Server Components, Server Actions, Route Handlers
// ============================================================

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // set() puede fallar en Server Components (read-only)
            // Solo funciona en Server Actions y Route Handlers
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // expires en el pasado para que la cookie se borre de verdad.
            // Next descarta maxAge: 0 (falsy) y sin esto queda una cookie
            // con valor vacío que nunca expira.
            cookieStore.set({
              name,
              value: '',
              ...options,
              expires: new Date(0),
              maxAge: 0,
            })
          } catch (error) {
            // Igual que set()
          }
        },
      },
    }
  )
}
