import {
  validateEvidenceFiles,
  MAX_EVIDENCE_FILES,
  MAX_EVIDENCE_SIZE_BYTES,
  ALLOWED_EVIDENCE_TYPES,
} from '@/lib/utils/evidence'
import {
  canTransitionAgreement,
  AGREEMENT_TRANSITIONS_BY_ROLE,
} from '@/lib/utils/agreement-flow'

// ============================================================
// SDD - Evidencia de entrega + transiciones de acuerdo por rol
// ============================================================

describe('validateEvidenceFiles', () => {
  const img = (overrides?: Partial<{ size: number; type: string; name: string }>) => ({
    size: 1024 * 1024,
    type: 'image/jpeg',
    name: 'foto.jpg',
    ...overrides,
  })

  it('acepta fotos válidas', () => {
    const result = validateEvidenceFiles([img(), img({ type: 'image/png' }), img({ type: 'image/webp' })])
    expect(result.valid).toBe(true)
  })

  it('rechaza si no hay archivos (evidencia obligatoria)', () => {
    const result = validateEvidenceFiles([])
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/al menos una foto/i)
  })

  it(`rechaza más de ${MAX_EVIDENCE_FILES} archivos`, () => {
    const files = Array.from({ length: MAX_EVIDENCE_FILES + 1 }, () => img())
    const result = validateEvidenceFiles(files)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/máximo/i)
  })

  it('rechaza archivos de más de 5MB', () => {
    const result = validateEvidenceFiles([img({ size: MAX_EVIDENCE_SIZE_BYTES + 1, name: 'grande.jpg' })])
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/grande\.jpg/)
    expect(result.error).toMatch(/5MB/)
  })

  it('rechaza PDFs y otros tipos (solo imágenes como evidencia)', () => {
    const result = validateEvidenceFiles([img({ type: 'application/pdf', name: 'doc.pdf' })])
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/doc\.pdf/)
  })

  it('los tipos permitidos son solo imágenes', () => {
    expect(ALLOWED_EVIDENCE_TYPES.every((t) => t.startsWith('image/'))).toBe(true)
  })
})

describe('canTransitionAgreement (transiciones por rol)', () => {
  describe('empresa', () => {
    it('puede iniciar coordinación desde active', () => {
      expect(canTransitionAgreement('company', 'active', 'coordinating')).toBe(true)
    })

    it('puede confirmar desde coordinating', () => {
      expect(canTransitionAgreement('company', 'coordinating', 'confirmed')).toBe(true)
    })

    it('puede cancelar antes de que empiece el trabajo', () => {
      expect(canTransitionAgreement('company', 'active', 'cancelled')).toBe(true)
      expect(canTransitionAgreement('company', 'coordinating', 'cancelled')).toBe(true)
      expect(canTransitionAgreement('company', 'confirmed', 'cancelled')).toBe(true)
    })

    it('NO puede cancelar un trabajo en progreso', () => {
      expect(canTransitionAgreement('company', 'in_progress', 'cancelled')).toBe(false)
    })

    it('NO puede marcar el trabajo como completado (eso es del instalador)', () => {
      expect(canTransitionAgreement('company', 'in_progress', 'completed')).toBe(false)
    })

    it('NO puede iniciar el trabajo (eso es del instalador)', () => {
      expect(canTransitionAgreement('company', 'confirmed', 'in_progress')).toBe(false)
    })
  })

  describe('instalador', () => {
    it('puede iniciar el trabajo desde confirmed', () => {
      expect(canTransitionAgreement('installer', 'confirmed', 'in_progress')).toBe(true)
    })

    it('NO puede marcar completed directamente (requiere evidencia, va por completeJobWithEvidence)', () => {
      expect(canTransitionAgreement('installer', 'in_progress', 'completed')).toBe(false)
    })

    it('NO puede cancelar acuerdos', () => {
      expect(canTransitionAgreement('installer', 'active', 'cancelled')).toBe(false)
      expect(canTransitionAgreement('installer', 'coordinating', 'cancelled')).toBe(false)
    })

    it('NO puede confirmar fechas (eso es de la empresa)', () => {
      expect(canTransitionAgreement('installer', 'coordinating', 'confirmed')).toBe(false)
    })
  })

  describe('reglas generales', () => {
    it('estados terminales no permiten transiciones', () => {
      expect(canTransitionAgreement('company', 'completed', 'cancelled')).toBe(false)
      expect(canTransitionAgreement('company', 'cancelled', 'active')).toBe(false)
      expect(canTransitionAgreement('installer', 'disputed', 'in_progress')).toBe(false)
    })

    it('no permite saltear pasos', () => {
      expect(canTransitionAgreement('company', 'active', 'confirmed')).toBe(false)
      expect(canTransitionAgreement('installer', 'active', 'in_progress')).toBe(false)
    })

    it('el mapa de transiciones cubre ambos roles', () => {
      expect(AGREEMENT_TRANSITIONS_BY_ROLE.company).toBeDefined()
      expect(AGREEMENT_TRANSITIONS_BY_ROLE.installer).toBeDefined()
    })
  })
})
