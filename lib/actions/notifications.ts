'use server'

// ============================================================
// SERVER ACTIONS - Notificaciones
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/actions/types'
import type { Notification } from '@/types/database'

// --- Obtener notificaciones del usuario ---
export async function getUserNotifications(
  limit: number = 20,
  offset: number = 0
): Promise<{ notifications: Notification[]; unreadCount: number }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { notifications: [], unreadCount: 0 }

  // Obtener notificaciones con paginación
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Obtener conteo de no leídas
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  return {
    notifications: (notifications || []) as Notification[],
    unreadCount: count || 0,
  }
}

// --- Marcar una notificación como leída ---
export async function markNotificationRead(
  notificationId: string
): Promise<ActionResult> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autenticado' }

  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) return { success: false, error: 'Error al marcar como leída' }

  return { success: true }
}

// --- Marcar todas como leídas ---
export async function markAllNotificationsRead(): Promise<ActionResult> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autenticado' }

  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) return { success: false, error: 'Error al marcar notificaciones' }

  return { success: true, message: 'Todas las notificaciones marcadas como leídas' }
}

// --- Crear notificación (helper para otros server actions) ---
export async function createNotification(params: {
  userId: string
  type: string
  title: string
  message?: string
  relatedEntityType?: string
  relatedEntityId?: string
}): Promise<void> {
  const supabase = createClient()

  await supabase.from('notifications').insert({
    user_id: params.userId,
    notification_type: params.type,
    title: params.title,
    message: params.message || null,
    related_entity_type: params.relatedEntityType || null,
    related_entity_id: params.relatedEntityId || null,
    is_read: false,
  })
}
