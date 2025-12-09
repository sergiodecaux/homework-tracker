import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

const createSubjectSchema = z.object({
  classId: z.string(),
  name: z.string().min(1).max(100),
  emoji: z.string().max(10).optional().default('📚'),
  color: z.string().optional().default('#3B82F6'),
})

router.get('/', async (req, res) => {
  try {
    const { classId } = req.query
    
    if (!classId) {
      return res.status(400).json({ error: 'classId is required' })
    }
    
    const subjects = await prisma.subject.findMany({
      where: { classId: classId as string },
      orderBy: { sortOrder: 'asc' }
    })
    
    res.json(subjects)
  } catch (error) {
    console.error('Error fetching subjects:', error)
    res.status(500).json({ error: 'Failed to fetch subjects' })
  }
})

router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'user-1'
    const data = createSubjectSchema.parse(req.body)
    
    const membership = await prisma.classMember.findUnique({
      where: { classId_userId: { classId: data.classId, userId } }
    })
    
    if (!membership || !['owner', 'editor'].includes(membership.role)) {
      return res.status(403).json({ error: 'No permission' })
    }
    
    const maxSort = await prisma.subject.aggregate({
      where: { classId: data.classId },
      _max: { sortOrder: true }
    })
    
    const subject = await prisma.subject.create({
      data: {
        name: data.name,
        emoji: data.emoji || '📚',
        color: data.color || '#3B82F6',
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
        class: {
          connect: { id: data.classId }
        }
      }
    })
    
    res.status(201).json(subject)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Error creating subject:', error)
    res.status(500).json({ error: 'Failed to create subject' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, emoji, color } = req.body
    
    const subject = await prisma.subject.update({
      where: { id },
      data: { name, emoji, color }
    })
    
    res.json(subject)
  } catch (error) {
    console.error('Error updating subject:', error)
    res.status(500).json({ error: 'Failed to update subject' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await prisma.subject.delete({ where: { id } })
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting subject:', error)
    res.status(500).json({ error: 'Failed to delete subject' })
  }
})

export default router