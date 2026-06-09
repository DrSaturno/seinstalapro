'use server'

// ============================================================
// SERVER ACTIONS - Trabajos
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createJobSchema, type CreateJobInput } from '@/lib/validations/job'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/auth/actions'
import type { Job, JobWithCompany, Category, Location } from '@/types/database'

// --- Obtener categorías activas ---
export async function getCategories(): Promise<Category[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('order_index')

  return (data || []) as Category[]
}

// --- Obtener ubicaciones activas ---
export async function getLocations(): Promise<Location[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('country_name')
    .order('province_name')
    .order('city_name')

  return (data || []) as Location[]
}

// --- Crear trabajo ---
export async function createJob(
  data: CreateJobInput
): Promise<ActionResult & { jobId?: string }> {
  const validation = createJobSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  // Obtener company_id
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!company) {
    return { success: false, error: 'No se encontró tu empresa. Completá tu perfil primero.' }
  }

  const jobData = {
    company_id: company.id,
    title: validation.data.title,
    description: validation.data.description,
    category_id: validation.data.category_id,
    location_id: validation.data.location_id || null,
    budget_min: validation.data.budget_min || null,
    budget_max: validation.data.budget_max || null,
    currency: validation.data.currency,
    start_date: validation.data.start_date || null,
    end_date: validation.data.end_date || null,
    status: 'draft' as const,
  }

  const { data: newJob, error } = await supabase
    .from('jobs')
    .insert(jobData)
    .select('id')
    .single()

  if (error) {
    console.error('Error creando trabajo:', error)
    return { success: false, error: 'Error al crear el trabajo. Intentá de nuevo.' }
  }

  revalidatePath('/empresa/trabajos')

  return {
    success: true,
    message: 'Trabajo creado como borrador.',
    jobId: newJob.id,
  }
}

// --- Listar trabajos de la empresa ---
export async function getCompanyJobs(
  status?: string
): Promise<JobWithCompany[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Obtener company_id
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!company) return []

  let query = supabase
    .from('jobs')
    .select(`
      *,
      category:categories(*),
      location:locations(*)
    `)
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data } = await query
  return (data || []) as JobWithCompany[]
}

// --- Obtener detalle de un trabajo ---
export async function getJobDetail(
  jobId: string
): Promise<JobWithCompany | null> {
  const supabase = createClient()

  const { data } = await supabase
    .from('jobs')
    .select(`
      *,
      company:companies(*),
      category:categories(*),
      location:locations(*),
      files:job_files(*)
    `)
    .eq('id', jobId)
    .single()

  return data as JobWithCompany | null
}

// --- Enviar trabajo a revisión (draft → pending_admin_approval) ---
export async function submitJobForReview(
  jobId: string
): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  // Verificar que el trabajo pertenece al usuario
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!company) {
    return { success: false, error: 'Empresa no encontrada' }
  }

  const { data: job } = await supabase
    .from('jobs')
    .select('id, status')
    .eq('id', jobId)
    .eq('company_id', company.id)
    .single()

  if (!job) {
    return { success: false, error: 'Trabajo no encontrado' }
  }

  if (job.status !== 'draft') {
    return { success: false, error: 'Solo se pueden enviar borradores a revisión' }
  }

  const { error } = await supabase
    .from('jobs')
    .update({ status: 'pending_admin_approval' })
    .eq('id', jobId)

  if (error) {
    return { success: false, error: 'Error al enviar a revisión' }
  }

  revalidatePath('/empresa/trabajos')
  revalidatePath(`/empresa/trabajos/${jobId}`)

  return { success: true, message: 'Trabajo enviado a revisión.' }
}

// --- Cancelar trabajo ---
export async function cancelJob(jobId: string): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autenticado' }

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!company) return { success: false, error: 'Empresa no encontrada' }

  const { error } = await supabase
    .from('jobs')
    .update({ status: 'cancelled' })
    .eq('id', jobId)
    .eq('company_id', company.id)
    .in('status', ['draft', 'pending_admin_approval', 'published', 'receiving_offers'])

  if (error) {
    return { success: false, error: 'Error al cancelar el trabajo' }
  }

  revalidatePath('/empresa/trabajos')
  return { success: true, message: 'Trabajo cancelado.' }
}

// --- Subir archivos de trabajo ---
export async function uploadJobFiles(
  jobId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autenticado' }

  const files = formData.getAll('files') as File[]
  if (files.length === 0) {
    return { success: false, error: 'No se seleccionaron archivos' }
  }

  if (files.length > 10) {
    return { success: false, error: 'Máximo 10 archivos por trabajo' }
  }

  const uploadedFiles = []

  for (const file of files) {
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: `${file.name} excede el tamaño máximo de 5MB` }
    }

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: `${file.name}: tipo de archivo no permitido. Usá JPG, PNG, WebP o PDF.` }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${jobId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('job_images')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Error subiendo archivo:', uploadError)
      continue
    }

    const { data: { publicUrl } } = supabase.storage
      .from('job_images')
      .getPublicUrl(fileName)

    uploadedFiles.push({
      job_id: jobId,
      file_type: file.type.startsWith('image/') ? 'image' : 'document',
      file_url: publicUrl,
      file_name: file.name,
      file_size: file.size,
      storage_path: fileName,
      order_index: uploadedFiles.length,
    })
  }

  if (uploadedFiles.length > 0) {
    const { error: insertError } = await supabase
      .from('job_files')
      .insert(uploadedFiles)

    if (insertError) {
      console.error('Error guardando archivos:', insertError)
      return { success: false, error: 'Error al guardar los archivos' }
    }

    // Actualizar contador de archivos
    await supabase
      .from('jobs')
      .update({ files_count: uploadedFiles.length })
      .eq('id', jobId)
  }

  revalidatePath(`/empresa/trabajos/${jobId}`)

  return {
    success: true,
    message: `${uploadedFiles.length} archivo(s) subido(s) correctamente.`,
  }
}
