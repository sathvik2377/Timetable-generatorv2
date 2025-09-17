"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, MapPin, User, BookOpen } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { Timetable, TimetableSession } from '@/types'
import { formatTime, getDayName, getSubjectTypeColor } from '@/lib/utils'

interface TimetableGridProps {
  timetable: Timetable
  editable?: boolean
  viewType?: 'general' | 'teacher' | 'class'
}

export function TimetableGrid({ timetable, editable = false, viewType = 'general' }: TimetableGridProps) {
  const [sessions, setSessions] = useState<TimetableSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<TimetableSession | null>(null)

  useEffect(() => {
    loadSessions()
  }, [timetable.id])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const sessionsData = await apiClient.getTimetableSessions(timetable.id)
      setSessions(sessionsData)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate time slots based on institution settings
  const generateTimeSlots = () => {
    const slots = []
    const startHour = 9 // Default start time
    const endHour = 17 // Default end time
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push({
        start: `${hour.toString().padStart(2, '0')}:00`,
        end: `${(hour + 1).toString().padStart(2, '0')}:00`,
        display: `${hour}:00 - ${hour + 1}:00`
      })
    }
    
    return slots
  }

  const timeSlots = generateTimeSlots()
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  // Group sessions by day and time
  const getSessionsForSlot = (dayIndex: number, timeSlot: string) => {
    return sessions.filter(session => 
      session.day_of_week === dayIndex && 
      session.start_time.startsWith(timeSlot.split(':')[0])
    )
  }

  const renderSession = (session: TimetableSession) => {
    const subjectColor = getSubjectTypeColor(session.subject_details?.type || 'core')
    const isLab = session.subject_details?.type === 'lab'
    const isCore = session.subject_details?.type === 'core'

    return (
      <motion.div
        key={session.id}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{
          scale: 1.03,
          y: -2,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
        }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelectedSession(session)}
        className={`${subjectColor} rounded-xl p-3 cursor-pointer transition-all duration-300 border backdrop-blur-sm relative overflow-hidden group hover:shadow-xl`}
        style={{
          background: isLab
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))'
            : isCore
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))'
            : undefined
        }}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        {/* Priority indicator */}
        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          isCore ? 'bg-blue-400' : isLab ? 'bg-orange-400' : 'bg-purple-400'
        } animate-pulse`} />

        <div className="space-y-1.5 relative z-10">
          {/* Subject with enhanced styling */}
          <div className="flex items-center space-x-2">
            <div className={`p-1 rounded-md ${
              isCore ? 'bg-blue-500/30' : isLab ? 'bg-orange-500/30' : 'bg-green-500/30'
            }`}>
              <BookOpen className="w-3 h-3" />
            </div>
            <span className="font-semibold text-sm truncate">
              {session.subject_details?.code || 'Unknown'}
            </span>
          </div>

          {/* Subject name */}
          <div className="text-xs opacity-90 truncate font-medium">
            {session.subject_details?.name || session.class_group_details?.name}
          </div>

          {/* Teacher with enhanced icon */}
          {session.teacher_details && (
            <div className="flex items-center space-x-2 text-xs opacity-85">
              <div className="p-0.5 rounded bg-white/20">
                <User className="w-3 h-3" />
              </div>
              <span className="truncate font-medium">
                {session.teacher_details.user_details?.first_name?.[0]}.
                {session.teacher_details.user_details?.last_name}
              </span>
            </div>
          )}

          {/* Room with enhanced styling */}
          {session.room_details && (
            <div className="flex items-center space-x-2 text-xs opacity-85">
              <div className="p-0.5 rounded bg-white/20">
                <MapPin className="w-3 h-3" />
              </div>
              <span className="truncate font-medium">{session.room_details.code}</span>
            </div>
          )}

          {/* Time with modern styling */}
          <div className="flex items-center space-x-2 text-xs opacity-75 bg-black/10 rounded-md px-2 py-1">
            <Clock className="w-3 h-3" />
            <span className="font-mono">
              {formatTime(session.start_time)} - {formatTime(session.end_time)}
            </span>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="text-gray-400">Loading timetable...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Timetable Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Enhanced Header */}
          <div className="grid grid-cols-6 gap-3 mb-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 text-center"
            >
              <Clock className="w-5 h-5 mx-auto mb-2 text-blue-400" />
              <span className="text-sm font-semibold text-primary">Time</span>
            </motion.div>
            {days.map((day, index) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-4 text-center hover:bg-glass-hover transition-all duration-300"
              >
                <span className="text-sm font-semibold text-primary">{day}</span>
                <div className="w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 mt-2 rounded-full opacity-60" />
              </motion.div>
            ))}
          </div>

          {/* Enhanced Time Slots */}
          <div className="space-y-3">
            {timeSlots.map((slot, slotIndex) => (
              <motion.div
                key={slotIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: slotIndex * 0.05 }}
                className="grid grid-cols-6 gap-3"
              >
                {/* Enhanced Time Column */}
                <div className="glass-card p-4 text-center">
                  <div className="text-xs font-mono text-blue-400 font-semibold">
                    {slot.display}
                  </div>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent mt-2" />
                </div>

                {/* Enhanced Day Columns */}
                {days.map((day, dayIndex) => {
                  const slotSessions = getSessionsForSlot(dayIndex, slot.start)

                  return (
                    <div key={`${dayIndex}-${slotIndex}`} className="min-h-[100px]">
                      {slotSessions.length > 0 ? (
                        <div className="space-y-2">
                          {slotSessions.map(session => renderSession(session))}
                        </div>
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="glass-card p-4 h-full flex items-center justify-center opacity-20 hover:opacity-40 transition-all duration-300 border-dashed border-slate-600/30 bg-gradient-to-br from-slate-800/20 to-slate-900/20"
                        >
                          <div className="text-center">
                            <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-slate-600/30 flex items-center justify-center">
                              <div className="w-2 h-2 bg-slate-500/50 rounded-full" />
                            </div>
                            <span className="text-xs text-slate-500 font-medium">Free</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )
                })}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSession(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Session Details</h3>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">Subject</label>
                  <p className="text-white font-medium">
                    {selectedSession.subject_details?.code} - {selectedSession.subject_details?.name}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Class Group</label>
                  <p className="text-white">{selectedSession.class_group_details?.name}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Teacher</label>
                  <p className="text-white">
                    {selectedSession.teacher_details?.user_details?.first_name} {selectedSession.teacher_details?.user_details?.last_name}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Room</label>
                  <p className="text-white">
                    {selectedSession.room_details?.name} ({selectedSession.room_details?.code})
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Time</label>
                  <p className="text-white">
                    {getDayName(selectedSession.day_of_week)}, {formatTime(selectedSession.start_time)} - {formatTime(selectedSession.end_time)}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Type</label>
                  <p className="text-white capitalize">{selectedSession.session_type}</p>
                </div>

                {selectedSession.notes && (
                  <div>
                    <label className="text-sm text-gray-400">Notes</label>
                    <p className="text-white">{selectedSession.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Enhanced Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 bg-gradient-to-r from-slate-800/40 to-slate-700/40 border-slate-600/30"
      >
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-3 h-3 text-white" />
          </div>
          <h4 className="text-sm font-semibold text-primary">Subject Types & Color Legend</h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { type: 'core', label: 'Core Subjects', icon: '📚', description: 'Essential curriculum' },
            { type: 'elective', label: 'Electives', icon: '🎯', description: 'Optional subjects' },
            { type: 'lab', label: 'Laboratory', icon: '🔬', description: 'Practical sessions' },
            { type: 'skill', label: 'Skill Development', icon: '💡', description: 'Skill building' },
            { type: 'project', label: 'Projects', icon: '🚀', description: 'Project work' }
          ].map(({ type, label, icon, description }) => (
            <motion.div
              key={type}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center p-3 rounded-lg glass-card hover:bg-glass-hover transition-all duration-300"
            >
              <div className="text-lg mb-1">{icon}</div>
              <div className={`w-4 h-4 rounded-full mb-2 ${getSubjectTypeColor(type)} border-2 border-glass-border`} />
              <span className="text-xs font-medium text-primary text-center">{label}</span>
              <span className="text-xs text-muted text-center mt-1">{description}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-glass-border">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>💡 Hover over sessions for details</span>
            <span>🎨 Colors indicate subject types</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
