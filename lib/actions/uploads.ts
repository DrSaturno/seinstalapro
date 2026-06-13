'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/actions/types'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB for profile images
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function uploadAvatar(
  formData: FormData
): Promise<ActionResult & { url?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autenticado' }

  const file = formData.get('file') as File
  if (!file || file.size === 0) {
    return { success: false, error: 'No se seleccionó archivo' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'La imagen no puede superar 2MB' }
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: 'Formato no permitido. Usá JPG, PNG o WebP.' }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    console.error('Error subiendo avatar:', uploadError)
    return { success: false, error: 'Error al subir la imagen. Verificá que el bucket "avatars" exista en Supabase Storage.' }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (updateError) {
    console.error('Error actualizando avatar_url:', updateError)
    return { success: false, error: 'Imagen subida pero no se pudo actualizar el perfil' }
  }

  return { success: true, message: 'Foto de perfil actualizada', url: publicUrl }
}

export async function uploadCompanyLogo(
  formData: FormData
): Promise<ActionResult & { url?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autenticado' }

  const file = formData.get('file') as File
  if (!file || file.size === 0) {
    return { success: false, error: 'No se seleccionó archivo' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'El logo no puede superar 2MB' }
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: 'Formato no permitido. Usá JPG, PNG o WebP.' }
  }

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!company) return { success: false, error: 'Empresa no encontrada' }

  const fileExt = file.name.split('.').pop()
  const fileName = `${company.id}/${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    console.error('Error subiendo logo:', uploadError)
    return { success: false, error: 'Error al subir el logo. Verificá que el bucket "avatars" exista en Supabase Storage.' }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  const { error: updateError } = await supabase
    .from('companies')
    .update({ logo_url: publicUrl })
    .eq('id', company.id)

  if (updateError) {
    console.error('Error actualizando logo_url:', updateError)
    return { success: false, error: 'Logo subido pero no se pudo actualizar la empresa' }
  }

  return { success: true, message: 'Logo actualizado', url: publicUrl }
}
