// ============================================================
// Clima del día de instalación (Open-Meteo, códigos WMO)
// La lluvia es riesgo real para instalaciones gráficas
// exteriores: vinilos y adhesivos no agarran con superficie
// mojada. Umbral conservador.
// ============================================================

export type WeatherKind = 'sun' | 'cloud' | 'rain' | 'storm' | 'snow' | 'fog'

export interface WeatherCondition {
  kind: WeatherKind
  label: string
}

// Códigos WMO → condición (https://open-meteo.com/en/docs)
const WMO_MAP: Record<number, WeatherCondition> = {
  0: { kind: 'sun', label: 'Despejado' },
  1: { kind: 'sun', label: 'Mayormente despejado' },
  2: { kind: 'cloud', label: 'Parcialmente nublado' },
  3: { kind: 'cloud', label: 'Nublado' },
  45: { kind: 'fog', label: 'Niebla' },
  48: { kind: 'fog', label: 'Niebla con escarcha' },
  51: { kind: 'rain', label: 'Llovizna leve' },
  53: { kind: 'rain', label: 'Llovizna' },
  55: { kind: 'rain', label: 'Llovizna intensa' },
  61: { kind: 'rain', label: 'Lluvia leve' },
  63: { kind: 'rain', label: 'Lluvia' },
  65: { kind: 'rain', label: 'Lluvia intensa' },
  66: { kind: 'rain', label: 'Lluvia helada' },
  67: { kind: 'rain', label: 'Lluvia helada intensa' },
  71: { kind: 'snow', label: 'Nevada leve' },
  73: { kind: 'snow', label: 'Nevada' },
  75: { kind: 'snow', label: 'Nevada intensa' },
  77: { kind: 'snow', label: 'Granizo fino' },
  80: { kind: 'rain', label: 'Chaparrones leves' },
  81: { kind: 'rain', label: 'Chaparrones' },
  82: { kind: 'rain', label: 'Chaparrones fuertes' },
  85: { kind: 'snow', label: 'Chaparrones de nieve' },
  86: { kind: 'snow', label: 'Chaparrones de nieve fuertes' },
  95: { kind: 'storm', label: 'Tormenta' },
  96: { kind: 'storm', label: 'Tormenta con granizo' },
  99: { kind: 'storm', label: 'Tormenta fuerte con granizo' },
}

export function getWeatherCondition(wmoCode: number): WeatherCondition {
  return WMO_MAP[wmoCode] || { kind: 'cloud', label: 'Variable' }
}

// Open-Meteo pronostica hasta 16 días (hoy + 15)
export const FORECAST_MAX_DAYS_AHEAD = 15

export function isForecastAvailable(dateISO: string, todayISO: string): boolean {
  const date = new Date(`${dateISO}T00:00:00`)
  const today = new Date(`${todayISO}T00:00:00`)
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86_400_000)
  return diffDays >= 0 && diffDays <= FORECAST_MAX_DAYS_AHEAD
}

// Riesgo de lluvia para instalación exterior
export const RAIN_RISK_THRESHOLD = 40 // % de probabilidad

export function hasRainRisk(precipProbability: number, wmoCode: number): boolean {
  if (precipProbability >= RAIN_RISK_THRESHOLD) return true
  const kind = getWeatherCondition(wmoCode).kind
  return kind === 'rain' || kind === 'storm'
}
