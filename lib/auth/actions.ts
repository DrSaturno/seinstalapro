'use server'

// ============================================================
// SERVER ACTIONS - Autenticación
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from '@/lib/validations/auth'
import type { UserRole } from '@/types/database'
import type { ActionResult } from '@/lib/actions/types'

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

// NOTA: el signup público fue eliminado en el pivot a SaaS B2B.
// Las cuentas de empresa las crea el superadmin (lib/actions/superadmin.ts)
// y los instaladores solo entran aceptando una invitación (lib/actions/team.ts).

// --- LOGOUT ---
// Nota: los botones de "Cerrar sesión" navegan a /auth/signout (route handler),
// que es el camino canónico. Esta action queda con las mismas garantías.
export async function logout(): Promise<void> {
  const supabase = createClient()
  try {
    await supabase.auth.signOut({ scope: 'local' })
  } catch {
    // El logout no debe depender de esta llamada (token expirado/rotado)
  }
  // Garantía: expirar toda cookie de auth de Supabase aunque signOut falle.
  // expires en el pasado — Next descarta maxAge: 0 por ser falsy.
  const cookieStore = cookies()
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.startsWith('sb-')) {
      cookieStore.set({
        name: cookie.name,
        value: '',
        path: '/',
        expires: new Date(0),
        maxAge: 0,
      })
    }
  }
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

// --- CHANGE PASSWORD (from settings, requires current password) ---
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'La nueva contraseña debe tener al menos 8 caracteres' }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return { success: false, error: 'No autenticado' }
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    return { success: false, error: 'La contraseña actual es incorrecta' }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { success: false, error: 'Error al actualizar la contraseña' }
  }

  return { success: true, message: 'Contraseña actualizada correctamente' }
}
