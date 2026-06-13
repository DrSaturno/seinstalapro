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
  Layers,
  Compass,
  Type,
  Image as ImageIcon,
  Bookmark,
  Sparkles,
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
  {
    nombre: 'Vinilos',
    descripcion: 'Adhesivos, ploteos, wrapping',
    icon: Layers,
    colorClass: 'text-blue-600 bg-blue-50 border-blue-100/50',
  },
  {
    nombre: 'Señalética',
    descripcion: 'Carteles, señalización corporativa',
    icon: Compass,
    colorClass: 'text-amber-600 bg-amber-50 border-amber-100/50',
  },
  {
    nombre: 'Rótulos',
    descripcion: 'Letreros comerciales',
    icon: Bookmark,
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-100/50',
  },
  {
    nombre: 'Lonas y Banners',
    descripcion: 'Impresiones gran formato',
    icon: ImageIcon,
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100/50',
  },
  {
    nombre: 'Letras 3D',
    descripcion: 'Corpóreas, letras volumétricas',
    icon: Type,
    colorClass: 'text-violet-600 bg-violet-50 border-violet-100/50',
  },
  {
    nombre: 'Publicidad Exterior',
    descripcion: 'Vía pública, OOH',
    icon: Sparkles,
    colorClass: 'text-rose-600 bg-rose-50 border-rose-100/50',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm shadow-slate-100/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 active:scale-[0.98] transition-all shadow-md shadow-primary-600/10 hover:shadow-lg hover:shadow-primary-600/25 duration-200"
            >
              Registrate gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50/70 via-white to-amber-50/40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100/50 text-blue-700 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              El marketplace líder del sector gráfico
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
              El marketplace de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500">
                instalaciones gráficas
              </span>{' '}
              profesionales
            </h1>
            <p className="mt-6 text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Conectamos empresas que necesitan instalaciones gráficas con los
              mejores instaladores profesionales de Argentina y Brasil. Rápido, seguro y verificado.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-primary-600 rounded-2xl hover:bg-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/35 duration-200"
              >
                Comenzar ahora
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#como-funciona"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 active:scale-[0.98] transition-all duration-200"
              >
                Cómo funciona
              </Link>
            </div>
          </div>
        </div>
        {/* Decoraciones de fondo */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-200/10 rounded-full blur-3xl opacity-40 translate-y-1/3 -translate-x-1/3 pointer-events-none" />
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-slate-900 tracking-tight">
            ¿Cómo funciona?
          </h2>
          <p className="mt-4 text-center text-slate-500 max-w-xl mx-auto leading-relaxed">
            Tres pasos simples para conectar tu empresa con instaladores profesionales y calificados.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Paso 1 */}
            <div className="bg-slate-50/50 rounded-2xl p-8 border border-slate-100 hover:border-blue-100 card-hover text-center relative overflow-hidden group">
              <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 border border-blue-100/50 rounded-2xl flex items-center justify-center text-2xl font-extrabold mb-6 transition-transform group-hover:scale-110 duration-200">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Publicá tu trabajo
              </h3>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Describí la instalación gráfica que necesitás, subí fotos y
                definí tu presupuesto estimado.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="bg-slate-50/50 rounded-2xl p-8 border border-slate-100 hover:border-amber-100 card-hover text-center relative overflow-hidden group">
              <div className="w-16 h-16 mx-auto bg-amber-50 text-amber-600 border border-amber-100/50 rounded-2xl flex items-center justify-center text-2xl font-extrabold mb-6 transition-transform group-hover:scale-110 duration-200">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Recibí ofertas
              </h3>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Instaladores verificados te envían sus propuestas detalladas con precio,
                plazo y disponibilidad.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="bg-slate-50/50 rounded-2xl p-8 border border-slate-100 hover:border-emerald-100 card-hover text-center relative overflow-hidden group">
              <div className="w-16 h-16 mx-auto bg-emerald-50 text-emerald-600 border border-emerald-100/50 rounded-2xl flex items-center justify-center text-2xl font-extrabold mb-6 transition-transform group-hover:scale-110 duration-200">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Coordiná y cerrá
              </h3>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Elegí la mejor oferta, coordiná la fecha por chat, y calificá la calidad del trabajo terminado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dos columnas: Empresas e Instaladores */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Card Empresas */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] card-hover flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-blue-50 border border-blue-100/50 rounded-2xl flex items-center justify-center">
                    <Building2 className="h-7 w-7 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      Para Empresas
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                      Imprentas, locales, agencias
                    </p>
                  </div>
                </div>
                <ul className="space-y-4">
                  {FEATURES_EMPRESA.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-600 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/signup"
                className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 active:scale-[0.98] transition-all shadow-md shadow-primary-600/10 hover:shadow-lg hover:shadow-primary-600/25 duration-200"
              >
                Registrá tu empresa
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Card Instaladores */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] card-hover flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-amber-50 border border-amber-100/50 rounded-2xl flex items-center justify-center">
                    <Wrench className="h-7 w-7 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      Para Instaladores
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                      Profesionales de colocación gráfica
                    </p>
                  </div>
                </div>
                <ul className="space-y-4">
                  {FEATURES_INSTALADOR.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-600 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/signup"
                className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-amber-600 rounded-xl hover:bg-amber-700 active:scale-[0.98] transition-all shadow-md shadow-amber-600/10 hover:shadow-lg hover:shadow-amber-600/25 duration-200"
              >
                Unite como instalador
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-slate-900 tracking-tight">
            Especialistas en instalaciones gráficas
          </h2>
          <p className="mt-4 text-center text-slate-500 max-w-xl mx-auto leading-relaxed">
            Nos enfocamos exclusivamente en el sector gráfico. Conectamos con profesionales especializados en cada nicho.
          </p>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIAS.map((cat) => {
              const Icon = cat.icon
              return (
                <div
                  key={cat.nombre}
                  className="bg-white p-6 rounded-2xl border border-slate-100 card-hover flex items-start gap-4"
                >
                  <div className={`p-3 rounded-xl border flex-shrink-0 ${cat.colorClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{cat.nombre}</h4>
                    <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{cat.descripcion}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="h-7 w-7 text-primary-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg">
                Instaladores verificados
              </h4>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-xs">
                Validamos antecedentes, documentación y portfolio de cada instalador.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
                <Star className="h-7 w-7 text-amber-500" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg">
                Sistema de calificaciones
              </h4>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-xs">
                Calificaciones reales basadas en proyectos finalizados en la plataforma.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                <MapPin className="h-7 w-7 text-emerald-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg">
                Argentina y Brasil
              </h4>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-xs">
                Cobertura geográfica amplia en las principales zonas comerciales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-white flex justify-center px-6">
        <div className="max-w-5xl w-full bg-gradient-to-r from-primary-600 to-blue-700 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-xl shadow-primary-600/10">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              ¿Listo para simplificar tus instalaciones?
            </h2>
            <p className="mt-4 text-base text-blue-100 leading-relaxed">
              Registrate sin costo hoy mismo. Publicá tu primer proyecto en minutos y conectá con instaladores calificados.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-primary-700 bg-white rounded-2xl hover:bg-slate-50 active:scale-[0.98] transition-all shadow-lg shadow-black/5 hover:shadow-xl duration-200"
            >
              Crear cuenta gratis
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          {/* Circulo decorativo interno */}
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-3xl translate-y-1/3 translate-x-1/3 pointer-events-none" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-10">
            <Logo size="sm" />
            <div className="flex gap-6 text-sm font-semibold">
              <Link href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</Link>
              <Link href="/login" className="hover:text-white transition-colors">Ingresar</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Registrarse</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 text-xs">
            <p>
              &copy; {new Date().getFullYear()} Se Instala Pro. Todos los derechos reservados.
            </p>
            <a
              href="mailto:seinstalapro@gmail.com"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              seinstalapro@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
