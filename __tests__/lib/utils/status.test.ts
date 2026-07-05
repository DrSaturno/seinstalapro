// ============================================================
// SDD TESTS - Status Utils
// ============================================================

import {
  JOB_STATUS,
  COMPANY_STATUS,
  INSTALLER_STATUS,
  TEAM_MEMBERSHIP_STATUS,
  INVITATION_STATUS,
} from '@/lib/utils/status'

describe('JOB_STATUS', () => {
  it('tiene config para todos los estados de job', () => {
    const expectedStatuses = [
      'draft', 'pending_admin_approval', 'published', 'assigned',
      'coordinating', 'confirmed', 'in_progress',
      'completed_by_installer', 'under_company_review', 'approved',
      'rated', 'cancelled', 'disputed',
    ]
    expectedStatuses.forEach((status) => {
      const config = JOB_STATUS[status as keyof typeof JOB_STATUS]
      expect(config).toBeDefined()
      expect(config.label).toBeTruthy()
      expect(config.color).toBeTruthy()
      expect(config.bgColor).toBeTruthy()
    })
  })

  it('draft tiene label Borrador', () => {
    expect(JOB_STATUS.draft.label).toBe('Borrador')
  })

  it('assigned tiene label Asignado', () => {
    expect(JOB_STATUS.assigned.label).toBe('Asignado')
  })
})

describe('TEAM_MEMBERSHIP_STATUS', () => {
  it('tiene config para todos los estados de membresía', () => {
    const expectedStatuses = ['active', 'removed']
    expectedStatuses.forEach((status) => {
      const config = TEAM_MEMBERSHIP_STATUS[status as keyof typeof TEAM_MEMBERSHIP_STATUS]
      expect(config).toBeDefined()
      expect(config.label).toBeTruthy()
    })
  })
})

describe('INVITATION_STATUS', () => {
  it('tiene config para todos los estados de invitación', () => {
    const expectedStatuses = ['pending', 'accepted', 'expired', 'revoked']
    expectedStatuses.forEach((status) => {
      const config = INVITATION_STATUS[status as keyof typeof INVITATION_STATUS]
      expect(config).toBeDefined()
      expect(config.label).toBeTruthy()
    })
  })
})

describe('COMPANY_STATUS', () => {
  it('tiene config para todos los estados de empresa', () => {
    const expectedStatuses = ['pending_review', 'verified', 'rejected', 'suspended']
    expectedStatuses.forEach((status) => {
      const config = COMPANY_STATUS[status as keyof typeof COMPANY_STATUS]
      expect(config).toBeDefined()
      expect(config.label).toBeTruthy()
    })
  })
})

describe('INSTALLER_STATUS', () => {
  it('tiene config para todos los estados de instalador', () => {
    const expectedStatuses = ['draft', 'pending_review', 'approved', 'changes_requested', 'rejected', 'suspended']
    expectedStatuses.forEach((status) => {
      const config = INSTALLER_STATUS[status as keyof typeof INSTALLER_STATUS]
      expect(config).toBeDefined()
      expect(config.label).toBeTruthy()
    })
  })
})
