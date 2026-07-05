'use client'

import { useRef, useState } from 'react'
import { X, Camera, Trash2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  validateEvidenceFiles,
  MAX_EVIDENCE_FILES,
} from '@/lib/utils/evidence'

interface CompleteJobModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: FormData) => Promise<void>
}

export function CompleteJobModal({ isOpen, onClose, onSubmit }: CompleteJobModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFilesSelected = (selected: FileList | null) => {
    if (!selected) return
    const combined = [...files, ...Array.from(selected)]
    const validation = validateEvidenceFiles(
      combined.map((f) => ({ size: f.size, type: f.type, name: f.name }))
    )
    if (!validation.valid) {
      setError(validation.error || 'Archivos inválidos')
      // Igual mostramos los que había antes; los nuevos no se agregan
      return
    }
    setError(null)
    setFiles(combined)
    if (inputRef.current) inputRef.current.value = ''
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setError(null)
  }

  const canSubmit = files.length > 0 && !error && !isLoading

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsLoading(true)
    try {
      const formData = new FormData()
      files.forEach((f) => formData.append('files', f))
      if (notes.trim()) formData.append('notes', notes.trim())
      await onSubmit(formData)
      setFiles([])
      setNotes('')
      onClose()
    } catch {
      // el caller ya mostró el error; dejamos el modal abierto para reintentar
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 size={20} className="text-emerald-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Entregar trabajo
          </h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Subí fotos del trabajo terminado como evidencia. Es obligatoria: la
          empresa la revisa antes de aprobar la entrega.
        </p>

        {/* Selector de fotos */}
        <div className="mb-3">
          <label
            htmlFor="evidence-files"
            className="flex items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed border-gray-300 px-3 py-6 text-sm text-gray-500 hover:border-primary-400 hover:text-primary-600 cursor-pointer transition-colors"
          >
            <Camera size={18} />
            Agregar fotos
          </label>
          <input
            ref={inputRef}
            id="evidence-files"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
          <p className="text-xs text-gray-400 mt-1">
            JPG, PNG o WebP · máx {MAX_EVIDENCE_FILES} fotos · 5MB c/u
          </p>
        </div>

        {/* Lista de fotos seleccionadas */}
        {files.length > 0 && (
          <ul className="mb-3 space-y-1.5">
            {files.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center justify-between gap-2 text-xs bg-slate-50 border border-slate-100 rounded-lg px-3 py-2"
              >
                <span className="truncate text-slate-600 font-medium">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-slate-400 hover:text-rose-500 shrink-0"
                  aria-label={`Quitar ${file.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}

        {/* Notas de entrega */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas de entrega (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Instalación completa, se reemplazó un panel dañado..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
            {isLoading ? 'Entregando...' : 'Entregar trabajo'}
          </Button>
        </div>
      </div>
    </div>
  )
}
