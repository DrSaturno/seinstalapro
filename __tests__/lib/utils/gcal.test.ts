import { googleCalendarUrl } from '@/lib/utils/gcal'

// ============================================================
// SDD - Agendar instalación en Google Calendar
// URL oficial de Google con evento prellenado. Eventos de día
// completo: formato YYYYMMDD/YYYYMMDD con fin EXCLUSIVO (+1 día).
// ============================================================

describe('googleCalendarUrl', () => {
  it('genera la URL de Google Calendar con el título', () => {
    const url = googleCalendarUrl({
      title: 'Instalación: Ploteo vidriera',
      startDate: '2026-07-10',
    })
    expect(url).toContain('https://calendar.google.com/calendar/render')
    expect(url).toContain('action=TEMPLATE')
    // URLSearchParams codifica espacios como '+'
    expect(url).toContain('text=Instalaci%C3%B3n%3A+Ploteo+vidriera')
  })

  it('evento de un día: el fin es el día siguiente (fin exclusivo)', () => {
    const url = googleCalendarUrl({
      title: 'Trabajo',
      startDate: '2026-07-10',
    })
    expect(url).toContain('dates=20260710%2F20260711')
  })

  it('evento de varios días: fin = último día + 1', () => {
    const url = googleCalendarUrl({
      title: 'Trabajo',
      startDate: '2026-07-10',
      endDate: '2026-07-12',
    })
    expect(url).toContain('dates=20260710%2F20260713')
  })

  it('maneja el cruce de mes en el fin exclusivo', () => {
    const url = googleCalendarUrl({
      title: 'Trabajo',
      startDate: '2026-07-31',
    })
    expect(url).toContain('dates=20260731%2F20260801')
  })

  it('incluye detalles y ubicación si se pasan', () => {
    const url = googleCalendarUrl({
      title: 'Trabajo',
      startDate: '2026-07-10',
      details: 'Empresa: Imprenta Central',
      location: 'CABA, Argentina',
    })
    expect(url).toContain('details=Empresa%3A+Imprenta+Central')
    expect(url).toContain('location=CABA%2C+Argentina')
  })

  it('omite detalles y ubicación si no se pasan', () => {
    const url = googleCalendarUrl({ title: 'Trabajo', startDate: '2026-07-10' })
    expect(url).not.toContain('details=')
    expect(url).not.toContain('location=')
  })
})
