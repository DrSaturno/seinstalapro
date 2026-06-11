'use server'

// ============================================================
// SERVER ACTIONS - Empresa
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { companyProfileSchema, type CompanyProfileInput } from '@/lib/validations/company'
import type { ActionResult } from '@/lib/actions/types'
import type { Company } from '@/types/database'

// --- Obtener perfil de empresa ---
export async function getCompanyProfile(): Promise<Company | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  return data as Company | null
}

// --- Actualizar perfil de empresa ---
export async function updateCompanyProfile(
  data: CompanyProfileInput
): Promise<ActionResult> {
  const validation = companyProfileSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  const { error } = await supabase
    .from('companies')
    .update({
      company_name: validation.data.company_name,
      tax_id: validation.data.tax_id || null,
      website: validation.data.website || null,
      description: validation.data.description || null,
      country: validation.data.country,
      city: validation.data.city || null,
      address: validation.data.address || null,
    })
    .eq('profile_id', user.id)

  if (error) {
    console.error('Error actualizando empresa:', error)
    return { success: false, error: 'Error al actualizar el perfil. Intentá de nuevo.' }
  }

  // También actualizar full_name en profiles
  await supabase
    .from('profiles')
    .update({ full_name: validation.data.company_name })
    .eq('id', user.id)

  return { success: true, message: 'Perfil actualizado correctamente.' }
}
