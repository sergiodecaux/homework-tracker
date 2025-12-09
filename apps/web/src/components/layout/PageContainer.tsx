import React from 'react'
import { clsx } from 'clsx'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  withBottomNav?: boolean
}

export function PageContainer({ 
  children, 
  className,
  withBottomNav = true 
}: PageContainerProps) {
  return (
    <main
      className={clsx(
        'min-h-screen bg-tg-secondary-bg',
        { 'pb-20': withBottomNav },
        className
      )}
    >
      {children}
    </main>
  )
}