'use client'

import { useEffect, useState } from 'react'
import { X, Camera, ImageOff } from 'lucide-react'
import { getAgreementEvidence, type EvidencePhoto } from '@/lib/actions/evidence'
import { formatDate } from '@/lib/utils/format'

interface EvidenceGalleryProps {
  agreementId: string
  isOpen: boolean
  onClose: () => void
}

export function EvidenceGallery({ agreementId, isOpen, onClose }: EvidenceGalleryProps) {
  const [photos, setPhotos] = useState<EvidencePhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<EvidencePhoto | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setIsLoading(true)
    setError(null)
    getAgreementEvidence(agreementId)
      .then((res) => {
        if (res.success) {
          setPhotos(res.photos || [])
        } else {
          setError(res.error || 'Error al cargar la evidencia')
        }
      })
      .catch(() => setError('Error al cargar la evidencia'))
      .finally(() => setIsLoading(false))
  }, [isOpen, agreementId])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Camera size={20} className="text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Evidencia de entrega
          </h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Fotos del trabajo terminado subidas por el instalador.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-square bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
            {error}
          </p>
        ) : photos.length === 0 ? (
          <div className="text-center py-8">
            <ImageOff className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">
              Este acuerdo todavía no tiene evidencia cargada.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setExpanded(photo)}
                className="group relative aspect-square rounded-xl overflow-hidden border border-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- signed URLs temporales, no optimizables por next/image */}
                <img
                  src={photo.signedUrl}
                  alt={photo.fileName || 'Foto de evidencia'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] px-2 py-1.5 text-left truncate">
                  {formatDate(photo.createdAt)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Foto expandida */}
        {expanded && (
          <div
            className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setExpanded(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={expanded.signedUrl}
              alt={expanded.fileName || 'Foto de evidencia'}
              className="max-w-full max-h-full rounded-xl object-contain"
            />
          </div>
        )}
      </div>
    </div>
  )
}
