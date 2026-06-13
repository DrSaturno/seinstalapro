'use server'

// ============================================================
// SERVER ACTIONS - Acuerdos y Reseñas
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'
import type { ActionResult, AgreementFull } from '@/lib/actions/types'
import type {
  Agreement,
  Job,
  Company,
  Installer,
  Offer,
  Profile,
  Category,
  AgreementStatus,
} from '@/types/database'

// --- Obtener acuerdos de la empresa ---
export async function getCompanyAgreements(): Promise<AgreementFull[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!company) return []

  const { data } = await supabase
    .from('agreements')
    .select(
      '*, job:jobs(id, title, status, category:categories(name)), installer:installers(*, profile:profiles(full_name, email, phone, avatar_url)), offer:offers(proposed_price, currency, team_size)'
    )
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  return (data || []) as AgreementFull[]
}

// --- Obtener acuerdos del instalador ---
export async function getInstallerAgreements(): Promise<AgreementFull[]> {
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
    .from('agreements')
    .select(
      '*, job:jobs(id, title, status, category:categories(name)), company:companies(company_name, profile:profiles(full_name, email, phone)), offer:offers(proposed_price, currency, team_size)'
    )
    .eq('installer_id', installer.id)
    .order('created_at', { ascending: false })

  return (data || []) as AgreementFull[]
}

// --- Actualizar estado del acuerdo ---
export async function updateAgreementStatus(
  agreementId: string,
  newStatus: AgreementStatus,
  notes?: string
): Promise<ActionResult> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: agreement } = await supabase
    .from('agreements')
    .select('id, status, job_id, company:companies(profile_id), installer:installers(profile_id), job:jobs(title)')
    .eq('id', agreementId)
    .single()

  if (!agreement) return { success: false, error: 'Acuerdo no encontrado' }

  // Validar transiciones permitidas
  const VALID: Record<string, string[]> = {
    active: ['coordinating', 'cancelled'],
    coordinating: ['confirmed', 'cancelled'],
    confirmed: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'disputed'],
  }

  const allowed = VALID[agreement.status] || []
  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      error: `No se puede pasar de "${agreement.status}" a "${newStatus}"`,
    }
  }

  const updateData: Record<string, unknown> = { status: newStatus }
  if (notes) updateData.notes = notes

  const { error } = await supabase
    .from('agreements')
    .update(updateData)
    .eq('id', agreementId)

  if (error) return { success: false, error: 'Error al actualizar el acuerdo' }

  // Sincronizar estado del job
  const JOB_STATUS_MAP: Record<string, string> = {
    coordinating: 'coordinating',
    confirmed: 'confirmed',
    in_progress: 'in_progress',
    completed: 'under_company_review',
    cancelled: 'cancelled',
    disputed: 'disputed',
  }

  const jobStatus = JOB_STATUS_MAP[newStatus]
  if (jobStatus) {
    await supabase
      .from('jobs')
      .update({ status: jobStatus })
      .eq('id', agreement.job_id)
  }

  // Notificar a la contraparte (al que NO hizo el cambio)
  const STATUS_LABELS: Record<string, string> = {
    coordinating: 'en coordinación',
    confirmed: 'confirmado',
    in_progress: 'en progreso',
    completed: 'marcado como completado',
    cancelled: 'cancelado',
    disputed: 'en disputa',
  }

  const companyProfileId = (agreement as any).company?.profile_id
  const installerProfileId = (agreement as any).installer?.profile_id
  const jobTitle = (agreement as any).job?.title || 'un trabajo'
  const statusLabel = STATUS_LABELS[newStatus] || newStatus

  const recipients = [companyProfileId, installerProfileId].filter(
    (id) => id && id !== user?.id
  )
  for (const recipientId of recipients) {
    await createNotification({
      userId: recipientId,
      type: 'agreement_update',
      title: `Acuerdo ${statusLabel}`,
      message: `El acuerdo de "${jobTitle}" ahora está ${statusLabel}.`,
      relatedEntityType: 'agreement',
      relatedEntityId: agreementId,
    })
  }

  revalidatePath('/empresa/acuerdos')
  revalidatePath('/instalador/acuerdos')

  return { success: true, message: `Acuerdo actualizado a: ${newStatus}` }
}

// --- Confirmar fechas del acuerdo ---
export async function confirmAgreementDates(
  agreementId: string,
  startDate: string,
  endDate?: string
): Promise<ActionResult> {
  const supabase = createClient()

  const { error } = await supabase
    .from('agreements')
    .update({
      confirmed_start_date: startDate,
      confirmed_end_date: endDate || null,
    })
    .eq('id', agreementId)

  if (error) return { success: false, error: 'Error al confirmar fechas' }

  revalidatePath('/empresa/acuerdos')
  revalidatePath('/instalador/acuerdos')

  return { success: true, message: 'Fechas confirmadas' }
}

