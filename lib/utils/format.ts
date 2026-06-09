// ============================================================
// UTILIDADES DE FORMATO
// ============================================================

/**
 * Formatea un monto como moneda
 */
export function formatCurrency(
  amount: number,
  currency: string = 'ARS'
): string {
  const locale = currency === 'BRL' ? 'pt-BR' : 'es-AR'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formatea un rango de presupuesto
 */
export function formatBudgetRange(
  min?: number | null,
  max?: number | null,
  currency: string = 'ARS'
): string {
  if (!min && !max) return 'A convenir'
  if (min && !max) return `Desde ${formatCurrency(min, currency)}`
  if (!min && max) return `Hasta ${formatCurrency(max, currency)}`
  if (min === max) return formatCurrency(min!, currency)
  return `${formatCurrency(min!, currency)} - ${formatCurrency(max!, currency)}`
}

/**
 * Formatea una fecha relativa (hace X tiempo)
 */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`

  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

/**
 * Formatea una fecha como DD/MM/YYYY
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formatea una fecha como "12 de marzo de 2024"
 */
export function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Trunca texto con ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}
