'use server'

// ============================================================
// SERVER ACTIONS - Disputas
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/auth/actions'
import type {
  Dispute,
  Agreement,
  Job,
  Company,
  Installer,
  Profile,
  DisputeStatus,
} from '@/types/database'
import { createNotification } from './notifications'

// --- Tipo completo de disputa ---
export type DisputeFull = Dispute & {
  reporter?: Profile
  agreement?: Agreement & {
    job?: Job
    company?: Company & { profile?: Profile }
    installer?: Installer & { profile?: Profile }
  }
}

// --- Transiciones válidas ---
const DISPUTE_TRANSITIONS: Record<string, string[]> = {
  new: ['under_review'],
  under_review: ['waiting_company', 'waiting_installer', 'resolved', 'closed'],
  waiting_company: ['under_review', 'resolved', 'closed'],
  waiting_installer: ['under_review', 'resolved', 'closed'],
}

// --- Crear disputa (empresa o instalador) ---
export async function createDispute(
  agreementId: string,
  title: string,
  description?: string
): Promise<ActionResult> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autenticado' }

  // Validar título
  if (!title || title.trim().length < 5) {
    return { success: false, error: 'El título debe tener al menos 5 caracteres' }
  }
  if (title.length > 200) {
    return { success: false, error: 'El título no puede superar los 200 caracteres' }
  }

  // Obtener acuerdo
  const { data: agreement } = await supabase
    .from('agreements')
    .select('id, status, job_id, company_id, installer_id')
    .eq('id', agreementId)
    .single()

  if (!agreement) return { success: false, error: 'Acuerdo no encontrado' }

  // Solo se puede disputar en ciertos estados
  const DISPUTABLE = ['active', 'coordinating', 'confirmed', 'in_progress', 'completed']
  if (!DISPUTABLE.includes(agreement.status)) {
    return {
      success: false,
      error: 'No se puede abrir una disputa en el estado actual del acuerdo',
    }
  }

  // Verificar que el usuario sea parte del acuerdo
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  let isParty = false
  if (profile?.role === 'company') {
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('profile_id', user.id)
      .single()
    isParty = company?.id === agreement.company_id
  } else if (profile?.role === 'installer') {
    const { data: installer } = await supabase
      .from('installers')
      .select('id')
      .eq('profile_id', user.id)
      .single()
    isParty = installer?.id === agreement.installer_id
  }

  if (!isParty) {
    return { success: false, error: 'No tenés permisos para disputar este acuerdo' }
  }

  // Crear disputa
  const { error } = await supabase.from('disputes').insert({
    job_id: agreement.job_id,
    agreement_id: agreementId,
    reporter_id: user.id,
    status: 'new',
    title: title.trim(),
    description: description?.trim() || null,
  })

  if (error) {
    console.error('Error creando disputa:', error)
    return { success: false, error: 'Error al crear la disputa' }
  }

  // Cambiar estado del acuerdo a "disputed"
  await supabase
    .from('agreements')
    .update({ status: 'disputed' })
    .eq('id', agreementId)

  // Cambiar estado del job a "disputed"
  await supabase
    .from('jobs')
    .update({ status: 'disputed' })
    .eq('id', agreement.job_id)

  revalidatePath('/empresa/acuerdos')
  revalidatePath('/instalador/acuerdos')
  revalidatePath('/admin/disputas')

  return { success: true, message: 'Disputa creada. Un administrador la revisará pronto.' }
}

// --- Obtener disputas del usuario ---
export async function getUserDisputes(): Promise<DisputeFull[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('disputes')
    .select(
      '*, reporter:profiles!reporter_id(full_name, email, avatar_url), agreement:agreements(*, job:jobs(id, title), company:companies(company_name, profile:profiles(full_name)), installer:installers(*, profile:profiles(full_name)))'
    )
    .eq('reporter_id', user.id)
    .order('created_at', { ascending: false })

  return (data || []) as DisputeFull[]
}

// --- Admin: Obtener todas las disputas ---
export async function getAdminDisputes(): Promise<DisputeFull[]> {
  const supabase = createClient()

  const { data } = await supabase
    .from('disputes')
    .select(
      '*, reporter:profiles!reporter_id(full_name, email, avatar_url, role), agreement:agreements(*, job:jobs(id, title), company:companies(company_name, profile:profiles(full_name)), installer:installers(*, profile:profiles(full_name)))'
    )
    .order('created_at', { ascending: false })

  return (data || []) as DisputeFull[]
}

// --- Admin: Actualizar estado de disputa ---
export async function updateDisputeStatus(
  disputeId: string,
  newStatus: DisputeStatus,
  adminNotes?: string
): Promise<ActionResult> {
  const supabase = createClient()

  // Obtener disputa actual
  const { data: dispute } = await supabase
    .from('disputes')
    .select('id, status, agreement_id')
    .eq('id', disputeId)
    .single()

  if (!dispute) return { success: false, error: 'Disputa no encontrada' }

  // Validar transición
  const allowed = DISPUTE_TRANSITIONS[dispute.status] || []
  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      error: `No se puede pasar de "${dispute.status}" a "${newStatus}"`,
    }
  }

  const updateData: Record<string, unknown> = { status: newStatus }
  if (adminNotes) updateData.admin_notes = adminNotes

  const { error } = await supabase
    .from('disputes')
    .update(updateData)
    .eq('id', disputeId)

  if (error) return { success: false, error: 'Error al actualizar la disputa' }

  revalidatePath('/admin/disputas')
  revalidatePath('/empresa/acuerdos')
  revalidatePath('/instalador/acuerdos')

  return { success: true, message: `Disputa actualizada a: ${newStatus}` }
}

// --- Admin: Resolver disputa ---
export async function resolveDispute(
  disputeId: string,
  resolution: string,
  adminNotes?: string
): Promise<ActionResult> {
  const supabase = createClient()

  if (!resolution || resolution.trim().length < 10) {
    return {
      success: false,
      error: 'La resolución debe tener al menos 10 caracteres',
    }
  }

  const { data: dispute } = await supabase
    .from('disputes')
    .select('id, status, agreement_id, reporter_id')
    .eq('id', disputeId)
    .single()

  if (!dispute) return { success: false, error: 'Disputa no encontrada' }

  if (['resolved', 'closed'].includes(dispute.status)) {
    return { success: false, error: 'La disputa ya está cerrada' }
  }

  // Actualizar disputa
  const { error } = await supabase
    .from('disputes')
    .update({
      status: 'resolved',
      resolution: resolution.trim(),
      admin_notes: adminNotes?.trim() || null,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', disputeId)

  if (error) return { success: false, error: 'Error al resolver la disputa' }

  // Notificar al reportador
  await createNotification({
    userId: dispute.reporter_id,
    type: 'dispute_resolved',
    title: 'Tu disputa fue resuelta',
    message: resolution.trim(),
    relatedEntityType: 'dispute',
    relatedEntityId: disputeId,
  })

  revalidatePath('/admin/disputas')
  revalidatePath('/empresa/acuerdos')
  revalidatePath('/instalador/acuerdos')

  return { success: true, message: 'Disputa resuelta exitosamente' }
}
