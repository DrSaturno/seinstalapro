// ============================================================
// SDD TESTS - Installer Validations
// ============================================================

import {
  installerProfileSchema,
  createOfferSchema,
} from '@/lib/validations/installer'

describe('installerProfileSchema', () => {
  it('acepta datos válidos mínimos', () => {
    const result = installerProfileSchema.safeParse({
      bio: 'Instalador profesional con experiencia en vinilos y señalética.',
      country: 'AR',
    })
    expect(result.success).toBe(true)
  })

  it('acepta datos completos', () => {
    const result = installerProfileSchema.safeParse({
      bio: 'Especialista en instalaciones de vinilos decorativos y señalética corporativa. 10 años de experiencia.',
      years_of_experience: 10,
      portfolio_url: 'https://miportfolio.com',
      phone: '+5491155551234',
      country: 'AR',
      city: 'Buenos Aires',
      coverage_zones: ['CABA', 'GBA Norte', 'GBA Sur'],
    })
    expect(result.success).toBe(true)
  })

  it('rechaza bio vacía', () => {
    const result = installerProfileSchema.safeParse({
      bio: '',
      country: 'AR',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza bio menor a 20 caracteres', () => {
    const result = installerProfileSchema.safeParse({
      bio: 'Hola soy instalador',
      country: 'AR',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza bio mayor a 1000 caracteres', () => {
    const result = installerProfileSchema.safeParse({
      bio: 'a'.repeat(1001),
      country: 'AR',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza URL de portfolio inválida', () => {
    const result = installerProfileSchema.safeParse({
      bio: 'Instalador profesional con experiencia.',
      portfolio_url: 'no-es-url',
      country: 'AR',
    })
    expect(result.success).toBe(false)
  })

  it('acepta portfolio_url vacío', () => {
    const result = installerProfileSchema.safeParse({
      bio: 'Instalador profesional con experiencia en vinilos.',
      portfolio_url: '',
      country: 'AR',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza años de experiencia negativos', () => {
    const result = installerProfileSchema.safeParse({
      bio: 'Instalador profesional con experiencia en vinilos.',
      years_of_experience: -1,
      country: 'AR',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza años de experiencia mayores a 50', () => {
    const result = installerProfileSchema.safeParse({
      bio: 'Instalador profesional con experiencia en vinilos.',
      years_of_experience: 51,
      country: 'AR',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza país vacío', () => {
    const result = installerProfileSchema.safeParse({
      bio: 'Instalador profesional con experiencia en vinilos.',
      country: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('createOfferSchema', () => {
  const validOffer = {
    job_id: '550e8400-e29b-41d4-a716-446655440000',
    proposed_price: 50000,
    message: 'Tengo disponibilidad inmediata para este trabajo.',
    availability_start_date: '2026-07-01',
    availability_end_date: '2026-07-05',
    estimated_duration_value: 3,
    team_size: 2,
  }

  it('acepta datos válidos completos', () => {
    const result = createOfferSchema.safeParse(validOffer)
    expect(result.success).toBe(true)
  })

  it('acepta datos mínimos (solo precio y job_id)', () => {
    const result = createOfferSchema.safeParse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      proposed_price: 25000,
    })
    expect(result.success).toBe(true)
  })

  it('rechaza precio cero', () => {
    const result = createOfferSchema.safeParse({
      ...validOffer,
      proposed_price: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rechaza precio negativo', () => {
    const result = createOfferSchema.safeParse({
      ...validOffer,
      proposed_price: -100,
    })
    expect(result.success).toBe(false)
  })

  it('rechaza job_id inválido', () => {
    const result = createOfferSchema.safeParse({
      ...validOffer,
      job_id: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza mensaje mayor a 2000 caracteres', () => {
    const result = createOfferSchema.safeParse({
      ...validOffer,
      message: 'a'.repeat(2001),
    })
    expect(result.success).toBe(false)
  })

  it('acepta mensaje vacío', () => {
    const result = createOfferSchema.safeParse({
      ...validOffer,
      message: '',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza team_size menor a 1', () => {
    const result = createOfferSchema.safeParse({
      ...validOffer,
      team_size: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rechaza team_size mayor a 50', () => {
    const result = createOfferSchema.safeParse({
      ...validOffer,
      team_size: 51,
    })
    expect(result.success).toBe(false)
  })

  it('rechaza duración estimada negativa', () => {
    const result = createOfferSchema.safeParse({
      ...validOffer,
      estimated_duration_value: -1,
    })
    expect(result.success).toBe(false)
  })

  it('usa ARS como moneda por defecto', () => {
    const result = createOfferSchema.safeParse(validOffer)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.currency).toBe('ARS')
    }
  })

  it('rechaza fecha inicio posterior a fecha fin', () => {
    const result = createOfferSchema.safeParse({
      ...validOffer,
      availability_start_date: '2026-08-01',
      availability_end_date: '2026-07-01',
    })
    expect(result.success).toBe(false)
  })
})
