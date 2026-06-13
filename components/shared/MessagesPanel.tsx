'use client'

// ============================================================
// PANEL DE MENSAJES - Compartido empresa/instalador
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageSquare, Send, ArrowLeft } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { getConversations, getMessages, sendMessage } from '@/lib/actions/messages'
import { formatRelativeDate } from '@/lib/utils/format'
import { AGREEMENT_STATUS } from '@/lib/utils/status'
import { useAuth } from '@/providers/AuthProvider'
import { clsx } from 'clsx'
import type { Message, AgreementStatus } from '@/types/database'

type Conversation = Awaited<ReturnType<typeof getConversations>>[number]

interface MessagesPanelProps {
  initialAgreementId?: string
}

export function MessagesPanel({ initialAgreementId }: MessagesPanelProps) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(
    initialAgreementId || null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoadingConvos, setIsLoadingConvos] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations()
      setConversations(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingConvos(false)
    }
  }, [])

  const loadMessages = useCallback(async (agreementId: string) => {
    try {
      const data = await getMessages(agreementId)
      setMessages(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingMessages(false)
    }
  }, [])

  // Cargar conversaciones al montar
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Cargar mensajes al seleccionar conversación + polling cada 15s
  useEffect(() => {
    if (!selectedId) return
    setIsLoadingMessages(true)
    loadMessages(selectedId)
    const interval = setInterval(() => loadMessages(selectedId), 15000)
    return () => clearInterval(interval)
  }, [selectedId, loadMessages])

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async () => {
    if (!selectedId || !newMessage.trim() || isSending) return

    setIsSending(true)
    const text = newMessage
    setNewMessage('')

    try {
      const result = await sendMessage(selectedId, text)
      if (result.success) {
        await loadMessages(selectedId)
        await loadConversations()
      } else {
        setNewMessage(text)
        alert(result.error || 'Error al enviar')
      }
    } catch (err) {
      setNewMessage(text)
    } finally {
      setIsSending(false)
    }
  }

  const selectedConvo = conversations.find((c) => c.agreementId === selectedId)

  if (isLoadingConvos) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200">
        <EmptyState
          icon={MessageSquare}
          title="No tenés conversaciones"
          description="Cuando se acepte una oferta y tengas un acuerdo activo, podrás coordinar la instalación desde acá."
        />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex h-[calc(100vh-220px)] min-h-[400px]">
      {/* Lista de conversaciones */}
      <div
        className={clsx(
          'w-full md:w-80 md:border-r border-gray-200 flex-col overflow-y-auto',
          selectedId ? 'hidden md:flex' : 'flex'
        )}
      >
        {conversations.map((convo) => {
          const statusConfig =
            AGREEMENT_STATUS[convo.agreementStatus as AgreementStatus]
          return (
            <button
              key={convo.agreementId}
              onClick={() => setSelectedId(convo.agreementId)}
              className={clsx(
                'flex items-start gap-3 p-4 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors',
                selectedId === convo.agreementId && 'bg-primary-50/50'
              )}
            >
              <Avatar
                fallback={convo.counterpartName}
                src={convo.counterpartAvatar || undefined}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {convo.counterpartName}
                  </p>
                  {convo.unreadCount > 0 && (
                    <span className="flex-shrink-0 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-primary-600 text-white text-[10px] font-bold px-1">
                      {convo.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {convo.jobTitle}
                </p>
                {convo.lastMessage ? (
                  <p className="text-xs text-gray-400 truncate mt-1">
                    {convo.lastMessage}
                  </p>
                ) : (
                  <p className="text-xs text-gray-300 italic mt-1">
                    Sin mensajes aún
                  </p>
                )}
                {statusConfig && (
                  <span
                    className={clsx(
                      'inline-block mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium',
                      statusConfig.bgColor,
                      statusConfig.color
                    )}
                  >
                    {statusConfig.label}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Hilo de mensajes */}
      <div
        className={clsx(
          'flex-1 flex-col',
          selectedId ? 'flex' : 'hidden md:flex'
        )}
      >
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Seleccioná una conversación</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header del hilo */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50/50">
              <button
                onClick={() => setSelectedId(null)}
                className="md:hidden p-1 text-gray-500 hover:text-gray-700"
                aria-label="Volver"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar
                fallback={selectedConvo?.counterpartName || '?'}
                src={selectedConvo?.counterpartAvatar || undefined}
                size="sm"
              />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {selectedConvo?.counterpartName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {selectedConvo?.jobTitle}
                </p>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingMessages && messages.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">
                    Todavía no hay mensajes. ¡Empezá la conversación!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === user?.id
                  return (
                    <div
                      key={msg.id}
                      className={clsx(
                        'flex',
                        isMine ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={clsx(
                          'max-w-[75%] rounded-2xl px-4 py-2',
                          isMine
                            ? 'bg-primary-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.message_text}
                        </p>
                        <p
                          className={clsx(
                            'text-[10px] mt-1',
                            isMine ? 'text-primary-100' : 'text-gray-400'
                          )}
                        >
                          {formatRelativeDate(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de envío */}
            <div className="border-t border-gray-200 p-3">
              <div className="flex items-end gap-2">
                <textarea
                  rows={1}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Escribí un mensaje..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
                  maxLength={2000}
                />
                <Button
                  onClick={handleSend}
                  isLoading={isSending}
                  disabled={!newMessage.trim()}
                  size="sm"
                  aria-label="Enviar mensaje"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
