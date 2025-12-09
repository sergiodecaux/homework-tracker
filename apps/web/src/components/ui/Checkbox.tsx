import React from 'react'
import { clsx } from 'clsx'
import { Check } from 'lucide-react'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function Checkbox({ checked, onChange, disabled, className }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all',
        'focus:outline-none focus:ring-2 focus:ring-tg-button focus:ring-offset-2',
        {
          'bg-tg-button border-tg-button': checked,
          'bg-white border-gray-300 hover:border-gray-400': !checked,
          'opacity-50 cursor-not-allowed': disabled,
        },
        className
      )}
    >
      {checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
    </button>
  )
}