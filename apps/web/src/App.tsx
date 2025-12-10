import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home, ClassView, AddAssignment, Profile, CreateClass, JoinClass, ClassSettings } from '@/pages'
import { useAppStore } from '@/stores/useAppStore'
import { api } from '@/api/client'
import { TelegramTheme } from '@/components/TelegramTheme'

function App() {
  const { setClasses, setUser, setSubjects, setAssignments } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setUser({
          id: 'user-1',
          telegramId: 123456789,
          name: 'Алексей',
          avatarUrl: null,
          role: 'student',
          createdAt: new Date(),
        })

        const classes = await api.getClasses()
        setClasses(classes)

        if (classes.length > 0) {
          const subjects = await api.getSubjects(classes[0].id)
          setSubjects(subjects)

          const assignments = await api.getAssignments({ classId: classes[0].id })
          setAssignments(assignments)
        }
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Ошибка загрузки данных')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <>
        <TelegramTheme />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--tg-theme-bg-color)', color: 'var(--tg-theme-text-color)' }}>
          <div className="text-center">
            <div className="text-4xl mb-4">📚</div>
            <p style={{ color: 'var(--tg-theme-hint-color)' }}>Загрузка...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <TelegramTheme />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--tg-theme-bg-color)', color: 'var(--tg-theme-text-color)' }}>
          <div className="text-center p-4">
            <div className="text-4xl mb-4">😕</div>
            <p style={{ color: 'var(--tg-theme-text-color)' }}>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-xl"
              style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <TelegramTheme />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/class/:id" element={<ClassView />} />
          <Route path="/class/:id/add" element={<AddAssignment />} />
          <Route path="/class/:id/settings" element={<ClassSettings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/classes" element={<Home />} />
          <Route path="/classes/new" element={<CreateClass />} />
          <Route path="/join" element={<JoinClass />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App