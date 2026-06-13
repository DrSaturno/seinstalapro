// ============================================================
// VALIDACIONES DE TRABAJO - Zod Schemas
// ============================================================

import { z } from 'zod'

export const createJobSchema = z.object({
  title: z
    .string()
    .min(1, 'El titulo es obligatorio')
    .min(5, 'El titulo debe tener al menos 5 caracteres')
    .max(200, 'El titulo no puede exceder 200 caracteres'),
  description: z
    .string()
    .min(1, 'La descripcion es obligatoria')
    .min(20, 'La descripcion debe tener al menos 20 caracteres')
    .max(5000, 'La descripcion no puede exceder 5000 caracteres'),
  category_id: z
    .string()
    .uuid('Selecciona una categoria valida'),
  location_id: z
    .string()
    .uuid('Selecciona una ubicacion valida')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'La direccion no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  // Detail fields
  is_height_work: z.boolean().default(false),
  height_meters: z
    .number()
    .min(0, 'La altura no puede ser negativa')
    .max(100, 'La altura no puede exceder 100 metros')
    .optional()
    .nullable(),
  requires_special_tools: z.boolean().default(false),
  special_tools_description: z
    .string()
    .max(500, 'Maximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  special_schedule: z
    .string()
    .max(500, 'Maximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  surface_type: z
    .string()
    .max(200, 'Maximo 200 caracteres')
    .optional()
    .or(z.literal('')),
  surface_dimensions: z
    .string()
    .max(200, 'Maximo 200 caracteres')
    .optional()
    .or(z.literal('')),
  access_details: z
    .string()
    .max(500, 'Maximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  additional_notes: z
    .string()
    .max(1000, 'Maximo 1000 caracteres')
    .optional()
    .or(z.literal('')),
  urgency: z
    .enum(['low', 'normal', 'high', 'urgent'])
    .default('normal'),
  budget_min: z
    .number({ invalid_type_error: 'Ingresa un numero valido' })
    .min(0, 'El presupuesto minimo no puede ser negativo')
    .optional()
    .nullable(),
  budget_max: z
    .number({ invalid_type_error: 'Ingresa un numero valido' })
    .min(0, 'El presupuesto maximo no puede ser negativo')
    .optional()
    .nullable(),
  currency: z
    .string()
    .default('ARS'),
  start_date: z
    .string()
    .optional()
    .or(z.literal('')),
  end_date: z
    .string()
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    if (data.budget_min && data.budget_max) {
      return data.budget_min <= data.budget_max
    }
    return true
  },
  {
    message: 'El presupuesto minimo no puede ser mayor al maximo',
    path: ['budget_min'],
  }
).refine(
  (data) => {
    if (data.start_date && data.end_date) {
      return new Date(data.start_date) <= new Date(data.end_date)
    }
    return true
  },
  {
    message: 'La fecha de inicio no puede ser posterior a la fecha fin',
    path: ['start_date'],
  }
)

export type CreateJobInput = z.infer<typeof createJobSchema>

// Schema para editar (mismos campos)
export const updateJobSchema = createJobSchema

export type UpdateJobInput = z.infer<typeof updateJobSchema>
