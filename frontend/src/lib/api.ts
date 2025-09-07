import axios, { AxiosInstance, AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  Institution, 
  Branch, 
  Subject, 
  Teacher, 
  Room, 
  ClassGroup, 
  Timetable, 
  TimetableSession,
  GenerateTimetableRequest,
  GenerateTimetableResponse,
  PaginatedResponse,
  FacultyWorkloadData,
  RoomUtilizationData,
  StudentDensityData
} from '@/types'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = Cookies.get('refresh_token')
            if (refreshToken) {
              const response = await this.client.post('/api/auth/token/refresh/', {
                refresh: refreshToken,
              })

              const { access } = response.data
              Cookies.set('access_token', access)

              originalRequest.headers.Authorization = `Bearer ${access}`
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            Cookies.remove('access_token')
            Cookies.remove('refresh_token')
            window.location.href = '/login'
          }
        }

        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post('/api/users/dev-login/', credentials)
    return response.data
  }

  async logout(): Promise<void> {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get('/api/users/me/')
    return response.data
  }

  // Institution endpoints
  async getInstitutions(): Promise<Institution[]> {
    const response = await this.client.get('/api/timetable/institutions/')
    return response.data.results || response.data
  }

  async getInstitution(id: number): Promise<Institution> {
    const response = await this.client.get(`/api/timetable/institutions/${id}/`)
    return response.data
  }

  async createInstitution(data: Partial<Institution>): Promise<Institution> {
    const response = await this.client.post('/api/timetable/institutions/', data)
    return response.data
  }

  async updateInstitution(id: number, data: Partial<Institution>): Promise<Institution> {
    const response = await this.client.patch(`/api/timetable/institutions/${id}/`, data)
    return response.data
  }

  // Branch endpoints
  async getBranches(institutionId?: number): Promise<Branch[]> {
    const params = institutionId ? { institution_id: institutionId } : {}
    const response = await this.client.get('/api/timetable/branches/', { params })
    return response.data.results || response.data
  }

  async createBranch(data: Partial<Branch>): Promise<Branch> {
    const response = await this.client.post('/api/timetable/branches/', data)
    return response.data
  }

  // Subject endpoints
  async getSubjects(branchId?: number): Promise<Subject[]> {
    const params = branchId ? { branch_id: branchId } : {}
    const response = await this.client.get('/api/timetable/subjects/', { params })
    return response.data.results || response.data
  }

  async createSubject(data: Partial<Subject>): Promise<Subject> {
    const response = await this.client.post('/api/timetable/subjects/', data)
    return response.data
  }

  // Teacher endpoints
  async getTeachers(departmentId?: number): Promise<Teacher[]> {
    const params = departmentId ? { department_id: departmentId } : {}
    const response = await this.client.get('/api/timetable/teachers/', { params })
    return response.data.results || response.data
  }

  async createTeacher(data: Partial<Teacher>): Promise<Teacher> {
    const response = await this.client.post('/api/timetable/teachers/', data)
    return response.data
  }

  // Room endpoints
  async getRooms(institutionId?: number): Promise<Room[]> {
    const params = institutionId ? { institution_id: institutionId } : {}
    const response = await this.client.get('/api/timetable/rooms/', { params })
    return response.data.results || response.data
  }

  async createRoom(data: Partial<Room>): Promise<Room> {
    const response = await this.client.post('/api/timetable/rooms/', data)
    return response.data
  }

  // Class Group endpoints
  async getClassGroups(branchId?: number): Promise<ClassGroup[]> {
    const params = branchId ? { branch_id: branchId } : {}
    const response = await this.client.get('/api/timetable/class-groups/', { params })
    return response.data.results || response.data
  }

  async createClassGroup(data: Partial<ClassGroup>): Promise<ClassGroup> {
    const response = await this.client.post('/api/timetable/class-groups/', data)
    return response.data
  }

  // Timetable endpoints
  async getTimetables(institutionId?: number): Promise<Timetable[]> {
    const params = institutionId ? { institution_id: institutionId } : {}
    const response = await this.client.get('/api/timetable/timetables/', { params })
    return response.data.results || response.data
  }

  async getTimetable(id: number): Promise<Timetable> {
    const response = await this.client.get(`/api/timetable/timetables/${id}/`)
    return response.data
  }

  async generateTimetable(data: GenerateTimetableRequest): Promise<GenerateTimetableResponse> {
    try {
      const response = await this.client.post('/api/scheduler/generate/', data)
      return response.data
    } catch (error) {
      // Fallback to demo endpoint if main endpoint fails
      console.log('Main endpoint failed, trying demo endpoint...')
      const response = await this.client.post('/api/scheduler/generate-demo/', {})
      return response.data
    }
  }

  async activateTimetable(id: number): Promise<void> {
    await this.client.post(`/api/timetable/timetables/${id}/activate/`)
  }

  // Timetable Session endpoints
  async getTimetableSessions(timetableId: number): Promise<TimetableSession[]> {
    const response = await this.client.get('/api/timetable/sessions/', {
      params: { timetable_id: timetableId }
    })
    return response.data.results || response.data
  }

  async updateTimetableSession(id: number, data: Partial<TimetableSession>): Promise<TimetableSession> {
    const response = await this.client.patch(`/api/timetable/sessions/${id}/`, data)
    return response.data
  }

  // Export endpoints
  async exportTimetable(timetableId: number, format: string, viewType: string = 'general'): Promise<Blob> {
    const response = await this.client.get(
      `/api/timetable/timetables/${timetableId}/export/${format}/`,
      {
        params: { view_type: viewType },
        responseType: 'blob'
      }
    )
    return response.data
  }

  async exportTimetablePDF(timetableId: number, viewType: string = 'general'): Promise<Blob> {
    return this.exportTimetable(timetableId, 'pdf', viewType)
  }

  async exportTimetableExcel(timetableId: number, viewType: string = 'general'): Promise<Blob> {
    return this.exportTimetable(timetableId, 'excel', viewType)
  }

  async exportTimetablePNG(timetableId: number, viewType: string = 'general'): Promise<Blob> {
    return this.exportTimetable(timetableId, 'png', viewType)
  }

  async exportTimetableICS(timetableId: number, viewType: string = 'general'): Promise<Blob> {
    return this.exportTimetable(timetableId, 'ics', viewType)
  }

  async exportAnalyticsPDF(institutionId: number, timetableId?: number): Promise<Blob> {
    const params: any = { institution_id: institutionId }
    if (timetableId) params.timetable_id = timetableId

    const response = await this.client.get('/api/timetable/analytics/export/pdf/', {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  async exportAnalyticsExcel(institutionId: number, timetableId?: number): Promise<Blob> {
    const params: any = { institution_id: institutionId }
    if (timetableId) params.timetable_id = timetableId

    const response = await this.client.get('/api/timetable/analytics/export/excel/', {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  // Analytics endpoints
  async getFacultyWorkloadAnalytics(institutionId?: number, timetableId?: number): Promise<{
    workload_data: FacultyWorkloadData
    summary: any
  }> {
    const params: any = {}
    if (institutionId) params.institution_id = institutionId
    if (timetableId) params.timetable_id = timetableId

    const response = await this.client.get('/api/timetable/analytics/faculty-workload/', { params })
    return response.data
  }

  async getRoomUtilizationAnalytics(institutionId?: number, timetableId?: number): Promise<{
    utilization_data: RoomUtilizationData
    summary: any
  }> {
    const params: any = {}
    if (institutionId) params.institution_id = institutionId
    if (timetableId) params.timetable_id = timetableId

    const response = await this.client.get('/api/timetable/analytics/room-utilization/', { params })
    return response.data
  }

  async getStudentDensityAnalytics(institutionId?: number, timetableId?: number): Promise<{
    density_data: StudentDensityData
    summary: any
  }> {
    const params: any = {}
    if (institutionId) params.institution_id = institutionId
    if (timetableId) params.timetable_id = timetableId

    const response = await this.client.get('/api/timetable/analytics/student-density/', { params })
    return response.data
  }

  // Validation endpoints
  async validateTimetable(timetableId: number): Promise<any> {
    const response = await this.client.post('/api/scheduler/validate/', {
      timetable_id: timetableId
    })
    return response.data
  }
}

export const apiClient = new ApiClient()
export default apiClient
