'use client'

import { useState, useRef, type ChangeEvent } from 'react'
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { clsx } from 'clsx'

interface FilePreview {
  file: File
  url: string
  type: 'image' | 'document'
}

interface ImageUploaderProps {
  onUpload: (formData: FormData) => Promise<{ success: boolean; error?: string; message?: string }>
  maxFiles?: number
  maxSizeMB?: number
  existingFiles?: Array<{ file_url: string; file_name?: string; file_type: string }>
  className?: string
}

export function ImageUploader({
  onUpload,
  maxFiles = 10,
  maxSizeMB = 5,
  existingFiles = [],
  className,
}: ImageUploaderProps) {
  const [previews, setPreviews] = useState<FilePreview[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const files = Array.from(e.target.files || [])

    if (previews.length + files.length > maxFiles) {
      setError(`Máximo ${maxFiles} archivos`)
      return
    }

    const newPreviews: FilePreview[] = []

    for (const file of files) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`${file.name} excede ${maxSizeMB}MB`)
        return
      }

      const isImage = file.type.startsWith('image/')
      newPreviews.push({
        file,
        url: isImage ? URL.createObjectURL(file) : '',
        type: isImage ? 'image' : 'document',
      })
    }

    setPreviews((prev) => [...prev, ...newPreviews])

    // Reset input
    if (inputRef.current) inputRef.current.value = ''
  }

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const removed = prev[index]
      if (removed.url) URL.revokeObjectURL(removed.url)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleUpload = async () => {
    if (previews.length === 0) return

    setIsUploading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    previews.forEach((p) => formData.append('files', p.file))

    try {
      const result = await onUpload(formData)
      if (result.success) {
        setSuccess(result.message || 'Archivos subidos')
        // Limpiar previews
        previews.forEach((p) => {
          if (p.url) URL.revokeObjectURL(p.url)
        })
        setPreviews([])
      } else {
        setError(result.error || 'Error al subir archivos')
      }
    } catch (err) {
      setError('Error inesperado al subir archivos')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={className}>
      {/* Archivos existentes */}
      {existingFiles.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Archivos subidos ({existingFiles.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {existingFiles.map((file, i) => (
              <div
                key={i}
                className="relative rounded-lg border border-gray-200 overflow-hidden aspect-square"
              >
                {file.file_type === 'image' ? (
                  <img
                    src={file.file_url}
                    alt={file.file_name || `Archivo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)} className="mb-3">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} className="mb-3">
          {success}
        </Alert>
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
          'border-gray-300 hover:border-primary-400 hover:bg-primary-50/50'
        )}
      >
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-700">
          Hacé click para seleccionar archivos
        </p>
        <p className="text-xs text-gray-500 mt-1">
          JPG, PNG, WebP o PDF. Máx {maxSizeMB}MB cada uno.
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {previews.map((preview, i) => (
              <div
                key={i}
                className="relative rounded-lg border border-gray-200 overflow-hidden aspect-square group"
              >
                {preview.type === 'image' ? (
                  <img
                    src={preview.url}
                    alt={preview.file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-2">
                    <FileText className="h-6 w-6 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500 text-center truncate w-full">
                      {preview.file.name}
                    </p>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removePreview(i)
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Eliminar"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={handleUpload}
            isLoading={isUploading}
            className="mt-3"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-1" />
            Subir {previews.length} archivo{previews.length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  )
}
