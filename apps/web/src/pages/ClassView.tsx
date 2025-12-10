import React, { useMemo, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { format, addDays, subDays, startOfWeek, isSameDay, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Header, PageContainer } from '@/components/layout'
import { Button, Card, Checkbox } from '@/components/ui'
import { useAppStore } from '@/stores/useAppStore'
import { api } from '@/api/client'

export function ClassView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    classes,
    subjects,
    assignments,
    selectedDate,
    setSelectedDate,
    setSubjects,
    setAssignments,
    toggleComplete,
    deleteAssignment
  } = useAppStore()

  const currentClass = classes.find(c => c.id === id)
  const classSubjects = subjects.filter(s => s.classId === id)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    async function loadClassData() {
      try {
        const [subjectsData, assignmentsData] = await Promise.all([
          api.getSubjects(id),
          api.getAssignments({ classId: id })
        ])
        setSubjects(subjectsData)
        setAssignments(assignmentsData)
      } catch (error) {
        console.error('Failed to load class data:', error)
      }
    }

    loadClassData()
  }, [id])

  const weekDays = useMemo(() => {
    const selected = parseISO(selectedDate)
    const weekStart = startOfWeek(selected, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [selectedDate])

  const dayAssignments = useMemo(() => {
    return assignments.filter(a => a.classId === id && a.dueDate === selectedDate)
  }, [assignments, id, selectedDate])

  const handlePrevDay = () => setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))
  const handleNextDay = () => setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))
  const handleDaySelect = (date: Date) => setSelectedDate(format(date, 'yyyy-MM-dd'))

  const handleToggleComplete = async (assignmentId: string, currentState: boolean) => {
    try {
      toggleComplete(assignmentId)
      await api.completeAssignment(assignmentId, !currentState)
    } catch (error) {
      console.error('Failed to toggle complete:', error)
      toggleComplete(assignmentId)
    }
  }

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Удалить задание?')) return

    setDeletingId(assignmentId)
    try {
      await api.deleteAssignment(assignmentId)
      deleteAssignment(assignmentId)
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('Не удалось удалить')
    } finally {
      setDeletingId(null)
    }
  }

  if (!currentClass) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <p style={{ color: 'var(--tg-theme-text-color)' }}>Класс не найден</p>
        </div>
      </PageContainer>
    )
  }

  const selectedDateObj = parseISO(selectedDate)

  return (
    <>
      <Header
        title={currentClass.name}
        showBack
        rightAction="settings"
        onRightAction={() => navigate(`/class/${id}/settings`)}
      />
      <PageContainer withBottomNav={false}>
        <div className="p-4 border-b" style={{ backgroundColor: 'var(--tg-theme-bg-color)', borderColor: 'var(--tg-theme-hint-color)', borderOpacity: 0.2 }}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevDay} className="p-2 rounded-xl transition-colors" style={{ color: 'var(--tg-theme-text-color)' }}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
              {format(selectedDateObj, 'd MMMM, EEEE', { locale: ru })}
            </h2>
            <button onClick={handleNextDay} className="p-2 rounded-xl transition-colors" style={{ color: 'var(--tg-theme-text-color)' }}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-between">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDateObj)
              const isToday = isSameDay(day, new Date())
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDaySelect(day)}
                  className="flex flex-col items-center p-2 rounded-xl min-w-[40px] transition-all"
                  style={{
                    backgroundColor: isSelected ? 'var(--tg-theme-button-color)' : 'transparent',
                    color: isSelected ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)',
                  }}
                >
                  <span className="text-xs" style={{ opacity: isSelected ? 1 : 0.6 }}>
                    {format(day, 'EEEEEE', { locale: ru })}
                  </span>
                  <span 
                    className="text-lg font-medium"
                    style={{ color: isToday && !isSelected ? 'var(--tg-theme-button-color)' : 'inherit' }}
                  >
                    {format(day, 'd')}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-4 space-y-3 pb-24">
          {dayAssignments.length > 0 ? (
            dayAssignments.map((assignment) => {
              const subject = classSubjects.find(s => s.id === assignment.subjectId)
              const isDeleting = deletingId === assignment.id

              return (
                <Card key={assignment.id} className={isDeleting ? 'opacity-50' : ''}>
                  <div className="flex gap-3">
                    <Checkbox
                      checked={assignment.isCompleted || false}
                      onChange={() => handleToggleComplete(assignment.id, assignment.isCompleted || false)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span>{subject?.emoji || '📝'}</span>
                          <span 
                            className="font-medium"
                            style={{ 
                              color: assignment.isCompleted ? 'var(--tg-theme-hint-color)' : 'var(--tg-theme-text-color)',
                              textDecoration: assignment.isCompleted ? 'line-through' : 'none'
                            }}
                          >
                            {subject?.name || 'Предмет'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--tg-theme-hint-color)' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p 
                        className="text-sm"
                        style={{ 
                          color: assignment.isCompleted ? 'var(--tg-theme-hint-color)' : 'var(--tg-theme-text-color)',
                          textDecoration: assignment.isCompleted ? 'line-through' : 'none'
                        }}
                      >
                        {assignment.content}
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-4xl mb-4">🎉</p>
              <p style={{ color: 'var(--tg-theme-hint-color)' }}>На этот день заданий нет</p>
            </div>
          )}
        </div>

        <div className="fixed bottom-6 left-4 right-4">
          <Button fullWidth size="lg" onClick={() => navigate(`/class/${id}/add`)}>
            <Plus className="w-5 h-5 mr-2" />
            Добавить ДЗ
          </Button>
        </div>
      </PageContainer>
    </>
  )
}