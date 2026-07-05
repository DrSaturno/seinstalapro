// ============================================================
// Grilla de calendario mensual (semana arranca en LUNES)
// ============================================================

export interface CalendarDay {
  iso: string // YYYY-MM-DD
  dayOfMonth: number
  inMonth: boolean
}

export const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const WEEKDAY_NAMES_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// month es 0-indexed (0 = enero)
export function getMonthGrid(year: number, month: number): CalendarDay[][] {
  const firstOfMonth = new Date(year, month, 1)
  // getDay(): 0=domingo … queremos 0=lunes
  const offset = (firstOfMonth.getDay() + 6) % 7

  const start = new Date(year, month, 1 - offset)
  const weeks: CalendarDay[][] = []
  const cursor = new Date(start)

  // Avanzamos de a semanas hasta cubrir el mes completo
  while (true) {
    const week: CalendarDay[] = []
    for (let i = 0; i < 7; i++) {
      week.push({
        iso: toISO(cursor),
        dayOfMonth: cursor.getDate(),
        inMonth: cursor.getMonth() === month,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
    if (cursor.getMonth() !== month || cursor.getFullYear() !== year) break
  }

  return weeks
}

// ¿La instalación (rango inicio-fin) ocupa este día?
export function occursOnDay(
  startISO: string,
  endISO: string | undefined,
  dayISO: string
): boolean {
  if (!endISO) return startISO === dayISO
  return dayISO >= startISO && dayISO <= endISO
}
