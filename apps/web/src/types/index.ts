export interface User {
  id: string
  telegramId: number | null
  name: string
  avatarUrl: string | null
  role: 'student' | 'parent'
  createdAt: Date
}

export interface Class {
  id: string
  name: string
  schoolName: string | null
  inviteCode: string
  createdBy: string
  createdAt: Date
  memberCount?: number
}

export interface ClassMember {
  id: string
  classId: string
  userId: string
  role: 'owner' | 'editor' | 'member' | 'parent'
  linkedStudentId: string | null
  joinedAt: Date
  user?: User
}

export interface Subject {
  id: string
  classId: string
  name: string
  emoji: string
  color: string
  sortOrder: number
}

export interface Assignment {
  id: string
  classId: string
  subjectId: string
  dueDate: string
  content: string
  attachments: Attachment[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
  subject?: Subject
  isCompleted?: boolean
}

export interface Attachment {
  type: 'image' | 'file'
  url: string
  name: string
}

export interface Completion {
  id: string
  assignmentId: string
  userId: string
  completed: boolean
  completedAt: Date | null
}

export interface Reminder {
  id: string
  userId: string
  classId: string | null
  time: string
  days: number[]
  enabled: boolean
}