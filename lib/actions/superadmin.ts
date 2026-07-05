'use server'

// ============================================================
// SERVER ACTIONS - Superadmin (creación de cuentas de empresa)
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import {
  createCompanySchema,
  type CreateCompanyInput,
} from '@/lib/validations/auth'
import { createNotification } from '@/lib/actions/notifications'
import type { ActionResult } from '@/lib/actions/types'

async function requireSuperadmin(): Promise<{ userId: string } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin' || profile?.status !== 'active') {
    return { error: 'Solo el superadministrador puede realizar esta acción' }
  }

  return { userId: user.id }
}

// --- Crear cuenta de empresa cliente ---
// Reemplaza al signup público: el superadmin da de alta a la empresa
// después de cerrar la venta fuera de la plataforma.
export async function createCompanyAccount(
  data: CreateCompanyInput
): Promise<ActionResult> {
  const auth = await requireSuperadmin()
  if ('error' in auth) return { success: false, error: auth.error }

  const validation = createCompanySchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  const { company_name, full_name, email, password, country_code } = validation.data

  const adminClient = createAdminClient()

  // Verificar que el email no esté ya en uso
  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingProfile) {
    return { success: false, error: 'Ya existe una cuenta con ese email' }
  }

  // Crear usuario en Auth (confirmado, sin email de verificación)
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role: 'company', country_code },
  })

  if (authError || !authData.user) {
    if (authError?.message.includes('already been registered')) {
      return { success: false, error: 'Ya existe una cuenta con ese email' }
    }
    return { success: false, error: `Error al crear el usuario: ${authError?.message}` }
  }

  // Crear perfil
  const { error: profileError } = await adminClient.from('profiles').insert({
    id: authData.user.id,
    role: 'company',
    full_name,
    email,
    country_code,
    status: 'active',
  })

  if (profileError) {
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return { success: false, error: 'Error al crear el perfil. Intentá de nuevo.' }
  }

  // Crear empresa (verificada de entrada: la creó el superadmin)
  const { error: companyError } = await adminClient.from('companies').insert({
    profile_id: authData.user.id,
    company_name,
    country: country_code,
    status: 'verified',
    verified_at: new Date().toISOString(),
    created_by_superadmin_id: auth.userId,
  })

  if (companyError) {
    await adminClient.from('profiles').delete().eq('id', authData.user.id)
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return { success: false, error: 'Error al crear la empresa. Intentá de nuevo.' }
  }

  await createNotification({
    userId: authData.user.id,
    type: 'system',
    title: 'Bienvenido a Se Instala Pro',
    message: 'Tu cuenta de empresa fue creada. Ya podés invitar instaladores a tu equipo y crear trabajos.',
  })

  revalidatePath('/admin/empresas')

  return {
    success: true,
    message: `Empresa "${company_name}" creada. El cliente ya puede ingresar con ${email}.`,
  }
}
