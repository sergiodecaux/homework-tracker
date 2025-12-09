import React from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-xl transition-all',
        'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-tg-button text-tg-button-text hover:opacity-90': variant === 'primary',
          'bg-tg-secondary-bg text-tg-text hover:bg-gray-200': variant === 'secondary',
          'bg-transparent text-tg-link hover:bg-tg-secondary-bg': variant === 'ghost',
          'bg-red-500 text-white hover:bg-red-600': variant === 'danger',
          'text-sm px-3 py-1.5': size === 'sm',
          'text-base px-4 py-2.5': size === 'md',
          'text-lg px-6 py-3': size === 'lg',
          'w-full': fullWidth,
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="mr-2 animate-spin">⏳</span>}
      {children}
    </button>
  )
}