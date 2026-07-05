// ============================================================
// TYPES - Tipos compartidos para server actions
// ============================================================
// NOTA: Este archivo NO tiene 'use server'.
// Next.js 14 requiere que los archivos 'use server' SOLO exporten
// funciones async. Tipos, interfaces y constantes van acá.
// ============================================================

import type {
  Agreement,
  Job,
  Company,
  Installer,
  Profile,
  Category,
  Dispute,
} from '@/types/database'

// --- Resultado genérico de server actions ---
export type ActionResult = {
  success: boolean
  error?: string
  message?: string
}

// --- Stats del admin dashboard ---
export interface AdminStats {
  totalCompanies: number
  pendingCompanies: number
  totalInstallers: number
  pendingInstallers: number
  totalJobs: number
  pendingJobs: number
  activeJobs: number
  openDisputes: number
}

// --- Acuerdo completo con relaciones ---
export type AgreementFull = Agreement & {
  job?: Job & { category?: Category }
  company?: Company & { profile?: Profile }
  installer?: Installer & { profile?: Profile }
}

// --- Disputa completa con relaciones ---
export type DisputeFull = Dispute & {
  reporter?: Profile
  agreement?: Agreement & {
    job?: Job
    company?: Company & { profile?: Profile }
    installer?: Installer & { profile?: Profile }
  }
}

// --- Instalador asignable (miembro activo del equipo) ---
export type AssignableInstaller = Installer & {
  profile?: Profile
}

// --- Equipo al que pertenece un instalador ---
export interface MyTeam {
  membershipId: string
  companyId: string
  companyName: string
  logoUrl?: string
  city?: string
  country: string
  joinedAt: string
}
