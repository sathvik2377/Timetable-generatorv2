"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Clock, 
  User, 
  MapPin,
  GraduationCap,
  Award,
  Calendar,
  FileText,
  Search,
  Filter
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { Subject, Teacher, TimetableSession } from '@/types'
import toast from 'react-hot-toast'

interface SubjectWithDetails extends Subject {
  teacher_details?: Teacher
  sessions?: TimetableSession[]
  total_hours?: number
  completed_hours?: number
  progress?: number
}

export default function StudentSubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectWithDetails[]>([])
  const [filteredSubjects, setFilteredSubjects] = useState<SubjectWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<SubjectWithDetails | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadSubjects()
  }, [])

  useEffect(() => {
    filterSubjects()
  }, [subjects, searchTerm, filterType])

  const loadSubjects = async () => {
    try {
      // For demo purposes, create sample subjects data
      const demoSubjects: SubjectWithDetails[] = [
        {
          id: 1,
          name: 'Data Structures and Algorithms',
          code: 'CS301',
          credits: 4,
          subject_type: 'theory',
          department: 1,
          teacher_details: {
            id: 1,
            user: 1,
            user_details: { first_name: 'Dr. John', last_name: 'Smith' },
            employee_id: 'T001',
            department: 1,
            max_hours_per_day: 6
          },
          total_hours: 60,
          completed_hours: 45,
          progress: 75
        },
        {
          id: 2,
          name: 'Database Management Systems',
          code: 'CS302',
          credits: 3,
          subject_type: 'theory',
          department: 1,
          teacher_details: {
            id: 2,
            user: 2,
            user_details: { first_name: 'Prof. Sarah', last_name: 'Johnson' },
            employee_id: 'T002',
            department: 1,
            max_hours_per_day: 6
          },
          total_hours: 45,
          completed_hours: 30,
          progress: 67
        },
        {
          id: 3,
          name: 'Programming Laboratory',
          code: 'CS303',
          credits: 2,
          subject_type: 'practical',
          department: 1,
          teacher_details: {
            id: 3,
            user: 3,
            user_details: { first_name: 'Dr. Michael', last_name: 'Brown' },
            employee_id: 'T003',
            department: 1,
            max_hours_per_day: 6
          },
          total_hours: 30,
          completed_hours: 24,
          progress: 80
        },
        {
          id: 4,
          name: 'Computer Networks',
          code: 'CS304',
          credits: 3,
          subject_type: 'theory',
          department: 1,
          teacher_details: {
            id: 4,
            user: 4,
            user_details: { first_name: 'Dr. Emily', last_name: 'Davis' },
            employee_id: 'T004',
            department: 1,
            max_hours_per_day: 6
          },
          total_hours: 45,
          completed_hours: 20,
          progress: 44
        },
        {
          id: 5,
          name: 'Software Engineering',
          code: 'CS305',
          credits: 4,
          subject_type: 'theory',
          department: 1,
          teacher_details: {
            id: 5,
            user: 5,
            user_details: { first_name: 'Prof. Robert', last_name: 'Wilson' },
            employee_id: 'T005',
            department: 1,
            max_hours_per_day: 6
          },
          total_hours: 60,
          completed_hours: 35,
          progress: 58
        },
        {
          id: 6,
          name: 'Web Development Lab',
          code: 'CS306',
          credits: 2,
          subject_type: 'practical',
          department: 1,
          teacher_details: {
            id: 6,
            user: 6,
            user_details: { first_name: 'Ms. Lisa', last_name: 'Anderson' },
            employee_id: 'T006',
            department: 1,
            max_hours_per_day: 6
          },
          total_hours: 30,
          completed_hours: 18,
          progress: 60
        }
      ]

      setSubjects(demoSubjects)
      
    } catch (error) {
      console.error('Failed to load subjects:', error)
      toast.error('Failed to load subjects data')
    } finally {
      setLoading(false)
    }
  }

  const filterSubjects = () => {
    let filtered = subjects

    if (filterType !== 'all') {
      filtered = filtered.filter(subject => subject.subject_type === filterType)
    }

    if (searchTerm) {
      filtered = filtered.filter(subject =>
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.teacher_details?.user_details?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.teacher_details?.user_details?.last_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredSubjects(filtered)
  }

  const getSubjectTypeColor = (type: string) => {
    switch (type) {
      case 'theory':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'practical':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'tutorial':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-yellow-500'
    if (progress >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const handleSubjectClick = (subject: SubjectWithDetails) => {
    setSelectedSubject(subject)
    setShowDetails(true)
  }

  const totalCredits = subjects.reduce((sum, subject) => sum + subject.credits, 0)
  const averageProgress = subjects.reduce((sum, subject) => sum + (subject.progress || 0), 0) / subjects.length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-white">Loading subjects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">My Subjects</h1>
              <p className="text-gray-300">Track your academic progress and subject details</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Credits</p>
                <p className="text-xl font-bold text-white">{totalCredits}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Average Progress</p>
                <p className="text-xl font-bold text-white">{averageProgress.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search subjects or teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 glass border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 glass border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="theory">Theory</option>
                <option value="practical">Practical</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleSubjectClick(subject)}
              className="glass-card p-6 cursor-pointer hover:bg-white/5 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{subject.name}</h3>
                  <p className="text-blue-400 font-medium">{subject.code}</p>
                </div>
                <BookOpen className="w-6 h-6 text-blue-400 flex-shrink-0" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getSubjectTypeColor(subject.subject_type)}`}>
                    {subject.subject_type.charAt(0).toUpperCase() + subject.subject_type.slice(1)}
                  </span>
                  <div className="flex items-center space-x-1 text-sm text-gray-400">
                    <Award className="w-4 h-4" />
                    <span>{subject.credits} Credits</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <User className="w-4 h-4" />
                    <span>
                      {subject.teacher_details?.user_details?.first_name} {subject.teacher_details?.user_details?.last_name}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-medium">{subject.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getProgressColor(subject.progress || 0)}`}
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{subject.completed_hours}h completed</span>
                    <span>{subject.total_hours}h total</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No subjects found matching your criteria</p>
          </div>
        )}

        {/* Subject Details Modal */}
        {showDetails && selectedSubject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedSubject.name}</h3>
                  <p className="text-blue-400 font-medium">{selectedSubject.code}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Subject Type</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getSubjectTypeColor(selectedSubject.subject_type)}`}>
                      {selectedSubject.subject_type.charAt(0).toUpperCase() + selectedSubject.subject_type.slice(1)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Credits</h4>
                    <p className="text-white font-medium">{selectedSubject.credits}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Instructor</h4>
                    <p className="text-white font-medium">
                      {selectedSubject.teacher_details?.user_details?.first_name} {selectedSubject.teacher_details?.user_details?.last_name}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Progress</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white font-medium">{selectedSubject.progress}%</span>
                        <span className="text-gray-400">{selectedSubject.completed_hours}h / {selectedSubject.total_hours}h</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all ${getProgressColor(selectedSubject.progress || 0)}`}
                          style={{ width: `${selectedSubject.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 px-4 py-2 glass border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}
