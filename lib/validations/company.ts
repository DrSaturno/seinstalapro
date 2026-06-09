// ============================================================
// VALIDACIONES DE EMPRESA - Zod Schemas
// ============================================================

import { z } from 'zod'

export const companyProfileSchema = z.object({
  company_name: z
    .string()
    .min(1, 'El nombre de la empresa es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  tax_id: z
    .string()
    .max(50, 'El CUIT/CNPJ no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('Ingresá una URL válida (ej: https://ejemplo.com)')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
  country: z
    .string()
    .min(1, 'Seleccioná un país'),
  city: z
    .string()
    .max(100, 'La ciudad no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(300, 'La dirección no puede exceder 300 caracteres')
    .optional()
    .or(z.literal('')),
})

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>
