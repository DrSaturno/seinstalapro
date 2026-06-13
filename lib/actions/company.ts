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

// --- Obtener estadisticas de la empresa ---
export async function getCompanyStats(): Promise<{
  totalJobs: number
  publishedJobs: number
  pendingOffers: number
  activeAgreements: number
  completedJobs: number
}> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { totalJobs: 0, publishedJobs: 0, pendingOffers: 0, activeAgreements: 0, completedJobs: 0 }

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!company) return { totalJobs: 0, publishedJobs: 0, pendingOffers: 0, activeAgreements: 0, completedJobs: 0 }

  // Obtener jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, status, offers_count')
    .eq('company_id', company.id)

  const allJobs = jobs || []
  const totalJobs = allJobs.length
  const publishedJobs = allJobs.filter(j =>
    ['published', 'receiving_offers', 'offer_accepted', 'in_progress'].includes(j.status)
  ).length
  const completedJobs = allJobs.filter(j =>
    ['approved', 'rated', 'completed_by_installer', 'under_company_review'].includes(j.status)
  ).length

  // Ofertas pendientes (sent) para los jobs de la empresa
  const jobIds = allJobs.map(j => j.id)
  let pendingOffers = 0
  if (jobIds.length > 0) {
    const { count } = await supabase
      .from('offers')
      .select('id', { count: 'exact', head: true })
      .in('job_id', jobIds)
      .eq('status', 'sent')
    pendingOffers = count || 0
  }

  // Acuerdos activos
  const { count: activeAgreements } = await supabase
    .from('agreements')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', company.id)
    .in('status', ['active', 'coordinating', 'confirmed', 'in_progress'])

  return {
    totalJobs,
    publishedJobs,
    pendingOffers,
    activeAgreements: activeAgreements || 0,
    completedJobs,
  }
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
