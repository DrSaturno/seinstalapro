// ============================================================
// Agendar en Google Calendar vía URL oficial (sin OAuth ni API
// key: abre el evento prellenado y el usuario lo guarda en SU
// calendario con un click).
// Eventos de día completo: dates=YYYYMMDD/YYYYMMDD donde el fin
// es EXCLUSIVO (día siguiente al último día del evento).
// ============================================================

interface GoogleCalendarEvent {
  title: string
  startDate: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD (último día inclusive)
  details?: string
  location?: string
}

function compact(dateISO: string): string {
  return dateISO.replace(/-/g, '')
}

function nextDay(dateISO: string): string {
  const d = new Date(`${dateISO}T00:00:00`)
  d.setDate(d.getDate() + 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

export function googleCalendarUrl(event: GoogleCalendarEvent): string {
  const lastDay = event.endDate || event.startDate

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${compact(event.startDate)}/${nextDay(lastDay)}`,
  })

  if (event.details) params.set('details', event.details)
  if (event.location) params.set('location', event.location)

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
