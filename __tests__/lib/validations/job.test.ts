// ============================================================
// SDD TESTS - Job Validation Schemas
// ============================================================

import { createJobSchema } from '@/lib/validations/job'

describe('createJobSchema', () => {
  const validData = {
    title: 'Instalación de vinilos en local comercial',
    description: 'Necesitamos instalar vinilos decorativos en un local de 50m2 en zona centro. Incluye paredes y vidrieras.',
    category_id: '550e8400-e29b-41d4-a716-446655440000',
    currency: 'ARS',
  }

  it('acepta datos válidos mínimos', () => {
    const result = createJobSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('acepta datos completos', () => {
    const result = createJobSchema.safeParse({
      ...validData,
      location_id: '550e8400-e29b-41d4-a716-446655440001',
      budget_min: 50000,
      budget_max: 100000,
      start_date: '2024-03-01',
      end_date: '2024-03-15',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza título vacío', () => {
    const result = createJobSchema.safeParse({ ...validData, title: '' })
    expect(result.success).toBe(false)
  })

  it('rechaza título menor a 5 caracteres', () => {
    const result = createJobSchema.safeParse({ ...validData, title: 'Hola' })
    expect(result.success).toBe(false)
  })

  it('rechaza descripción vacía', () => {
    const result = createJobSchema.safeParse({ ...validData, description: '' })
    expect(result.success).toBe(false)
  })

  it('rechaza descripción menor a 20 caracteres', () => {
    const result = createJobSchema.safeParse({
      ...validData,
      description: 'Corta',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza category_id inválido', () => {
    const result = createJobSchema.safeParse({
      ...validData,
      category_id: 'no-es-uuid',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza presupuesto mínimo mayor al máximo', () => {
    const result = createJobSchema.safeParse({
      ...validData,
      budget_min: 100000,
      budget_max: 50000,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const budgetError = result.error.issues.find(
        (i) => i.path.includes('budget_min')
      )
      expect(budgetError?.message).toContain('no puede ser mayor')
    }
  })

  it('acepta presupuesto mínimo igual al máximo', () => {
    const result = createJobSchema.safeParse({
      ...validData,
      budget_min: 75000,
      budget_max: 75000,
    })
    expect(result.success).toBe(true)
  })

  it('rechaza fecha inicio posterior a fecha fin', () => {
    const result = createJobSchema.safeParse({
      ...validData,
      start_date: '2024-04-01',
      end_date: '2024-03-01',
    })
    expect(result.success).toBe(false)
  })

  it('acepta presupuesto solo mínimo', () => {
    const result = createJobSchema.safeParse({
      ...validData,
      budget_min: 50000,
    })
    expect(result.success).toBe(true)
  })

  it('acepta presupuesto solo máximo', () => {
    const result = createJobSchema.safeParse({
      ...validData,
      budget_max: 100000,
    })
    expect(result.success).toBe(true)
  })

  it('rechaza presupuesto negativo', () => {
    const result = createJobSchema.safeParse({
      ...validData,
      budget_min: -1000,
    })
    expect(result.success).toBe(false)
  })

  it('usa ARS como moneda por defecto', () => {
    const result = createJobSchema.safeParse({
      title: 'Trabajo de prueba válido',
      description: 'Una descripción suficientemente larga para pasar la validación',
      category_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.currency).toBe('ARS')
    }
  })
})
