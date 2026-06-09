'use server'

// ============================================================
// SERVER ACTIONS - Instalador
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/auth/actions'
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

// --- Obtener stats del instalador ---
export async function getInstallerStats(): Promise<{
  activeOffers: number
  acceptedOffers: number
  activeAgreements: number
  completedJobs: number
  avgRating: number
  totalReviews: number
}> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      activeOffers: 0,
      acceptedOffers: 0,
      activeAgreements: 0,
      completedJobs: 0,
      avgRating: 0,
      totalReviews: 0,
    }
  }

  const { data: installer } = await supabase
    .from('installers')
    .select('id, avg_rating, total_reviews')
    .eq('profile_id', user.id)
    .single()

  if (!installer) {
    return {
      activeOffers: 0,
      acceptedOffers: 0,
      activeAgreements: 0,
      completedJobs: 0,
      avgRating: 0,
      totalReviews: 0,
    }
  }

  const [offers, agreements] = await Promise.all([
    supabase
      .from('offers')
      .select('status')
      .eq('installer_id', installer.id),
    supabase
      .from('agreements')
      .select('status')
      .eq('installer_id', installer.id),
  ])

  const offerData = offers.data || []
  const agreementData = agreements.data || []

  return {
    activeOffers: offerData.filter((o) => o.status === 'sent').length,
    acceptedOffers: offerData.filter((o) => o.status === 'accepted').length,
    activeAgreements: agreementData.filter((a) =>
      ['active', 'coordinating', 'confirmed', 'in_progress'].includes(a.status)
    ).length,
    completedJobs: agreementData.filter((a) => a.status === 'completed').length,
    avgRating: installer.avg_rating || 0,
    totalReviews: installer.total_reviews || 0,
  }
}
