const API_URL = 'http://localhost:3001/api'

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'user-1',
      ...options.headers,
    },
  }

  const response = await fetch(url, config)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Request failed')
  }

  return response.json()
}

export const api = {
  // Классы
  getClasses: () => request<any[]>('/classes'),
  
  getClass: (id: string) => request<any>(`/classes/${id}`),
  
  createClass: (data: { name: string; schoolName?: string }) =>
    request<any>('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  joinClass: (inviteCode: string) =>
    request<any>('/classes/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    }),
  
  // Предметы
  getSubjects: (classId: string) =>
    request<any[]>(`/subjects?classId=${classId}`),
  
  createSubject: (data: { classId: string; name: string; emoji?: string }) =>
    request<any>('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteSubject: (id: string) =>
    request<any>(`/subjects/${id}`, {
      method: 'DELETE',
    }),
  
  // Задания
  getAssignments: (params: { classId?: string; date?: string }) => {
    const query = new URLSearchParams()
    if (params.classId) query.set('classId', params.classId)
    if (params.date) query.set('date', params.date)
    return request<any[]>(`/assignments?${query}`)
  },
  
  createAssignment: (data: {
    classId: string
    subjectId: string
    dueDate: string
    content: string
  }) =>
    request<any>('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateAssignment: (id: string, data: Partial<any>) =>
    request<any>(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteAssignment: (id: string) =>
    request<any>(`/assignments/${id}`, {
      method: 'DELETE',
    }),
  
  completeAssignment: (id: string, completed: boolean) =>
    request<any>(`/assignments/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ completed }),
    }),
}