'use server'

// ============================================================
// SERVER ACTIONS - Admin
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'
import type { ActionResult, AdminStats } from '@/lib/actions/types'
import type {
  Company,
  Installer,
  Job,
  Profile,
  CompanyStatus,
  InstallerStatus,
  JobStatus,
} from '@/types/database'

// --- Obtener stats del admin ---
export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createClient()

  const [companies, installers, jobs, disputes] = await Promise.all([
    supabase.from('companies').select('status', { count: 'exact' }),
    supabase.from('installers').select('status', { count: 'exact' }),
    supabase.from('jobs').select('status', { count: 'exact' }),
    supabase
      .from('disputes')
      .select('id', { count: 'exact' })
      .in('status', ['new', 'under_review']),
  ])

  const companyData = companies.data || []
  const installerData = installers.data || []
  const jobData = jobs.data || []

  return {
    totalCompanies: companies.count || 0,
    pendingCompanies: companyData.filter((c) => c.status === 'pending_review').length,
    totalInstallers: installers.count || 0,
    pendingInstallers: installerData.filter((i) => i.status === 'pending_review').length,
    totalJobs: jobs.count || 0,
    pendingJobs: jobData.filter((j) => j.status === 'pending_admin_approval').length,
    activeJobs: jobData.filter((j) =>
      ['published', 'receiving_offers', 'in_progress'].includes(j.status)
    ).length,
    openDisputes: disputes.count || 0,
  }
}

// --- Listar empresas con perfil ---
export async function getAdminCompanies(
  status?: string
): Promise<Array<Company & { profile?: Profile }>> {
  const supabase = createClient()

  let query = supabase
    .from('companies')
    .select('*, profile:profiles(*)')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data } = await query
  return (data || []) as Array<Company & { profile?: Profile }>
}

// --- Cambiar estado de empresa ---
export async function updateCompanyStatus(
  companyId: string,
  newStatus: CompanyStatus,
  reason?: string
): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autenticado' }

  // Obtener estado actual
  const { data: company } = await supabase
    .from('companies')
    .select('id, status, profile_id, company_name')
    .eq('id', companyId)
    .single()

  if (!company) return { success: false, error: 'Empresa no encontrada' }

  const updateData: Record<string, unknown> = { status: newStatus }
  if (newStatus === 'verified') {
    updateData.verified_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('companies')
    .update(updateData)
    .eq('id', companyId)

  if (error) {
    return { success: false, error: 'Error al actualizar el estado' }
  }

  // Registrar auditoría
  await supabase.from('audit_logs').insert({
    admin_id: user.id,
    action_type: `company_${newStatus}`,
    affected_entity_type: 'company',
    affected_entity_id: companyId,
    details: {
      previous_status: company.status,
      new_status: newStatus,
      reason: reason || null,
    },
  })

  // Notificar a la empresa el cambio de estado de su cuenta
  const COMPANY_STATUS_NOTIFICATIONS: Record<string, { type: string; title: string; message: string }> = {
    verified: {
      type: 'account_verified',
      title: '¡Tu empresa fue verificada!',
      message: 'Ya podés publicar trabajos de instalación gráfica.',
    },
    rejected: {
      type: 'account_rejected',
      title: 'Tu empresa fue rechazada',
      message: reason || 'Contactá a soporte para más información.',
    },
    suspended: {
      type: 'account_suspended',
      title: 'Tu cuenta fue suspendida',
      message: reason || 'Contactá a soporte para más información.',
    },
    pending_review: {
      type: 'system',
      title: 'Tu cuenta volvió a revisión',
      message: 'Un administrador revisará tu empresa nuevamente.',
    },
  }

  const notif = COMPANY_STATUS_NOTIFICATIONS[newStatus]
  if (notif && company.profile_id) {
    await createNotification({
      userId: company.profile_id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      relatedEntityType: 'company',
      relatedEntityId: companyId,
    })
  }

  revalidatePath('/admin/empresas')
  revalidatePath('/admin/dashboard')

  return { success: true, message: `Empresa actualizada a: ${newStatus}` }
}

// --- Listar instaladores con perfil ---
export async function getAdminInstallers(
  status?: string
): Promise<Array<Installer & { profile?: Profile }>> {
  const supabase = createClient()

  let query = supabase
    .from('installers')
    .select('*, profile:profiles(*)')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data } = await query
  return (data || []) as Array<Installer & { profile?: Profile }>
}

