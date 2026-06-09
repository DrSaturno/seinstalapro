// ============================================================
// VALIDACIONES DE TRABAJO - Zod Schemas
// ============================================================

import { z } from 'zod'

export const createJobSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es obligatorio')
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  description: z
    .string()
    .min(1, 'La descripción es obligatoria')
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(5000, 'La descripción no puede exceder 5000 caracteres'),
  category_id: z
    .string()
    .uuid('Seleccioná una categoría válida'),
  location_id: z
    .string()
    .uuid('Seleccioná una ubicación válida')
    .optional()
    .or(z.literal('')),
  budget_min: z
    .number({ invalid_type_error: 'Ingresá un número válido' })
    .min(0, 'El presupuesto mínimo no puede ser negativo')
    .optional()
    .nullable(),
  budget_max: z
    .number({ invalid_type_error: 'Ingresá un número válido' })
    .min(0, 'El presupuesto máximo no puede ser negativo')
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
    message: 'El presupuesto mínimo no puede ser mayor al máximo',
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

// Schema para editar (mismos campos pero todo opcional excepto title)
export const updateJobSchema = createJobSchema

export type UpdateJobInput = z.infer<typeof updateJobSchema>
