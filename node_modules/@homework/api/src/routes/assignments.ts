import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

const createAssignmentSchema = z.object({
  classId: z.string(),
  subjectId: z.string(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  content: z.string().min(1).max(2000),
  attachments: z.array(z.object({
    type: z.enum(['image', 'file']),
    url: z.string(),
    name: z.string(),
  })).optional().default([]),
})

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

router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'user-1'
    const data = createAssignmentSchema.parse(req.body)
    
    const membership = await prisma.classMember.findUnique({
      where: { classId_userId: { classId: data.classId, userId } }
    })
    
    if (!membership || !['owner', 'editor'].includes(membership.role)) {
      return res.status(403).json({ error: 'No permission to add assignments' })
    }
    
    const assignment = await prisma.assignment.create({
      data: {
        dueDate: new Date(data.dueDate),
        content: data.content,
        attachments: JSON.stringify(data.attachments),
        class: {
          connect: { id: data.classId }
        },
        subject: {
          connect: { id: data.subjectId }
        },
        creator: {
          connect: { id: userId }
        }
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
    
    const membership = await prisma.classMember.findUnique({
      where: { classId_userId: { classId: assignment.classId, userId } }
    })
    
    if (!membership || !['owner', 'editor'].includes(membership.role)) {
      return res.status(403).json({ error: 'No permission' })
    }
    
    const updateData: any = {}
    if (content) updateData.content = content
    if (dueDate) updateData.dueDate = new Date(dueDate)
    if (subjectId) updateData.subject = { connect: { id: subjectId } }
    
    const updated = await prisma.assignment.update({
      where: { id },
      data: updateData,
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

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.headers['x-user-id'] as string || 'user-1'
    
    const assignment = await prisma.assignment.findUnique({ where: { id } })
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }
    
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