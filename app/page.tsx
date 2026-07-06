import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { Badge } from '@/components/ui/Badge'
import {
  Building2,
  Wrench,
  ArrowRight,
  CheckCircle,
  MapPin,
  Layers,
  Compass,
  Type,
  Image as ImageIcon,
  Bookmark,
  Sparkles,
  MessageSquare,
  Camera,
  Sun,
  CloudRain,
  User,
  Clock,
  ChevronRight,
  AlertTriangle,
  CalendarDays,
  ClipboardList,
} from 'lucide-react'

const CATEGORIAS = [
  {
    nombre: 'Vinilos',
    descripcion: 'Adhesivos, ploteos, wrapping y acabados',
    icon: Layers,
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-100/50',
  },
  {
    nombre: 'Señalética',
    descripcion: 'Cartelería corporativa y señalización comercial',
    icon: Compass,
    colorClass: 'text-amber-600 bg-amber-50 border-amber-100/50',
  },
  {
    nombre: 'Rótulos',
    descripcion: 'Letreros luminosos y front-lights',
    icon: Bookmark,
    colorClass: 'text-primary-600 bg-primary-50 border-primary-100/50',
  },
  {
    nombre: 'Lonas y Banners',
    descripcion: 'Impresiones gran formato OOH',
    icon: ImageIcon,
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100/50',
  },
  {
    nombre: 'Letras 3D',
    descripcion: 'Corpóreas y logotipos volumétricos',
    icon: Type,
    colorClass: 'text-violet-600 bg-violet-50 border-violet-100/50',
  },
  {
    nombre: 'Publicidad Exterior',
    descripcion: 'Publicidad exterior y grandes estructuras',
    icon: Sparkles,
    colorClass: 'text-rose-600 bg-rose-50 border-rose-100/50',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden font-sans">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f108_1px,transparent_1px),linear-gradient(to_bottom,#6366f108_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

      {/* Massive Neon Glowing Orbs */}
      <div className="absolute top-[-15%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none z-0 animate-pulse-slow" />
      <div className="absolute top-[25%] left-[-20%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-premium">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-all duration-200"
            >
              Iniciar sesión
            </Link>
            <Link
              href="mailto:nicolas.galarza87@gmail.com"
              className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-primary-600 via-indigo-600 to-indigo-500 rounded-xl hover:from-primary-700 hover:to-indigo-650 active:scale-[0.98] transition-all shadow-md shadow-primary-600/15 hover:shadow-lg hover:shadow-primary-600/25 duration-200"
            >
              Solicitar demo
            </Link>
          </div>
        </div>
      </header>

      {/* Hero: Enterprise Focus & Colorful Pipeline Board */}
      <section className="relative z-10 pt-16 pb-24 md:pt-24 md:pb-28 border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Hero Left: Copy 100% Oriented to Company / operations */}
          <div className="lg:col-span-6 flex flex-col text-left">
            <div className="inline-flex self-start items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-100/60 text-primary-700 text-xs font-bold mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
              Centro de Control para Instalaciones Gráficas
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight">
              Tomá el control de tus{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-purple-650 to-indigo-500">
                instalaciones gráficas
              </span>{' '}
              corporativas
            </h1>
            <p className="mt-6 text-base md:text-lg text-slate-500 leading-relaxed font-medium">
              El software B2B diseñado para **imprentas corporativas, agencias de trade y retailers**. Centralizá tu base de instaladores de confianza, asigná órdenes de trabajo completas y monitoreá el progreso en tiempo real con evidencia de entrega.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="mailto:nicolas.galarza87@gmail.com"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-primary-600 via-indigo-600 to-indigo-500 rounded-2xl hover:from-primary-700 hover:to-indigo-650 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/35 duration-200"
              >
                Solicitar una demo operativa
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#como-funciona"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] transition-all duration-200 shadow-sm"
              >
                Ver funcionamiento
              </Link>
            </div>
          </div>

          {/* Hero Right: Interactive Dashboard Kanban/Pipeline Simulation */}
          <div className="lg:col-span-6 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/15 to-emerald-500/10 blur-3xl rounded-3xl" />
            
            {/* Pipeline Container */}
            <div className="relative w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl overflow-hidden">
              {/* Header del tablero */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-500 font-bold tracking-wider ml-2 uppercase">Tablero de Gestión Corporativo</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-primary-950 border border-primary-800/50 text-[10px] font-bold text-primary-400">
                  5 ACTIVAS
                </div>
              </div>

              {/* Columnas Kanban */}
              <div className="grid grid-cols-3 gap-3.5">
                
                {/* Columna 1: Asignadas / Planificadas */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <span>Planificado</span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  </div>
                  
                  {/* Card 1 */}
                  <div className="bg-slate-850 border border-slate-800 p-3 rounded-2xl hover:border-indigo-500/50 transition-all duration-200">
                    <h5 className="text-xs font-bold text-slate-100 line-clamp-1">Vidriera Abasto</h5>
                    <p className="text-[9px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                      <MapPin size={10} /> CABA
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[8px] font-bold text-white border border-slate-600">
                        CN
                      </div>
                      <span className="text-[9px] text-indigo-400 font-bold uppercase">10-Jul</span>
                    </div>
                  </div>
                </div>

                {/* Columna 2: En Progreso */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <span>En Curso</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  </div>

                  {/* Card 2 */}
                  <div className="bg-slate-850 border border-slate-800 p-3 rounded-2xl hover:border-amber-500/50 transition-all duration-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-1 bg-amber-500" />
                    <h5 className="text-xs font-bold text-slate-100 line-clamp-1">Cartel Unicenter</h5>
                    <p className="text-[9px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                      <MapPin size={10} /> Martínez
                    </p>
                    {/* Alerta de clima integrada */}
                    <div className="mt-2.5 bg-amber-950/60 border border-amber-900/50 p-1.5 rounded-lg flex items-center gap-1.5">
                      <CloudRain size={11} className="text-amber-500" />
                      <span className="text-[8px] text-amber-300 font-bold">Riesgo Lluvia</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[8px] font-bold text-white border border-slate-600">
                        MA
                      </div>
                      <span className="text-[8px] text-slate-400 font-bold uppercase">70% Progreso</span>
                    </div>
                  </div>
                </div>

                {/* Columna 3: Bajo Revisión */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <span>Bajo Revisión</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>

                  {/* Card 3 */}
                  <div className="bg-slate-850 border border-slate-800 p-3 rounded-2xl hover:border-emerald-500/50 transition-all duration-200 relative">
                    <h5 className="text-xs font-bold text-slate-100 line-clamp-1">Letras 3D Recoleta</h5>
                    <p className="text-[9px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                      <MapPin size={10} /> CABA
                    </p>
                    {/* Evidencia fotográfica subida */}
                    <div className="mt-2 bg-emerald-950/60 border border-emerald-900/50 p-1.5 rounded-lg flex items-center gap-1.5">
                      <Camera size={11} className="text-emerald-500" />
                      <span className="text-[8px] text-emerald-300 font-bold">Evidencia Subida</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[8px] font-bold text-white border border-slate-600">
                        LN
                      </div>
                      <span className="text-[9px] text-emerald-400 font-black uppercase">Revisar</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Cómo funciona: Gorgeous, High-Contrast Dark Slate-950 Section */}
      <section id="como-funciona" className="py-24 bg-slate-950 text-white relative overflow-hidden">
        {/* Glow background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-primary-600/10 to-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-black text-center tracking-tight">
            Control de principio a fin para tu empresa
          </h2>
          <p className="mt-4 text-center text-slate-400 max-w-xl mx-auto leading-relaxed font-semibold">
            Centralizá y digitalizá la cadena de valor de tus instalaciones en tres pasos estratégicos.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Paso 1 */}
            <div className="bg-slate-900/60 border border-slate-800 hover:border-primary-500/50 rounded-3xl p-8 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-tr from-primary-600 to-indigo-500 text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-6 shadow-glow transition-transform group-hover:scale-105 duration-200">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                1. Centralizá tu equipo
              </h3>
              <p className="mt-3 text-sm text-slate-400 font-semibold leading-relaxed">
                Invitá a tu red de instaladores corporativos o tercerizados por correo electrónico. Ellos reciben una invitación segura para sumarse a tu equipo.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-8 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-500 text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-6 shadow-glow transition-transform group-hover:scale-105 duration-200">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                2. Asigná órdenes técnicas
              </h3>
              <p className="mt-3 text-sm text-slate-400 font-semibold leading-relaxed">
                Cargá el proyecto con planos de ensamble, fichas técnicas, medidas y fotos de pre-inspección. Asigná directamente al instalador indicado sin pérdida de información.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-8 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-indigo-500 text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-6 shadow-glow-accent transition-transform group-hover:scale-105 duration-200">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                3. Monitoreá y auditá
              </h3>
              <p className="mt-3 text-sm text-slate-400 font-semibold leading-relaxed">
                Seguí el avance con reportes climáticos automatizados y chat integrado por trabajo. Auditá la entrega final a través de fotos cargadas como evidencia directa desde la obra.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Operative Features: 100% Enterprise/Operations Oriented Grid */}
      <section className="py-24 bg-white border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Herramientas de control corporativo
            </h2>
            <p className="mt-4 text-slate-500 font-semibold leading-relaxed">
              Descubrí por qué las principales imprentas comerciales y agencias de trade marketing eligen Se Instala Pro para estructurar su flujo logístico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-slate-50/50 border border-slate-200/60 rounded-3xl p-8 hover:border-primary-200 transition-all duration-300 flex items-start gap-5">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center border border-primary-100/50 shrink-0 text-primary-600">
                <ClipboardList size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-lg leading-tight">Órdenes de Trabajo Completas</h4>
                <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                  Evitá errores de producción. Compartí planos de ensamble, fichas de producto, renders conceptuales y medidas específicas en cada trabajo. El instalador tiene todo a mano en su celular.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50/50 border border-slate-200/60 rounded-3xl p-8 hover:border-emerald-200 transition-all duration-300 flex items-start gap-5">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100/50 shrink-0 text-emerald-600">
                <Camera size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-lg leading-tight">Auditoría con Evidencia Fotográfica</h4>
                <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                  Garantizá la calidad de entrega y compartí los reportes fotográficos terminados con tu cliente corporativo en segundos. Evidencia directa de la instalación en el punto de venta.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50/50 border border-slate-200/60 rounded-3xl p-8 hover:border-amber-200 transition-all duration-300 flex items-start gap-5">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100/50 shrink-0 text-amber-600">
                <CloudRain size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-lg leading-tight">Alertas de Clima Integradas</h4>
                <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                  ¿Trabajos de vinilo en exterior? La plataforma geolocaliza el trabajo y te notifica con alertas deOpen-Meteo sobre riesgo de lluvia para que re-programes antes de que el equipo se desplace.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50/50 border border-slate-200/60 rounded-3xl p-8 hover:border-violet-200 transition-all duration-300 flex items-start gap-5">
              <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center border border-violet-100/50 shrink-0 text-violet-600">
                <MessageSquare size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-lg leading-tight">Chat Contextual y Notificaciones</h4>
                <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                  Eliminá los hilos dispersos de chat. Todo el historial de comunicación, ajustes de fecha, y dudas de materiales quedan registrados dentro de la ficha de la instalación gráfica para auditoría.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-24 bg-slate-50 border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-center text-slate-900 tracking-tight">
            Optimizado para cada tipo de producción gráfica
          </h2>
          <p className="mt-4 text-center text-slate-500 max-w-xl mx-auto leading-relaxed font-semibold">
            Configurá tareas, requerimientos de herramientas y validaciones específicas según la categoría del proyecto.
          </p>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIAS.map((cat) => {
              const Icon = cat.icon
              return (
                <div
                  key={cat.nombre}
                  className="bg-white p-6 rounded-2xl border border-slate-100 card shadow-premium card-hover flex items-start gap-4"
                >
                  <div className={`p-3.5 rounded-xl border flex-shrink-0 ${cat.colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base leading-none">{cat.nombre}</h4>
                    <p className="text-xs font-semibold text-slate-400 mt-2.5 leading-relaxed">{cat.descripcion}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Geolocation Coverage */}
      <section className="py-20 bg-white border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 border border-emerald-100/50 rounded-2xl mb-5 text-emerald-600 shadow-sm">
            <MapPin className="h-6 w-6" />
          </div>
          <h3 className="font-black text-slate-900 text-2xl tracking-tight">
            Logística regional coordinada
          </h3>
          <p className="mt-3 text-sm font-semibold text-slate-400 leading-relaxed max-w-md mx-auto">
            Optimizado para la gestión operativa en las principales zonas de **Argentina y Brasil**. Controlá instaladores locales en múltiples provincias desde una sola central.
          </p>
        </div>
      </section>

      {/* Spectacular Final CTA: Saturated Gradient Overlay */}
      <section className="py-24 bg-white flex justify-center px-6">
        <div className="max-w-5xl w-full bg-gradient-to-r from-primary-650 via-purple-650 to-emerald-500 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-primary-600/30">
          {/* Internal grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight">
              ¿Listo para ordenar tus instalaciones?
            </h2>
            <p className="mt-5 text-base text-white/90 leading-relaxed font-bold">
              Pedí tu demostración corporativa gratuita y te mostramos cómo centralizar tu operación en menos de una semana.
            </p>
            <Link
              href="mailto:nicolas.galarza87@gmail.com"
              className="mt-10 inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-slate-900 bg-white rounded-2xl hover:bg-slate-50 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl duration-200"
            >
              Solicitar demo de empresa
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          
          {/* Glowing neon sphere inside CTA */}
          <div className="absolute right-0 bottom-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/3 translate-x-1/3 pointer-events-none" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-900 pb-10">
            <Logo size="sm" />
            <div className="flex gap-6 text-sm font-semibold">
              <Link href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</Link>
              <Link href="/login" className="hover:text-white transition-colors">Ingresar</Link>
              <Link href="mailto:nicolas.galarza87@gmail.com" className="hover:text-white transition-colors">Contacto</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 text-xs">
            <p className="font-medium text-slate-500">
              &copy; {new Date().getFullYear()} Se Instala Pro. Todos los derechos reservados.
            </p>
            <a
              href="mailto:seinstalapro@gmail.com"
              className="hover:text-white transition-colors flex items-center gap-1.5 font-medium text-slate-500"
            >
              seinstalapro@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
