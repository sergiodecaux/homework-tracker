import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, addDays } from 'date-fns'
import { Camera, FileImage } from 'lucide-react'
import { Header, PageContainer } from '@/components/layout'
import { Button, Input, TextArea } from '@/components/ui'
import { useAppStore } from '@/stores/useAppStore'
import { api } from '@/api/client'

export function AddAssignment() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { subjects, addAssignment, selectedDate, setSubjects } = useAppStore()
  const classSubjects = subjects.filter(s => s.classId === id)

  const [subjectId, setSubjectId] = useState('')
  const [dueDate, setDueDate] = useState(selectedDate || format(new Date(), 'yyyy-MM-dd'))
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Загружаем предметы
  useEffect(() => {
    if (!id) return

    async function loadSubjects() {
      try {
        const data = await api.getSubjects(id)
        setSubjects(data)
      } catch (error) {
        console.error('Failed to load subjects:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (classSubjects.length === 0) {
      loadSubjects()
    } else {
      setIsLoading(false)
    }
  }, [id])

  const dateOptions = [
    { label: 'Сегодня', value: format(new Date(), 'yyyy-MM-dd') },
    { label: 'Завтра', value: format(addDays(new Date(), 1), 'yyyy-MM-dd') },
    { label: 'Послезавтра', value: format(addDays(new Date(), 2), 'yyyy-MM-dd') },
  ]

  const handleSubmit = async () => {
    if (!subjectId || !content.trim() || !id) return
    setIsSubmitting(true)

    try {
      const newAssignment = await api.createAssignment({
        classId: id,
        subjectId,
        dueDate,
        content: content.trim(),
      })

      addAssignment({
        ...newAssignment,
        isCompleted: false,
      })

      navigate(-1)
    } catch (error) {
      console.error('Failed to add assignment:', error)
      alert('Не удалось добавить задание')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = subjectId && content.trim()

  return (
    <>
      <Header
        title="Новое задание"
        showBack
        rightAction={
          <Button size="sm" disabled={!isValid || isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? '...' : 'Готово'}
          </Button>
        }
      />
      <PageContainer withBottomNav={false}>
        <div className="p-4 space-y-6">
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--tg-theme-hint-color)' }}
            >
              Предмет
            </label>
            
            {isLoading ? (
              <div className="text-center py-8">
                <p style={{ color: 'var(--tg-theme-hint-color)' }}>Загрузка предметов...</p>
              </div>
            ) : classSubjects.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {classSubjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setSubjectId(subject.id)}
                    className="p-3 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: subjectId === subject.id ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-hint-color)',
                      backgroundColor: subjectId === subject.id ? 'var(--tg-theme-button-color)' : 'transparent',
                      opacity: subjectId === subject.id ? 0.2 : 0.3,
                    }}
                  >
                    <span className="text-xl mr-2">{subject.emoji}</span>
                    <span 
                      className="font-medium"
                      style={{ color: 'var(--tg-theme-text-color)' }}
                    >
                      {subject.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div 
                className="text-center py-8 rounded-xl"
                style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
              >
                <p style={{ color: 'var(--tg-theme-hint-color)' }}>
                  Нет предметов. Добавьте их в настройках класса.
                </p>
                <Button
                  variant="ghost"
                  className="mt-2"
                  onClick={() => navigate(`/class/${id}/settings`)}
                >
                  Открыть настройки
                </Button>
              </div>
            )}
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--tg-theme-hint-color)' }}
            >
              На какой день
            </label>
            <div className="flex gap-2 mb-3">
              {dateOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDueDate(option.value)}
                  className="flex-1 py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all"
                  style={{
                    borderColor: dueDate === option.value ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-hint-color)',
                    backgroundColor: dueDate === option.value ? 'var(--tg-theme-button-color)' : 'transparent',
                    color: dueDate === option.value ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)',
                    opacity: dueDate === option.value ? 1 : 0.6,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <TextArea
            label="Задание"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="§12, номера 234-236..."
            rows={4}
          />

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--tg-theme-hint-color)' }}
            >
              Прикрепить фото
            </label>
            <div className="flex gap-3">
              <button 
                className="flex-1 flex flex-col items-center gap-2 py-6 border-2 border-dashed rounded-xl transition-colors"
                style={{ borderColor: 'var(--tg-theme-hint-color)', opacity: 0.5 }}
              >
                <Camera className="w-8 h-8" style={{ color: 'var(--tg-theme-hint-color)' }} />
                <span className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>Камера</span>
              </button>
              <button 
                className="flex-1 flex flex-col items-center gap-2 py-6 border-2 border-dashed rounded-xl transition-colors"
                style={{ borderColor: 'var(--tg-theme-hint-color)', opacity: 0.5 }}
              >
                <FileImage className="w-8 h-8" style={{ color: 'var(--tg-theme-hint-color)' }} />
                <span className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>Галерея</span>
              </button>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  )
}