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

const colorStyles = {
  primary: 'bg-primary-50 text-primary-600',
  accent: 'bg-accent-50 text-accent-600',
  green: 'bg-green-50 text-green-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
}

const valueColors = {
  primary: 'text-primary-600',
  accent: 'text-accent-600',
  green: 'text-green-600',
  red: 'text-red-600',
  purple: 'text-purple-600',
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
        'bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p
            className={clsx(
              'text-3xl font-bold mt-1',
              valueColors[color]
            )}
          >
            {value}
          </p>
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
          {trend && (
            <p
              className={clsx(
                'text-xs font-medium mt-2',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}% vs. mes anterior
            </p>
          )}
        </div>
        <div
          className={clsx(
            'p-3 rounded-xl flex-shrink-0',
            colorStyles[color]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
