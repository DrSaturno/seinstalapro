'use client'

import { clsx } from 'clsx'
import { JOB_STATUS } from '@/lib/utils/status'
import type { JobStatus } from '@/types/database'

interface JobStatusBadgeProps {
  status: JobStatus
  className?: string
}

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  const config = JOB_STATUS[status]

  if (!config) return null

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.bgColor,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  )
}
