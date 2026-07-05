// ============================================================
// Pipeline de trabajos: agrupa estados del circuito en columnas
// para la vista tablero de la empresa.
// Cancelados/disputados quedan fuera (no son parte del flujo).
// ============================================================

import type { Job, JobStatus } from '@/types/database'

export type PipelineColumnKey =
  | 'draft'
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'review'
  | 'done'

export const PIPELINE_COLUMNS: Array<{
  key: PipelineColumnKey
  label: string
  colorClass: string
}> = [
  { key: 'draft', label: 'Borradores', colorClass: 'bg-slate-400' },
  { key: 'open', label: 'Abiertos al equipo', colorClass: 'bg-blue-500' },
  { key: 'assigned', label: 'Asignados', colorClass: 'bg-indigo-500' },
  { key: 'in_progress', label: 'En progreso', colorClass: 'bg-purple-500' },
  { key: 'review', label: 'Para revisar', colorClass: 'bg-amber-500' },
  { key: 'done', label: 'Entregados', colorClass: 'bg-emerald-500' },
]

const STATUS_TO_COLUMN: Partial<Record<JobStatus, PipelineColumnKey>> = {
  draft: 'draft',
  pending_admin_approval: 'open', // legacy pre-pivote
  published: 'open',
  assigned: 'assigned',
  coordinating: 'assigned',
  confirmed: 'assigned',
  in_progress: 'in_progress',
  completed_by_installer: 'review',
  under_company_review: 'review',
  approved: 'done',
  rated: 'done',
  // cancelled / disputed: fuera del pipeline
}

export function groupJobsForPipeline<T extends Pick<Job, 'status'>>(
  jobs: T[]
): Record<PipelineColumnKey, T[]> {
  const groups: Record<PipelineColumnKey, T[]> = {
    draft: [],
    open: [],
    assigned: [],
    in_progress: [],
    review: [],
    done: [],
  }

  for (const job of jobs) {
    const column = STATUS_TO_COLUMN[job.status]
    if (column) groups[column].push(job)
  }

  return groups
}
