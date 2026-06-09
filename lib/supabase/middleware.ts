// ============================================================
// SUPABASE MIDDLEWARE CLIENT
// Para uso en middleware.ts (refresh de sesión)
// ============================================================

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { UserRole } from '@/types/database'

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/forgot-password', '/auth/callback', '/auth/confirm']

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

  // Si es ruta pública, permitir acceso sin verificar auth
  const isPublicRoute = PUBLIC_ROUTES.some(
    route => pathname === route || pathname.startsWith('/auth/')
  )

  if (isPublicRoute) {
    return response
  }

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
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Refresh session - IMPORTANTE: siempre llamar getUser() para refresh
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      // Usuario no autenticado intentando acceder ruta protegida
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    // Usuario autenticado - obtener perfil para saber el rol
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()

    // Si no tiene perfil, redirigir a login
    if (!profile) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const role = profile.role as UserRole
    const userBaseRoute = ROLE_ROUTES[role]

    // Usuario autenticado intentando acceder a login/signup → redirigir a su dashboard
    if (pathname === '/login' || pathname === '/signup') {
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
    // Si hay error en auth, redirigir a login para rutas protegidas
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }
}
