'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-600/15 hover:shadow-lg hover:shadow-primary-600/25 focus:ring-primary-500 active:scale-[0.98]',
  secondary:
    'bg-slate-50 text-slate-700 border border-slate-200/60 hover:bg-slate-100/80 hover:text-slate-900 focus:ring-slate-300 active:scale-[0.98]',
  outline:
    'border border-slate-200 text-slate-700 hover:bg-slate-50/80 hover:text-slate-950 focus:ring-slate-300 active:scale-[0.98]',
  ghost:
    'text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-200 active:scale-[0.98]',
  danger:
    'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/15 hover:shadow-lg hover:shadow-rose-500/25 focus:ring-rose-500 active:scale-[0.98]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs font-semibold rounded-xl',
  md: 'px-4.5 py-2.5 text-sm font-semibold rounded-xl',
  lg: 'px-6 py-3.5 text-base font-bold rounded-2xl',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-500/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps }
