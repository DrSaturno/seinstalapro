// ============================================================
// Transiciones de estado de acuerdos, POR ROL.
// Cada parte solo puede mover el acuerdo en su dirección:
// - empresa: coordina, confirma fechas y puede cancelar antes
//   de que el trabajo empiece
// - instalador: inicia el trabajo; completar requiere evidencia
//   y va por completeJobWithEvidence (no por transición directa)
// ============================================================

import type { AgreementStatus } from '@/types/database'

type PartyRole = 'company' | 'installer'

export const AGREEMENT_TRANSITIONS_BY_ROLE: Record<
  PartyRole,
  Partial<Record<AgreementStatus, AgreementStatus[]>>
> = {
  company: {
    active: ['coordinating', 'cancelled'],
    coordinating: ['confirmed', 'cancelled'],
    confirmed: ['cancelled'],
  },
  installer: {
    confirmed: ['in_progress'],
    // in_progress → completed NO está acá a propósito:
    // solo se completa con evidencia vía completeJobWithEvidence
  },
}

export function canTransitionAgreement(
  role: PartyRole,
  from: AgreementStatus,
  to: AgreementStatus
): boolean {
  const allowed = AGREEMENT_TRANSITIONS_BY_ROLE[role][from] || []
  return allowed.includes(to)
}
