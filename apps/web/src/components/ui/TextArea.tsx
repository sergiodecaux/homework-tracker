import React from 'react'
import { clsx } from 'clsx'

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-tg-hint mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={clsx(
            'w-full px-4 py-3 rounded-xl border bg-tg-secondary-bg resize-none',
            'focus:outline-none focus:ring-2 focus:ring-tg-button focus:border-transparent',
            'placeholder:text-tg-hint transition-all',
            {
              'border-gray-200': !error,
              'border-red-500': error,
            },
            className
          )}
          rows={4}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'