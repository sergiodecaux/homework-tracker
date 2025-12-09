import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home, ClassView, AddAssignment, Profile, CreateClass, JoinClass, ClassSettings } from '@/pages'
import { useAppStore } from '@/stores/useAppStore'
import { api } from '@/api/client'

function App() {
  const { setClasses, setUser, setSubjects, setAssignments } = useAppStore()
  const [loading, setLoading] = useState(true)

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
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-tg-secondary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-tg-hint">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
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
  )
}

export default App