// --- Cambiar estado de instalador ---
export async function updateInstallerStatus(
  installerId: string,
  newStatus: InstallerStatus,
  reason?: string
): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autenticado' }

  const { data: installer } = await supabase
    .from('installers')
    .select('id, status, profile_id')
    .eq('id', installerId)
    .single()

  if (!installer) return { success: false, error: 'Instalador no encontrado' }

  const updateData: Record<string, unknown> = { status: newStatus }
  if (newStatus === 'approved') {
    updateData.approved_at = new Date().toISOString()
    updateData.is_verified = true
  }
  if (newStatus === 'rejected' || newStatus === 'changes_requested') {
    updateData.rejected_reason = reason || null
  }

  const { error } = await supabase
    .from('installers')
    .update(updateData)
    .eq('id', installerId)

  if (error) {
    return { success: false, error: 'Error al actualizar el estado' }
  }

  // Auditoría
  await supabase.from('audit_logs').insert({
    admin_id: user.id,
    action_type: `installer_${newStatus}`,
    affected_entity_type: 'installer',
    affected_entity_id: installerId,
    details: {
      previous_status: installer.status,
      new_status: newStatus,
      reason: reason || null,
    },
  })

  // Notificar al instalador el cambio de estado de su cuenta
  const INSTALLER_STATUS_NOTIFICATIONS: Record<string, { type: string; title: string; message: string }> = {
    approved: {
      type: 'account_verified',
      title: '¡Tu perfil fue aprobado!',
      message: 'Ya podés buscar trabajos y enviar ofertas.',
    },
    changes_requested: {
      type: 'system',
      title: 'Tu perfil necesita cambios',
      message: reason || 'Revisá tu perfil y completá la información solicitada.',
    },
    rejected: {
      type: 'account_rejected',
      title: 'Tu perfil fue rechazado',
      message: reason || 'Contactá a soporte para más información.',
    },
    suspended: {
      type: 'account_suspended',
      title: 'Tu cuenta fue suspendida',
      message: reason || 'Contactá a soporte para más información.',
    },
    pending_review: {
      type: 'system',
      title: 'Tu perfil volvió a revisión',
      message: 'Un administrador revisará tu perfil nuevamente.',
    },
  }

  const notif = INSTALLER_STATUS_NOTIFICATIONS[newStatus]
  if (notif && installer.profile_id) {
    await createNotification({
      userId: installer.profile_id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      relatedEntityType: 'installer',
      relatedEntityId: installerId,
    })
  }

  revalidatePath('/admin/instaladores')
  revalidatePath('/admin/dashboard')

  return { success: true, message: `Instalador actualizado a: ${newStatus}` }
}

// --- Listar trabajos para admin ---
export async function getAdminJobs(
  status?: string
): Promise<Array<Job & { company?: Company; category?: { name: string } }>> {
  const supabase = createClient()

  let query = supabase
    .from('jobs')
    .select('*, company:companies(*, profile:profiles(full_name, email)), category:categories(name)')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data } = await query
  return (data || []) as Array<Job & { company?: Company; category?: { name: string } }>
}

// --- Aprobar/Rechazar trabajo ---
export async function updateJobStatus(
  jobId: string,
  newStatus: 'published' | 'draft',
  reason?: string
): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autenticado' }

  const { data: job } = await supabase
    .from('jobs')
    .select('id, status, title, company:companies(profile_id)')
    .eq('id', jobId)
    .single()

  if (!job) return { success: false, error: 'Trabajo no encontrado' }

  if (job.status !== 'pending_admin_approval') {
    return { success: false, error: 'Solo se pueden moderar trabajos pendientes de aprobación' }
  }

  const updateData: Record<string, unknown> = { status: newStatus }
  if (newStatus === 'published') {
    updateData.admin_approved_at = new Date().toISOString()
    updateData.published_at = new Date().toISOString()
  }
  if (newStatus === 'draft') {
    updateData.admin_rejection_reason = reason || 'Rechazado por admin'
  }

  const { error } = await supabase
    .from('jobs')
    .update(updateData)
    .eq('id', jobId)

  if (error) {
    return { success: false, error: 'Error al actualizar el trabajo' }
  }

  // Auditoría
  await supabase.from('audit_logs').insert({
    admin_id: user.id,
    action_type: newStatus === 'published' ? 'approve_job' : 'reject_job',
    affected_entity_type: 'job',
    affected_entity_id: jobId,
    details: {
      previous_status: job.status,
      new_status: newStatus,
      reason: reason || null,
    },
  })

  // Notificar a la empresa el resultado de la moderación
  const companyProfileId = (job as any).company?.profile_id
  if (companyProfileId) {
    if (newStatus === 'published') {
      await createNotification({
        userId: companyProfileId,
        type: 'job_approved',
        title: 'Tu trabajo fue aprobado y publicado',
        message: `"${job.title}" ya está visible para los instaladores.`,
        relatedEntityType: 'job',
        relatedEntityId: jobId,
      })
    } else {
      await createNotification({
        userId: companyProfileId,
        type: 'job_rejected',
        title: 'Tu trabajo fue devuelto a borrador',
        message: reason
          ? `"${job.title}": ${reason}`
          : `"${job.title}" necesita cambios antes de publicarse.`,
        relatedEntityType: 'job',
        relatedEntityId: jobId,
      })
    }
  }

  revalidatePath('/admin/trabajos')
  revalidatePath('/admin/dashboard')

  return {
    success: true,
    message: newStatus === 'published' ? 'Trabajo aprobado y publicado.' : 'Trabajo devuelto a borrador.',
  }
}

