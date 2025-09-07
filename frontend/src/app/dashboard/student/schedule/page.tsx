"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen,
  AlertCircle,
  CheckCircle,
  Download,
  Filter,
  Search
} from 'lucide-react'
import { TimetableGrid } from '@/components/timetable-grid'
import { ExportMenu } from '@/components/export-menu'
import { apiClient } from '@/lib/api'
import { User as UserType, ClassGroup, Timetable, TimetableSession } from '@/types'
import toast from 'react-hot-toast'

export default function StudentSchedulePage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [classGroup, setClassGroup] = useState<ClassGroup | null>(null)
  const [timetables, setTimetables] = useState<Timetable[]>([])
  const [activeTimetable, setActiveTimetable] = useState<Timetable | null>(null)
  const [sessions, setSessions] = useState<TimetableSession[]>([])
  const [filteredSessions, setFilteredSessions] = useState<TimetableSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayNumbers = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 }

  useEffect(() => {
    loadStudentData()
  }, [])

  useEffect(() => {
    filterSessions()
  }, [sessions, selectedDay, selectedSubject, searchTerm])

  const loadStudentData = async () => {
    try {
      // Load user data from localStorage
      const userData = localStorage.getItem('user')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      }

      // For demo purposes, create sample data
      const demoTimetable: Timetable = {
        id: 1,
        institution: 1,
        institution_name: 'Demo Institution',
        name: 'Computer Science - Fall 2024',
        academic_year: '2024-25',
        semester: 1,
        status: 'active',
        status_display: 'Active',
        version: 1,
        generated_by: 1,
        generated_by_name: 'Admin User',
        generation_time: new Date().toISOString(),
        algorithm_used: 'OR-Tools',
        generation_parameters: {},
        total_sessions: 25,
        optimization_score: 85.5,
        conflicts_resolved: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setActiveTimetable(demoTimetable)
      setTimetables([demoTimetable])

      // Create demo sessions
      const demoSessions: TimetableSession[] = [
        {
          id: 1,
          timetable: 1,
          subject: 1,
          subject_details: { id: 1, name: 'Data Structures', code: 'CS301', credits: 4, subject_type: 'theory', department: 1 },
          teacher: 1,
          teacher_details: { id: 1, user: 1, user_details: { first_name: 'Dr. John', last_name: 'Smith' }, employee_id: 'T001', department: 1, max_hours_per_day: 6 },
          room: 1,
          room_details: { id: 1, name: 'Room 101', code: 'R101', room_type: 'classroom', capacity: 40, institution: 1 },
          class_group: 1,
          class_group_details: { id: 1, name: 'CS-A', branch: 1, branch_name: 'Computer Science', year: 3, semester: 1, section: 'A', student_count: 35 },
          day_of_week: 1,
          day_display: 'Monday',
          start_time: '09:00',
          end_time: '10:00',
          session_type: 'theory',
          session_type_display: 'Theory Class',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          timetable: 1,
          subject: 2,
          subject_details: { id: 2, name: 'Algorithms', code: 'CS302', credits: 3, subject_type: 'theory', department: 1 },
          teacher: 1,
          teacher_details: { id: 1, user: 1, user_details: { first_name: 'Dr. John', last_name: 'Smith' }, employee_id: 'T001', department: 1, max_hours_per_day: 6 },
          room: 2,
          room_details: { id: 2, name: 'Room 205', code: 'R205', room_type: 'classroom', capacity: 35, institution: 1 },
          class_group: 1,
          class_group_details: { id: 1, name: 'CS-A', branch: 1, branch_name: 'Computer Science', year: 3, semester: 1, section: 'A', student_count: 35 },
          day_of_week: 1,
          day_display: 'Monday',
          start_time: '10:00',
          end_time: '11:00',
          session_type: 'theory',
          session_type_display: 'Theory Class',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          timetable: 1,
          subject: 3,
          subject_details: { id: 3, name: 'Programming Lab', code: 'CS303', credits: 2, subject_type: 'practical', department: 1 },
          teacher: 2,
          teacher_details: { id: 2, user: 2, user_details: { first_name: 'Prof. Sarah', last_name: 'Johnson' }, employee_id: 'T002', department: 1, max_hours_per_day: 6 },
          room: 3,
          room_details: { id: 3, name: 'Lab A', code: 'LA', room_type: 'lab', capacity: 30, institution: 1 },
          class_group: 1,
          class_group_details: { id: 1, name: 'CS-A', branch: 1, branch_name: 'Computer Science', year: 3, semester: 1, section: 'A', student_count: 35 },
          day_of_week: 1,
          day_display: 'Monday',
          start_time: '14:00',
          end_time: '16:00',
          session_type: 'practical',
          session_type_display: 'Lab Session',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      setSessions(demoSessions)
      
    } catch (error) {
      console.error('Failed to load student data:', error)
      toast.error('Failed to load schedule data')
    } finally {
      setLoading(false)
    }
  }

  const filterSessions = () => {
    let filtered = sessions

    if (selectedDay !== 'all') {
      const dayNum = dayNumbers[selectedDay as keyof typeof dayNumbers]
      filtered = filtered.filter(session => session.day_of_week === dayNum)
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(session => 
        session.subject_details?.code === selectedSubject
      )
    }

    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.subject_details?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.subject_details?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.teacher_details?.user_details?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.teacher_details?.user_details?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.room_details?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredSessions(filtered)
  }

  const getUniqueSubjects = () => {
    const subjects = sessions.map(s => s.subject_details).filter(Boolean)
    return Array.from(new Set(subjects.map(s => s!.code))).map(code => 
      subjects.find(s => s!.code === code)!
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-white">Loading schedule...</p>
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
              <h1 className="text-2xl font-bold text-white">My Schedule</h1>
              <p className="text-gray-300">View and manage your class schedule</p>
            </div>

            <div className="flex items-center space-x-4">
              {activeTimetable && (
                <ExportMenu
                  timetableId={activeTimetable.id}
                  timetable={activeTimetable}
                  type="timetable"
                />
              )}
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
                  placeholder="Search subjects, teachers, or rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 glass border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="px-4 py-3 glass border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Days</option>
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-3 glass border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Subjects</option>
                {getUniqueSubjects().map(subject => (
                  <option key={subject.code} value={subject.code}>
                    {subject.code} - {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        {activeTimetable && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Weekly Schedule</h2>
                <p className="text-gray-300">{activeTimetable.name}</p>
              </div>
            </div>
            
            <div id="timetable-grid">
              <TimetableGrid 
                timetable={activeTimetable} 
                viewType="class"
              />
            </div>
          </motion.div>
        )}

        {/* Session List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">
            Schedule Details ({filteredSessions.length} sessions)
          </h3>
          
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass border border-white/10 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h4 className="text-white font-medium">
                        {session.subject_details?.code} - {session.subject_details?.name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        session.session_type === 'theory' 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : session.session_type === 'practical'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {session.session_type_display}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{session.day_display}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{session.start_time} - {session.end_time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{session.room_details?.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>
                          {session.teacher_details?.user_details?.first_name} {session.teacher_details?.user_details?.last_name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {filteredSessions.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No sessions found matching your filters</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
