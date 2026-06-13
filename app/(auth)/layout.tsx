import { Logo } from '@/components/ui/Logo'
import { CheckCircle2, ShieldCheck, Zap, Briefcase } from 'lucide-react'
import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 lg:bg-white flex">
      {/* Columna Izquierda: Banner Promocional (Oculto en móvil, a la izquierda en lg) */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-4/12 bg-gradient-to-br from-primary-600 to-primary-900 text-white p-12 flex-col justify-start gap-8 relative overflow-hidden select-none">
        {/* Glows de decoración */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-200 bg-white/10 px-3 py-1 rounded-full border border-white/5">
            Comunidad Profesional
          </span>
          <h2 className="text-2xl font-extrabold mt-6 leading-tight">
            Haz crecer tu negocio de instalación gráfica
          </h2>
          <p className="text-sm text-primary-100 mt-2">
            La plataforma que conecta talento y proyectos sin intermediarios.
          </p>
        </div>

        {/* Beneficios */}
        <div className="space-y-6 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-white/10 border border-white/5 mt-0.5">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Mayor visibilidad</h4>
              <p className="text-xs text-primary-200 mt-0.5">
                Accede a cientos de ofertas en tu área y postula con un clic.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-white/10 border border-white/5 mt-0.5">
              <Briefcase className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Gestión profesional</h4>
              <p className="text-xs text-primary-200 mt-0.5">
                Coordina fechas, sube planos y acuerda presupuestos en un solo lugar.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-white/10 border border-white/5 mt-0.5">
              <ShieldCheck className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Seguridad y confianza</h4>
              <p className="text-xs text-primary-200 mt-0.5">
                Calificaciones reales, perfiles verificados y control de disputas.
              </p>
            </div>
          </div>
        </div>

        {/* Imagen promocional flotante */}
        <div className="relative z-10 w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-xl shadow-black/15 bg-primary-800">
          <Image
            src="/images/promo-sidebar-image.png"
            alt="Instalación Gráfica"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Columna Derecha: Formulario */}
      <div className="w-full lg:w-7/12 xl:w-8/12 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 bg-slate-50/50">
        <div className="mx-auto w-full max-w-md">
          {/* Logo centrado en móviles, alineado a la izquierda en lg */}
          <div className="flex justify-center lg:justify-start mb-8">
            <Logo size="md" />
          </div>

          {/* Tarjeta con formulario */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] p-8 md:p-10">
            {children}
          </div>

          {/* Footer mínimo */}
          <p className="mt-8 text-center lg:text-left text-xs font-semibold text-slate-400">
            &copy; {new Date().getFullYear()} Se Instala Pro &bull; Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
