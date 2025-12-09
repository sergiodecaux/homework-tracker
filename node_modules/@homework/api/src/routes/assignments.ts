import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

// Схема валидации
const createAssignmentSchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  content: z.string().min(1).max(2000),
  attachments: z.array(z.object({
    type: z.enum(['image', 'file']),
    url: z.string(),
    name: z.string(),
  })).optional().default([]),
})

// GET /api/assignments - получить задания
router.get('/', async (req, res) => {
  try {
    const { classId, date, from, to } = req.query
    const userId = req.headers['x-user-id'] as string || 'user-1'
    
    const where: any = {}
    
    if (classId) {
      where.classId = classId as string
    }
    
    if (date) {
      where.dueDate = new Date(date as string)
    } else if (from && to) {
      where.dueDate = {
        gte: new Date(from as string),
        lte: new Date(to as string),
      }
    }
    
    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        subject: true,
        completions: {
          where: { userId }
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { subject: { sortOrder: 'asc' } }
      ]
    })
    
    // Добавляем флаг isCompleted
    const result = assignments.map(a => ({
      ...a,
      dueDate: a.dueDate.toISOString().split('T')[0],
      isCompleted: a.completions.length > 0 && a.completions[0].completed,
    }))
    
    res.json(result)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    res.status(500).json({ error: 'Failed to fetch assignments' })
  }
})

// POST /api/assignments - создать задание
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'user-1'
    const data = createAssignmentSchema.parse(req.body)
    
    // Проверяем права (editor или owner)
    const membership = await prisma.classMember.findUnique({
      where: { classId_userId: { classId: data.classId, userId } }
    })
    
    if (!membership || !['owner', 'editor'].includes(membership.role)) {
      return res.status(403).json({ error: 'No permission to add assignments' })
    }
    
    const assignment = await prisma.assignment.create({
      data: {
        classId: data.classId,
        subjectId: data.subjectId,
        dueDate: new Date(data.dueDate),
        content: data.content,
        attachments: data.attachments,
        createdBy: userId,
      },
      include: { subject: true }
    })
    
    res.status(201).json({
      ...assignment,
      dueDate: assignment.dueDate.toISOString().split('T')[0],
      isCompleted: false,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Error creating assignment:', error)
    res.status(500).json({ error: 'Failed to create assignment' })
  }
})

// PUT /api/assignments/:id - обновить задание
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.headers['x-user-id'] as string || 'user-1'
    const { content, dueDate, subjectId } = req.body
    
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: { class: true }
    })
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }
    
    // Проверяем права
    const membership = await prisma.classMember.findUnique({
      where: { classId_userId: { classId: assignment.classId, userId } }
    })
    
    if (!membership || !['owner', 'editor'].includes(membership.role)) {
      return res.status(403).json({ error: 'No permission' })
    }
    
    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        content: content || assignment.content,
        dueDate: dueDate ? new Date(dueDate) : assignment.dueDate,
        subjectId: subjectId || assignment.subjectId,
      },
      include: { subject: true }
    })
    
    res.json({
      ...updated,
      dueDate: updated.dueDate.toISOString().split('T')[0],
    })
  } catch (error) {
    console.error('Error updating assignment:', error)
    res.status(500).json({ error: 'Failed to update assignment' })
  }
})

// DELETE /api/assignments/:id - удалить задание
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.headers['x-user-id'] as string || 'user-1'
    
    const assignment = await prisma.assignment.findUnique({ where: { id } })
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }
    
    // Проверяем права
    const membership = await prisma.classMember.findUnique({
      where: { classId_userId: { classId: assignment.classId, userId } }
    })
    
    if (!membership || !['owner', 'editor'].includes(membership.role)) {
      return res.status(403).json({ error: 'No permission' })
    }
    
    await prisma.assignment.delete({ where: { id } })
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting assignment:', error)
    res.status(500).json({ error: 'Failed to delete assignment' })
  }
})

// POST /api/assignments/:id/complete - отметить выполненным
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.headers['x-user-id'] as string || 'user-1'
    const { completed } = req.body
    
    const completion = await prisma.completion.upsert({
      where: {
        assignmentId_userId: { assignmentId: id, userId }
      },
      update: {
        completed: completed ?? true,
        completedAt: completed ? new Date() : null,
      },
      create: {
        assignmentId: id,
        userId,
        completed: completed ?? true,
        completedAt: completed ? new Date() : null,
      }
    })
    
    res.json(completion)
  } catch (error) {
    console.error('Error completing assignment:', error)
    res.status(500).json({ error: 'Failed to complete assignment' })
  }
})

export default router