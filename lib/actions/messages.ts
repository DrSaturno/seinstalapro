'use server'

// ============================================================
// SERVER ACTIONS - Mensajería (coordinación empresa-instalador)
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'
import type { ActionResult } from '@/lib/actions/types'
import type { Message } from '@/types/database'

// --- Helper interno: verifica que el usuario sea parte del acuerdo ---
// Devuelve los profile_ids de ambas partes o null si no es parte
async function getAgreementParties(agreementId: string, userId: string): Promise<{
  companyProfileId: string
  installerProfileId: string
  jobId: string
  jobTitle: string
} | null> {
  const supabase = createAdminClient()

  const { data: agreement } = await supabase
    .from('agreements')
    .select(
      'id, job_id, company:companies(profile_id), installer:installers(profile_id), job:jobs(title)'
    )
    .eq('id', agreementId)
    .single()

  if (!agreement) return null

  const companyProfileId = (agreement as any).company?.profile_id
  const installerProfileId = (agreement as any).installer?.profile_id

  if (userId !== companyProfileId && userId !== installerProfileId) {
    return null
  }

  return {
    companyProfileId,
    installerProfileId,
    jobId: agreement.job_id,
    jobTitle: (agreement as any).job?.title || 'Trabajo',
  }
}

// --- Obtener conversaciones (acuerdos con su último mensaje) ---
export async function getConversations(): Promise<
  Array<{
    agreementId: string
    jobTitle: string
    counterpartName: string
    counterpartAvatar: string | null
    lastMessage: string | null
    lastMessageAt: string | null
    unreadCount: number
    agreementStatus: string
  }>
> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return []

  const admin = createAdminClient()
  let agreements: any[] = []

  if (profile.role === 'company') {
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('profile_id', user.id)
      .single()
    if (!company) return []

    const { data } = await admin
      .from('agreements')
      .select(
        'id, status, created_at, job:jobs(title), installer:installers(profile_id, profile:profiles(full_name, avatar_url))'
      )
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })
    agreements = data || []
  } else if (profile.role === 'installer') {
    const { data: installer } = await supabase
      .from('installers')
      .select('id')
      .eq('profile_id', user.id)
      .single()
    if (!installer) return []

    const { data } = await admin
      .from('agreements')
      .select(
        'id, status, created_at, job:jobs(title), company:companies(profile_id, company_name, profile:profiles(full_name, avatar_url))'
      )
      .eq('installer_id', installer.id)
      .order('created_at', { ascending: false })
    agreements = data || []
  }

  if (agreements.length === 0) return []

  // Últimos mensajes y no leídos por acuerdo
  const agreementIds = agreements.map((a) => a.id)
  const { data: messages } = await admin
    .from('messages')
    .select('agreement_id, message_text, created_at, recipient_id, is_read')
    .in('agreement_id', agreementIds)
    .order('created_at', { ascending: false })

  const lastByAgreement: Record<string, { text: string; at: string }> = {}
  const unreadByAgreement: Record<string, number> = {}

  for (const msg of messages || []) {
    if (!lastByAgreement[msg.agreement_id]) {
      lastByAgreement[msg.agreement_id] = {
        text: msg.message_text,
        at: msg.created_at,
      }
    }
    if (msg.recipient_id === user.id && !msg.is_read) {
      unreadByAgreement[msg.agreement_id] =
        (unreadByAgreement[msg.agreement_id] || 0) + 1
    }
  }

  return agreements.map((a) => {
    const counterpart =
      profile.role === 'company'
        ? {
            name: a.installer?.profile?.full_name || 'Instalador',
            avatar: a.installer?.profile?.avatar_url || null,
          }
        : {
            name:
              a.company?.company_name ||
              a.company?.profile?.full_name ||
              'Empresa',
            avatar: a.company?.profile?.avatar_url || null,
          }

    return {
      agreementId: a.id,
      jobTitle: a.job?.title || 'Trabajo',
      counterpartName: counterpart.name,
      counterpartAvatar: counterpart.avatar,
      lastMessage: lastByAgreement[a.id]?.text || null,
      lastMessageAt: lastByAgreement[a.id]?.at || null,
      unreadCount: unreadByAgreement[a.id] || 0,
      agreementStatus: a.status,
    }
  })
}

// --- Obtener mensajes de una conversación ---
export async function getMessages(agreementId: string): Promise<Message[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const parties = await getAgreementParties(agreementId, user.id)
  if (!parties) return []

  const admin = createAdminClient()

  const { data: messages } = await admin
    .from('messages')
    .select('*')
    .eq('agreement_id', agreementId)
    .order('created_at', { ascending: true })

  // Marcar como leídos los mensajes que recibí
  await admin
    .from('messages')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('agreement_id', agreementId)
    .eq('recipient_id', user.id)
    .eq('is_read', false)

  return (messages || []) as Message[]
}

// --- Enviar mensaje ---
export async function sendMessage(
  agreementId: string,
  messageText: string
): Promise<ActionResult> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autenticado' }

  const text = messageText.trim()
  if (!text) {
    return { success: false, error: 'El mensaje no puede estar vacío' }
  }
  if (text.length > 2000) {
    return { success: false, error: 'El mensaje no puede superar los 2000 caracteres' }
  }

  const parties = await getAgreementParties(agreementId, user.id)
  if (!parties) {
    return { success: false, error: 'No tenés acceso a esta conversación' }
  }

  const recipientId =
    user.id === parties.companyProfileId
      ? parties.installerProfileId
      : parties.companyProfileId

  const admin = createAdminClient()
  const { error } = await admin.from('messages').insert({
    job_id: parties.jobId,
    agreement_id: agreementId,
    sender_id: user.id,
    recipient_id: recipientId,
    message_text: text,
    is_read: false,
  })

  if (error) {
    console.error('Error enviando mensaje:', error)
    return { success: false, error: 'Error al enviar el mensaje' }
  }

  // Notificar al destinatario
  await createNotification({
    userId: recipientId,
    type: 'message_received',
    title: 'Nuevo mensaje',
    message: `Tenés un mensaje nuevo sobre "${parties.jobTitle}".`,
    relatedEntityType: 'agreement',
    relatedEntityId: agreementId,
  })

  revalidatePath('/empresa/mensajes')
  revalidatePath('/instalador/mensajes')

  return { success: true }
}
