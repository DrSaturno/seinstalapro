'use client'

import { useState, useRef } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { Avatar } from './Avatar'
import { clsx } from 'clsx'

interface AvatarUploadProps {
  currentUrl?: string | null
  fallback?: string
  onUpload: (formData: FormData) => Promise<{ success: boolean; error?: string; url?: string }>
  size?: 'md' | 'lg' | 'xl'
  label?: string
  className?: string
}

const sizeStyles = {
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
  xl: 'h-32 w-32',
}

const avatarSizeMap = {
  md: 'lg' as const,
  lg: 'lg' as const,
  xl: 'lg' as const,
}

export function AvatarUpload({
  currentUrl,
  fallback = '?',
  onUpload,
  size = 'lg',
  label = 'Cambiar foto',
  className,
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const displayUrl = previewUrl || currentUrl

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (file.size > 2 * 1024 * 1024) {
      setError('Máximo 2MB')
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Solo JPG, PNG o WebP')
      return
    }

    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)
    setIsUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await onUpload(formData)
      if (result.success && result.url) {
        setPreviewUrl(result.url)
      } else {
        setError(result.error || 'Error al subir')
        setPreviewUrl(null)
      }
    } catch {
      setError('Error inesperado')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      URL.revokeObjectURL(preview)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={clsx('flex flex-col items-center gap-2', className)}>
      <div className="relative group">
        <div className={clsx('rounded-full overflow-hidden', sizeStyles[size])}>
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={fallback}
              className="w-full h-full object-cover"
            />
          ) : (
            <Avatar fallback={fallback} size={avatarSizeMap[size]} className="!w-full !h-full !text-2xl" />
          )}
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={clsx(
            'absolute inset-0 rounded-full flex items-center justify-center transition-opacity',
            'bg-black/40 text-white',
            isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Camera className="h-6 w-6" />
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
      >
        {isUploading ? 'Subiendo...' : label}
      </button>

      {error && (
        <p className="text-xs text-red-600 text-center">{error}</p>
      )}
    </div>
  )
}
