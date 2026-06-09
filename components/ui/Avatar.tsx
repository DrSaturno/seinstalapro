'use client'

import { clsx } from 'clsx'

interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Avatar({
  src,
  alt = '',
  fallback = '?',
  size = 'md',
  className,
}: AvatarProps) {
  const initials = fallback ? getInitials(fallback) : '?'

  if (src) {
    return (
      <img
        src={src}
        alt={alt || fallback}
        className={clsx(
          'rounded-full object-cover flex-shrink-0',
          sizeStyles[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={clsx(
        'rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium flex-shrink-0',
        sizeStyles[size],
        className
      )}
      aria-label={alt || fallback}
    >
      {initials}
    </div>
  )
}
