'use server'

// ============================================================
// SERVER ACTIONS - Ofertas recibidas (vista Empresa)
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'
import type { ActionResult, OfferWithInstaller } from '@/lib/actions/types'
import type {
  Offer,
  Job,
  Installer,
  Profile,
  Category,
  OfferStatus,
} from '@/types/database'

// --- Obtener ofertas recibidas por la empresa ---
export async function getCompanyReceivedOffers(
  jobId?: string
): Promise<OfferWithInstaller[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  // Obtener company_id
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!company) return []

  // Obtener jobs de la empresa
  let jobIds: string[] = []

  if (jobId) {
    jobIds = [jobId]
  } else {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id')
      .eq('company_id', company.id)

    jobIds = (jobs || []).map((j) => j.id)
  }

  if (jobIds.length === 0) return []

  const { data } = await supabase
    .from('offers')
    .select(
      '*, installer:installers(*, profile:profiles(full_name, email, phone, avatar_url)), job:jobs(id, title, status, category:categories(name))'
    )
    .in('job_id', jobIds)
    .order('created_at', { ascending: false })

  return (data || []) as OfferWithInstaller[]
}

// --- Obtener ofertas para un trabajo específico ---
export async function getJobOffers(
  jobId: string
): Promise<OfferWithInstaller[]> {
  return getCompanyReceivedOffers(jobId)
}

// --- Preseleccionar oferta ---
export async function shortlistOffer(offerId: string): Promise<ActionResult> {
  const supabase = createClient()

  const { data: offer } = await supabase
    .from('offers')
    .select('id, status, installer:installers(profile_id), job:jobs(title)')
    .eq('id', offerId)
    .single()

  if (!offer) return { success: false, error: 'Oferta no encontrada' }
  if (offer.status !== 'sent') {
    return { success: false, error: 'Solo se pueden preseleccionar ofertas enviadas' }
  }

  const { error } = await supabase
    .from('offers')
    .update({ status: 'shortlisted' })
    .eq('id', offerId)

  if (error) return { success: false, error: 'Error al preseleccionar' }

  const installerProfileId = (offer as any).installer?.profile_id
  if (installerProfileId) {
    await createNotification({
      userId: installerProfileId,
      type: 'offer_received',
      title: 'Tu oferta fue preseleccionada',
      message: `La empresa está considerando tu oferta para "${(offer as any).job?.title || 'un trabajo'}".`,
      relatedEntityType: 'offer',
      relatedEntityId: offerId,
    })
  }

  revalidatePath('/empresa/ofertas')
  return { success: true, message: 'Oferta preseleccionada' }
}

// --- Rechazar oferta ---
export async function rejectOffer(offerId: string): Promise<ActionResult> {
  const supabase = createClient()

  const { data: offer } = await supabase
    .from('offers')
    .select('id, status, installer:installers(profile_id), job:jobs(title)')
    .eq('id', offerId)
    .single()

  if (!offer) return { success: false, error: 'Oferta no encontrada' }
  if (!['sent', 'shortlisted'].includes(offer.status)) {
    return { success: false, error: 'Esta oferta no se puede rechazar' }
  }

  const { error } = await supabase
    .from('offers')
    .update({ status: 'rejected', rejected_at: new Date().toISOString() })
    .eq('id', offerId)

  if (error) return { success: false, error: 'Error al rechazar' }

  const installerProfileId = (offer as any).installer?.profile_id
  if (installerProfileId) {
    await createNotification({
      userId: installerProfileId,
      type: 'offer_rejected',
      title: 'Tu oferta no fue seleccionada',
      message: `La empresa eligió otra opción para "${(offer as any).job?.title || 'un trabajo'}".`,
      relatedEntityType: 'offer',
      relatedEntityId: offerId,
    })
  }

  revalidatePath('/empresa/ofertas')
  return { success: true, message: 'Oferta rechazada' }
}

// --- Aceptar oferta (crea acuerdo automáticamente) ---
export async function acceptOffer(offerId: string): Promise<ActionResult> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autenticado' }

  // Obtener la oferta completa
  const { data: offer } = await supabase
    .from('offers')
    .select('*, job:jobs(id, company_id, status, title), installer:installers(profile_id)')
    .eq('id', offerId)
    .single()

  if (!offer) return { success: false, error: 'Oferta no encontrada' }
  if (!['sent', 'shortlisted'].includes(offer.status)) {
    return { success: false, error: 'Esta oferta no se puede aceptar' }
  }

  const job = (offer as any).job
  if (!job) return { success: false, error: 'Trabajo asociado no encontrado' }

  // 1. Aceptar la oferta
  const { error: acceptError } = await supabase
    .from('offers')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', offerId)

  if (acceptError) return { success: false, error: 'Error al aceptar la oferta' }

  // 2. Rechazar las demás ofertas del trabajo (guardando antes a quiénes notificar)
  const { data: otherOffers } = await supabase
    .from('offers')
    .select('id, installer:installers(profile_id)')
    .eq('job_id', job.id)
    .neq('id', offerId)
    .in('status', ['sent', 'shortlisted'])

  await supabase
    .from('offers')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
    })
    .eq('job_id', job.id)
    .neq('id', offerId)
    .in('status', ['sent', 'shortlisted'])

  // 3. Crear acuerdo automáticamente
  const { error: agreementError } = await supabase.from('agreements').insert({
    job_id: job.id,
    offer_id: offerId,
    company_id: job.company_id,
    installer_id: offer.installer_id,
    status: 'active',
    final_price: offer.proposed_price,
    currency: offer.currency,
    confirmed_start_date: offer.availability_start_date || null,
    confirmed_end_date: offer.availability_end_date || null,
  })

  if (agreementError) {
    console.error('Error creando acuerdo:', agreementError)
    // No revertimos la aceptación, el acuerdo se puede crear manualmente
  }

  // 4. Actualizar estado del trabajo
  await supabase
    .from('jobs')
    .update({ status: 'offer_accepted' })
    .eq('id', job.id)

  // 5. Notificar al instalador ganador
  const winnerProfileId = (offer as any).installer?.profile_id
  if (winnerProfileId) {
    await createNotification({
      userId: winnerProfileId,
      type: 'offer_accepted',
      title: '¡Tu oferta fue aceptada!',
      message: `La empresa aceptó tu oferta para "${job.title || 'un trabajo'}". Ya pueden coordinar la instalación.`,
      relatedEntityType: 'offer',
      relatedEntityId: offerId,
    })
  }

  // 6. Notificar a los instaladores cuyas ofertas fueron rechazadas
  for (const other of otherOffers || []) {
    const profileId = (other as any).installer?.profile_id
    if (profileId) {
      await createNotification({
        userId: profileId,
        type: 'offer_rejected',
        title: 'Tu oferta no fue seleccionada',
        message: `La empresa eligió otra oferta para "${job.title || 'un trabajo'}".`,
        relatedEntityType: 'offer',
        relatedEntityId: other.id,
      })
    }
  }

  revalidatePath('/empresa/ofertas')
  revalidatePath('/empresa/acuerdos')
  revalidatePath(`/empresa/trabajos/${job.id}`)

  return {
    success: true,
    message: 'Oferta aceptada. Se creó el acuerdo automáticamente.',
  }
}
