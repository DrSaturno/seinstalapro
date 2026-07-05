import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

// ============================================================
// SDD - Home page (pivote SaaS B2B)
// El home debe presentar Se Instala Pro como un software de
// gestión (SaaS) para empresas del sector gráfico, NO como un
// marketplace de ofertas.
// ============================================================

describe('HomePage (SaaS B2B)', () => {
  beforeEach(() => {
    render(<HomePage />)
  })

  describe('posicionamiento SaaS', () => {
    it('no menciona "marketplace" en ningún lado', () => {
      expect(screen.queryByText(/marketplace/i)).not.toBeInTheDocument()
    })

    it('no menciona ofertas ni bidding (flujo eliminado)', () => {
      expect(screen.queryByText(/ofert/i)).not.toBeInTheDocument()
    })

    it('se presenta como software/plataforma de gestión', () => {
      expect(
        screen.getAllByText(/gestión|gestioná|software/i).length
      ).toBeGreaterThan(0)
    })

    it('mantiene el foco en instalaciones gráficas', () => {
      expect(
        screen.getAllByText(/instalaciones gráficas/i).length
      ).toBeGreaterThan(0)
    })
  })

  describe('flujo de trabajo nuevo (equipo + asignación)', () => {
    it('explica que la empresa arma su equipo invitando instaladores', () => {
      expect(screen.getAllByText(/invit/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/equipo/i).length).toBeGreaterThan(0)
    })

    it('explica la asignación directa de trabajos', () => {
      expect(screen.getAllByText(/asign/i).length).toBeGreaterThan(0)
    })

    it('menciona el seguimiento de los trabajos', () => {
      expect(screen.getAllByText(/seguimiento|segu[íi]/i).length).toBeGreaterThan(0)
    })
  })

  describe('CTAs', () => {
    it('el CTA principal es solicitar una demo', () => {
      const demoLinks = screen.getAllByRole('link', { name: /demo/i })
      expect(demoLinks.length).toBeGreaterThan(0)
    })

    it('no invita a "registrarse" ni "publicar" abiertamente (no hay signup público)', () => {
      expect(screen.queryByText(/registrate/i)).not.toBeInTheDocument()
      expect(
        screen.queryByRole('link', { name: /crear cuenta/i })
      ).not.toBeInTheDocument()
    })

    it('tiene link de inicio de sesión para clientes existentes', () => {
      const loginLinks = screen.getAllByRole('link', { name: /iniciar sesión|ingresar/i })
      expect(loginLinks.length).toBeGreaterThan(0)
      expect(loginLinks[0]).toHaveAttribute('href', '/login')
    })

    it('los instaladores se suman solo por invitación de su empresa', () => {
      expect(screen.getAllByText(/invitación/i).length).toBeGreaterThan(0)
    })
  })

  describe('contenido del sector', () => {
    it('muestra las categorías gráficas', () => {
      expect(screen.getByText('Vinilos')).toBeInTheDocument()
      expect(screen.getByText('Señalética')).toBeInTheDocument()
      expect(screen.getByText('Rótulos')).toBeInTheDocument()
      expect(screen.getByText('Lonas y Banners')).toBeInTheDocument()
      expect(screen.getByText('Letras 3D')).toBeInTheDocument()
      expect(screen.getByText('Publicidad Exterior')).toBeInTheDocument()
    })

    it('menciona la cobertura en Argentina y Brasil', () => {
      expect(screen.getAllByText(/argentina y brasil/i).length).toBeGreaterThan(0)
    })
  })
})
