'use server'

// ============================================================
// SERVER ACTIONS - Ofertas (Instalador)
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/auth/actions'
import { createOfferSchema } from '@/lib/validations/installer'
import type {
  Job,
  Company,
  Category,
  Location,
  Offer,
  Profile,
} from '@/types/database'

// --- Buscar trabajos publicados (para instaladores) ---
export async function getPublishedJobs(filters?: {
  category_id?: string
  country?: string
  search?: string
}): Promise<
  Array<
    Job & {
      company?: Company & { profile?: Pick<Profile, 'full_name'> }
      category?: Category
      location?: Location
    }
  >
> {
  const supabase = createClient()

  let query = supabase
    .from('jobs')
    .select(
      '*, company:companies(company_name, country, profile:profiles(full_name)), category:categories(id, name), location:locations(*)'
    )
    .in('status', ['published', 'receiving_offers'])
    .order('published_at', { ascending: false })

  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id)
  }

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }

  const { data } = await query
  return (data || []) as any
}

// --- Ver detalle de un trabajo (para instalador) ---
export async function getJobDetailForInstaller(jobId: string): Promise<{
  job: (Job & {
    company?: Company & { profile?: Pick<Profile, 'full_name'> }
    category?: Category
    location?: Location
  }) | null
  myOffer: Offer | null
}> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Obtener el trabajo
  const { data: job } = await supabase
    .from('jobs')
    .select(
      '*, company:companies(company_name, country, city, profile:profiles(full_name)), category:categories(id, name), location:locations(*)'
    )
    .eq('id', jobId)
    .in('status', ['published', 'receiving_offers', 'offer_accepted', 'coordinating', 'confirmed', 'in_progress'])
    .single()

  if (!job) return { job: null, myOffer: null }

  // Ver si ya tiene oferta en este trabajo
  let myOffer: Offer | null = null
  if (user) {
    const { data: installer } = await supabase
      .from('installers')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (installer) {
      const { data: offer } = await supabase
        .from('offers')
        .select('*')
        .eq('job_id', jobId)
        .eq('installer_id', installer.id)
        .single()

      myOffer = offer as Offer | null
    }
  }

  return { job: job as any, myOffer }
}

// --- Crear oferta ---
export async function createOffer(
  formData: Record<string, unknown>
): Promise<ActionResult> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autenticado' }

  const validation = createOfferSchema.safeParse(formData)
  if (!validation.success) {
    const firstError = validation.error.errors[0]?.message || 'Datos inválidos'
    return { success: false, error: firstError }
  }

  // Obtener installer_id
  const { data: installer } = await supabase
    .from('installers')
    .select('id, status')
    .eq('profile_id', user.id)
    .single()

  if (!installer) {
    return { success: false, error: 'Perfil de instalador no encontrado' }
  }

  if (installer.status !== 'approved') {
    return { success: false, error: 'Tu perfil debe estar aprobado para enviar ofertas' }
  }

  // Verificar que el trabajo acepte ofertas
  const { data: job } = await supabase
    .from('jobs')
    .select('id, status')
    .eq('id', validation.data.job_id)
    .in('status', ['published', 'receiving_offers'])
    .single()

  if (!job) {
    return { success: false, error: 'Este trabajo no acepta ofertas actualmente' }
  }

  // Verificar que no tenga oferta previa
  const { data: existingOffer } = await supabase
    .from('offers')
    .select('id')
    .eq('job_id', validation.data.job_id)
    .eq('installer_id', installer.id)
    .not('status', 'eq', 'withdrawn')
    .single()

  if (existingOffer) {
    return { success: false, error: 'Ya tenés una oferta activa en este trabajo' }
  }

  const {
    job_id,
    proposed_price,
    currency,
    message,
    availability_start_date,
    availability_end_date,
    estimated_duration_value,
    team_size,
  } = validation.data

  const { error } = await supabase.from('offers').insert({
    job_id,
    installer_id: installer.id,
    proposed_price,
    currency: currency || 'ARS',
    message: message || null,
    availability_start_date: availability_start_date || null,
    availability_end_date: availability_end_date || null,
    estimated_duration_value: estimated_duration_value || null,
    team_size: team_size || 1,
    status: 'sent',
    submitted_at: new Date().toISOString(),
  })

  if (error) {
    console.error('Error creando oferta:', error)
    return { success: false, error: 'Error al enviar la oferta' }
  }

  // Actualizar status del job a receiving_offers si estaba en published
  if (job.status === 'published') {
    await supabase
      .from('jobs')
      .update({ status: 'receiving_offers' })
      .eq('id', job_id)
  }

  // Incrementar offers_count manualmente
  const { data: currentJob } = await supabase
    .from('jobs')
    .select('offers_count')
    .eq('id', job_id)
    .single()

  if (currentJob) {
    await supabase
      .from('jobs')
      .update({ offers_count: (currentJob.offers_count || 0) + 1 })
      .eq('id', job_id)
  }

  revalidatePath('/instalador/ofertas')
  revalidatePath(`/instalador/trabajos/${job_id}`)

  return { success: true, message: 'Oferta enviada correctamente' }
}

// --- Mis ofertas (instalador) ---
export async function getInstallerOffers(): Promise<
  Array<
    Offer & {
      job?: Job & { company?: Company; category?: Category }
    }
  >
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
    .from('offers')
    .select(
      '*, job:jobs(*, company:companies(company_name), category:categories(name))'
    )
    .eq('installer_id', installer.id)
    .order('created_at', { ascending: false })

  return (data || []) as any
}

// --- Retirar oferta ---
export async function withdrawOffer(offerId: string): Promise<ActionResult> {
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

  if (!installer) return { success: false, error: 'Perfil no encontrado' }

  // Verificar que la oferta sea del instalador y esté en estado retirable
  const { data: offer } = await supabase
    .from('offers')
    .select('id, status')
    .eq('id', offerId)
    .eq('installer_id', installer.id)
    .single()

  if (!offer) return { success: false, error: 'Oferta no encontrada' }

  if (offer.status !== 'sent') {
    return { success: false, error: 'Solo podés retirar ofertas que estén enviadas' }
  }

  const { error } = await supabase
    .from('offers')
    .update({ status: 'withdrawn' })
    .eq('id', offerId)

  if (error) {
    return { success: false, error: 'Error al retirar la oferta' }
  }

  revalidatePath('/instalador/ofertas')
  return { success: true, message: 'Oferta retirada' }
}
