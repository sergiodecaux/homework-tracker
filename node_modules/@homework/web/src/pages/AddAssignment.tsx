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

  // Загружаем предметы если их нет
  useEffect(() => {
    if (id && classSubjects.length === 0) {
      api.getSubjects(id).then(setSubjects).catch(console.error)
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
            <label className="block text-sm font-medium text-tg-hint mb-2">Предмет</label>
            <div className="grid grid-cols-2 gap-2">
              {classSubjects.length > 0 ? (
                classSubjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setSubjectId(subject.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      subjectId === subject.id ? 'border-tg-button bg-tg-button/10' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl mr-2">{subject.emoji}</span>
                    <span className="font-medium">{subject.name}</span>
                  </button>
                ))
              ) : (
                <p className="col-span-2 text-center py-8 text-tg-hint">
                  Загрузка предметов...
                </p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-tg-hint mb-2">На какой день</label>
            <div className="flex gap-2 mb-3">
              {dateOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDueDate(option.value)}
                  className={`flex-1 py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    dueDate === option.value ? 'border-tg-button bg-tg-button/10 text-tg-button' : 'border-gray-200 hover:border-gray-300'
                  }`}
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
            <label className="block text-sm font-medium text-tg-hint mb-2">Прикрепить фото</label>
            <div className="flex gap-3">
              <button className="flex-1 flex flex-col items-center gap-2 py-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-colors">
                <Camera className="w-8 h-8 text-tg-hint" />
                <span className="text-sm text-tg-hint">Камера</span>
              </button>
              <button className="flex-1 flex flex-col items-center gap-2 py-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-colors">
                <FileImage className="w-8 h-8 text-tg-hint" />
                <span className="text-sm text-tg-hint">Галерея</span>
              </button>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  )
}