import { render, screen } from '@testing-library/react'
import { UpcomingInstalls } from '@/components/instalador/UpcomingInstalls'
import type { UpcomingInstallation } from '@/lib/actions/weather'

// ============================================================
// SDD - UpcomingInstalls (tablero del instalador)
// Próximas instalaciones con fecha, empresa, ciudad y clima.
// Aviso destacado si hay riesgo de lluvia.
// ============================================================

const BASE: UpcomingInstallation = {
  agreementId: 'a1',
  jobId: 'j1',
  jobTitle: 'Ploteo vidriera local Palermo',
  companyName: 'Imprenta Central',
  city: 'CABA',
  countryCode: 'AR',
  startDate: '2026-07-10',
  agreementStatus: 'confirmed',
  weather: {
    kind: 'sun',
    label: 'Despejado',
    tempMax: 14,
    tempMin: 5,
    precipProbability: 5,
    rainRisk: false,
  },
}

describe('UpcomingInstalls', () => {
  it('muestra título, empresa y ciudad de cada instalación', () => {
    render(<UpcomingInstalls installations={[BASE]} />)
    expect(screen.getByText('Ploteo vidriera local Palermo')).toBeInTheDocument()
    expect(screen.getByText(/Imprenta Central/)).toBeInTheDocument()
    expect(screen.getByText(/CABA/)).toBeInTheDocument()
  })

  it('muestra el pronóstico con temperaturas', () => {
    render(<UpcomingInstalls installations={[BASE]} />)
    expect(screen.getByText(/Despejado/)).toBeInTheDocument()
    expect(screen.getByText(/14°/)).toBeInTheDocument()
    expect(screen.getByText(/5°/)).toBeInTheDocument()
  })

  it('avisa cuando hay riesgo de lluvia', () => {
    const rainy: UpcomingInstallation = {
      ...BASE,
      weather: {
        kind: 'rain',
        label: 'Lluvia',
        tempMax: 12,
        tempMin: 8,
        precipProbability: 70,
        rainRisk: true,
      },
    }
    render(<UpcomingInstalls installations={[rainy]} />)
    expect(screen.getByText(/riesgo de lluvia/i)).toBeInTheDocument()
    expect(screen.getByText(/70%/)).toBeInTheDocument()
  })

  it('no muestra aviso de lluvia si no hay riesgo', () => {
    render(<UpcomingInstalls installations={[BASE]} />)
    expect(screen.queryByText(/riesgo de lluvia/i)).not.toBeInTheDocument()
  })

  it('funciona sin pronóstico (fecha lejana o sin ciudad)', () => {
    const noWeather: UpcomingInstallation = { ...BASE, weather: undefined }
    render(<UpcomingInstalls installations={[noWeather]} />)
    expect(screen.getByText('Ploteo vidriera local Palermo')).toBeInTheDocument()
  })

  it('no renderiza nada sin instalaciones próximas', () => {
    const { container } = render(<UpcomingInstalls installations={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
