'use server'

// ============================================================
// SERVER ACTIONS - Autenticación
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type SignupInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from '@/lib/validations/auth'
import type { UserRole } from '@/types/database'

// Tipo para respuestas de actions
export type ActionResult = {
  success: boolean
  error?: string
  message?: string
}

// Mapeo de roles a rutas de dashboard
const ROLE_DASHBOARD: Record<UserRole, string> = {
  company: '/empresa/dashboard',
  installer: '/instalador/dashboard',
  admin: '/admin/dashboard',
  superadmin: '/admin/dashboard',
}

// --- LOGIN ---
export async function login(data: LoginInput): Promise<ActionResult> {
  const validation = loginSchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    }
  }

  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  })

  if (error) {
    // Mapear errores de Supabase a mensajes en español
    if (error.message === 'Invalid login credentials') {
      return { success: false, error: 'Email o contraseña incorrectos' }
    }
    if (error.message === 'Email not confirmed') {
      return { success: false, error: 'Confirmá tu email antes de iniciar sesión. Revisá tu casilla de correo.' }
    }
    return { success: false, error: 'Error al iniciar sesión. Intentá de nuevo.' }
  }

  // Obtener el perfil para saber el rol y redirigir
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Error al obtener datos del usuario' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { success: false, error: 'No se encontró tu perfil. Contactá a soporte.' }
  }

  if (profile.status === 'suspended') {
    await supabase.auth.signOut()
    return { success: false, error: 'Tu cuenta está suspendida. Contactá a soporte.' }
  }

  const dashboardUrl = ROLE_DASHBOARD[profile.role as UserRole]
  redirect(dashboardUrl)
}

// --- SIGNUP ---
export async function signup(data: SignupInput): Promise<ActionResult> {
  const validation = signupSchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    }
  }

  const { full_name, email, password, role, country_code } = validation.data
  const supabase = createClient()

  // Registrar en Supabase Auth con metadata
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        role,
        country_code,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? '' : ''}${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      return { success: false, error: 'Este email ya está registrado. Intentá iniciar sesión.' }
    }
    return { success: false, error: 'Error al crear la cuenta. Intentá de nuevo.' }
  }

  if (!authData.user) {
    return { success: false, error: 'Error al crear la cuenta.' }
  }

  // Crear perfil usando admin client (bypasa RLS)
  const adminClient = createAdminClient()

  const { error: profileError } = await adminClient
    .from('profiles')
    .insert({
      id: authData.user.id,
      role,
      full_name,
      email,
      country_code,
      status: 'active',
    })

  if (profileError) {
    console.error('Error creando perfil:', profileError)
    // No fallar el signup por esto, el callback lo intentará de nuevo
  }

  // Crear registro de empresa o instalador según el rol
  if (role === 'company') {
    const { error: companyError } = await adminClient
      .from('companies')
      .insert({
        profile_id: authData.user.id,
        company_name: full_name, // Temporal, se actualiza después
        country: country_code,
        status: 'pending_review',
      })

    if (companyError) {
      console.error('Error creando empresa:', companyError)
    }
  } else if (role === 'installer') {
    const { error: installerError } = await adminClient
      .from('installers')
      .insert({
        profile_id: authData.user.id,
        country: country_code,
        status: 'draft',
      })

    if (installerError) {
      console.error('Error creando instalador:', installerError)
    }
  }

  return {
    success: true,
    message: 'Cuenta creada. Revisá tu email para confirmar tu cuenta.',
  }
}

// --- LOGOUT ---
export async function logout(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// --- FORGOT PASSWORD ---
export async function forgotPassword(
  data: ForgotPasswordInput
): Promise<ActionResult> {
  const validation = forgotPasswordSchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    }
  }

  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(
    validation.data.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?next=/reset-password`,
    }
  )

  if (error) {
    return { success: false, error: 'Error al enviar el email. Intentá de nuevo.' }
  }

  return {
    success: true,
    message: 'Te enviamos un email con las instrucciones para restablecer tu contraseña.',
  }
}

// --- RESET PASSWORD ---
export async function resetPassword(
  data: ResetPasswordInput
): Promise<ActionResult> {
  const validation = resetPasswordSchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    }
  }

  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    password: validation.data.password,
  })

  if (error) {
    return { success: false, error: 'Error al actualizar la contraseña. Intentá de nuevo.' }
  }

  return {
    success: true,
    message: 'Contraseña actualizada correctamente.',
  }
}
