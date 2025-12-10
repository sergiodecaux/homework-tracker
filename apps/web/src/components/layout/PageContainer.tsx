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
  // Проверяем, запущено ли в Telegram
  const isTelegram = !!(window as any).Telegram?.WebApp

  return (
    <main
      className={clsx(
        'min-h-screen bg-tg-secondary-bg',
        {
          'pb-20': withBottomNav,
          'pb-24': withBottomNav && isTelegram, // Больше отступ в Telegram
        },
        className
      )}
    >
      {children}
    </main>
  )
}