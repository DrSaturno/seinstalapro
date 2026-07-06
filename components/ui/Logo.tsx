import { clsx } from 'clsx'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
}

const sizeConfig = {
  sm: { icon: 'h-8 w-8 rounded-lg', text: 'text-base font-bold' },
  md: { icon: 'h-10 w-10 rounded-xl', text: 'text-lg font-extrabold' },
  lg: { icon: 'h-14 w-14 rounded-2xl', text: 'text-2xl font-black' },
}

export function Logo({ size = 'md', className, showText = true }: LogoProps) {
  const config = sizeConfig[size]

  return (
    <div className={clsx('flex items-center gap-2.5 select-none', className)}>
      {/* Icono del logo - espátula de vinilo abstracta y moderna con gradiente */}
      <div
        className={clsx(
          'flex items-center justify-center bg-gradient-to-tr from-primary-600 to-indigo-400 text-white shadow-md shadow-primary-500/10 transition-transform duration-300 hover:scale-105',
          config.icon
        )}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7/12 h-7/12"
        >
          {/* Squeegee / espátula de vinilo minimalista y moderna */}
          <path
            d="M8 12C8 10.3431 9.34315 9 11 9H29C30.6569 9 32 10.3431 32 12V15H8V12Z"
            fill="currentColor"
          />
          <path
            d="M10 27H30V30C30 30.5523 29.5523 31 29 31H11C10.4477 31 10 30.5523 10 30V27Z"
            fill="currentColor"
            fillOpacity="0.4"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15 15H17V27H15V15ZM23 15H25V27H23V15Z"
            fill="currentColor"
            fillOpacity="0.8"
          />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className={clsx(
              'text-slate-900 tracking-tight font-extrabold',
              config.text
            )}
          >
            Se Instala
          </span>
          <span
            className={clsx(
              'font-black bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent tracking-widest -mt-0.5',
              size === 'lg' ? 'text-sm' : 'text-[10px]'
            )}
          >
            PRO SOFTWARE
          </span>
        </div>
      )}
    </div>
  )
}
