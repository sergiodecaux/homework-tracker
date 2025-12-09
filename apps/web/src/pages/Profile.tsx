import React from 'react'
import { Bell, Moon, Info, LogOut } from 'lucide-react'
import { Header, PageContainer, BottomNav } from '@/components/layout'
import { Card } from '@/components/ui'
import { useAppStore } from '@/stores/useAppStore'

export function Profile() {
  const { user } = useAppStore()
  
  const menuItems = [
    { icon: Bell, label: 'Уведомления', onClick: () => {} },
    { icon: Moon, label: 'Тёмная тема', onClick: () => {} },
    { icon: Info, label: 'О приложении', onClick: () => {} },
  ]
  
  return (
    <>
      <Header title="Профиль" />
      <PageContainer>
        <div className="p-4 space-y-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-tg-button/10 rounded-full flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user?.name || 'Пользователь'}</h2>
                <p className="text-tg-hint">{user?.role === 'parent' ? 'Родитель' : 'Ученик'}</p>
              </div>
            </div>
          </Card>
          
          <Card className="divide-y divide-gray-100">
            {menuItems.map(({ icon: Icon, label, onClick }) => (
              <button key={label} onClick={onClick} className="flex items-center gap-3 w-full py-3 first:pt-0 last:pb-0 hover:opacity-70 transition-opacity">
                <Icon className="w-5 h-5 text-tg-hint" />
                <span>{label}</span>
              </button>
            ))}
          </Card>
          
          <Card>
            <button className="flex items-center gap-3 w-full text-red-500 hover:opacity-70 transition-opacity">
              <LogOut className="w-5 h-5" />
              <span>Выйти</span>
            </button>
          </Card>
          
          <p className="text-center text-sm text-tg-hint pt-4">Версия 1.0.0</p>
        </div>
      </PageContainer>
      <BottomNav />
    </>
  )
}