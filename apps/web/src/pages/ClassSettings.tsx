import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Copy, Check, Plus, Trash2, Users } from 'lucide-react'
import { Header, PageContainer } from '@/components/layout'
import { Button, Card, Input } from '@/components/ui'
import { useAppStore } from '@/stores/useAppStore'
import { api } from '@/api/client'

export function ClassSettings() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { classes, subjects, setSubjects } = useAppStore()
  
  const currentClass = classes.find(c => c.id === id)
  const classSubjects = subjects.filter(s => s.classId === id)
  
  const [copied, setCopied] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newSubjectEmoji, setNewSubjectEmoji] = useState('📚')
  const [isAddingSubject, setIsAddingSubject] = useState(false)

  // Популярные эмодзи для предметов
  const emojiOptions = ['📐', '📚', '📜', '⚡', '🇬🇧', '🎨', '🔬', '🌍', '💻', '🎵', '⚽', '📖']

  useEffect(() => {
    if (id) {
      api.getSubjects(id).then(setSubjects).catch(console.error)
    }
  }, [id])

  const handleCopyCode = async () => {
    if (!currentClass) return
    
    try {
      await navigator.clipboard.writeText(currentClass.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleAddSubject = async () => {
    if (!newSubjectName.trim() || !id) return
    
    setIsAddingSubject(true)
    try {
      const newSubject = await api.createSubject({
        classId: id,
        name: newSubjectName.trim(),
        emoji: newSubjectEmoji,
      })
      
      setSubjects([...subjects, newSubject])
      setNewSubjectName('')
      setNewSubjectEmoji('📚')
    } catch (err) {
      console.error('Failed to add subject:', err)
    } finally {
      setIsAddingSubject(false)
    }
  }

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Удалить предмет? Все задания по нему тоже будут удалены.')) return
    
    try {
      await api.deleteSubject(subjectId)
      setSubjects(subjects.filter(s => s.id !== subjectId))
    } catch (err) {
      console.error('Failed to delete subject:', err)
    }
  }

  if (!currentClass) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <p>Класс не найден</p>
        </div>
      </PageContainer>
    )
  }

  return (
    <>
      <Header title="Настройки" showBack />
      <PageContainer withBottomNav={false}>
        <div className="p-4 space-y-6">
          {/* Информация о классе */}
          <Card>
            <h2 className="font-semibold text-lg mb-1">{currentClass.name}</h2>
            {currentClass.schoolName && (
              <p className="text-tg-hint">{currentClass.schoolName}</p>
            )}
          </Card>

          {/* Код приглашения */}
          <div>
            <h3 className="text-sm font-medium text-tg-hint mb-2">
              Код приглашения
            </h3>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-mono font-bold tracking-widest">
                    {currentClass.inviteCode}
                  </p>
                  <p className="text-sm text-tg-hint mt-1">
                    Поделитесь кодом с одноклассниками
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleCopyCode}
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Предметы */}
          <div>
            <h3 className="text-sm font-medium text-tg-hint mb-2">
              Предметы ({classSubjects.length})
            </h3>
            
            <div className="space-y-2">
              {classSubjects.map((subject) => (
                <Card key={subject.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{subject.emoji}</span>
                      <span className="font-medium">{subject.name}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ))}

              {/* Добавление предмета */}
              <Card>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex gap-1 flex-wrap">
                      {emojiOptions.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setNewSubjectEmoji(emoji)}
                          className={`w-10 h-10 text-xl rounded-lg transition-all ${
                            newSubjectEmoji === emoji
                              ? 'bg-tg-button/20 scale-110'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Название предмета"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddSubject}
                      disabled={!newSubjectName.trim() || isAddingSubject}
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Участники (заглушка) */}
          <div>
            <h3 className="text-sm font-medium text-tg-hint mb-2">
              Участники
            </h3>
            <Card>
              <div className="flex items-center gap-3 text-tg-hint">
                <Users className="w-5 h-5" />
                <span>Управление участниками (скоро)</span>
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </>
  )
}