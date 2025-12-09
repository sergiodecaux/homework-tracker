import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Создаём тестового пользователя
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

  console.log('✅ User created:', user.name)

  // Создаём класс
  const class1 = await prisma.class.upsert({
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

  console.log('✅ Class created:', class1.name)

  // Добавляем пользователя в класс
  await prisma.classMember.upsert({
    where: { classId_userId: { classId: class1.id, userId: user.id } },
    update: {},
    create: {
      classId: class1.id,
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
        ...subjects[i],
        classId: class1.id,
        sortOrder: i + 1,
      },
    })
  }

  console.log('✅ Subjects created:', subjects.length)

  // Создаём задания
  const today = new Date()
  const tomorrow = new Date(Date.now() + 86400000)

  const assignments = [
    {
      id: 'hw-1',
      subjectId: 'subj-1',
      dueDate: today,
      content: '§12, номера 234-236, 240 (а, б)',
    },
    {
      id: 'hw-2',
      subjectId: 'subj-2',
      dueDate: today,
      content: 'Упражнение 45, выучить правило на стр. 89',
    },
    {
      id: 'hw-3',
      subjectId: 'subj-3',
      dueDate: today,
      content: 'Читать параграф 15-16, ответить на вопросы',
    },
    {
      id: 'hw-4',
      subjectId: 'subj-4',
      dueDate: tomorrow,
      content: 'Лабораторная работа №5',
    },
    {
      id: 'hw-5',
      subjectId: 'subj-5',
      dueDate: tomorrow,
      content: 'Workbook p.34-35, выучить слова Unit 5',
    },
  ]

  for (const hw of assignments) {
    await prisma.assignment.upsert({
      where: { id: hw.id },
      update: {},
      create: {
        ...hw,
        classId: class1.id,
        createdBy: user.id,
        attachments: '[]',
      },
    })
  }

  console.log('✅ Assignments created:', assignments.length)
  console.log('\n🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })