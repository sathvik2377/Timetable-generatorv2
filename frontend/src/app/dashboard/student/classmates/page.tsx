"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin,
  GraduationCap,
  User,
  Calendar,
  BookOpen,
  Award,
  Filter
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { User as UserType, ClassGroup } from '@/types'
import toast from 'react-hot-toast'

interface Classmate extends UserType {
  student_id?: string
  year?: number
  semester?: number
  gpa?: number
  attendance?: number
  subjects_enrolled?: number
}

export default function StudentClassmatesPage() {
  const [classmates, setClassmates] = useState<Classmate[]>([])
  const [filteredClassmates, setFilteredClassmates] = useState<Classmate[]>([])
  const [classGroup, setClassGroup] = useState<ClassGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<string>('name')
  const [selectedClassmate, setSelectedClassmate] = useState<Classmate | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadClassmates()
  }, [])

  useEffect(() => {
    filterAndSortClassmates()
  }, [classmates, searchTerm, sortBy])

  const loadClassmates = async () => {
    try {
      // For demo purposes, create sample classmates data
      const demoClassmates: Classmate[] = [
        {
          id: 1,
          username: 'alice.johnson',
          email: 'alice.johnson@demo.edu',
          first_name: 'Alice',
          last_name: 'Johnson',
          role: 'student',
          display_name: 'Alice Johnson',
          is_active: true,
          date_joined: '2023-08-15',
          student_id: 'CS2023001',
          year: 3,
          semester: 1,
          gpa: 8.7,
          attendance: 92,
          subjects_enrolled: 6
        },
        {
          id: 2,
          username: 'bob.smith',
          email: 'bob.smith@demo.edu',
          first_name: 'Bob',
          last_name: 'Smith',
          role: 'student',
          display_name: 'Bob Smith',
          is_active: true,
          date_joined: '2023-08-15',
          student_id: 'CS2023002',
          year: 3,
          semester: 1,
          gpa: 7.9,
          attendance: 88,
          subjects_enrolled: 6
        },
        {
          id: 3,
          username: 'carol.davis',
          email: 'carol.davis@demo.edu',
          first_name: 'Carol',
          last_name: 'Davis',
          role: 'student',
          display_name: 'Carol Davis',
          is_active: true,
          date_joined: '2023-08-15',
          student_id: 'CS2023003',
          year: 3,
          semester: 1,
          gpa: 9.1,
          attendance: 95,
          subjects_enrolled: 6
        },
        {
          id: 4,
          username: 'david.wilson',
          email: 'david.wilson@demo.edu',
          first_name: 'David',
          last_name: 'Wilson',
          role: 'student',
          display_name: 'David Wilson',
          is_active: true,
          date_joined: '2023-08-15',
          student_id: 'CS2023004',
          year: 3,
          semester: 1,
          gpa: 8.3,
          attendance: 90,
          subjects_enrolled: 6
        },
        {
          id: 5,
          username: 'emma.brown',
          email: 'emma.brown@demo.edu',
          first_name: 'Emma',
          last_name: 'Brown',
          role: 'student',
          display_name: 'Emma Brown',
          is_active: true,
          date_joined: '2023-08-15',
          student_id: 'CS2023005',
          year: 3,
          semester: 1,
          gpa: 8.8,
          attendance: 93,
          subjects_enrolled: 6
        },
        {
          id: 6,
          username: 'frank.miller',
          email: 'frank.miller@demo.edu',
          first_name: 'Frank',
          last_name: 'Miller',
          role: 'student',
          display_name: 'Frank Miller',
          is_active: true,
          date_joined: '2023-08-15',
          student_id: 'CS2023006',
          year: 3,
          semester: 1,
          gpa: 7.5,
          attendance: 85,
          subjects_enrolled: 6
        },
        {
          id: 7,
          username: 'grace.taylor',
          email: 'grace.taylor@demo.edu',
          first_name: 'Grace',
          last_name: 'Taylor',
          role: 'student',
          display_name: 'Grace Taylor',
          is_active: true,
          date_joined: '2023-08-15',
          student_id: 'CS2023007',
          year: 3,
          semester: 1,
          gpa: 9.3,
          attendance: 97,
          subjects_enrolled: 6
        },
        {
          id: 8,
          username: 'henry.anderson',
          email: 'henry.anderson@demo.edu',
          first_name: 'Henry',
          last_name: 'Anderson',
          role: 'student',
          display_name: 'Henry Anderson',
          is_active: true,
          date_joined: '2023-08-15',
          student_id: 'CS2023008',
          year: 3,
          semester: 1,
          gpa: 8.1,
          attendance: 89,
          subjects_enrolled: 6
        }
      ]

      const demoClassGroup: ClassGroup = {
        id: 1,
        name: 'CS-A',
        branch: 1,
        branch_name: 'Computer Science',
        year: 3,
        semester: 1,
        section: 'A',
        student_count: demoClassmates.length
      }

      setClassmates(demoClassmates)
      setClassGroup(demoClassGroup)
      
    } catch (error) {
      console.error('Failed to load classmates:', error)
      toast.error('Failed to load classmates data')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortClassmates = () => {
    let filtered = classmates

    if (searchTerm) {
      filtered = filtered.filter(classmate =>
        classmate.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classmate.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classmate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classmate.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort classmates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
        case 'gpa':
          return (b.gpa || 0) - (a.gpa || 0)
        case 'attendance':
          return (b.attendance || 0) - (a.attendance || 0)
        case 'student_id':
          return (a.student_id || '').localeCompare(b.student_id || '')
        default:
          return 0
      }
    })

    setFilteredClassmates(filtered)
  }

  const getGPAColor = (gpa: number) => {
    if (gpa >= 9.0) return 'text-green-400'
    if (gpa >= 8.0) return 'text-blue-400'
    if (gpa >= 7.0) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return 'text-green-400'
    if (attendance >= 80) return 'text-yellow-400'
    return 'text-red-400'
  }

  const handleClassmateClick = (classmate: Classmate) => {
    setSelectedClassmate(classmate)
    setShowDetails(true)
  }

  const averageGPA = classmates.reduce((sum, c) => sum + (c.gpa || 0), 0) / classmates.length
  const averageAttendance = classmates.reduce((sum, c) => sum + (c.attendance || 0), 0) / classmates.length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-white">Loading classmates...</p>
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
              <h1 className="text-2xl font-bold text-white">My Classmates</h1>
              <p className="text-gray-300">
                {classGroup?.name} • {classGroup?.branch_name} • Year {classGroup?.year}
              </p>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Students</p>
                <p className="text-xl font-bold text-white">{classmates.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Class Average GPA</p>
                <p className="text-xl font-bold text-white">{averageGPA.toFixed(1)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Average Attendance</p>
                <p className="text-xl font-bold text-white">{averageAttendance.toFixed(1)}%</p>
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
                  placeholder="Search by name, email, or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 glass border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 glass border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="name">Sort by Name</option>
                <option value="gpa">Sort by GPA</option>
                <option value="attendance">Sort by Attendance</option>
                <option value="student_id">Sort by Student ID</option>
              </select>
            </div>
          </div>
        </div>

        {/* Classmates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClassmates.map((classmate) => (
            <motion.div
              key={classmate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleClassmateClick(classmate)}
              className="glass-card p-6 cursor-pointer hover:bg-white/5 transition-all"
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {classmate.first_name} {classmate.last_name}
                </h3>
                <p className="text-blue-400 text-sm">{classmate.student_id}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">GPA</span>
                  <span className={`font-semibold ${getGPAColor(classmate.gpa || 0)}`}>
                    {classmate.gpa?.toFixed(1)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Attendance</span>
                  <span className={`font-semibold ${getAttendanceColor(classmate.attendance || 0)}`}>
                    {classmate.attendance}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Subjects</span>
                  <span className="text-white font-semibold">{classmate.subjects_enrolled}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{classmate.email}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredClassmates.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No classmates found matching your search</p>
          </div>
        )}

        {/* Classmate Details Modal */}
        {showDetails && selectedClassmate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {selectedClassmate.first_name} {selectedClassmate.last_name}
                    </h3>
                    <p className="text-blue-400 font-medium">{selectedClassmate.student_id}</p>
                  </div>
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
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-white">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{selectedClassmate.email}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Academic Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Year</span>
                        <span className="text-white">{selectedClassmate.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Semester</span>
                        <span className="text-white">{selectedClassmate.semester}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Subjects Enrolled</span>
                        <span className="text-white">{selectedClassmate.subjects_enrolled}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Performance</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400">GPA</span>
                          <span className={`font-semibold ${getGPAColor(selectedClassmate.gpa || 0)}`}>
                            {selectedClassmate.gpa?.toFixed(1)}/10.0
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400">Attendance</span>
                          <span className={`font-semibold ${getAttendanceColor(selectedClassmate.attendance || 0)}`}>
                            {selectedClassmate.attendance}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              (selectedClassmate.attendance || 0) >= 90 ? 'bg-green-500' :
                              (selectedClassmate.attendance || 0) >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${selectedClassmate.attendance}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => window.open(`mailto:${selectedClassmate.email}`, '_blank')}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Email</span>
                </button>
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
