// ============================================================
// SDD TESTS - Navigation Config
// ============================================================

import { getNavigation, ROLE_LABELS, ROLE_COLORS } from '@/lib/navigation'
import type { UserRole } from '@/types/database'

describe('getNavigation', () => {
  it('retorna navegación para empresa', () => {
    const nav = getNavigation('company')
    expect(nav.length).toBeGreaterThan(0)

    // Debe tener Dashboard
    const allItems = nav.flatMap((s) => s.items)
    const dashboard = allItems.find((i) => i.label === 'Dashboard')
    expect(dashboard).toBeDefined()
    expect(dashboard?.href).toBe('/empresa/dashboard')
  })

  it('retorna navegación para instalador', () => {
    const nav = getNavigation('installer')
    expect(nav.length).toBeGreaterThan(0)

    const allItems = nav.flatMap((s) => s.items)
    const dashboard = allItems.find((i) => i.label === 'Dashboard')
    expect(dashboard).toBeDefined()
    expect(dashboard?.href).toBe('/instalador/dashboard')
  })

  it('retorna navegación para admin', () => {
    const nav = getNavigation('admin')
    expect(nav.length).toBeGreaterThan(0)

    const allItems = nav.flatMap((s) => s.items)
    const dashboard = allItems.find((i) => i.label === 'Dashboard')
    expect(dashboard).toBeDefined()
    expect(dashboard?.href).toBe('/admin/dashboard')
  })

  it('superadmin usa la misma navegación que admin', () => {
    const adminNav = getNavigation('admin')
    const superadminNav = getNavigation('superadmin')
    expect(adminNav).toEqual(superadminNav)
  })

  it('empresa tiene sección de trabajos con publicar', () => {
    const nav = getNavigation('company')
    const allItems = nav.flatMap((s) => s.items)
    const publicar = allItems.find((i) => i.label === 'Publicar trabajo')
    expect(publicar).toBeDefined()
    expect(publicar?.href).toBe('/empresa/trabajos/nuevo')
  })

  it('instalador tiene buscar trabajos', () => {
    const nav = getNavigation('installer')
    const allItems = nav.flatMap((s) => s.items)
    const buscar = allItems.find((i) => i.label === 'Buscar trabajos')
    expect(buscar).toBeDefined()
  })

  it('admin tiene sección de moderación', () => {
    const nav = getNavigation('admin')
    const moderacion = nav.find((s) => s.title === 'Moderación')
    expect(moderacion).toBeDefined()
    expect(moderacion?.items.length).toBeGreaterThanOrEqual(3)
  })

  it('empresa tiene mensajes', () => {
    const nav = getNavigation('company')
    const allItems = nav.flatMap((s) => s.items)
    const mensajes = allItems.find((i) => i.label === 'Mensajes')
    expect(mensajes).toBeDefined()
  })

  it('instalador tiene mensajes', () => {
    const nav = getNavigation('installer')
    const allItems = nav.flatMap((s) => s.items)
    const mensajes = allItems.find((i) => i.label === 'Mensajes')
    expect(mensajes).toBeDefined()
  })

  it('todas las rutas de empresa empiezan con /empresa', () => {
    const nav = getNavigation('company')
    const allItems = nav.flatMap((s) => s.items)
    allItems.forEach((item) => {
      expect(item.href).toMatch(/^\/empresa/)
    })
  })

  it('todas las rutas de instalador empiezan con /instalador', () => {
    const nav = getNavigation('installer')
    const allItems = nav.flatMap((s) => s.items)
    allItems.forEach((item) => {
      expect(item.href).toMatch(/^\/instalador/)
    })
  })

  it('todas las rutas de admin empiezan con /admin', () => {
    const nav = getNavigation('admin')
    const allItems = nav.flatMap((s) => s.items)
    allItems.forEach((item) => {
      expect(item.href).toMatch(/^\/admin/)
    })
  })

  it('todos los items tienen icon definido', () => {
    const roles: UserRole[] = ['company', 'installer', 'admin', 'superadmin']
    roles.forEach((role) => {
      const nav = getNavigation(role)
      const allItems = nav.flatMap((s) => s.items)
      allItems.forEach((item) => {
        expect(item.icon).toBeDefined()
      })
    })
  })
})

describe('ROLE_LABELS', () => {
  it('tiene labels para los 4 roles', () => {
    expect(ROLE_LABELS.company).toBe('Empresa')
    expect(ROLE_LABELS.installer).toBe('Instalador')
    expect(ROLE_LABELS.admin).toBe('Administrador')
    expect(ROLE_LABELS.superadmin).toBe('Super Admin')
  })
})

describe('ROLE_COLORS', () => {
  it('tiene colores para los 4 roles', () => {
    const roles: UserRole[] = ['company', 'installer', 'admin', 'superadmin']
    roles.forEach((role) => {
      expect(ROLE_COLORS[role]).toBeDefined()
      expect(ROLE_COLORS[role].length).toBeGreaterThan(0)
    })
  })
})
