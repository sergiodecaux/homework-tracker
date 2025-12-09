import React from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-tg-hint mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full px-4 py-3 rounded-xl border bg-tg-secondary-bg',
            'focus:outline-none focus:ring-2 focus:ring-tg-button focus:border-transparent',
            'placeholder:text-tg-hint transition-all',
            {
              'border-gray-200': !error,
              'border-red-500': error,
            },
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'