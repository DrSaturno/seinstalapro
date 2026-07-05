'use server'

// ============================================================
// SERVER ACTIONS - Asignación de trabajos
// Reemplaza al flujo de ofertas/bidding del marketplace:
// la empresa asigna directo a un instalador de su equipo, o
// publica el trabajo para que cualquiera del equipo lo tome.
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'
import type { ActionResult, AssignableInstaller } from '@/lib/actions/types'

// --- Instaladores asignables (equipo activo de la empresa) ---
export async function getAssignableInstallers(): Promise<AssignableInstaller[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!company) return []

  const { data } = await supabase
    .from('team_memberships')
    .select('installer:installers(*, profile:profiles(full_name, email, avatar_url))')
    .eq('company_id', company.id)
    .eq('status', 'active')

  return (data || [])
    .map((row: any) => row.installer)
    .filter(Boolean) as AssignableInstaller[]
}

// --- Asignar trabajo directo a un instalador del equipo ---
export async function createAssignment(
  jobId: string,
  installerId: string,
  notes?: string
): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: company } = await supabase
    .from('companies')
    .select('id, company_name')
    .eq('profile_id', user.id)
    .single()

  if (!company) return { success: false, error: 'No se encontró tu empresa' }

  // Validar el trabajo
  const { data: job } = await supabase
    .from('jobs')
    .select('id, title, status, company_id')
    .eq('id', jobId)
    .single()

  if (!job || job.company_id !== company.id) {
    return { success: false, error: 'Trabajo no encontrado' }
  }

  const ASSIGNABLE_STATUSES = ['draft', 'pending_admin_approval', 'published']
  if (!ASSIGNABLE_STATUSES.includes(job.status)) {
    return { success: false, error: 'Este trabajo ya no se puede asignar' }
  }

  // Validar que el instalador es miembro activo del equipo
  const { data: membership } = await supabase
    .from('team_memberships')
    .select('id, installer:installers(id, profile_id, profile:profiles(full_name))')
    .eq('company_id', company.id)
    .eq('installer_id', installerId)
    .eq('status', 'active')
    .maybeSingle()

  if (!membership) {
    return { success: false, error: 'Ese instalador no forma parte de tu equipo' }
  }

  // Crear acuerdo directamente (sin oferta)
  const { data: agreement, error: agreementError } = await supabase
    .from('agreements')
    .insert({
      job_id: jobId,
      company_id: company.id,
      installer_id: installerId,
      status: 'active',
      notes: notes || null,
    })
    .select('id')
    .single()

  if (agreementError || !agreement) {
    return { success: false, error: 'Error al crear la asignación. Intentá de nuevo.' }
  }

  // Actualizar el trabajo
  await supabase
    .from('jobs')
    .update({ status: 'assigned', claimed_by_installer_id: installerId })
    .eq('id', jobId)

  // Notificar al instalador
  const installerProfileId = (membership as any).installer?.profile_id
  if (installerProfileId) {
    await createNotification({
      userId: installerProfileId,
      type: 'job_assigned',
      title: 'Te asignaron un trabajo',
      message: `${company.company_name} te asignó "${job.title}".`,
      relatedEntityType: 'agreement',
      relatedEntityId: agreement.id,
    })
  }

  revalidatePath(`/empresa/trabajos/${jobId}`)
  revalidatePath('/empresa/trabajos')
  revalidatePath('/instalador/mis-trabajos')

  return { success: true, message: 'Trabajo asignado correctamente' }
}