// --- Aprobar trabajo completado (empresa) ---
export async function approveCompletedJob(
  agreementId: string
): Promise<ActionResult> {
  const supabase = createClient()

  const { data: agreement } = await supabase
    .from('agreements')
    .select('id, status, job_id, installer:installers(profile_id), job:jobs(title)')
    .eq('id', agreementId)
    .single()

  if (!agreement) return { success: false, error: 'Acuerdo no encontrado' }
  if (agreement.status !== 'completed') {
    return { success: false, error: 'El acuerdo debe estar completado para aprobarlo' }
  }

  // Actualizar job a aprobado
  await supabase
    .from('jobs')
    .update({ status: 'approved' })
    .eq('id', agreement.job_id)

  // Notificar al instalador que la empresa aprobó su trabajo
  const installerProfileId = (agreement as any).installer?.profile_id
  if (installerProfileId) {
    await createNotification({
      userId: installerProfileId,
      type: 'job_approved',
      title: 'La empresa aprobó tu trabajo',
      message: `"${(agreement as any).job?.title || 'Tu trabajo'}" fue aprobado. ¡Ya pueden calificarse mutuamente!`,
      relatedEntityType: 'agreement',
      relatedEntityId: agreementId,
    })
  }

  revalidatePath('/empresa/acuerdos')
  revalidatePath('/instalador/acuerdos')

  return { success: true, message: 'Trabajo aprobado. Ya podés dejar una reseña.' }
}

// --- Crear reseña ---
export async function createReview(
  agreementId: string,
  rating: number,
  comment?: string
): Promise<ActionResult> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autenticado' }

  if (rating < 1 || rating > 5) {
    return { success: false, error: 'El rating debe ser entre 1 y 5' }
  }

  // Obtener acuerdo con datos necesarios
  const { data: agreement } = await supabase
    .from('agreements')
    .select('id, status, job_id, company_id, installer_id')
    .eq('id', agreementId)
    .single()

  if (!agreement) return { success: false, error: 'Acuerdo no encontrado' }

  // Verificar acuerdo completado — chequear job status
  const { data: job } = await supabase
    .from('jobs')
    .select('status')
    .eq('id', agreement.job_id)
    .single()

  if (!job || !['approved', 'rated', 'under_company_review', 'completed_by_installer'].includes(job.status)) {
    return { success: false, error: 'El trabajo debe estar aprobado para dejar reseña' }
  }

  // Verificar que no exista reseña previa
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('agreement_id', agreementId)
    .eq('reviewer_id', user.id)
    .single()

  if (existingReview) {
    return { success: false, error: 'Ya dejaste una reseña para este acuerdo' }
  }

  // Determinar quién es el reseñado
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  let reviewedId: string
  if (profile?.role === 'company') {
    // Empresa reseña al instalador - necesitamos profile_id del instalador
    const { data: installer } = await supabase
      .from('installers')
      .select('profile_id')
      .eq('id', agreement.installer_id)
      .single()
    reviewedId = installer?.profile_id || ''
  } else {
    // Instalador reseña a la empresa - necesitamos profile_id de la empresa
    const { data: company } = await supabase
      .from('companies')
      .select('profile_id')
      .eq('id', agreement.company_id)
      .single()
    reviewedId = company?.profile_id || ''
  }

  if (!reviewedId) {
    return { success: false, error: 'No se pudo determinar a quién reseñar' }
  }

  const { error } = await supabase.from('reviews').insert({
    job_id: agreement.job_id,
    agreement_id: agreementId,
    reviewer_id: user.id,
    reviewed_id: reviewedId,
    rating,
    comment: comment || null,
  })

  if (error) {
    console.error('Error creando reseña:', error)
    return { success: false, error: 'Error al crear la reseña' }
  }

  // Actualizar promedio del instalador si corresponde
  if (profile?.role === 'company') {
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewed_id', reviewedId)

    if (allReviews && allReviews.length > 0) {
      const avg =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      await supabase
        .from('installers')
        .update({
          avg_rating: Math.round(avg * 10) / 10,
          total_reviews: allReviews.length,
        })
        .eq('profile_id', reviewedId)
    }
  }

  // Notificar al reseñado
  await createNotification({
    userId: reviewedId,
    type: 'review_received',
    title: 'Recibiste una reseña',
    message: `Te calificaron con ${rating} estrella${rating !== 1 ? 's' : ''}${comment ? ' y dejaron un comentario' : ''}.`,
    relatedEntityType: 'agreement',
    relatedEntityId: agreementId,
  })

  // Actualizar job a "rated" si ambas partes dejaron reseña
  const { data: jobReviews } = await supabase
    .from('reviews')
    .select('id')
    .eq('agreement_id', agreementId)

  if (jobReviews && jobReviews.length >= 2) {
    await supabase
      .from('jobs')
      .update({ status: 'rated' })
      .eq('id', agreement.job_id)
  }

  revalidatePath('/empresa/acuerdos')
  revalidatePath('/instalador/acuerdos')
  revalidatePath('/instalador/resenas')

  return { success: true, message: 'Reseña enviada correctamente' }
}
