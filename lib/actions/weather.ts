'use server'

// ============================================================
// SERVER ACTIONS - Próximas instalaciones con clima
// Pronóstico vía Open-Meteo (gratis, sin API key):
// 1. Geocoding de la ciudad del trabajo
// 2. Forecast diario para la fecha confirmada de instalación
// La lluvia importa: vinilos/adhesivos no agarran en superficie
// mojada, y el trabajo exterior se suspende con tormenta.
// ============================================================

import { createClient } from '@/lib/supabase/server'
import {
  getWeatherCondition,
  isForecastAvailable,
  hasRainRisk,
  type WeatherKind,
} from '@/lib/utils/weather'

export interface UpcomingInstallation {
  agreementId: string
  jobId: string
  jobTitle: string
  companyName: string
  city?: string
  countryCode?: string
  startDate: string
  endDate?: string
  agreementStatus: string
  weather?: {
    kind: WeatherKind
    label: string
    tempMax: number
    tempMin: number
    precipProbability: number
    rainRisk: boolean
  }
}

// Cache simple de geocoding por ciudad (dura lo que vive el proceso)
const geoCache = new Map<string, { lat: number; lon: number } | null>()

async function geocodeCity(
  city: string,
  countryCode?: string
): Promise<{ lat: number; lon: number } | null> {
  const cacheKey = `${city}|${countryCode || ''}`
  if (geoCache.has(cacheKey)) return geoCache.get(cacheKey) ?? null

  try {
    const params = new URLSearchParams({
      name: city,
      count: '1',
      language: 'es',
      format: 'json',
    })
    if (countryCode) params.set('countryCode', countryCode)

    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?${params}`,
      { next: { revalidate: 86400 } } // la ciudad no se mueve: cache 24h
    )
    if (!res.ok) throw new Error(`geocoding ${res.status}`)
    const data = await res.json()
    const result = data?.results?.[0]
    const coords = result
      ? { lat: result.latitude as number, lon: result.longitude as number }
      : null
    geoCache.set(cacheKey, coords)
    return coords
  } catch {
    geoCache.set(cacheKey, null)
    return null
  }
}

async function fetchDayForecast(
  lat: number,
  lon: number,
  dateISO: string
): Promise<UpcomingInstallation['weather'] | undefined> {
  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'auto',
      start_date: dateISO,
      end_date: dateISO,
    })

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      next: { revalidate: 3600 }, // pronóstico: cache 1h
    })
    if (!res.ok) throw new Error(`forecast ${res.status}`)
    const data = await res.json()
    const daily = data?.daily
    if (!daily?.weather_code?.length) return undefined

    const code = daily.weather_code[0] as number
    const precipProbability = (daily.precipitation_probability_max?.[0] ?? 0) as number
    const condition = getWeatherCondition(code)

    return {
      kind: condition.kind,
      label: condition.label,
      tempMax: Math.round(daily.temperature_2m_max[0]),
      tempMin: Math.round(daily.temperature_2m_min[0]),
      precipProbability,
      rainRisk: hasRainRisk(precipProbability, code),
    }
  } catch {
    return undefined
  }
}

// --- Instalador: próximas instalaciones con pronóstico ---
export async function getUpcomingInstallations(): Promise<UpcomingInstallation[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: installer } = await supabase
    .from('installers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!installer) return []

  const todayISO = new Date().toISOString().slice(0, 10)

  const { data } = await supabase
    .from('agreements')
    .select(
      'id, status, confirmed_start_date, confirmed_end_date, job:jobs(id, title, location:locations(city_name, country_code)), company:companies(company_name)'
    )
    .eq('installer_id', installer.id)
    .in('status', ['confirmed', 'in_progress'])
    .gte('confirmed_start_date', todayISO)
    .order('confirmed_start_date', { ascending: true })
    .limit(5)

  const installations: UpcomingInstallation[] = []

  for (const row of data || []) {
    const job = (row as any).job
    const company = (row as any).company
    if (!row.confirmed_start_date) continue

    const install: UpcomingInstallation = {
      agreementId: row.id,
      jobId: job?.id,
      jobTitle: job?.title || 'Trabajo',
      companyName: company?.company_name || 'Empresa',
      city: job?.location?.city_name,
      countryCode: job?.location?.country_code,
      startDate: row.confirmed_start_date,
      endDate: row.confirmed_end_date || undefined,
      agreementStatus: row.status,
    }

    // Pronóstico solo si la ciudad existe y la fecha está en rango
    if (install.city && isForecastAvailable(install.startDate, todayISO)) {
      const coords = await geocodeCity(install.city, install.countryCode)
      if (coords) {
        install.weather = await fetchDayForecast(coords.lat, coords.lon, install.startDate)
      }
    }

    installations.push(install)
  }

  return installations
}
