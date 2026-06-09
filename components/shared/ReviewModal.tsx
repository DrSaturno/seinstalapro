'use client'

import { useState } from 'react'
import { X, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, comment: string) => Promise<void>
  title: string
}

export function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  title,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (rating === 0) return
    setIsLoading(true)
    try {
      await onSubmit(rating, comment)
      setRating(0)
      setComment('')
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

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

        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">
          Tu opinión ayuda a mejorar la plataforma
        </p>

        {/* Estrellas */}
        <div className="flex gap-1 mb-4 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                size={32}
                className={
                  star <= (hoverRating || rating)
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-300'
                }
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-center text-sm text-gray-600 mb-4">
            {rating === 1 && 'Malo'}
            {rating === 2 && 'Regular'}
            {rating === 3 && 'Bueno'}
            {rating === 4 && 'Muy bueno'}
            {rating === 5 && 'Excelente'}
          </p>
        )}

        {/* Comentario */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comentario (opcional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Contá tu experiencia..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={rating === 0}
          >
            Enviar reseña
          </Button>
        </div>
      </div>
    </div>
  )
}
