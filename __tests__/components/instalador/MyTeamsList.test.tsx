import { render, screen } from '@testing-library/react'
import { MyTeamsList } from '@/components/instalador/MyTeamsList'
import type { MyTeam } from '@/lib/actions/types'

// ============================================================
// SDD - MyTeamsList (dashboard del instalador)
// El instalador tiene que poder ver a qué equipos (empresas)
// pertenece, desde cuándo, y con datos de la empresa.
// ============================================================

const TEAMS: MyTeam[] = [
  {
    membershipId: 'm1',
    companyId: 'c1',
    companyName: 'Imprenta Central',
    logoUrl: undefined,
    city: 'CABA',
    country: 'AR',
    joinedAt: '2026-06-15T10:00:00Z',
  },
  {
    membershipId: 'm2',
    companyId: 'c2',
    companyName: 'Gráfica Sur',
    logoUrl: 'https://example.com/logo.png',
    city: 'Rosario',
    country: 'AR',
    joinedAt: '2026-07-01T10:00:00Z',
  },
]

describe('MyTeamsList', () => {
  describe('con equipos', () => {
    beforeEach(() => {
      render(<MyTeamsList teams={TEAMS} />)
    })

    it('muestra el título de la sección', () => {
      expect(screen.getByText(/mis equipos/i)).toBeInTheDocument()
    })

    it('muestra el nombre de cada empresa', () => {
      expect(screen.getByText('Imprenta Central')).toBeInTheDocument()
      expect(screen.getByText('Gráfica Sur')).toBeInTheDocument()
    })

    it('muestra la ubicación de cada empresa', () => {
      expect(screen.getByText(/CABA/)).toBeInTheDocument()
      expect(screen.getByText(/Rosario/)).toBeInTheDocument()
    })

    it('muestra desde cuándo es miembro', () => {
      expect(screen.getAllByText(/miembro desde/i).length).toBe(2)
    })
  })

  describe('sin equipos', () => {
    it('muestra un empty state explicando cómo sumarse', () => {
      render(<MyTeamsList teams={[]} />)
      expect(screen.getByText(/todavía no formás parte de ningún equipo/i)).toBeInTheDocument()
      expect(screen.getByText(/invitación/i)).toBeInTheDocument()
    })
  })
})
