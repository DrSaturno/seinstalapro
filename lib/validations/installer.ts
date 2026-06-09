// ============================================================
// VALIDACIONES - Instalador y Ofertas
// ============================================================

import { z } from 'zod'

// --- Perfil de instalador ---
export const installerProfileSchema = z.object({
  bio: z
    .string()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(1000, 'La descripción no puede superar los 1000 caracteres'),
  years_of_experience: z
    .number()
    .min(0, 'Los años de experiencia no pueden ser negativos')
    .max(50, 'Los años de experiencia no pueden superar 50')
    .optional(),
  portfolio_url: z
    .string()
    .url('Ingresá una URL válida')
    .or(z.literal(''))
    .optional(),
  phone: z.string().optional(),
  country: z.string().min(1, 'El país es obligatorio'),
  city: z.string().optional(),
  coverage_zones: z.array(z.string()).optional(),
})

export type InstallerProfileInput = z.infer<typeof installerProfileSchema>

// --- Crear oferta ---
export const createOfferSchema = z
  .object({
    job_id: z.string().uuid('ID de trabajo inválido'),
    proposed_price: z
      .number()
      .positive('El precio debe ser mayor a 0'),
    currency: z.string().default('ARS'),
    message: z
      .string()
      .max(2000, 'El mensaje no puede superar los 2000 caracteres')
      .optional()
      .or(z.literal('')),
    availability_start_date: z.string().optional(),
    availability_end_date: z.string().optional(),
    estimated_duration_value: z
      .number()
      .min(0, 'La duración no puede ser negativa')
      .optional(),
    team_size: z
      .number()
      .min(1, 'El equipo debe tener al menos 1 persona')
      .max(50, 'El equipo no puede superar 50 personas')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.availability_start_date && data.availability_end_date) {
        return new Date(data.availability_start_date) <= new Date(data.availability_end_date)
      }
      return true
    },
    {
      message: 'La fecha de inicio no puede ser posterior a la fecha de fin',
      path: ['availability_end_date'],
    }
  )

export type CreateOfferInput = z.infer<typeof createOfferSchema>
