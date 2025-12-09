import { Router } from 'express'
import classesRouter from './classes.js'
import assignmentsRouter from './assignments.js'
import subjectsRouter from './subjects.js'

export const router = Router()

// Routes
router.use('/classes', classesRouter)
router.use('/assignments', assignmentsRouter)
router.use('/subjects', subjectsRouter)

// Auth route (для Telegram WebApp)
router.post('/auth/telegram', async (req, res) => {
  try {
    const { initData } = req.body
    
    // TODO: Валидация initData от Telegram
    // Пока возвращаем тестового пользователя
    
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