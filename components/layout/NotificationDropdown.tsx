'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, CheckCheck, Info, Star, AlertTriangle, FileCheck2, ClipboardList, XCircle, CheckCircle2, ShieldCheck, ShieldX, ShieldAlert, MessageSquare } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils/format'
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/actions/notifications'
import { useAuth } from '@/providers/AuthProvider'
import type { Notification } from '@/types/database'

const TYPE_ICONS: Record<string, { icon: typeof Bell; color: string; bgColor: string }> = {
  offer_received: { icon: ClipboardList, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  offer_accepted: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50' },
  offer_rejected: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
  agreement_update: { icon: FileCheck2, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  dispute_opened: { icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  dispute_resolved: { icon: Check, color: 'text-green-600', bgColor: 'bg-green-50' },
  review_received: { icon: Star, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  job_approved: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50' },
  job_rejected: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
  account_verified: { icon: ShieldCheck, color: 'text-green-600', bgColor: 'bg-green-50' },
  account_rejected: { icon: ShieldX, color: 'text-red-600', bgColor: 'bg-red-50' },
  account_suspended: { icon: ShieldAlert, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  message_received: { icon: MessageSquare, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  system: { icon: Info, color: 'text-gray-600', bgColor: 'bg-gray-50' },
}

export function NotificationDropdown() {
  const router = useRouter()
  const { profile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Resolver a dónde navega cada notificación según rol y entidad
  const getNotificationLink = useCallback(
    (notif: Notification): string | null => {
      const role = profile?.role
      if (!role) return null
      const base =
        role === 'company' ? '/empresa' : role === 'installer' ? '/instalador' : '/admin'

      switch (notif.related_entity_type) {
        case 'job':
          if (role === 'admin') return '/admin/trabajos'
          if (role === 'company') return `/empresa/trabajos/${notif.related_entity_id}`
          return `/instalador/trabajos/${notif.related_entity_id}`
        case 'offer':
          return role === 'company' ? '/empresa/ofertas' : '/instalador/ofertas'
        case 'agreement':
          if (role === 'admin') return '/admin/disputas'
          if (notif.notification_type === 'message_received') {
            return `${base}/mensajes?acuerdo=${notif.related_entity_id}`
          }
          return `${base}/acuerdos`
        case 'company':
          return role === 'admin' ? '/admin/empresas' : '/empresa/perfil'
        case 'installer':
          return role === 'admin' ? '/admin/instaladores' : '/instalador/perfil'
        default:
          return null
      }
    },
    [profile?.role]
  )

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await getUserNotifications(15)
      setNotifications(result.notifications)
      setUnreadCount(result.unreadCount)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Cargar al montar y cada 60 segundos
  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 60000)
    return () => clearInterval(interval)
  }, [loadNotifications])

  const handleOpen = () => {
    setIsOpen(!isOpen)
    if (!isOpen) loadNotifications()
  }

  const handleMarkRead = async (notifId: string) => {
    await markNotificationRead(notifId)
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notifId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                <CheckCheck size={14} />
                Marcar todas leídas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Bell className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No tenés notificaciones</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const typeConfig = TYPE_ICONS[notif.notification_type] || TYPE_ICONS.system
                const Icon = typeConfig.icon
                return (
                  <button
                    key={notif.id}
                    onClick={() => {
                      if (!notif.is_read) handleMarkRead(notif.id)
                      const link = getNotificationLink(notif)
                      if (link) {
                        setIsOpen(false)
                        router.push(link)
                      }
                    }}
                    className={`w-full text-left flex gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${
                      notif.is_read
                        ? 'bg-white'
                        : 'bg-primary-50/30 hover:bg-primary-50/50'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${typeConfig.bgColor}`}
                    >
                      <Icon size={14} className={typeConfig.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm line-clamp-1 ${
                          notif.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'
                        }`}
                      >
                        {notif.title}
                      </p>
                      {notif.message && (
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {notif.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatRelativeDate(notif.created_at)}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="flex-shrink-0 mt-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary-600" />
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
