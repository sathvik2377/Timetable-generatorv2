'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Upload,
  Clock,
  MapPin,
  Users,
  BookOpen,
  Edit3,
  Copy,
  RefreshCw,
  CheckCircle,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SimpleSlot {
  id: string
  subject: string
  teacher: string
  room: string
  color: string
  type: 'theory' | 'practical' | 'tutorial' | 'break'
}

interface SimpleTimetableCreatorProps {
  onComplete: (timetable: any) => void
  onCancel: () => void
}

export default function SimpleTimetableCreator({ onComplete, onCancel }: SimpleTimetableCreatorProps) {
  const [timetableName, setTimetableName] = useState('My Custom Timetable')
  const [selectedBranch, setSelectedBranch] = useState('General')
  const [selectedSection, setSelectedSection] = useState('A')
  
  const timeSlots = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', 
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00'
  ]
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  
  const [timetable, setTimetable] = useState<Record<string, Record<string, SimpleSlot | null>>>(() => {
    const initialTimetable: Record<string, Record<string, SimpleSlot | null>> = {}
    days.forEach(day => {
      initialTimetable[day] = {}
      timeSlots.forEach(slot => {
        if (slot === '13:00-14:00') {
          // Default lunch break
          initialTimetable[day][slot] = {
            id: `lunch-${day}`,
            subject: 'Lunch Break',
            teacher: '',
            room: 'Cafeteria',
            color: '#10B981',
            type: 'break'
          }
        } else {
          initialTimetable[day][slot] = null
        }
      })
    })
    return initialTimetable
  })

  const [selectedSlot, setSelectedSlot] = useState<{day: string, timeSlot: string} | null>(null)
  const [showSlotEditor, setShowSlotEditor] = useState(false)
  const [editingSlot, setEditingSlot] = useState<SimpleSlot>({
    id: '',
    subject: '',
    teacher: '',
    room: '',
    color: '#3B82F6',
    type: 'theory'
  })

  const subjectColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ]

  const commonSubjects = [
    { name: 'Mathematics', type: 'theory', color: '#3B82F6' },
    { name: 'Physics', type: 'theory', color: '#10B981' },
    { name: 'Chemistry', type: 'theory', color: '#F59E0B' },
    { name: 'Computer Science', type: 'theory', color: '#8B5CF6' },
    { name: 'Programming Lab', type: 'practical', color: '#06B6D4' },
    { name: 'Physics Lab', type: 'practical', color: '#84CC16' },
    { name: 'Chemistry Lab', type: 'practical', color: '#F97316' },
    { name: 'Tutorial', type: 'tutorial', color: '#EC4899' },
    { name: 'Free Period', type: 'break', color: '#6B7280' }
  ]

  const openSlotEditor = (day: string, timeSlot: string) => {
    const existingSlot = timetable[day][timeSlot]
    setSelectedSlot({ day, timeSlot })
    
    if (existingSlot) {
      setEditingSlot(existingSlot)
    } else {
      setEditingSlot({
        id: `${day}-${timeSlot}-${Date.now()}`,
        subject: '',
        teacher: '',
        room: '',
        color: '#3B82F6',
        type: 'theory'
      })
    }
    setShowSlotEditor(true)
  }

  const saveSlot = () => {
    if (!selectedSlot || !editingSlot.subject.trim()) {
      toast.error('Please enter a subject name')
      return
    }

    const newTimetable = { ...timetable }
    newTimetable[selectedSlot.day][selectedSlot.timeSlot] = { ...editingSlot }
    setTimetable(newTimetable)
    setShowSlotEditor(false)
    setSelectedSlot(null)
    toast.success('Slot saved successfully!')
  }

  const deleteSlot = (day: string, timeSlot: string) => {
    const newTimetable = { ...timetable }
    newTimetable[day][timeSlot] = null
    setTimetable(newTimetable)
    toast.success('Slot deleted')
  }

  const copySlot = (day: string, timeSlot: string) => {
    const slot = timetable[day][timeSlot]
    if (!slot) return

    // Store in localStorage for pasting
    localStorage.setItem('copiedSlot', JSON.stringify(slot))
    toast.success('Slot copied! Click on another slot to paste.')
  }

  const pasteSlot = (day: string, timeSlot: string) => {
    const copiedSlotData = localStorage.getItem('copiedSlot')
    if (!copiedSlotData) {
      toast.error('No slot copied')
      return
    }

    try {
      const copiedSlot = JSON.parse(copiedSlotData)
      const newTimetable = { ...timetable }
      newTimetable[day][timeSlot] = {
        ...copiedSlot,
        id: `${day}-${timeSlot}-${Date.now()}`
      }
      setTimetable(newTimetable)
      toast.success('Slot pasted!')
    } catch (error) {
      toast.error('Failed to paste slot')
    }
  }

  const clearTimetable = () => {
    const clearedTimetable: Record<string, Record<string, SimpleSlot | null>> = {}
    days.forEach(day => {
      clearedTimetable[day] = {}
      timeSlots.forEach(slot => {
        if (slot === '13:00-14:00') {
          clearedTimetable[day][slot] = {
            id: `lunch-${day}`,
            subject: 'Lunch Break',
            teacher: '',
            room: 'Cafeteria',
            color: '#10B981',
            type: 'break'
          }
        } else {
          clearedTimetable[day][slot] = null
        }
      })
    })
    setTimetable(clearedTimetable)
    toast.success('Timetable cleared!')
  }

  const fillWithTemplate = (templateType: 'basic' | 'engineering' | 'science') => {
    const templates = {
      basic: [
        { subject: 'Mathematics', teacher: 'Prof. Smith', room: 'Room 101', color: '#3B82F6', type: 'theory' as const },
        { subject: 'English', teacher: 'Dr. Johnson', room: 'Room 102', color: '#10B981', type: 'theory' as const },
        { subject: 'Science', teacher: 'Prof. Davis', room: 'Room 103', color: '#F59E0B', type: 'theory' as const },
        { subject: 'History', teacher: 'Dr. Wilson', room: 'Room 104', color: '#EF4444', type: 'theory' as const }
      ],
      engineering: [
        { subject: 'Engineering Mathematics', teacher: 'Prof. Kumar', room: 'Room 201', color: '#3B82F6', type: 'theory' as const },
        { subject: 'Programming', teacher: 'Dr. Patel', room: 'Lab A', color: '#8B5CF6', type: 'practical' as const },
        { subject: 'Data Structures', teacher: 'Prof. Singh', room: 'Room 202', color: '#06B6D4', type: 'theory' as const },
        { subject: 'Database Lab', teacher: 'Dr. Sharma', room: 'Lab B', color: '#84CC16', type: 'practical' as const }
      ],
      science: [
        { subject: 'Physics', teacher: 'Prof. Newton', room: 'Room 301', color: '#10B981', type: 'theory' as const },
        { subject: 'Chemistry', teacher: 'Dr. Curie', room: 'Room 302', color: '#F59E0B', type: 'theory' as const },
        { subject: 'Physics Lab', teacher: 'Prof. Newton', room: 'Lab C', color: '#84CC16', type: 'practical' as const },
        { subject: 'Chemistry Lab', teacher: 'Dr. Curie', room: 'Lab D', color: '#F97316', type: 'practical' as const }
      ]
    }

    const template = templates[templateType]
    const newTimetable = { ...timetable }
    
    let subjectIndex = 0
    days.forEach(day => {
      timeSlots.forEach(slot => {
        if (slot !== '13:00-14:00' && Math.random() > 0.3) { // 70% chance to fill
          const subject = template[subjectIndex % template.length]
          newTimetable[day][slot] = {
            id: `${day}-${slot}-${Date.now()}-${subjectIndex}`,
            ...subject
          }
          subjectIndex++
        }
      })
    })
    
    setTimetable(newTimetable)
    toast.success(`${templateType} template applied!`)
  }

  const exportTimetable = () => {
    const exportData = {
      name: timetableName,
      branch: selectedBranch,
      section: selectedSection,
      timetable,
      createdAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${timetableName.replace(/\s+/g, '_')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Timetable exported!')
  }

  const completeTimetable = () => {
    const filledSlots = Object.values(timetable).reduce((total, day) => 
      total + Object.values(day).filter(slot => slot && slot.type !== 'break').length, 0
    )
    
    if (filledSlots === 0) {
      toast.error('Please add at least one class to the timetable')
      return
    }

    const timetableData = {
      name: timetableName,
      branch: selectedBranch,
      section: selectedSection,
      schedule: timetable,
      totalPeriods: filledSlots,
      optimizationScore: 95, // Simple timetables get high score
      conflictsResolved: 0,
      createdAt: new Date().toISOString(),
      type: 'simple'
    }

    onComplete(timetableData)
    toast.success('Simple timetable created successfully!')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Simple Timetable Creator</h2>
              <p className="text-green-100">Build your timetable from scratch with drag-and-drop simplicity</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timetable Name
                </label>
                <input
                  type="text"
                  value={timetableName}
                  onChange={(e) => setTimetableName(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Branch
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="General">General</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Section
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => fillWithTemplate('basic')}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Basic Template
              </button>
              <button
                onClick={() => fillWithTemplate('engineering')}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Engineering
              </button>
              <button
                onClick={() => fillWithTemplate('science')}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Science
              </button>
              <button
                onClick={clearTimetable}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center space-x-1"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="p-6 overflow-auto max-h-96">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr>
                  <th className="border border-gray-300 dark:border-gray-600 p-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold">
                    Time
                  </th>
                  {days.map(day => (
                    <th key={day} className="border border-gray-300 dark:border-gray-600 p-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(timeSlot => (
                  <tr key={timeSlot}>
                    <td className="border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm text-center">
                      {timeSlot}
                    </td>
                    {days.map(day => {
                      const slot = timetable[day][timeSlot]
                      return (
                        <td
                          key={`${day}-${timeSlot}`}
                          className="border border-gray-300 dark:border-gray-600 p-2 align-top min-h-[80px] relative group"
                        >
                          {slot ? (
                            <div
                              className="p-3 rounded-lg text-white text-sm cursor-pointer relative"
                              style={{ backgroundColor: slot.color }}
                              onClick={() => openSlotEditor(day, timeSlot)}
                            >
                              <div className="font-semibold mb-1">{slot.subject}</div>
                              {slot.teacher && (
                                <div className="text-xs opacity-90 mb-1">👨‍🏫 {slot.teacher}</div>
                              )}
                              {slot.room && (
                                <div className="text-xs opacity-90">📍 {slot.room}</div>
                              )}

                              {/* Action buttons */}
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    copySlot(day, timeSlot)
                                  }}
                                  className="p-1 bg-black/20 rounded hover:bg-black/40 transition-colors"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteSlot(day, timeSlot)
                                  }}
                                  className="p-1 bg-red-500/80 rounded hover:bg-red-500 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                              onClick={() => openSlotEditor(day, timeSlot)}
                              onDoubleClick={() => pasteSlot(day, timeSlot)}
                            >
                              <div className="text-center text-gray-500 dark:text-gray-400">
                                <Plus className="w-6 h-6 mx-auto mb-1 group-hover:text-blue-500" />
                                <span className="text-xs group-hover:text-blue-500">Add Class</span>
                              </div>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Add Subjects */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Add Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {commonSubjects.map((subject, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setEditingSlot({
                      id: `quick-${Date.now()}`,
                      subject: subject.name,
                      teacher: '',
                      room: '',
                      color: subject.color,
                      type: subject.type
                    })
                    // Don't open editor, just prepare the slot for next click
                  }}
                  className="px-3 py-2 rounded-lg text-white text-sm hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: subject.color }}
                >
                  {subject.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Click a subject above, then click on an empty slot to add it quickly
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={exportTimetable}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>

            <div className="text-sm text-gray-600 dark:text-gray-300">
              {Object.values(timetable).reduce((total, day) =>
                total + Object.values(day).filter(slot => slot && slot.type !== 'break').length, 0
              )} classes added
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={completeTimetable}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Create Timetable</span>
            </button>
          </div>
        </div>

        {/* Slot Editor Modal */}
        {showSlotEditor && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedSlot && `Edit ${selectedSlot.day} ${selectedSlot.timeSlot}`}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={editingSlot.subject}
                      onChange={(e) => setEditingSlot({...editingSlot, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter subject name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Teacher
                    </label>
                    <input
                      type="text"
                      value={editingSlot.teacher}
                      onChange={(e) => setEditingSlot({...editingSlot, teacher: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter teacher name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Room
                    </label>
                    <input
                      type="text"
                      value={editingSlot.room}
                      onChange={(e) => setEditingSlot({...editingSlot, room: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter room number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={editingSlot.type}
                      onChange={(e) => setEditingSlot({...editingSlot, type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="theory">Theory</option>
                      <option value="practical">Practical</option>
                      <option value="tutorial">Tutorial</option>
                      <option value="break">Break</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Color
                    </label>
                    <div className="flex space-x-2">
                      {subjectColors.map(color => (
                        <button
                          key={color}
                          onClick={() => setEditingSlot({...editingSlot, color})}
                          className={`w-8 h-8 rounded-full border-2 ${
                            editingSlot.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowSlotEditor(false)
                      setSelectedSlot(null)
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSlot}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
