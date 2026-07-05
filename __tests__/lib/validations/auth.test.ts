// ============================================================
// SDD TESTS - Auth Validation Schemas
// Escritos ANTES de la implementación según SDD
// ============================================================

import {
  loginSchema,
  createCompanySchema,
  inviteInstallerSchema,
  acceptInvitationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations/auth'

describe('loginSchema', () => {
  it('acepta datos válidos', () => {
    const result = loginSchema.safeParse({
      email: 'test@ejemplo.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza email vacío', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'password123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El email es obligatorio')
    }
  })

  it('rechaza email inválido', () => {
    const result = loginSchema.safeParse({
      email: 'no-es-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Ingresá un email válido')
    }
  })

  it('rechaza contraseña vacía', () => {
    const result = loginSchema.safeParse({
      email: 'test@ejemplo.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza contraseña menor a 6 caracteres', () => {
    const result = loginSchema.safeParse({
      email: 'test@ejemplo.com',
      password: '12345',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('al menos 6')
    }
  })
})

describe('createCompanySchema', () => {
  const validData = {
    company_name: 'Imprenta Ejemplo S.A.',
    full_name: 'Juan Pérez',
    email: 'juan@ejemplo.com',
    password: 'password123',
    country_code: 'AR',
  }

  it('acepta datos válidos', () => {
    const result = createCompanySchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rechaza nombre de empresa vacío', () => {
    const result = createCompanySchema.safeParse({
      ...validData,
      company_name: '',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza nombre de responsable vacío', () => {
    const result = createCompanySchema.safeParse({
      ...validData,
      full_name: '',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza email inválido', () => {
    const result = createCompanySchema.safeParse({
      ...validData,
      email: 'no-es-email',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza contraseña menor a 6 caracteres', () => {
    const result = createCompanySchema.safeParse({
      ...validData,
      password: '12345',
    })
    expect(result.success).toBe(false)
  })

  it('usa AR como país por defecto', () => {
    const { country_code, ...withoutCountry } = validData
    const result = createCompanySchema.safeParse(withoutCountry)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.country_code).toBe('AR')
    }
  })
})

describe('inviteInstallerSchema', () => {
  it('acepta email válido', () => {
    const result = inviteInstallerSchema.safeParse({ email: 'instalador@test.com' })
    expect(result.success).toBe(true)
  })

  it('rechaza email vacío', () => {
    const result = inviteInstallerSchema.safeParse({ email: '' })
    expect(result.success).toBe(false)
  })

  it('rechaza email inválido', () => {
    const result = inviteInstallerSchema.safeParse({ email: 'invalido' })
    expect(result.success).toBe(false)
  })
})

describe('acceptInvitationSchema', () => {
  const validData = {
    full_name: 'Pedro Instalador',
    password: 'password123',
    confirmPassword: 'password123',
    country_code: 'AR',
  }

  it('acepta datos válidos', () => {
    const result = acceptInvitationSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rechaza nombre vacío', () => {
    const result = acceptInvitationSchema.safeParse({
      ...validData,
      full_name: '',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza contraseñas que no coinciden', () => {
    const result = acceptInvitationSchema.safeParse({
      ...validData,
      confirmPassword: 'otra-password',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const confirmError = result.error.issues.find(
        (i) => i.path.includes('confirmPassword')
      )
      expect(confirmError?.message).toBe('Las contraseñas no coinciden')
    }
  })

  it('rechaza contraseña mayor a 72 caracteres', () => {
    const longPassword = 'a'.repeat(73)
    const result = acceptInvitationSchema.safeParse({
      ...validData,
      password: longPassword,
      confirmPassword: longPassword,
    })
    expect(result.success).toBe(false)
  })

  it('usa AR como país por defecto', () => {
    const { country_code, ...withoutCountry } = validData
    const result = acceptInvitationSchema.safeParse(withoutCountry)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.country_code).toBe('AR')
    }
  })
})

describe('forgotPasswordSchema', () => {
  it('acepta email válido', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'test@ejemplo.com',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza email vacío', () => {
    const result = forgotPasswordSchema.safeParse({ email: '' })
    expect(result.success).toBe(false)
  })

  it('rechaza email inválido', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'invalido' })
    expect(result.success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('acepta contraseñas válidas que coinciden', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'nuevapass123',
      confirmPassword: 'nuevapass123',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza contraseñas que no coinciden', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'nuevapass123',
      confirmPassword: 'otra-password',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza contraseña menor a 6 caracteres', () => {
    const result = resetPasswordSchema.safeParse({
      password: '12345',
      confirmPassword: '12345',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza contraseña vacía', () => {
    const result = resetPasswordSchema.safeParse({
      password: '',
      confirmPassword: '',
    })
    expect(result.success).toBe(false)
  })
})
