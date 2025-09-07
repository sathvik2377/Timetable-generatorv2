"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  BookOpen,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  User
} from 'lucide-react'
import { TimetableGrid } from '@/components/timetable-grid'
import { ExportMenu } from '@/components/export-menu'
import { apiClient } from '@/lib/api'
import { User as UserType, ClassGroup, Timetable, TimetableSession } from '@/types'
import toast from 'react-hot-toast'

export default function StudentDashboard() {
  const [user, setUser] = useState<UserType | null>(null)
  const [classGroup, setClassGroup] = useState<ClassGroup | null>(null)
  const [timetables, setTimetables] = useState<Timetable[]>([])
  const [activeTimetable, setActiveTimetable] = useState<Timetable | null>(null)
  const [sessions, setSessions] = useState<TimetableSession[]>([])
  const [todaySessions, setTodaySessions] = useState<TimetableSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Load user data
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      setUser(userData)
      
      // Load class groups (assuming student belongs to one)
      const classGroupsData = await apiClient.getClassGroups()
      const studentClass = classGroupsData[0] // For demo, take first class
      setClassGroup(studentClass || null)
      
      if (studentClass) {
        // Load timetables
        const timetablesData = await apiClient.getTimetables()
        setTimetables(timetablesData)
        
        // Find active timetable
        const active = timetablesData.find(t => t.status === 'active')
        setActiveTimetable(active || null)
        
        if (active) {
          // Load sessions for this class
          const sessionsData = await apiClient.getTimetableSessions(active.id)
          const classSessions = sessionsData.filter(s => s.class_group === studentClass.id)
          setSessions(classSessions)
          
          // Filter today's sessions
          const today = new Date().getDay()
          const todaysSessions = classSessions.filter(s => s.day_of_week === today)
          setTodaySessions(todaysSessions)
        }
      }
      
    } catch (error) {
      console.error('Failed to load student data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getNextSession = () => {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    return todaySessions
      .filter(session => session.start_time > currentTime)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))[0]
  }

  const getCurrentSession = () => {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    return todaySessions.find(session => 
      session.start_time <= currentTime && session.end_time >= currentTime
    )
  }

  const getUniqueSubjects = () => {
    const subjectIds = new Set(sessions.map(s => s.subject).filter(Boolean))
    return subjectIds.size
  }

  const getUniqueTeachers = () => {
    const teacherIds = new Set(sessions.map(s => s.teacher).filter(Boolean))
    return teacherIds.size
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const nextSession = getNextSession()
  const currentSession = getCurrentSession()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
              <p className="text-gray-300">
                Welcome back, {user?.first_name} {user?.last_name}
              </p>
              {classGroup && (
                <p className="text-sm text-gray-400">
                  {classGroup.name} • {classGroup.branch_name} • Year {classGroup.year}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {activeTimetable && (
                <ExportMenu
                  timetableId={activeTimetable.id}
                  type="timetable"
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Today's Classes</p>
                <p className="text-2xl font-bold text-white">{todaySessions.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Sessions</p>
                <p className="text-2xl font-bold text-white">{sessions.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Subjects</p>
                <p className="text-2xl font-bold text-white">{getUniqueSubjects()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Teachers</p>
                <p className="text-2xl font-bold text-white">{getUniqueTeachers()}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Current/Next Session */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Current Session */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Current Class</h3>
            {currentSession ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">In Progress</span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {currentSession.subject_details?.code} - {currentSession.subject_details?.name}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {currentSession.session_type_display}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{currentSession.start_time} - {currentSession.end_time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{currentSession.room_details?.code}</span>
                  </div>
                </div>
                {currentSession.teacher_details && (
                  <div className="flex items-center space-x-1 text-sm text-gray-400">
                    <User className="w-4 h-4" />
                    <span>
                      {currentSession.teacher_details.user_details?.first_name} {currentSession.teacher_details.user_details?.last_name}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No current class</p>
              </div>
            )}
          </motion.div>

          {/* Next Session */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Next Class</h3>
            {nextSession ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">Upcoming</span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {nextSession.subject_details?.code} - {nextSession.subject_details?.name}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {nextSession.session_type_display}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{nextSession.start_time} - {nextSession.end_time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{nextSession.room_details?.code}</span>
                  </div>
                </div>
                {nextSession.teacher_details && (
                  <div className="flex items-center space-x-1 text-sm text-gray-400">
                    <User className="w-4 h-4" />
                    <span>
                      {nextSession.teacher_details.user_details?.first_name} {nextSession.teacher_details.user_details?.last_name}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No more classes today</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Timetable */}
        {activeTimetable && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Class Timetable</h2>
                <p className="text-gray-300">{activeTimetable.name}</p>
              </div>
            </div>
            
            <TimetableGrid 
              timetable={activeTimetable} 
              viewType="class"
            />
          </motion.div>
        )}
      </main>
    </div>
  )
}
