import { Logo } from '@/components/ui/Logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo centrado */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        {/* Card con el formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {children}
        </div>

        {/* Footer mínimo */}
        <p className="mt-8 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Se Instala Pro. Todos los derechos
          reservados.
        </p>
      </div>
    </div>
  )
}
