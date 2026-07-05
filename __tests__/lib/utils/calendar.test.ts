import { getMonthGrid, occursOnDay, MONTH_NAMES_ES } from '@/lib/utils/calendar'

// ============================================================
// SDD - Agenda de instalaciones (grilla mensual)
// Semana argentina: arranca en lunes.
// ============================================================

describe('getMonthGrid', () => {
  it('julio 2026 arranca en miércoles: la primera semana tiene 2 días de junio', () => {
    // 1 de julio 2026 es miércoles → lunes 29 y martes 30 de junio adelante
    const grid = getMonthGrid(2026, 6) // month 0-indexed
    expect(grid[0][0].iso).toBe('2026-06-29')
    expect(grid[0][2].iso).toBe('2026-07-01')
    expect(grid[0][2].inMonth).toBe(true)
    expect(grid[0][0].inMonth).toBe(false)
  })

  it('todas las semanas tienen 7 días', () => {
    const grid = getMonthGrid(2026, 6)
    for (const week of grid) {
      expect(week).toHaveLength(7)
    }
  })

  it('contiene todos los días del mes', () => {
    const grid = getMonthGrid(2026, 6)
    const inMonthDays = grid.flat().filter((d) => d.inMonth)
    expect(inMonthDays).toHaveLength(31) // julio tiene 31
    expect(inMonthDays[0].iso).toBe('2026-07-01')
    expect(inMonthDays[30].iso).toBe('2026-07-31')
  })

  it('febrero de año bisiesto tiene 29 días', () => {
    const grid = getMonthGrid(2028, 1)
    expect(grid.flat().filter((d) => d.inMonth)).toHaveLength(29)
  })

  it('los nombres de meses están en español', () => {
    expect(MONTH_NAMES_ES[0]).toBe('Enero')
    expect(MONTH_NAMES_ES[6]).toBe('Julio')
  })
})

describe('occursOnDay (instalación ocupa el día)', () => {
  it('true en la fecha de inicio', () => {
    expect(occursOnDay('2026-07-10', undefined, '2026-07-10')).toBe(true)
  })

  it('false en otro día si no hay fecha de fin', () => {
    expect(occursOnDay('2026-07-10', undefined, '2026-07-11')).toBe(false)
  })

  it('true en cualquier día del rango inicio-fin', () => {
    expect(occursOnDay('2026-07-10', '2026-07-12', '2026-07-11')).toBe(true)
    expect(occursOnDay('2026-07-10', '2026-07-12', '2026-07-12')).toBe(true)
  })

  it('false fuera del rango', () => {
    expect(occursOnDay('2026-07-10', '2026-07-12', '2026-07-09')).toBe(false)
    expect(occursOnDay('2026-07-10', '2026-07-12', '2026-07-13')).toBe(false)
  })
})
