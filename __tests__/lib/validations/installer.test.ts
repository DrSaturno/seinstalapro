// ============================================================
// SDD TESTS - Installer Validations
// ============================================================

import { installerProfileSchema } from '@/lib/validations/installer'

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

