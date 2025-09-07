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
    
    return (
      <motion.div
        key={session.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setSelectedSession(session)}
        className={`${subjectColor} rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-lg border backdrop-blur-sm`}
      >
        <div className="space-y-1">
          {/* Subject */}
          <div className="flex items-center space-x-1">
            <BookOpen className="w-3 h-3" />
            <span className="font-medium text-sm truncate">
              {session.subject_details?.code || 'Unknown'}
            </span>
          </div>
          
          {/* Class Group */}
          <div className="text-xs opacity-90 truncate">
            {session.class_group_details?.name}
          </div>
          
          {/* Teacher */}
          {session.teacher_details && (
            <div className="flex items-center space-x-1 text-xs opacity-80">
              <User className="w-3 h-3" />
              <span className="truncate">
                {session.teacher_details.user_details?.first_name?.[0]}.
                {session.teacher_details.user_details?.last_name}
              </span>
            </div>
          )}
          
          {/* Room */}
          {session.room_details && (
            <div className="flex items-center space-x-1 text-xs opacity-80">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{session.room_details.code}</span>
            </div>
          )}
        </div>
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
          {/* Header */}
          <div className="grid grid-cols-6 gap-2 mb-2">
            <div className="glass-card p-3 text-center">
              <Clock className="w-4 h-4 mx-auto mb-1 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Time</span>
            </div>
            {days.map((day, index) => (
              <div key={day} className="glass-card p-3 text-center">
                <span className="text-sm font-medium text-white">{day}</span>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="space-y-2">
            {timeSlots.map((slot, slotIndex) => (
              <div key={slotIndex} className="grid grid-cols-6 gap-2">
                {/* Time Column */}
                <div className="glass-card p-3 text-center">
                  <span className="text-xs text-gray-400">{slot.display}</span>
                </div>

                {/* Day Columns */}
                {days.map((day, dayIndex) => {
                  const slotSessions = getSessionsForSlot(dayIndex, slot.start)
                  
                  return (
                    <div key={`${dayIndex}-${slotIndex}`} className="min-h-[80px]">
                      {slotSessions.length > 0 ? (
                        <div className="space-y-1">
                          {slotSessions.map(session => renderSession(session))}
                        </div>
                      ) : (
                        <div className="glass-card p-3 h-full flex items-center justify-center opacity-30">
                          <span className="text-xs text-gray-500">Free</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
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

      {/* Legend */}
      <div className="glass-card p-4">
        <h4 className="text-sm font-medium text-white mb-3">Subject Types</h4>
        <div className="flex flex-wrap gap-3">
          {[
            { type: 'core', label: 'Core' },
            { type: 'elective', label: 'Elective' },
            { type: 'lab', label: 'Laboratory' },
            { type: 'skill', label: 'Skill Development' },
            { type: 'project', label: 'Project' }
          ].map(({ type, label }) => (
            <div key={type} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded ${getSubjectTypeColor(type)}`} />
              <span className="text-xs text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
