// ============================================================
// VALIDACIONES - Instalador
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

// NOTA: createOfferSchema fue eliminado en el pivot a SaaS B2B —
// ya no hay ofertas/bidding, los trabajos se asignan o se toman
// directamente (lib/actions/assignments.ts).
