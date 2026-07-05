'use server'

// ============================================================
// SERVER ACTIONS - Instalador
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/actions/types'
import { installerProfileSchema } from '@/lib/validations/installer'
import type { Installer, Profile, Category } from '@/types/database'

// --- Obtener perfil del instalador ---
export async function getInstallerProfile(): Promise<
  (Installer & { profile?: Profile }) | null
> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('installers')
    .select('*, profile:profiles(*)')
    .eq('profile_id', user.id)
    .single()

  return data as (Installer & { profile?: Profile }) | null
}

// --- Actualizar perfil del instalador ---
export async function updateInstallerProfile(
  formData: Record<string, unknown>
): Promise<ActionResult> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autenticado' }

  const validation = installerProfileSchema.safeParse(formData)
  if (!validation.success) {
    const firstError = validation.error.errors[0]?.message || 'Datos inválidos'
    return { success: false, error: firstError }
  }

  const { bio, years_of_experience, portfolio_url, phone, country, city, coverage_zones } =
    validation.data

  // Actualizar installer
  const { error: installerError } = await supabase
    .from('installers')
    .update({
      bio,
      years_of_experience,
      portfolio_url: portfolio_url || null,
      country,
      coverage_zones: coverage_zones || [],
    })
    .eq('profile_id', user.id)

  if (installerError) {
    return { success: false, error: 'Error al actualizar el perfil' }
  }

  // Actualizar phone en profile si se proporcionó
  if (phone !== undefined) {
    await supabase
      .from('profiles')
      .update({ phone })
      .eq('id', user.id)
  }

  revalidatePath('/instalador/perfil')
  return { success: true, message: 'Perfil actualizado correctamente' }
}

// --- Obtener skills del instalador ---
export async function getInstallerSkills(): Promise<
  Array<{ id: string; skill_name: string; proficiency_level?: string }>
> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  // Primero obtener el installer_id
  const { data: installer } = await supabase
    .from('installers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!installer) return []

  const { data } = await supabase
    .from('installer_skills')
    .select('id, skill_name, proficiency_level')
    .eq('installer_id', installer.id)
    .order('created_at', { ascending: true })

  return data || []
}

// --- Agregar skill ---
export async function addInstallerSkill(
  skillName: string,
  proficiencyLevel?: string
): Promise<ActionResult> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autenticado' }

  const { data: installer } = await supabase
    .from('installers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!installer) return { success: false, error: 'Perfil de instalador no encontrado' }

  const { error } = await supabase.from('installer_skills').insert({
    installer_id: installer.id,
    skill_name: skillName,
    proficiency_level: proficiencyLevel || 'intermediate',
  })

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Ya tenés esta habilidad registrada' }
    }
    return { success: false, error: 'Error al agregar habilidad' }
  }

  revalidatePath('/instalador/perfil')
  return { success: true, message: 'Habilidad agregada' }
}

// --- Eliminar skill ---
export async function removeInstallerSkill(skillId: string): Promise<ActionResult> {
  const supabase = createClient()

  const { error } = await supabase
    .from('installer_skills')
    .delete()
    .eq('id', skillId)

  if (error) {
    return { success: false, error: 'Error al eliminar habilidad' }
  }

  revalidatePath('/instalador/perfil')
  return { success: true, message: 'Habilidad eliminada' }
}

// --- Obtener reseñas recibidas por el instalador ---
export async function getInstallerReviews(): Promise<
  Array<{
    id: string
    rating: number
    comment?: string
    created_at: string
    job: { title: string; category?: { name: string } } | null
    reviewer: { full_name: string; avatar_url?: string } | null
    company: { company_name: string } | null
  }>
> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('reviews')
    .select(`
      id, rating, comment, created_at,
      job:jobs(title, category:categories(name)),
      reviewer:profiles!reviewer_id(full_name, avatar_url),
      company:jobs(company:companies(company_name))
    `)
    .eq('reviewed_id', user.id)
    .order('created_at', { ascending: false })

  return (data || []) as any
}

// --- Obtener stats del instalador ---
export async function getInstallerStats(): Promise<{
  teamsCount: number
  activeAgreements: number
  completedJobs: number
  avgRating: number
  totalReviews: number
}> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const empty = {
    teamsCount: 0,
    activeAgreements: 0,
    completedJobs: 0,
    avgRating: 0,
    totalReviews: 0,
  }
  if (!user) return empty

  const { data: installer } = await supabase
    .from('installers')
    .select('id, avg_rating, total_reviews')
    .eq('profile_id', user.id)
    .single()

  if (!installer) return empty

  const [memberships, agreements] = await Promise.all([
    supabase
      .from('team_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('installer_id', installer.id)
      .eq('status', 'active'),
    supabase
      .from('agreements')
      .select('status')
      .eq('installer_id', installer.id),
  ])

  const agreementData = agreements.data || []

  return {
    teamsCount: memberships.count || 0,
    activeAgreements: agreementData.filter((a) =>
      ['active', 'coordinating', 'confirmed', 'in_progress'].includes(a.status)
    ).length,
    completedJobs: agreementData.filter((a) => a.status === 'completed').length,
    avgRating: installer.avg_rating || 0,
    totalReviews: installer.total_reviews || 0,
  }
}

// --- Equipos del instalador (a qué empresas pertenece) ---
export async function getMyTeams(): Promise<
  Array<{ companyName: string; companyId: string; joinedAt: string }>
> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data: installer } = await supabase
    .from('installers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!installer) return []

  const { data } = await supabase
    .from('team_memberships')
    .select('company_id, joined_at, created_at, company:companies(company_name)')
    .eq('installer_id', installer.id)
    .eq('status', 'active')
    .order('joined_at', { ascending: false })

  return (data || []).map((row: any) => ({
    companyId: row.company_id,
    companyName: row.company?.company_name || 'Empresa',
    joinedAt: row.joined_at || row.created_at,
  }))
}
