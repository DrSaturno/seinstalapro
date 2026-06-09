// ============================================================
// MAPEO DE ESTADOS - Labels y colores para UI
// ============================================================

import type {
  JobStatus,
  OfferStatus,
  CompanyStatus,
  InstallerStatus,
  AgreementStatus,
} from '@/types/database'

type StatusConfig = {
  label: string
  color: string
  bgColor: string
}

// --- Job Status ---
export const JOB_STATUS: Record<JobStatus, StatusConfig> = {
  draft: { label: 'Borrador', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  pending_admin_approval: { label: 'Pendiente aprobación', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  published: { label: 'Publicado', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  receiving_offers: { label: 'Recibiendo ofertas', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  offer_accepted: { label: 'Oferta aceptada', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  coordinating: { label: 'Coordinando', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  confirmed: { label: 'Confirmado', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  in_progress: { label: 'En progreso', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  completed_by_installer: { label: 'Completado por instalador', color: 'text-teal-700', bgColor: 'bg-teal-100' },
  under_company_review: { label: 'En revisión', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  approved: { label: 'Aprobado', color: 'text-green-700', bgColor: 'bg-green-100' },
  rated: { label: 'Calificado', color: 'text-green-700', bgColor: 'bg-green-100' },
  cancelled: { label: 'Cancelado', color: 'text-red-700', bgColor: 'bg-red-100' },
  disputed: { label: 'En disputa', color: 'text-red-700', bgColor: 'bg-red-100' },
}

// --- Offer Status ---
export const OFFER_STATUS: Record<OfferStatus, StatusConfig> = {
  sent: { label: 'Enviada', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  withdrawn: { label: 'Retirada', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  shortlisted: { label: 'Preseleccionada', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  accepted: { label: 'Aceptada', color: 'text-green-700', bgColor: 'bg-green-100' },
  rejected: { label: 'Rechazada', color: 'text-red-700', bgColor: 'bg-red-100' },
  expired: { label: 'Expirada', color: 'text-gray-600', bgColor: 'bg-gray-100' },
}

// --- Company Status ---
export const COMPANY_STATUS: Record<CompanyStatus, StatusConfig> = {
  pending_review: { label: 'Pendiente revisión', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  verified: { label: 'Verificada', color: 'text-green-700', bgColor: 'bg-green-100' },
  rejected: { label: 'Rechazada', color: 'text-red-700', bgColor: 'bg-red-100' },
  suspended: { label: 'Suspendida', color: 'text-red-700', bgColor: 'bg-red-100' },
}

// --- Installer Status ---
export const INSTALLER_STATUS: Record<InstallerStatus, StatusConfig> = {
  draft: { label: 'Borrador', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  pending_review: { label: 'Pendiente revisión', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  approved: { label: 'Aprobado', color: 'text-green-700', bgColor: 'bg-green-100' },
  changes_requested: { label: 'Cambios solicitados', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  rejected: { label: 'Rechazado', color: 'text-red-700', bgColor: 'bg-red-100' },
  suspended: { label: 'Suspendido', color: 'text-red-700', bgColor: 'bg-red-100' },
}

// --- Agreement Status ---
export const AGREEMENT_STATUS: Record<AgreementStatus, StatusConfig> = {
  active: { label: 'Activo', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  coordinating: { label: 'Coordinando', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  confirmed: { label: 'Confirmado', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  in_progress: { label: 'En progreso', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  completed: { label: 'Completado', color: 'text-green-700', bgColor: 'bg-green-100' },
  cancelled: { label: 'Cancelado', color: 'text-red-700', bgColor: 'bg-red-100' },
  disputed: { label: 'En disputa', color: 'text-red-700', bgColor: 'bg-red-100' },
}

// --- Dispute Status ---
export const DISPUTE_STATUS: Record<string, StatusConfig> = {
  new: { label: 'Nueva', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  under_review: { label: 'En revisión', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  waiting_company: { label: 'Esperando empresa', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  waiting_installer: { label: 'Esperando instalador', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  resolved: { label: 'Resuelta', color: 'text-green-700', bgColor: 'bg-green-100' },
  closed: { label: 'Cerrada', color: 'text-gray-600', bgColor: 'bg-gray-100' },
}

// --- Notification Types ---
export const NOTIFICATION_LABELS: Record<string, string> = {
  offer_received: 'Oferta recibida',
  offer_accepted: 'Oferta aceptada',
  offer_rejected: 'Oferta rechazada',
  agreement_update: 'Actualización de acuerdo',
  dispute_opened: 'Disputa abierta',
  dispute_resolved: 'Disputa resuelta',
  review_received: 'Reseña recibida',
  job_approved: 'Trabajo aprobado',
  job_rejected: 'Trabajo rechazado',
  system: 'Sistema',
}
