// ============================================================
// SUPABASE MIDDLEWARE CLIENT
// Para uso en middleware.ts (refresh de sesión)
// ============================================================

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { UserRole } from '@/types/database'

// Rutas completamente públicas (no necesitan chequeo de auth)
const PUBLIC_ROUTES = ['/', '/forgot-password', '/reset-password']

// Rutas de auth (callback, confirm, signout)
// /auth/signout va acá para que el middleware no refresque/reescriba
// cookies en la misma request en la que el handler las está borrando.
const AUTH_CALLBACK_ROUTES = ['/auth/callback', '/auth/confirm', '/auth/signout']

// Aceptación de invitaciones: accesible con o sin sesión (gated por token)
const INVITATION_ROUTE_PREFIX = '/invitaciones'

// Rutas de login (públicas pero redirigen si ya está logueado).
// No hay signup público: las cuentas se crean por superadmin o invitación.
const AUTH_FORM_ROUTES = ['/login']

// Mapeo de roles a rutas base
const ROLE_ROUTES: Record<UserRole, string> = {
  company: '/empresa',
  installer: '/instalador',
  admin: '/admin',
  superadmin: '/admin',
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const pathname = request.nextUrl.pathname

  // Auth callbacks — siempre permitir
  if (AUTH_CALLBACK_ROUTES.some(route => pathname.startsWith(route))) {
    return response
  }

  // Invitaciones — accesibles con o sin sesión (la página valida el token)
  if (pathname.startsWith(INVITATION_ROUTE_PREFIX)) {
    return response
  }

  // Rutas completamente públicas — no necesitan auth check
  if (PUBLIC_ROUTES.includes(pathname)) {
    return response
  }

  // Para todo lo demás (incluyendo /login, /signup, rutas protegidas),
  // verificar autenticación
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options })
            response = NextResponse.next({
              request: { headers: request.headers },
            })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options })
            response = NextResponse.next({
              request: { headers: request.headers },
            })
            // expires en el pasado para borrar la cookie de verdad.
            // Next descarta maxAge: 0 (falsy) y sin esto queda una cookie
            // con valor vacío que "revive".
            response.cookies.set({
              name,
              value: '',
              ...options,
              expires: new Date(0),
              maxAge: 0,
            })
          },
        },
      }
    )

    // Refresh session - IMPORTANTE: siempre llamar getUser() para refresh
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      // No autenticado
      if (AUTH_FORM_ROUTES.includes(pathname)) {
        return response // Permitir acceso a login/signup
      }
      // Redirigir a login para rutas protegidas
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    // Usuario autenticado — obtener perfil para saber el rol
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()

    if (!profile) {
      if (AUTH_FORM_ROUTES.includes(pathname)) {
        return response
      }
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const role = profile.role as UserRole
    const userBaseRoute = ROLE_ROUTES[role]

    // Usuario autenticado en login/signup → redirigir a su dashboard
    if (AUTH_FORM_ROUTES.includes(pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = `${userBaseRoute}/dashboard`
      return NextResponse.redirect(url)
    }

    // Verificar que el usuario accede a rutas de su rol
    const protectedPrefixes = ['/empresa', '/instalador', '/admin']
    const isProtectedRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix))

    if (isProtectedRoute) {
      const hasAccess = pathname.startsWith(userBaseRoute)
      if (!hasAccess) {
        const url = request.nextUrl.clone()
        url.pathname = `${userBaseRoute}/dashboard`
        return NextResponse.redirect(url)
      }
    }

    // Verificar que el perfil no está suspendido
    if (profile.status === 'suspended' || profile.status === 'deleted') {
      if (pathname !== '/cuenta-suspendida') {
        const url = request.nextUrl.clone()
        url.pathname = '/cuenta-suspendida'
        return NextResponse.redirect(url)
      }
    }

    return response
  } catch (error) {
    // Si hay error en auth
    if (AUTH_FORM_ROUTES.includes(pathname)) {
      return response // Permitir acceso a login/signup si falla auth check
    }
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }
}
