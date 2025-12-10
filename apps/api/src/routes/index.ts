import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import classesRouter from './classes.js'
import assignmentsRouter from './assignments.js'
import subjectsRouter from './subjects.js'

const prisma = new PrismaClient()

export const router = Router()

router.use('/classes', classesRouter)
router.use('/assignments', assignmentsRouter)
router.use('/subjects', subjectsRouter)

router.post('/auth/telegram', async (req, res) => {
  try {
    res.json({
      user: {
        id: 'user-1',
        telegramId: 123456789,
        name: 'Тестовый пользователь',
        role: 'student',
      },
      token: 'test-jwt-token',
    })
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' })
  }
})

// Создание тестовых данных
router.post('/seed', async (req, res) => {
  try {
    // Создаём пользователя
    const user = await prisma.user.upsert({
      where: { id: 'user-1' },
      update: {},
      create: {
        id: 'user-1',
        telegramId: BigInt(123456789),
        name: 'Алексей',
        role: 'student',
      },
    })

    // Создаём класс
    const classData = await prisma.class.upsert({
      where: { id: 'class-1' },
      update: {},
      create: {
        id: 'class-1',
        name: '9Б класс',
        schoolName: 'Школа №42',
        inviteCode: 'ABC123',
        createdBy: user.id,
      },
    })

    // Добавляем пользователя в класс
    await prisma.classMember.upsert({
      where: { classId_userId: { classId: classData.id, userId: user.id } },
      update: {},
      create: {
        classId: classData.id,
        userId: user.id,
        role: 'owner',
      },
    })

    // Создаём предметы
    const subjects = [
      { id: 'subj-1', name: 'Алгебра', emoji: '📐', color: '#3B82F6' },
      { id: 'subj-2', name: 'Русский язык', emoji: '📚', color: '#EF4444' },
      { id: 'subj-3', name: 'История', emoji: '📜', color: '#F59E0B' },
      { id: 'subj-4', name: 'Физика', emoji: '⚡', color: '#8B5CF6' },
      { id: 'subj-5', name: 'Английский', emoji: '🇬🇧', color: '#10B981' },
    ]

    for (let i = 0; i < subjects.length; i++) {
      await prisma.subject.upsert({
        where: { id: subjects[i].id },
        update: {},
        create: {
          id: subjects[i].id,
          name: subjects[i].name,
          emoji: subjects[i].emoji,
          color: subjects[i].color,
          sortOrder: i + 1,
          classId: classData.id,
        },
      })
    }

    // Создаём задания
    const today = new Date()
    const tomorrow = new Date(Date.now() + 86400000)

    const assignments = [
      { id: 'hw-1', subjectId: 'subj-1', dueDate: today, content: '§12, номера 234-236' },
      { id: 'hw-2', subjectId: 'subj-2', dueDate: today, content: 'Упражнение 45, выучить правило' },
      { id: 'hw-3', subjectId: 'subj-3', dueDate: tomorrow, content: 'Читать параграф 15-16' },
    ]

    for (const hw of assignments) {
      await prisma.assignment.upsert({
        where: { id: hw.id },
        update: {},
        create: {
          id: hw.id,
          subjectId: hw.subjectId,
          classId: classData.id,
          dueDate: hw.dueDate,
          content: hw.content,
          attachments: '[]',
          createdBy: user.id,
        },
      })
    }

    res.json({ success: true, message: 'Тестовые данные созданы!' })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ error: 'Failed to seed data' })
  }
})