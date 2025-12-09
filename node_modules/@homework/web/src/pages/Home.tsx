import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, ChevronRight } from 'lucide-react'
import { Header, PageContainer, BottomNav } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { useAppStore } from '@/stores/useAppStore'

export function Home() {
  const navigate = useNavigate()
  const { classes, assignments } = useAppStore()
  
  const getClassStats = (classId: string) => {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    
    const classAssignments = assignments.filter(a => a.classId === classId)
    const upcoming = classAssignments.filter(
      a => a.dueDate >= today && a.dueDate <= tomorrow && !a.isCompleted
    )
    
    return { total: classAssignments.length, upcoming: upcoming.length }
  }
  
  return (
    <>
      <Header title="Домашка" rightAction="add" onRightAction={() => navigate('/classes/new')} />
      <PageContainer>
        <div className="p-4 space-y-4">
          <div className="text-center py-6">
            <h2 className="text-2xl font-bold mb-2">👋 Привет!</h2>
            <p className="text-tg-hint">
              {classes.length === 0
                ? 'Добавь свой первый класс'
                : 'Выбери класс для просмотра заданий'}
            </p>
          </div>
          
          {classes.length > 0 && (
            <div className="space-y-3">
              {classes.map((cls) => {
                const stats = getClassStats(cls.id)
                return (
                  <Card key={cls.id} hoverable onClick={() => navigate(`/class/${cls.id}`)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-tg-button/10 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">📚</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{cls.name}</h3>
                          <p className="text-sm text-tg-hint">
                            {stats.upcoming > 0 
                              ? `${stats.upcoming} заданий на ближайшие дни`
                              : 'Нет заданий'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-tg-hint" />
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
          
          <div className="space-y-3 pt-4">
            <Button fullWidth size="lg" onClick={() => navigate('/classes/new')}>
              <Plus className="w-5 h-5 mr-2" />
              Создать класс
            </Button>
            <Button fullWidth size="lg" variant="secondary" onClick={() => navigate('/join')}>
              <Users className="w-5 h-5 mr-2" />
              Присоединиться по коду
            </Button>
          </div>
        </div>
      </PageContainer>
      <BottomNav />
    </>
  )
}