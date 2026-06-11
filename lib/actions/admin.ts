'use server'

// ============================================================
// SERVER ACTIONS - Admin
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
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
    .select('id, status')
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
    .select('id, status')
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
    .select('id, status')
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

  revalidatePath('/admin/trabajos')
  revalidatePath('/admin/dashboard')

  return {
    success: true,
    message: newStatus === 'published' ? 'Trabajo aprobado y publicado.' : 'Trabajo devuelto a borrador.',
  }
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
