'use server'

// ============================================================
// SERVER ACTIONS - Evidencia fotográfica de entrega
// El instalador marca el trabajo como terminado SUBIENDO fotos
// (obligatorias). La empresa las ve antes de aprobar la entrega.
// Bucket privado 'evidence' → se sirven con signed URLs.
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'
import { validateEvidenceFiles } from '@/lib/utils/evidence'
import type { ActionResult } from '@/lib/actions/types'

const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 // 1 hora

// --- Instalador: completar trabajo con evidencia obligatoria ---
export async function completeJobWithEvidence(
  agreementId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // El que llama debe ser EL instalador de este acuerdo
  const { data: agreement } = await supabase
    .from('agreements')
    .select('id, status, job_id, company_id, installer:installers(id, profile_id), company:companies(profile_id), job:jobs(title)')
    .eq('id', agreementId)
    .single()

  if (!agreement) return { success: false, error: 'Acuerdo no encontrado' }

  const installer = (agreement as any).installer
  if (!installer || installer.profile_id !== user.id) {
    return { success: false, error: 'Solo el instalador asignado puede completar este trabajo' }
  }

  if (agreement.status !== 'in_progress') {
    return { success: false, error: 'El trabajo tiene que estar en progreso para completarlo' }
  }

  const files = formData.getAll('files') as File[]
  const validation = validateEvidenceFiles(
    files.map((f) => ({ size: f.size, type: f.type, name: f.name }))
  )
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  // Subir al bucket privado con admin client (validación de partes ya hecha)
  const adminClient = createAdminClient()
  const uploadedRows = []

  for (const file of files) {
    const fileExt = file.name.split('.').pop()
    const storagePath = `${agreement.job_id}/${agreementId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

    const { error: uploadError } = await adminClient.storage
      .from('evidence')
      .upload(storagePath, file, { contentType: file.type })

    if (uploadError) {
      console.error('Error subiendo evidencia:', uploadError)
      return { success: false, error: `No se pudo subir ${file.name}. Intentá de nuevo.` }
    }

    uploadedRows.push({
      job_id: agreement.job_id,
      agreement_id: agreementId,
      file_type: 'evidence',
      file_url: storagePath, // bucket privado: guardamos el path, no una URL pública
      file_name: file.name,
      file_size: file.size,
      storage_path: storagePath,
      order_index: uploadedRows.length,
      uploaded_by: user.id,
    })
  }

  const { error: insertError } = await adminClient
    .from('job_files')
    .insert(uploadedRows)

  if (insertError) {
    console.error('Error guardando evidencia:', insertError)
    return { success: false, error: 'Error al guardar la evidencia' }
  }

  // Notas opcionales del instalador sobre la entrega
  const deliveryNotes = (formData.get('notes') as string | null)?.trim()

  // Transición del acuerdo y del job
  const updateData: Record<string, unknown> = { status: 'completed' }
  if (deliveryNotes) updateData.notes = deliveryNotes

  const { error: agreementError } = await adminClient
    .from('agreements')
    .update(updateData)
    .eq('id', agreementId)
    .eq('status', 'in_progress') // guard contra doble submit

  if (agreementError) {
    return { success: false, error: 'Error al actualizar el acuerdo' }
  }

  await adminClient
    .from('jobs')
    .update({ status: 'under_company_review' })
    .eq('id', agreement.job_id)

  // Notificar a la empresa que tiene una entrega para revisar
  const companyProfileId = (agreement as any).company?.profile_id
  const jobTitle = (agreement as any).job?.title || 'un trabajo'
  if (companyProfileId) {
    await createNotification({
      userId: companyProfileId,
      type: 'agreement_update',
      title: 'Trabajo entregado con evidencia',
      message: `El instalador entregó "${jobTitle}" con ${uploadedRows.length} foto${uploadedRows.length !== 1 ? 's' : ''} de evidencia. Revisala y aprobá la entrega.`,
      relatedEntityType: 'agreement',
      relatedEntityId: agreementId,
    })
  }

  revalidatePath('/empresa/acuerdos')
  revalidatePath('/instalador/acuerdos')

  return {
    success: true,
    message: 'Trabajo entregado con evidencia. La empresa va a revisar la entrega.',
  }
}

// --- Ambas partes (y admin): ver evidencia de un acuerdo ---
export interface EvidencePhoto {
  id: string
  fileName?: string
  signedUrl: string
  createdAt: string
}

export async function getAgreementEvidence(
  agreementId: string
): Promise<{ success: boolean; error?: string; photos?: EvidencePhoto[] }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // Validar que el que pide sea parte del acuerdo (o admin)
  const { data: agreement } = await supabase
    .from('agreements')
    .select('id, installer:installers(profile_id), company:companies(profile_id)')
    .eq('id', agreementId)
    .single()

  if (!agreement) return { success: false, error: 'Acuerdo no encontrado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isParty =
    (agreement as any).installer?.profile_id === user.id ||
    (agreement as any).company?.profile_id === user.id
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'

  if (!isParty && !isAdmin) {
    return { success: false, error: 'No tenés acceso a esta evidencia' }
  }

  const adminClient = createAdminClient()

  const { data: rows, error } = await adminClient
    .from('job_files')
    .select('id, file_name, storage_path, created_at')
    .eq('agreement_id', agreementId)
    .eq('file_type', 'evidence')
    .order('order_index', { ascending: true })

  if (error) return { success: false, error: 'Error al cargar la evidencia' }

  const photos: EvidencePhoto[] = []
  for (const row of rows || []) {
    if (!row.storage_path) continue
    const { data: signed } = await adminClient.storage
      .from('evidence')
      .createSignedUrl(row.storage_path, SIGNED_URL_EXPIRY_SECONDS)

    if (signed?.signedUrl) {
      photos.push({
        id: row.id,
        fileName: row.file_name || undefined,
        signedUrl: signed.signedUrl,
        createdAt: row.created_at,
      })
    }
  }

  return { success: true, photos }
}
