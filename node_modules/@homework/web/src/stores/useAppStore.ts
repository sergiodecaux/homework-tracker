import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Class, Assignment, Subject } from '@/types'

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
  
  classes: Class[]
  currentClassId: string | null
  setClasses: (classes: Class[]) => void
  addClass: (cls: Class) => void
  setCurrentClass: (id: string | null) => void
  
  subjects: Subject[]
  setSubjects: (subjects: Subject[]) => void
  
  assignments: Assignment[]
  setAssignments: (assignments: Assignment[]) => void
  addAssignment: (assignment: Assignment) => void
  updateAssignment: (id: string, data: Partial<Assignment>) => void
  deleteAssignment: (id: string) => void
  toggleComplete: (assignmentId: string) => void
  
  selectedDate: string
  setSelectedDate: (date: string) => void
  
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

const getToday = () => new Date().toISOString().split('T')[0]

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      
      classes: [],
      currentClassId: null,
      setClasses: (classes) => set({ classes }),
      addClass: (cls) => set((state) => ({ classes: [...state.classes, cls] })),
      setCurrentClass: (id) => set({ currentClassId: id }),
      
      subjects: [],
      setSubjects: (subjects) => set({ subjects }),
      
      assignments: [],
      setAssignments: (assignments) => set({ assignments }),
      addAssignment: (assignment) => set((state) => ({ 
        assignments: [...state.assignments, assignment] 
      })),
      updateAssignment: (id, data) => set((state) => ({
        assignments: state.assignments.map((a) => 
          a.id === id ? { ...a, ...data } : a
        )
      })),
      deleteAssignment: (id) => set((state) => ({
        assignments: state.assignments.filter((a) => a.id !== id)
      })),
      toggleComplete: (assignmentId) => set((state) => ({
        assignments: state.assignments.map((a) =>
          a.id === assignmentId ? { ...a, isCompleted: !a.isCompleted } : a
        )
      })),
      
      selectedDate: getToday(),
      setSelectedDate: (date) => set({ selectedDate: date }),
      
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'homework-storage',
      partialize: (state) => ({
        user: state.user,
        currentClassId: state.currentClassId,
      }),
    }
  )
)