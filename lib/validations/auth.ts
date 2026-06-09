// ============================================================
// VALIDACIONES DE AUTENTICACIÓN - Zod Schemas
// ============================================================

import { z } from 'zod'

// --- Login ---
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Ingresá un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type LoginInput = z.infer<typeof loginSchema>

// --- Signup ---
export const signupSchema = z
  .object({
    full_name: z
      .string()
      .min(1, 'El nombre es obligatorio')
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
    email: z
      .string()
      .min(1, 'El email es obligatorio')
      .email('Ingresá un email válido'),
    password: z
      .string()
      .min(1, 'La contraseña es obligatoria')
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(72, 'La contraseña no puede exceder 72 caracteres'),
    confirmPassword: z
      .string()
      .min(1, 'Confirmá tu contraseña'),
    role: z.enum(['company', 'installer'], {
      required_error: 'Seleccioná tu tipo de cuenta',
      invalid_type_error: 'Tipo de cuenta inválido',
    }),
    country_code: z
      .string()
      .min(1, 'Seleccioná tu país')
      .default('AR'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type SignupInput = z.infer<typeof signupSchema>

// --- Forgot Password ---
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Ingresá un email válido'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

// --- Reset Password ---
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'La contraseña es obligatoria')
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(72, 'La contraseña no puede exceder 72 caracteres'),
    confirmPassword: z
      .string()
      .min(1, 'Confirmá tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
