import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

// Схема валидации
const createClassSchema = z.object({
  name: z.string().min(1).max(100),
  schoolName: z.string().max(200).optional(),
})

// Генерация invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// GET /api/classes - получить все классы пользователя
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'user-1' // TODO: из JWT
    
    const memberships = await prisma.classMember.findMany({
      where: { userId },
      include: {
        class: {
          include: {
            _count: { select: { members: true } }
          }
        }
      }
    })
    
    const classes = memberships.map(m => ({
      ...m.class,
      memberCount: m.class._count.members,
      myRole: m.role,
    }))
    
    res.json(classes)
  } catch (error) {
    console.error('Error fetching classes:', error)
    res.status(500).json({ error: 'Failed to fetch classes' })
  }
})

// GET /api/classes/:id - получить класс по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        subjects: { orderBy: { sortOrder: 'asc' } },
        members: {
          include: { user: true }
        },
        _count: { select: { members: true, assignments: true } }
      }
    })
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' })
    }
    
    res.json(classData)
  } catch (error) {
    console.error('Error fetching class:', error)
    res.status(500).json({ error: 'Failed to fetch class' })
  }
})

// POST /api/classes - создать класс
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'user-1'
    const data = createClassSchema.parse(req.body)
    
    const newClass = await prisma.class.create({
      data: {
        name: data.name,
        schoolName: data.schoolName,
        inviteCode: generateInviteCode(),
        createdBy: userId,
        members: {
          create: {
            userId,
            role: 'owner',
          }
        }
      },
      include: {
        _count: { select: { members: true } }
      }
    })
    
    res.status(201).json(newClass)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Error creating class:', error)
    res.status(500).json({ error: 'Failed to create class' })
  }
})

// POST /api/classes/join - присоединиться по коду
router.post('/join', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'user-1'
    const { inviteCode } = req.body
    
    const classData = await prisma.class.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() }
    })
    
    if (!classData) {
      return res.status(404).json({ error: 'Класс не найден' })
    }
    
    // Проверяем, не состоит ли уже
    const existing = await prisma.classMember.findUnique({
      where: {
        classId_userId: { classId: classData.id, userId }
      }
    })
    
    if (existing) {
      return res.status(400).json({ error: 'Вы уже состоите в этом классе' })
    }
    
    await prisma.classMember.create({
      data: {
        classId: classData.id,
        userId,
        role: 'member',
      }
    })
    
    res.json({ success: true, class: classData })
  } catch (error) {
    console.error('Error joining class:', error)
    res.status(500).json({ error: 'Failed to join class' })
  }
})

// DELETE /api/classes/:id - удалить класс
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.headers['x-user-id'] as string || 'user-1'
    
    // Проверяем права
    const membership = await prisma.classMember.findUnique({
      where: { classId_userId: { classId: id, userId } }
    })
    
    if (!membership || membership.role !== 'owner') {
      return res.status(403).json({ error: 'Only owner can delete class' })
    }
    
    await prisma.class.delete({ where: { id } })
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting class:', error)
    res.status(500).json({ error: 'Failed to delete class' })
  }
})

export default router