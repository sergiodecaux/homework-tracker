import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Settings, Plus } from 'lucide-react'

interface HeaderProps {
  title: string
  showBack?: boolean
  rightAction?: 'settings' | 'add' | React.ReactNode
  onRightAction?: () => void
}

export function Header({ title, showBack, rightAction, onRightAction }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()

  // Проверяем, запущено ли в Telegram
  const isTelegram = !!(window as any).Telegram?.WebApp

  const handleBack = () => {
    if (location.key !== 'default') {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  const renderRightAction = () => {
    if (!rightAction) return null

    if (React.isValidElement(rightAction)) {
      return rightAction
    }

    const Icon = rightAction === 'settings' ? Settings : Plus

    return (
      <button
        onClick={onRightAction}
        className="p-2 -mr-2 hover:bg-tg-secondary-bg rounded-xl transition-colors"
      >
        <Icon className="w-6 h-6 text-tg-link" />
      </button>
    )
  }

  return (
    <header 
      className="sticky top-0 z-50 bg-tg-bg border-b border-gray-100"
      style={{ paddingTop: isTelegram ? 'env(safe-area-inset-top, 8px)' : '0' }}
    >
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-tg-secondary-bg rounded-xl transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-semibold truncate">{title}</h1>
        </div>
        <div className="flex-shrink-0">
          {renderRightAction()}
        </div>
      </div>
    </header>
  )
}