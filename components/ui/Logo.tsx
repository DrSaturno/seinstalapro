import { clsx } from 'clsx'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
}

const sizeConfig = {
  sm: { icon: 'h-8 w-8', text: 'text-lg' },
  md: { icon: 'h-10 w-10', text: 'text-xl' },
  lg: { icon: 'h-14 w-14', text: 'text-3xl' },
}

export function Logo({ size = 'md', className, showText = true }: LogoProps) {
  const config = sizeConfig[size]

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      {/* Icono del logo - herramienta de instalación gráfica */}
      <div
        className={clsx(
          'flex items-center justify-center rounded-xl bg-primary-500 text-white font-bold',
          config.icon
        )}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4"
        >
          {/* Squeegee / espátula de vinilo */}
          <rect
            x="8"
            y="8"
            width="24"
            height="6"
            rx="2"
            fill="currentColor"
          />
          <rect
            x="14"
            y="14"
            width="4"
            height="18"
            rx="1"
            fill="currentColor"
          />
          <rect
            x="22"
            y="14"
            width="4"
            height="18"
            rx="1"
            fill="currentColor"
          />
          <rect
            x="10"
            y="28"
            width="20"
            height="4"
            rx="1"
            fill="currentColor"
            opacity="0.6"
          />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className={clsx(
              'font-bold text-primary-500 tracking-tight',
              config.text
            )}
          >
            Se Instala
          </span>
          <span
            className={clsx(
              'font-bold text-accent-500 -mt-1 tracking-tight',
              size === 'lg' ? 'text-lg' : 'text-sm'
            )}
          >
            PRO
          </span>
        </div>
      )}
    </div>
  )
}
