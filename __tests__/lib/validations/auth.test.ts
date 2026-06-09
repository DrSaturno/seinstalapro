// ============================================================
// SDD TESTS - Auth Validation Schemas
// Escritos ANTES de la implementación según SDD
// ============================================================

import {
  loginSchema,
  signupSchema,
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

describe('signupSchema', () => {
  const validData = {
    full_name: 'Juan Pérez',
    email: 'juan@ejemplo.com',
    password: 'password123',
    confirmPassword: 'password123',
    role: 'company' as const,
    country_code: 'AR',
  }

  it('acepta datos válidos para empresa', () => {
    const result = signupSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('acepta datos válidos para instalador', () => {
    const result = signupSchema.safeParse({
      ...validData,
      role: 'installer',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza nombre vacío', () => {
    const result = signupSchema.safeParse({
      ...validData,
      full_name: '',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza nombre de 1 caracter', () => {
    const result = signupSchema.safeParse({
      ...validData,
      full_name: 'A',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza contraseñas que no coinciden', () => {
    const result = signupSchema.safeParse({
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

  it('rechaza rol inválido', () => {
    const result = signupSchema.safeParse({
      ...validData,
      role: 'admin',
    })
    expect(result.success).toBe(false)
  })

  it('solo acepta roles company e installer', () => {
    const roles = ['company', 'installer']
    roles.forEach((role) => {
      const result = signupSchema.safeParse({ ...validData, role })
      expect(result.success).toBe(true)
    })

    const invalidRoles = ['admin', 'superadmin', 'user', '']
    invalidRoles.forEach((role) => {
      const result = signupSchema.safeParse({ ...validData, role })
      expect(result.success).toBe(false)
    })
  })

  it('rechaza contraseña mayor a 72 caracteres', () => {
    const longPassword = 'a'.repeat(73)
    const result = signupSchema.safeParse({
      ...validData,
      password: longPassword,
      confirmPassword: longPassword,
    })
    expect(result.success).toBe(false)
  })

  it('usa AR como país por defecto', () => {
    const result = signupSchema.safeParse({
      full_name: 'Test',
      email: 'test@test.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'company',
    })
    // country_code tiene default 'AR', pero al no enviarlo
    // el schema lo agrega automáticamente
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
