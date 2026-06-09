// ============================================================
// SDD TESTS - Company Validation Schemas
// ============================================================

import { companyProfileSchema } from '@/lib/validations/company'

describe('companyProfileSchema', () => {
  const validData = {
    company_name: 'Gráfica del Sur SRL',
    country: 'AR',
  }

  it('acepta datos válidos mínimos', () => {
    const result = companyProfileSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('acepta datos completos', () => {
    const result = companyProfileSchema.safeParse({
      ...validData,
      tax_id: '30-12345678-9',
      website: 'https://graficadelsur.com.ar',
      description: 'Empresa de impresión y cartelería',
      city: 'Buenos Aires',
      address: 'Av. Corrientes 1234',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza nombre vacío', () => {
    const result = companyProfileSchema.safeParse({
      ...validData,
      company_name: '',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza nombre de 1 caracter', () => {
    const result = companyProfileSchema.safeParse({
      ...validData,
      company_name: 'A',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza URL inválida', () => {
    const result = companyProfileSchema.safeParse({
      ...validData,
      website: 'no-es-url',
    })
    expect(result.success).toBe(false)
  })

  it('acepta website vacío', () => {
    const result = companyProfileSchema.safeParse({
      ...validData,
      website: '',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza descripción mayor a 1000 chars', () => {
    const result = companyProfileSchema.safeParse({
      ...validData,
      description: 'a'.repeat(1001),
    })
    expect(result.success).toBe(false)
  })

  it('rechaza país vacío', () => {
    const result = companyProfileSchema.safeParse({
      ...validData,
      country: '',
    })
    expect(result.success).toBe(false)
  })
})
