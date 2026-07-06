'use client'

import { clsx } from 'clsx'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'primary' | 'accent' | 'green' | 'red' | 'purple'
  className?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'primary',
  className,
}: StatsCardProps) {
  return (
    <div
      className={clsx(
        'card card-hover p-6 select-none',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            {title}
          </p>
          <p className="text-3xl font-black text-slate-800 tracking-tight mt-3 leading-none">
            {value}
          </p>
          
          {description && !trend && (
            <p className="text-xs font-semibold text-slate-400 mt-2.5 leading-none">{description}</p>
          )}

          {trend && (
            <div className="flex items-center gap-1.5 mt-3.5">
              <span
                className={clsx(
                  'inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border',
                  trend.isPositive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50'
                    : 'bg-rose-50 text-rose-700 border-rose-100/50'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-[10px] font-semibold text-slate-400">vs. período anterior</span>
            </div>
          )}
        </div>

        <div
          className={clsx(
            'p-3.5 rounded-2xl flex-shrink-0 border transition-colors duration-300',
            color === 'primary' && 'bg-primary-50/80 text-primary-600 border-primary-100/50',
            color === 'accent' && 'bg-amber-50/80 text-amber-600 border-amber-100/50',
            color === 'green' && 'bg-emerald-50/80 text-emerald-600 border-emerald-100/50',
            color === 'red' && 'bg-rose-50/80 text-rose-600 border-rose-100/50',
            color === 'purple' && 'bg-purple-50/80 text-purple-600 border-purple-100/50'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
