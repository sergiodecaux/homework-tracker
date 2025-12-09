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
        'bg-white rounded-2xl p-4 shadow-sm border border-gray-100',
        {
          'cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]': hoverable || onClick,
        },
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}