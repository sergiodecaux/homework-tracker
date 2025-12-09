import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header, PageContainer } from '@/components/layout'
import { Button, Input } from '@/components/ui'
import { useAppStore } from '@/stores/useAppStore'
import { api } from '@/api/client'

export function CreateClass() {
  const navigate = useNavigate()
  const { addClass } = useAppStore()
  
  const [name, setName] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const newClass = await api.createClass({
        name: name.trim(),
        schoolName: schoolName.trim() || undefined,
      })
      
      addClass(newClass)
      navigate(`/class/${newClass.id}`)
    } catch (err) {
      console.error('Failed to create class:', err)
      setError('Не удалось создать класс')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = name.trim().length > 0

  return (
    <>
      <Header title="Новый класс" showBack />
      <PageContainer withBottomNav={false}>
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          <div className="text-center py-6">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-tg-hint">
              Создайте класс и пригласите одноклассников
            </p>
          </div>

          <Input
            label="Название класса"
            placeholder="Например: 9Б класс"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <Input
            label="Школа (необязательно)"
            placeholder="Например: Школа №42"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />

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
              {isSubmitting ? 'Создание...' : 'Создать класс'}
            </Button>
          </div>
        </form>
      </PageContainer>
    </>
  )
}