'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface DisputeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, description: string) => Promise<void>
  mode: 'create' | 'resolve'
}

export function DisputeModal({ isOpen, onClose, onSubmit, mode }: DisputeModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (mode === 'create' && title.trim().length < 5) return
    if (mode === 'resolve' && title.trim().length < 10) return
    setIsLoading(true)
    try {
      await onSubmit(title.trim(), description.trim())
      setTitle('')
      setDescription('')
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const isCreate = mode === 'create'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={20} className={isCreate ? 'text-orange-500' : 'text-green-500'} />
          <h3 className="text-lg font-semibold text-gray-900">
            {isCreate ? 'Abrir disputa' : 'Resolver disputa'}
          </h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {isCreate
            ? 'Describí el problema para que un administrador lo revise.'
            : 'Ingresá la resolución de la disputa.'}
        </p>

        {/* Campo título o resolución */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isCreate ? 'Título del problema' : 'Resolución'}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              isCreate
                ? 'Ej: Trabajo no completado correctamente'
                : 'Ej: Se acordó reembolso parcial del 50%'
            }
            maxLength={200}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            {isCreate ? 'Mínimo 5 caracteres' : 'Mínimo 10 caracteres'}
          </p>
        </div>

        {/* Descripción / notas */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isCreate ? 'Descripción (opcional)' : 'Notas del admin (opcional)'}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              isCreate
                ? 'Contá con detalle lo que pasó...'
                : 'Notas internas sobre la resolución...'
            }
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant={isCreate ? 'danger' : 'primary'}
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={
              isCreate
                ? title.trim().length < 5
                : title.trim().length < 10
            }
          >
            {isCreate ? 'Abrir disputa' : 'Resolver'}
          </Button>
        </div>
      </div>
    </div>
  )
}