// --- Listar todos los usuarios de la plataforma ---
export async function getAdminUsers(
  role?: string
): Promise<Profile[]> {
  const supabase = createClient()

  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (role && role !== 'all') {
    query = query.eq('role', role)
  }

  const { data } = await query
  return (data || []) as Profile[]
}

// --- Listar todas las categorías (incluye inactivas, para admin) ---
export async function getAdminCategories(): Promise<
  Array<{ id: string; name: string; description?: string; is_active: boolean; order_index: number }>
> {
  const supabase = createClient()

  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('order_index')

  return (data || []) as any
}

// --- Helper: verificar que el usuario actual es admin ---
async function requireAdmin(): Promise<{ userId: string } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'No tenés permisos de administrador' }
  }

  return { userId: user.id }
}

// --- Crear categoría ---
export async function createCategory(
  name: string,
  description?: string
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ('error' in auth) return { success: false, error: auth.error }

  const trimmedName = name.trim()
  if (trimmedName.length < 3) {
    return { success: false, error: 'El nombre debe tener al menos 3 caracteres' }
  }

  const admin = createAdminClient()

  // Calcular siguiente order_index
  const { data: categories } = await admin
    .from('categories')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)

  const nextIndex = categories && categories.length > 0
    ? (categories[0].order_index || 0) + 1
    : 0

  const { error } = await admin.from('categories').insert({
    name: trimmedName,
    description: description?.trim() || null,
    is_active: true,
    order_index: nextIndex,
  })

  if (error) {
    console.error('Error creando categoría:', error)
    return { success: false, error: 'Error al crear la categoría' }
  }

  await admin.from('audit_logs').insert({
    admin_id: auth.userId,
    action_type: 'category_created',
    affected_entity_type: 'category',
    affected_entity_id: trimmedName,
    details: { name: trimmedName },
  })

  revalidatePath('/admin/configuracion')
  return { success: true, message: 'Categoría creada' }
}

// --- Actualizar categoría (nombre, descripción, activa) ---
export async function updateCategory(
  categoryId: string,
  updates: { name?: string; description?: string; is_active?: boolean }
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ('error' in auth) return { success: false, error: auth.error }

  const admin = createAdminClient()

  const updateData: Record<string, unknown> = {}
  if (updates.name !== undefined) {
    const trimmed = updates.name.trim()
    if (trimmed.length < 3) {
      return { success: false, error: 'El nombre debe tener al menos 3 caracteres' }
    }
    updateData.name = trimmed
  }
  if (updates.description !== undefined) {
    updateData.description = updates.description.trim() || null
  }
  if (updates.is_active !== undefined) {
    updateData.is_active = updates.is_active
  }

  const { error } = await admin
    .from('categories')
    .update(updateData)
    .eq('id', categoryId)

  if (error) {
    console.error('Error actualizando categoría:', error)
    return { success: false, error: 'Error al actualizar la categoría' }
  }

  await admin.from('audit_logs').insert({
    admin_id: auth.userId,
    action_type: 'category_updated',
    affected_entity_type: 'category',
    affected_entity_id: categoryId,
    details: updateData,
  })

  revalidatePath('/admin/configuracion')
  return { success: true, message: 'Categoría actualizada' }
}

// --- Obtener logs de auditoría ---
export async function getAuditLogs(limit: number = 50): Promise<Array<{
  id: string
  action_type: string
  affected_entity_type: string
  affected_entity_id: string
  details: Record<string, unknown> | null
  created_at: string
  admin?: { full_name: string; email: string }
}>> {
  const supabase = createClient()

  const { data } = await supabase
    .from('audit_logs')
    .select('*, admin:profiles!audit_logs_admin_id_fkey(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data || []) as any
}