// --- Publicar trabajo para que el equipo lo tome ---
export async function publishJobToTeam(jobId: string): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: company } = await supabase
    .from('companies')
    .select('id, company_name')
    .eq('profile_id', user.id)
    .single()

  if (!company) return { success: false, error: 'No se encontró tu empresa' }

  const { data: job } = await supabase
    .from('jobs')
    .select('id, title, status, company_id')
    .eq('id', jobId)
    .single()

  if (!job || job.company_id !== company.id) {
    return { success: false, error: 'Trabajo no encontrado' }
  }

  if (!['draft', 'pending_admin_approval'].includes(job.status)) {
    return { success: false, error: 'Este trabajo no se puede publicar' }
  }

  const { error } = await supabase
    .from('jobs')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', jobId)

  if (error) return { success: false, error: 'Error al publicar el trabajo' }

  // Notificar a todos los miembros activos del equipo
  const adminClient = createAdminClient()
  const { data: members } = await adminClient
    .from('team_memberships')
    .select('installer:installers(profile_id)')
    .eq('company_id', company.id)
    .eq('status', 'active')

  for (const member of members || []) {
    const profileId = (member as any).installer?.profile_id
    if (profileId) {
      await createNotification({
        userId: profileId,
        type: 'job_published',
        title: 'Nuevo trabajo disponible',
        message: `${company.company_name} publicó "${job.title}". Podés tomarlo desde Mis Trabajos.`,
        relatedEntityType: 'job',
        relatedEntityId: jobId,
      })
    }
  }

  revalidatePath(`/empresa/trabajos/${jobId}`)
  revalidatePath('/empresa/trabajos')

  return { success: true, message: 'Trabajo publicado para tu equipo' }
}

// --- Instalador toma un trabajo abierto de su equipo ---
export async function claimJob(jobId: string): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: installer } = await supabase
    .from('installers')
    .select('id, profile:profiles(full_name)')
    .eq('profile_id', user.id)
    .single()

  if (!installer) return { success: false, error: 'No se encontró tu perfil de instalador' }

  const { data: job } = await supabase
    .from('jobs')
    .select('id, title, status, company_id, company:companies(company_name, profile_id)')
    .eq('id', jobId)
    .single()

  if (!job) return { success: false, error: 'Trabajo no encontrado' }
  if (job.status !== 'published') {
    return { success: false, error: 'Este trabajo ya no está disponible' }
  }

  // Validar membresía activa en el equipo de esa empresa
  const { data: membership } = await supabase
    .from('team_memberships')
    .select('id')
    .eq('company_id', job.company_id)
    .eq('installer_id', installer.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!membership) {
    return { success: false, error: 'No formás parte del equipo de esta empresa' }
  }

  // Claim atómico: solo gana el primero (guard sobre claimed_by_installer_id)
  const adminClient = createAdminClient()
  const { data: claimed } = await adminClient
    .from('jobs')
    .update({ status: 'assigned', claimed_by_installer_id: installer.id })
    .eq('id', jobId)
    .eq('status', 'published')
    .is('claimed_by_installer_id', null)
    .select('id')

  if (!claimed || claimed.length === 0) {
    return { success: false, error: 'Otro instalador tomó este trabajo primero' }
  }

  // Crear el acuerdo
  const { data: agreement, error: agreementError } = await supabase
    .from('agreements')
    .insert({
      job_id: jobId,
      company_id: job.company_id,
      installer_id: installer.id,
      status: 'active',
    })
    .select('id')
    .single()

  if (agreementError || !agreement) {
    // Revertir el claim si falló el acuerdo
    await adminClient
      .from('jobs')
      .update({ status: 'published', claimed_by_installer_id: null })
      .eq('id', jobId)
    return { success: false, error: 'Error al tomar el trabajo. Intentá de nuevo.' }
  }

  // Notificar a la empresa
  const companyProfileId = (job as any).company?.profile_id
  const installerName = (installer as any).profile?.full_name || 'Un instalador'
  if (companyProfileId) {
    await createNotification({
      userId: companyProfileId,
      type: 'job_claimed',
      title: 'Tomaron tu trabajo',
      message: `${installerName} tomó "${job.title}".`,
      relatedEntityType: 'agreement',
      relatedEntityId: agreement.id,
    })
  }

  revalidatePath('/instalador/mis-trabajos')
  revalidatePath('/empresa/trabajos')

  return { success: true, message: 'Tomaste el trabajo. Coordiná los detalles con la empresa.' }
}

// --- Trabajos disponibles para tomar (equipos del instalador) ---
export async function getClaimableJobs(): Promise<any[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: installer } = await supabase
    .from('installers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!installer) return []

  const { data: memberships } = await supabase
    .from('team_memberships')
    .select('company_id')
    .eq('installer_id', installer.id)
    .eq('status', 'active')

  const companyIds = (memberships || []).map((m) => m.company_id)
  if (companyIds.length === 0) return []

  const { data } = await supabase
    .from('jobs')
    .select('*, company:companies(company_name), category:categories(name), location:locations(city_name, province_name)')
    .in('company_id', companyIds)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return data || []
}
