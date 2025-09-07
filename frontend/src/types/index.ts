// User types
export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'faculty' | 'student'
  phone_number?: string
  employee_id?: string
  student_id?: string
  preferred_theme: 'light' | 'dark'
  full_name: string
  display_name: string
  is_active: boolean
  date_joined: string
}

export interface UserProfile {
  user: User
  bio?: string
  avatar?: string
  address?: string
  emergency_contact?: string
  department?: string
  specialization?: string
  email_notifications: boolean
  sms_notifications: boolean
}

// Institution types
export interface Institution {
  id: number
  name: string
  type: 'school' | 'college' | 'university'
  type_display: string
  address?: string
  phone?: string
  email?: string
  website?: string
  academic_year: string
  start_time: string
  end_time: string
  slot_duration: number
  lunch_break_start: string
  lunch_break_end: string
  working_days: number[]
  created_at: string
  updated_at: string
}

export interface Branch {
  id: number
  institution: number
  institution_name: string
  name: string
  code: string
  description?: string
  head?: number
  head_name?: string
  created_at: string
  updated_at: string
}

export interface ClassGroup {
  id: number
  branch: number
  branch_name: string
  branch_code: string
  name: string
  year: number
  section: string
  semester: number
  strength: number
  coordinator?: number
  coordinator_name?: string
  created_at: string
  updated_at: string
}

export interface Subject {
  id: number
  branch: number
  branch_name: string
  branch_code: string
  code: string
  name: string
  type: 'core' | 'elective' | 'lab' | 'skill' | 'project'
  type_display: string
  credits: number
  semester: number
  year: number
  theory_hours: number
  practical_hours: number
  tutorial_hours: number
  total_hours: number
  prerequisites: number[]
  created_at: string
  updated_at: string
}

export interface Teacher {
  id: number
  user: number
  user_details: User
  employee_id: string
  designation: 'professor' | 'associate_professor' | 'assistant_professor' | 'lecturer' | 'visiting_faculty'
  designation_display: string
  department: number
  department_name: string
  specialization?: string
  qualification?: string
  experience_years: number
  max_hours_per_day: number
  max_hours_per_week: number
  max_consecutive_hours: number
  availability: Record<string, any>
  subject_assignments: TeacherSubject[]
  created_at: string
  updated_at: string
}

export interface TeacherSubject {
  id: number
  subject: number
  subject_name: string
  subject_code: string
  preference_level: number
  can_teach_theory: boolean
  can_teach_practical: boolean
  created_at: string
}

export interface Room {
  id: number
  institution: number
  institution_name: string
  name: string
  code: string
  type: 'classroom' | 'laboratory' | 'seminar_hall' | 'auditorium' | 'library'
  type_display: string
  capacity: number
  has_projector: boolean
  has_computer: boolean
  has_whiteboard: boolean
  has_ac: boolean
  building?: string
  floor: number
  is_active: boolean
  availability: Record<string, any>
  created_at: string
  updated_at: string
}

// Timetable types
export interface Timetable {
  id: number
  institution: number
  institution_name: string
  name: string
  academic_year: string
  semester: number
  status: 'draft' | 'active' | 'archived'
  status_display: string
  version: number
  generated_by: number
  generated_by_name: string
  generation_time?: string
  algorithm_used: string
  generation_parameters: Record<string, any>
  total_sessions: number
  conflicts_resolved: number
  optimization_score: number
  sessions?: TimetableSession[]
  created_at: string
  updated_at: string
}

export interface TimetableSession {
  id: number
  timetable: number
  subject?: number
  subject_details?: Subject
  teacher?: number
  teacher_details?: Teacher
  room?: number
  room_details?: Room
  class_group: number
  class_group_details: ClassGroup
  day_of_week: number
  day_display: string
  start_time: string
  end_time: string
  session_type: 'theory' | 'practical' | 'tutorial' | 'break' | 'lunch'
  session_type_display: string
  notes?: string
  is_fixed: boolean
  created_at: string
  updated_at: string
}

// API types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  count: number
  next?: string
  previous?: string
  results: T[]
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  tokens: {
    access: string
    refresh: string
  }
}

export interface GenerateTimetableRequest {
  institution_id: number
  name: string
  semester?: number
  parameters?: Record<string, any>
}

export interface GenerateTimetableResponse {
  success: boolean
  message: string
  timetable_id?: number
  total_sessions?: number
  optimization_score?: number
  error?: string
}

// Analytics types
export interface FacultyWorkloadData {
  [teacherName: string]: {
    teacher_id: number
    total_hours: number
    subjects: string[]
    classes: string[]
    subject_count: number
    class_count: number
    daily_hours: Record<number, number>
  }
}

export interface RoomUtilizationData {
  [roomName: string]: {
    room_id: number
    room_code: string
    room_type: string
    capacity: number
    total_sessions: number
    utilization_percentage: number
    utilization_by_day: Record<number, number>
    subjects_taught: string[]
    classes_hosted: string[]
  }
}

export interface StudentDensityData {
  [className: string]: {
    class_id: number
    branch: string
    year: number
    section: string
    strength: number
    total_sessions: number
    avg_sessions_per_day: number
    sessions_by_day: Record<number, number>
    subjects: string[]
    teachers: string[]
  }
}

// Form types
export interface SetupWizardData {
  institution: Partial<Institution>
  branches: Partial<Branch>[]
  subjects: Partial<Subject>[]
  teachers: Partial<Teacher>[]
  rooms: Partial<Room>[]
  classGroups: Partial<ClassGroup>[]
  constraints: any[]
}

// Theme types
export type Theme = 'light' | 'dark'

// Navigation types
export interface NavItem {
  title: string
  href: string
  icon?: string
  disabled?: boolean
  external?: boolean
  label?: string
}

export interface SidebarNavItem extends NavItem {
  items?: SidebarNavItem[]
}
