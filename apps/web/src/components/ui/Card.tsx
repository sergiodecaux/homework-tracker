import React from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export function Card({ children, className, onClick, hoverable = false }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl p-4 shadow-sm',
        {
          'cursor-pointer active:scale-[0.99] transition-transform': hoverable || onClick,
        },
        className
      )}
      style={{
        backgroundColor: 'var(--tg-theme-bg-color)',
        color: 'var(--tg-theme-text-color)',
      }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}