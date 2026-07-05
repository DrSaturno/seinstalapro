import { groupJobsForPipeline, PIPELINE_COLUMNS } from '@/lib/utils/pipeline'
import type { JobStatus } from '@/types/database'

// ============================================================
// SDD - Pipeline de trabajos (tablero por estado)
// ============================================================

const job = (id: string, status: JobStatus) => ({ id, status }) as any

describe('groupJobsForPipeline', () => {
  it('define las columnas del circuito en orden', () => {
    expect(PIPELINE_COLUMNS.map((c) => c.key)).toEqual([
      'draft',
      'open',
      'assigned',
      'in_progress',
      'review',
      'done',
    ])
  })

  it('agrupa cada estado en su columna', () => {
    const groups = groupJobsForPipeline([
      job('1', 'draft'),
      job('2', 'published'),
      job('3', 'assigned'),
      job('4', 'in_progress'),
      job('5', 'under_company_review'),
      job('6', 'approved'),
    ])
    expect(groups.draft.map((j: any) => j.id)).toEqual(['1'])
    expect(groups.open.map((j: any) => j.id)).toEqual(['2'])
    expect(groups.assigned.map((j: any) => j.id)).toEqual(['3'])
    expect(groups.in_progress.map((j: any) => j.id)).toEqual(['4'])
    expect(groups.review.map((j: any) => j.id)).toEqual(['5'])
    expect(groups.done.map((j: any) => j.id)).toEqual(['6'])
  })

  it('estados intermedios de coordinación van a "asignados"', () => {
    const groups = groupJobsForPipeline([
      job('1', 'coordinating'),
      job('2', 'confirmed'),
    ])
    expect(groups.assigned).toHaveLength(2)
  })

  it('completed_by_installer y rated se agrupan bien', () => {
    const groups = groupJobsForPipeline([
      job('1', 'completed_by_installer'),
      job('2', 'rated'),
    ])
    expect(groups.review).toHaveLength(1)
    expect(groups.done).toHaveLength(1)
  })

  it('cancelados y disputados quedan fuera del pipeline', () => {
    const groups = groupJobsForPipeline([
      job('1', 'cancelled'),
      job('2', 'disputed'),
    ])
    const total = Object.values(groups).flat().length
    expect(total).toBe(0)
  })

  it('legacy pending_admin_approval cuenta como abierto', () => {
    const groups = groupJobsForPipeline([job('1', 'pending_admin_approval')])
    expect(groups.open).toHaveLength(1)
  })
})
