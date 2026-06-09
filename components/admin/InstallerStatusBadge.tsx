'use client'

import { clsx } from 'clsx'
import { INSTALLER_STATUS } from '@/lib/utils/status'
import type { InstallerStatus } from '@/types/database'

interface InstallerStatusBadgeProps {
  status: InstallerStatus
}

export function InstallerStatusBadge({ status }: InstallerStatusBadgeProps) {
  const config = INSTALLER_STATUS[status]
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
