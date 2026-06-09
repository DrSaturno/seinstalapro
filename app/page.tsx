import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import {
  Building2,
  Wrench,
  Shield,
  Star,
  ArrowRight,
  CheckCircle,
  MapPin,
} from 'lucide-react'

const FEATURES_EMPRESA = [
  'Publicá trabajos de instalación gráfica',
  'Recibí ofertas de instaladores verificados',
  'Coordiná fechas y precios en la plataforma',
  'Calificá y dejá reseñas',
]

const FEATURES_INSTALADOR = [
  'Accedé a trabajos de empresas reales',
  'Ofertá con tus mejores precios',
  'Construí tu reputación con reseñas',
  'Gestioná tu agenda de instalaciones',
]

const CATEGORIAS = [
  { nombre: 'Vinilos', descripcion: 'Adhesivos, ploteos, wrapping' },
  { nombre: 'Señalética', descripcion: 'Carteles, señalización corporativa' },
  { nombre: 'Rótulos', descripcion: 'Letreros comerciales' },
  { nombre: 'Lonas y Banners', descripcion: 'Impresiones gran formato' },
  { nombre: 'Letras 3D', descripcion: 'Corpóreas, letras volumétricas' },
  { nombre: 'Publicidad Exterior', descripcion: 'Vía pública, OOH' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Registrate gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              El marketplace de{' '}
              <span className="text-primary-500">instalaciones gráficas</span>{' '}
              profesionales
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Conectamos empresas que necesitan instalaciones gráficas con los
              mejores instaladores profesionales de Argentina y Brasil.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-3 text-lg font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/25"
              >
                Comenzar ahora
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#como-funciona"
                className="inline-flex items-center gap-2 px-8 py-3 text-lg font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:text-primary-600 transition-colors"
              >
                Cómo funciona
              </Link>
            </div>
          </div>
        </div>
        {/* Decoración */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-100 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2" />
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900">
            ¿Cómo funciona?
          </h2>
          <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
            Tres pasos simples para conectar tu empresa con instaladores profesionales
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Paso 1 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                Publicá tu trabajo
              </h3>
              <p className="mt-2 text-gray-600">
                Describí la instalación gráfica que necesitás, subí fotos y
                definí tu presupuesto.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-accent-100 text-accent-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                Recibí ofertas
              </h3>
              <p className="mt-2 text-gray-600">
                Instaladores verificados te envían sus propuestas con precio,
                plazo y disponibilidad.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                Coordiná y cerrá
              </h3>
              <p className="mt-2 text-gray-600">
                Elegí la mejor oferta, coordiná la fecha y calificá el trabajo
                terminado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dos columnas: Empresas e Instaladores */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card Empresas */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Para Empresas
                  </h3>
                  <p className="text-sm text-gray-500">
                    Imprentas, supermercados, estudios
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                {FEATURES_EMPRESA.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Registrá tu empresa
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Card Instaladores */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-accent-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Para Instaladores
                  </h3>
                  <p className="text-sm text-gray-500">
                    Profesionales de instalación gráfica
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                {FEATURES_INSTALADOR.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-accent-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-accent-500 rounded-lg hover:bg-accent-600 transition-colors"
              >
                Unite como instalador
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900">
            Especialistas en instalaciones gráficas
          </h2>
          <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
            Nos enfocamos exclusivamente en el mundo de la gráfica. Sin
            distracciones, sin otros rubros.
          </p>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIAS.map((cat) => (
              <div
                key={cat.nombre}
                className="p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <h4 className="font-semibold text-gray-900">{cat.nombre}</h4>
                <p className="text-sm text-gray-500 mt-1">{cat.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Shield className="h-8 w-8 text-primary-500 mx-auto" />
              <h4 className="mt-3 font-semibold text-gray-900">
                Instaladores verificados
              </h4>
              <p className="mt-1 text-sm text-gray-600">
                Cada instalador pasa por un proceso de aprobación
              </p>
            </div>
            <div>
              <Star className="h-8 w-8 text-accent-500 mx-auto" />
              <h4 className="mt-3 font-semibold text-gray-900">
                Sistema de calificaciones
              </h4>
              <p className="mt-1 text-sm text-gray-600">
                Reseñas reales de empresas satisfechas
              </p>
            </div>
            <div>
              <MapPin className="h-8 w-8 text-green-500 mx-auto" />
              <h4 className="mt-3 font-semibold text-gray-900">
                Argentina y Brasil
              </h4>
              <p className="mt-1 text-sm text-gray-600">
                Cobertura en los principales mercados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-primary-500">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Empezá hoy mismo
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Registrate gratis y conectá con los mejores profesionales de
            instalaciones gráficas.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 px-8 py-3 text-lg font-medium text-primary-600 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
          >
            Crear cuenta gratis
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Se Instala Pro. Todos los
              derechos reservados.
            </p>
            <a
              href="mailto:seinstalapro@gmail.com"
              className="text-sm hover:text-white transition-colors"
            >
              seinstalapro@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
