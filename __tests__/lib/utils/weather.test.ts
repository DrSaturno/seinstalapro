import {
  getWeatherCondition,
  isForecastAvailable,
  hasRainRisk,
  RAIN_RISK_THRESHOLD,
} from '@/lib/utils/weather'

// ============================================================
// SDD - Clima del día de instalación
// Open-Meteo usa códigos WMO. El pronóstico diario llega hasta
// 16 días. La lluvia es riesgo para instalaciones exteriores.
// ============================================================

describe('getWeatherCondition (códigos WMO)', () => {
  it('mapea despejado', () => {
    expect(getWeatherCondition(0).kind).toBe('sun')
    expect(getWeatherCondition(0).label).toMatch(/despejado/i)
  })

  it('mapea nublado', () => {
    expect(getWeatherCondition(3).kind).toBe('cloud')
  })

  it('mapea lluvia', () => {
    expect(getWeatherCondition(61).kind).toBe('rain')
    expect(getWeatherCondition(80).kind).toBe('rain')
  })

  it('mapea tormenta', () => {
    expect(getWeatherCondition(95).kind).toBe('storm')
  })

  it('mapea niebla', () => {
    expect(getWeatherCondition(45).kind).toBe('fog')
  })

  it('código desconocido cae en nublado como default seguro', () => {
    expect(getWeatherCondition(999).kind).toBe('cloud')
  })
})

describe('isForecastAvailable', () => {
  const today = '2026-07-05'

  it('disponible para hoy', () => {
    expect(isForecastAvailable('2026-07-05', today)).toBe(true)
  })

  it('disponible dentro de los 15 días', () => {
    expect(isForecastAvailable('2026-07-20', today)).toBe(true)
  })

  it('NO disponible más allá de 15 días', () => {
    expect(isForecastAvailable('2026-07-21', today)).toBe(false)
  })

  it('NO disponible para fechas pasadas', () => {
    expect(isForecastAvailable('2026-07-04', today)).toBe(false)
  })
})

describe('hasRainRisk (riesgo para instalación exterior)', () => {
  it('hay riesgo si la probabilidad de lluvia supera el umbral', () => {
    expect(hasRainRisk(RAIN_RISK_THRESHOLD, 0)).toBe(true)
    expect(hasRainRisk(80, 0)).toBe(true)
  })

  it('hay riesgo si la condición es lluvia o tormenta aunque la prob sea baja', () => {
    expect(hasRainRisk(10, 61)).toBe(true)
    expect(hasRainRisk(10, 95)).toBe(true)
  })

  it('sin riesgo con cielo despejado y baja probabilidad', () => {
    expect(hasRainRisk(10, 0)).toBe(false)
    expect(hasRainRisk(0, 3)).toBe(false)
  })
})
