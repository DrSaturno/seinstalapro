'use client'

import { clsx } from 'clsx'
import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
  showDot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100/70 text-slate-700 border-slate-200/50',
  primary: 'bg-primary-50/80 text-primary-700 border-primary-100/50',
  success: 'bg-emerald-50/80 text-emerald-700 border-emerald-100/50',
  warning: 'bg-amber-50/80 text-amber-700 border-amber-100/50',
  danger: 'bg-rose-50/80 text-rose-700 border-rose-100/50',
  info: 'bg-blue-50/80 text-blue-700 border-blue-100/50',
}

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  primary: 'bg-primary-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-blue-500',
}

export function Badge({ variant = 'default', children, className, showDot = false }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border',
        variantStyles[variant],
        className
      )}
    >
      {showDot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotStyles[variant])} />
      )}
      {children}
    </span>
  )
}
