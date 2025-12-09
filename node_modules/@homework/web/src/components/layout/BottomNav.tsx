import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, BookOpen, User } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { to: '/', icon: Home, label: 'Главная' },
  { to: '/classes', icon: BookOpen, label: 'Классы' },
  { to: '/profile', icon: User, label: 'Профиль' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-tg-bg border-t border-gray-100 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors',
                {
                  'text-tg-button': isActive,
                  'text-tg-hint': !isActive,
                }
              )
            }
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}