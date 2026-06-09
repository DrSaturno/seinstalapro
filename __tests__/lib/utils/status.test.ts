// ============================================================
// SDD TESTS - Status Utils
// ============================================================

import { JOB_STATUS, OFFER_STATUS, COMPANY_STATUS, INSTALLER_STATUS } from '@/lib/utils/status'

describe('JOB_STATUS', () => {
  it('tiene config para todos los estados de job', () => {
    const expectedStatuses = [
      'draft', 'pending_admin_approval', 'published', 'receiving_offers',
      'offer_accepted', 'coordinating', 'confirmed', 'in_progress',
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

  it('published tiene label Publicado', () => {
    expect(JOB_STATUS.published.label).toBe('Publicado')
  })
})

describe('OFFER_STATUS', () => {
  it('tiene config para todos los estados de oferta', () => {
    const expectedStatuses = ['sent', 'withdrawn', 'shortlisted', 'accepted', 'rejected', 'expired']
    expectedStatuses.forEach((status) => {
      const config = OFFER_STATUS[status as keyof typeof OFFER_STATUS]
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
