'use client'

import { clsx } from 'clsx'
import { COMPANY_STATUS } from '@/lib/utils/status'
import type { CompanyStatus } from '@/types/database'

interface CompanyStatusBadgeProps {
  status: CompanyStatus
}

export function CompanyStatusBadge({ status }: CompanyStatusBadgeProps) {
  const config = COMPANY_STATUS[status]
  if (!config) return null

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        config.bgColor,
        config.color
      )}
    >
      {config.label}
    </span>
  )
}
