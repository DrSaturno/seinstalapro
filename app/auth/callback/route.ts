// ============================================================
// AUTH CALLBACK - Maneja confirmación de email y reset de password
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { UserRole } from '@/types/database'

const ROLE_DASHBOARD: Record<UserRole, string> = {
  company: '/empresa/dashboard',
  installer: '/instalador/dashboard',
  admin: '/admin/dashboard',
  superadmin: '/admin/dashboard',
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/'

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Verificar si el perfil ya existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        // Crear perfil desde metadata del signup
        const metadata = data.user.user_metadata
        const role = (metadata?.role as UserRole) || 'company'
        const fullName = metadata?.full_name || data.user.email?.split('@')[0] || 'Usuario'
        const countryCode = metadata?.country_code || 'AR'

        const adminClient = createAdminClient()

        // Crear perfil
        await adminClient.from('profiles').insert({
          id: data.user.id,
          role,
          full_name: fullName,
          email: data.user.email!,
          country_code: countryCode,
          status: 'active',
        })

        // Crear registro de empresa o instalador
        if (role === 'company') {
          await adminClient.from('companies').insert({
            profile_id: data.user.id,
            company_name: fullName,
            country: countryCode,
            status: 'pending_review',
          })
        } else if (role === 'installer') {
          await adminClient.from('installers').insert({
            profile_id: data.user.id,
            country: countryCode,
            status: 'draft',
          })
        }

        // Redirigir al dashboard según rol
        return NextResponse.redirect(
          new URL(ROLE_DASHBOARD[role], origin)
        )
      }

      // Si el perfil ya existe, verificar si viene de reset-password
      if (next === '/reset-password') {
        return NextResponse.redirect(new URL('/reset-password', origin))
      }

      // Redirigir al dashboard según rol existente
      const dashboardUrl = ROLE_DASHBOARD[existingProfile.role as UserRole] || '/'
      return NextResponse.redirect(new URL(dashboardUrl, origin))
    }
  }

  // Si algo falla, redirigir a login con error
  return NextResponse.redirect(
    new URL('/login?error=callback_error', origin)
  )
}
