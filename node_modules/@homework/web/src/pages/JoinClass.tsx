import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header, PageContainer } from '@/components/layout'
import { Button, Input } from '@/components/ui'
import { useAppStore } from '@/stores/useAppStore'
import { api } from '@/api/client'

export function JoinClass() {
  const navigate = useNavigate()
  const { addClass } = useAppStore()
  
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const result = await api.joinClass(code.trim().toUpperCase())
      addClass(result.class)
      navigate(`/class/${result.class.id}`)
    } catch (err: any) {
      console.error('Failed to join class:', err)
      setError(err.message || 'Класс не найден или код неверный')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Форматируем ввод: только буквы и цифры, uppercase
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    setCode(value.slice(0, 6))
  }

  const isValid = code.trim().length >= 4

  return (
    <>
      <Header title="Присоединиться" showBack />
      <PageContainer withBottomNav={false}>
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          <div className="text-center py-6">
            <div className="text-6xl mb-4">🔗</div>
            <p className="text-tg-hint">
              Введите код приглашения от одноклассника
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-tg-hint mb-2">
              Код приглашения
            </label>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="ABC123"
              className="w-full px-4 py-4 text-center text-2xl font-mono font-bold tracking-widest rounded-xl border border-gray-200 bg-tg-secondary-bg focus:outline-none focus:ring-2 focus:ring-tg-button focus:border-transparent"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <div className="pt-4">
            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Поиск...' : 'Присоединиться'}
            </Button>
          </div>

          <p className="text-center text-sm text-tg-hint">
            Код можно получить у того, кто создал класс
          </p>
        </form>
      </PageContainer>
    </>
  )
}