// ============================================================
// SIGNOUT ROUTE HANDLER
// Logout server-side: borra la sesión y las cookies de auth en
// la respuesta HTTP, sin depender del estado del cliente JS.
// ============================================================

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function signOut(request: NextRequest) {
  // Best-effort: revocar la sesión actual en Supabase.
  // Si el token ya expiró o fue rotado, esto puede fallar — no importa,
  // el borrado de cookies de abajo es lo que garantiza el logout.
  try {
    const supabase = createClient()
    await supabase.auth.signOut({ scope: 'local' })
  } catch {
    // Ignorado a propósito: el logout no debe depender de esta llamada.
  }

  const response = NextResponse.redirect(new URL('/login', request.url), {
    status: 303,
  })

  // Garantía definitiva: expirar TODAS las cookies de auth de Supabase
  // (incluye variantes fragmentadas sb-xxx-auth-token.0, .1, etc.)
  // OJO: usar expires (no solo maxAge: 0) — Next descarta maxAge: 0 por
  // ser falsy y la cookie quedaría vacía pero viva.
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith('sb-')) {
      response.cookies.set(cookie.name, '', {
        path: '/',
        expires: new Date(0),
        maxAge: 0,
      })
    }
  }

  return response
}

export async function POST(request: NextRequest) {
  return signOut(request)
}

// GET permite desloguearse navegando directo a /auth/signout
// (y es lo que usan los botones de "Cerrar sesión")
export async function GET(request: NextRequest) {
  return signOut(request)
}
