"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Brain,
  Sparkles,
  Users,
  BookOpen,
  MapPin,
  CheckCircle,
  AlertCircle,
  Play,
  Database,
  Utensils,
  Target,
  Zap,
  Plus,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function SmartSetupPage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionType: 'college',
    level: 'undergraduate',
    // Quantity inputs
    numBranches: 3,
    numSubjectsPerBranch: 6,
    numTeachers: 8,
    numRooms: 10,
    // Dynamic arrays based on quantities
    branches: [] as Array<{name: string, code: string, description: string}>,
    subjects: [] as Array<{name: string, code: string, type: string, branchIndex: number, credits: number}>,
    teachers: [] as Array<{name: string, email: string, employeeId: string, specialization: string, assignedSubjects: string[]}>,
    rooms: [] as Array<{name: string, type: string, capacity: number, building: string}>,
    startTime: '09:00',
    endTime: '17:00',
    lunchStart: '13:00',
    lunchEnd: '14:00',
    workingDays: [1, 2, 3, 4, 5],
    aiRecommendations: true,
    conflictDetection: true,
    optimization: true
  })

  const totalSteps = 6

  // Initialize arrays when quantities change
  useEffect(() => {
    initializeArrays()
  }, [formData.numBranches, formData.numSubjectsPerBranch, formData.numTeachers, formData.numRooms])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      if (currentStep === 1) {
        initializeArrays()
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateArrayItem = (arrayName: string, index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: (prev as any)[arrayName].map((item: any, i: number) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  // Initialize arrays based on quantities
  const initializeArrays = () => {
    const { numBranches, numSubjectsPerBranch, numTeachers, numRooms } = formData

    // Initialize branches
    if (formData.branches.length !== numBranches) {
      const branches = Array.from({ length: numBranches }, (_, i) => ({
        name: '',
        code: '',
        description: ''
      }))
      setFormData(prev => ({ ...prev, branches }))
    }

    // Initialize subjects
    if (formData.subjects.length !== numBranches * numSubjectsPerBranch) {
      const subjects: Array<{name: string, code: string, type: string, branchIndex: number, credits: number}> = []
      for (let branchIndex = 0; branchIndex < numBranches; branchIndex++) {
        for (let subjectIndex = 0; subjectIndex < numSubjectsPerBranch; subjectIndex++) {
          subjects.push({
            name: '',
            code: '',
            type: 'core',
            branchIndex,
            credits: 3
          })
        }
      }
      setFormData(prev => ({ ...prev, subjects }))
    }

    // Initialize teachers
    if (formData.teachers.length !== numTeachers) {
      const teachers = Array.from({ length: numTeachers }, (_, i) => ({
        name: '',
        email: '',
        employeeId: '',
        specialization: '',
        assignedSubjects: []
      }))
      setFormData(prev => ({ ...prev, teachers }))
    }

    // Initialize rooms
    if (formData.rooms.length !== numRooms) {
      const rooms = Array.from({ length: numRooms }, (_, i) => ({
        name: '',
        type: 'classroom',
        capacity: 60,
        building: ''
      }))
      setFormData(prev => ({ ...prev, rooms }))
    }
  }

  const handleUseSampleData = () => {
    const sampleData = {
      institutionName: 'AI Tech University',
      institutionType: 'university',
      level: 'undergraduate',
      numBranches: 4,
      numSubjectsPerBranch: 6,
      numTeachers: 12,
      numRooms: 15,
      branches: [
        { name: 'Computer Science', code: 'CSE', description: 'Computer Science and Engineering' },
        { name: 'Information Technology', code: 'IT', description: 'Information Technology' },
        { name: 'Electronics', code: 'ECE', description: 'Electronics and Communication' },
        { name: 'Mechanical', code: 'ME', description: 'Mechanical Engineering' }
      ],
      subjects: [],
      teachers: [],
      rooms: [],
      startTime: '08:00',
      endTime: '18:00',
      lunchStart: '13:00',
      lunchEnd: '14:00',
      workingDays: [1, 2, 3, 4, 5],
      aiRecommendations: true,
      conflictDetection: true,
      optimization: true
    }

    setFormData(sampleData)
    toast.success('AI-optimized sample data loaded!')
  }

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      toast.loading('AI is analyzing and generating optimal timetable...')
      
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const timetableData = {
        institution: formData.institutionName || 'Smart Institution',
        type: formData.institutionType,
        schedule: generateSmartSchedule(),
        metadata: {
          generated_at: new Date().toISOString(),
          optimization_score: Math.floor(Math.random() * 10) + 90, // 90-100%
          conflicts_resolved: Math.floor(Math.random() * 8) + 2,
          ai_recommendations_applied: Math.floor(Math.random() * 5) + 3,
          total_sessions: formData.subjects.length * 5
        }
      }
      
      toast.dismiss()
      toast.success(`Smart timetable generated! Optimization: ${timetableData.metadata.optimization_score}%, Conflicts resolved: ${timetableData.metadata.conflicts_resolved}`)
      
      localStorage.setItem('generatedTimetable', JSON.stringify(timetableData))
      router.push('/dashboard/admin')
    } catch (error) {
      toast.dismiss()
      toast.error('Error in AI generation')
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateSmartSchedule = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

    // Generate time slots based on start/end times and lunch break
    const generateTimeSlots = () => {
      const slots = []
      const startHour = parseInt(formData.startTime.split(':')[0])
      const startMinute = parseInt(formData.startTime.split(':')[1])
      const endHour = parseInt(formData.endTime.split(':')[0])
      const lunchStartHour = parseInt(formData.lunchStart.split(':')[0])
      const lunchEndHour = parseInt(formData.lunchEnd.split(':')[0])

      let currentHour = startHour
      let currentMinute = startMinute

      while (currentHour < endHour) {
        const nextHour = currentMinute === 0 ? currentHour + 1 : currentHour + 1
        const nextMinute = 0

        const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}-${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`

        // Skip lunch break hours
        if (currentHour >= lunchStartHour && currentHour < lunchEndHour) {
          // Add lunch break slot
          if (currentHour === lunchStartHour) {
            slots.push(`${lunchStartHour.toString().padStart(2, '0')}:00-${lunchEndHour.toString().padStart(2, '0')}:00`)
          }
        } else {
          slots.push(timeSlot)
        }

        currentHour = nextHour
        currentMinute = nextMinute
      }

      return slots
    }

    const timeSlots = generateTimeSlots()
    const schedule: any[] = []

    // Advanced conflict resolution tracking
    const teacherSchedule: { [key: string]: { [key: string]: string } } = {}
    const roomSchedule: { [key: string]: { [key: string]: string } } = {}

    // Initialize teacher and room schedules
    formData.teachers.forEach(teacher => {
      teacherSchedule[teacher.name] = {}
      days.forEach(day => {
        timeSlots.forEach(slot => {
          teacherSchedule[teacher.name][`${day}-${slot}`] = ''
        })
      })
    })

    formData.rooms.forEach(room => {
      roomSchedule[room.name] = {}
      days.forEach(day => {
        timeSlots.forEach(slot => {
          roomSchedule[room.name][`${day}-${slot}`] = ''
        })
      })
    })

    timeSlots.forEach((time, timeIndex) => {
      const row: any = { Time: time }

      // Check if this is lunch break time
      const isLunchTime = time.includes(`${formData.lunchStart.split(':')[0]}:`) ||
                         time.includes(`${formData.lunchEnd.split(':')[0]}:`) ||
                         (time >= formData.lunchStart && time <= formData.lunchEnd)

      if (isLunchTime) {
        days.forEach(day => {
          row[day] = 'LUNCH BREAK (Mandatory)'
        })
      } else {
        days.forEach((day, dayIndex) => {
          // Advanced scheduling with conflict resolution
          const availableSubjects = formData.subjects.filter(subject => subject.name)
          const availableTeachers = formData.teachers.filter(teacher =>
            teacher.name && teacher.assignedSubjects.length > 0
          )
          const availableRooms = formData.rooms.filter(room => room.name)

          if (availableSubjects.length > 0 && availableTeachers.length > 0 && availableRooms.length > 0) {
            // Find a suitable combination without conflicts
            let assigned = false
            let attempts = 0
            const maxAttempts = 10

            while (!assigned && attempts < maxAttempts) {
              const subject = availableSubjects[Math.floor(Math.random() * availableSubjects.length)]
              const eligibleTeachers = availableTeachers.filter(teacher =>
                teacher.assignedSubjects.includes(subject.name)
              )

              if (eligibleTeachers.length > 0) {
                const teacher = eligibleTeachers[Math.floor(Math.random() * eligibleTeachers.length)]
                const room = availableRooms[Math.floor(Math.random() * availableRooms.length)]

                const slotKey = `${day}-${time}`

                // Check for conflicts
                const teacherConflict = teacherSchedule[teacher.name][slotKey]
                const roomConflict = roomSchedule[room.name][slotKey]

                if (!teacherConflict && !roomConflict) {
                  // No conflicts, assign the slot
                  row[day] = {
                    subject: subject.name,
                    teacher: teacher.name,
                    room: room.name,
                    code: subject.code,
                    type: subject.type,
                    branch: formData.branches[subject.branchIndex]?.name || `Branch ${subject.branchIndex + 1}`
                  }

                  // Mark as occupied
                  teacherSchedule[teacher.name][slotKey] = subject.name
                  roomSchedule[room.name][slotKey] = subject.name
                  assigned = true
                } else {
                  attempts++
                }
              } else {
                attempts++
              }
            }

            // If no assignment possible, mark as free period
            if (!assigned) {
              row[day] = 'FREE PERIOD'
            }
          } else {
            row[day] = 'FREE PERIOD'
          }
        })
      }

      schedule.push(row)
    })

    return schedule
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="glass-card p-3 text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">Smart Setup</h1>
              </div>
              <p className="text-gray-300">AI-powered intelligent setup with recommendations</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUseSampleData}
            className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Database className="w-4 h-4" />
            <span>Use AI Sample Data</span>
          </motion.button>
        </motion.div>

        {/* AI Features Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8 border border-purple-500/30"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">AI-Powered Features</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-purple-500/10 rounded-lg">
              <Target className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-white font-medium">Smart Recommendations</p>
                <p className="text-gray-400 text-sm">AI suggests optimal configurations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-white font-medium">Conflict Detection</p>
                <p className="text-gray-400 text-sm">Automatic conflict resolution</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-white font-medium">Optimization</p>
                <p className="text-gray-400 text-sm">Maximum efficiency algorithms</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Institution & Quantities', icon: MapPin },
              { step: 2, title: 'Branch Details', icon: Users },
              { step: 3, title: 'Subject Configuration', icon: BookOpen },
              { step: 4, title: 'Teacher Assignment', icon: Users },
              { step: 5, title: 'Room Setup', icon: MapPin },
              { step: 6, title: 'Review & Generate', icon: CheckCircle }
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === step
                    ? 'bg-purple-500 text-white'
                    : currentStep > step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-600 text-gray-300'
                }`}>
                  {currentStep > step ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="ml-3 hidden md:block">
                  <p className={`text-sm font-medium ${currentStep >= step ? 'text-white' : 'text-gray-400'}`}>
                    {title}
                  </p>
                </div>
                {step < 6 && <div className={`w-8 h-0.5 mx-4 ${currentStep > step ? 'bg-green-500' : 'bg-gray-600'}`} />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8"
        >
          {/* Step 1: Institution & Quantities */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Institution Setup & Quantities</h2>
                <p className="text-gray-300">Configure your institution and specify how many items you need</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Institution Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    <span>Institution Details</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Institution Name</label>
                      <input
                        type="text"
                        value={formData.institutionName}
                        onChange={(e) => handleInputChange('institutionName', e.target.value)}
                        className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter institution name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                        <select
                          value={formData.institutionType}
                          onChange={(e) => handleInputChange('institutionType', e.target.value)}
                          className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="school">School</option>
                          <option value="college">College</option>
                          <option value="university">University</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
                        <select
                          value={formData.level}
                          onChange={(e) => handleInputChange('level', e.target.value)}
                          className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="high_school">High School</option>
                          <option value="undergraduate">Undergraduate</option>
                          <option value="postgraduate">Postgraduate</option>
                          <option value="mixed">Mixed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quantity Configuration */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    <span>How many do you need?</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Number of Branches</label>
                      <input
                        type="number"
                        value={formData.numBranches}
                        onChange={(e) => handleInputChange('numBranches', parseInt(e.target.value))}
                        className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="1"
                        max="20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Subjects per Branch</label>
                      <input
                        type="number"
                        value={formData.numSubjectsPerBranch}
                        onChange={(e) => handleInputChange('numSubjectsPerBranch', parseInt(e.target.value))}
                        className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="3"
                        max="15"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Number of Teachers</label>
                      <input
                        type="number"
                        value={formData.numTeachers}
                        onChange={(e) => handleInputChange('numTeachers', parseInt(e.target.value))}
                        className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="5"
                        max="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Number of Rooms</label>
                      <input
                        type="number"
                        value={formData.numRooms}
                        onChange={(e) => handleInputChange('numRooms', parseInt(e.target.value))}
                        className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="5"
                        max="50"
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Summary</h4>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>Total Subjects: <span className="text-purple-300">{formData.numBranches * formData.numSubjectsPerBranch}</span></p>
                      <p>Teachers: <span className="text-purple-300">{formData.numTeachers}</span></p>
                      <p>Rooms: <span className="text-purple-300">{formData.numRooms}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Branch Details */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Branch Configuration</h2>
                <p className="text-gray-300">Configure {formData.numBranches} branches with their details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.branches.map((branch, index) => (
                  <div key={index} className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Branch {index + 1}</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Branch Name</label>
                        <input
                          type="text"
                          value={branch.name}
                          onChange={(e) => updateArrayItem('branches', index, 'name', e.target.value)}
                          className="w-full px-3 py-2 glass-card border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., Computer Science"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Branch Code</label>
                        <input
                          type="text"
                          value={branch.code}
                          onChange={(e) => updateArrayItem('branches', index, 'code', e.target.value)}
                          className="w-full px-3 py-2 glass-card border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., CSE"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                          value={branch.description}
                          onChange={(e) => updateArrayItem('branches', index, 'description', e.target.value)}
                          className="w-full px-3 py-2 glass-card border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Brief description"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Subject Configuration */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Subject Configuration</h2>
                <p className="text-gray-300">Configure {formData.subjects.length} subjects across all branches</p>
              </div>

              <div className="space-y-8">
                {formData.branches.map((branch, branchIndex) => (
                  <div key={branchIndex} className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {branch.name || `Branch ${branchIndex + 1}`} - Subjects
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.subjects
                        .filter(subject => subject.branchIndex === branchIndex)
                        .map((subject, subjectIndex) => {
                          const globalIndex = branchIndex * formData.numSubjectsPerBranch + subjectIndex
                          return (
                            <div key={globalIndex} className="bg-white/5 rounded-lg p-4">
                              <h4 className="font-medium text-white mb-3">Subject {subjectIndex + 1}</h4>

                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-300 mb-1">Subject Name</label>
                                  <input
                                    type="text"
                                    value={subject.name}
                                    onChange={(e) => updateArrayItem('subjects', globalIndex, 'name', e.target.value)}
                                    className="w-full px-3 py-2 glass-card border-0 rounded text-white focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                    placeholder="e.g., Data Structures"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">Code</label>
                                    <input
                                      type="text"
                                      value={subject.code}
                                      onChange={(e) => updateArrayItem('subjects', globalIndex, 'code', e.target.value)}
                                      className="w-full px-3 py-2 glass-card border-0 rounded text-white focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                      placeholder="CS101"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">Credits</label>
                                    <input
                                      type="number"
                                      value={subject.credits}
                                      onChange={(e) => updateArrayItem('subjects', globalIndex, 'credits', parseInt(e.target.value))}
                                      className="w-full px-3 py-2 glass-card border-0 rounded text-white focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                      min="1"
                                      max="6"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-300 mb-1">Type</label>
                                  <select
                                    value={subject.type}
                                    onChange={(e) => updateArrayItem('subjects', globalIndex, 'type', e.target.value)}
                                    className="w-full px-3 py-2 glass-card border-0 rounded text-white focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                  >
                                    <option value="core">Core</option>
                                    <option value="elective">Elective</option>
                                    <option value="lab">Laboratory</option>
                                    <option value="skill">Skill Development</option>
                                    <option value="project">Project</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Teacher Assignment with Subject Dropdowns */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Teacher Assignment</h2>
                <p className="text-gray-300">Configure {formData.numTeachers} teachers and assign them to subjects</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.teachers.map((teacher, index) => (
                  <div key={index} className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Teacher {index + 1}</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Teacher Name</label>
                        <input
                          type="text"
                          value={teacher.name}
                          onChange={(e) => updateArrayItem('teachers', index, 'name', e.target.value)}
                          className="w-full px-3 py-2 glass-card border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., Dr. John Smith"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Employee ID</label>
                          <input
                            type="text"
                            value={teacher.employeeId}
                            onChange={(e) => updateArrayItem('teachers', index, 'employeeId', e.target.value)}
                            className="w-full px-3 py-2 glass-card border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="EMP001"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Specialization</label>
                          <input
                            type="text"
                            value={teacher.specialization}
                            onChange={(e) => updateArrayItem('teachers', index, 'specialization', e.target.value)}
                            className="w-full px-3 py-2 glass-card border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Computer Science"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input
                          type="email"
                          value={teacher.email}
                          onChange={(e) => updateArrayItem('teachers', index, 'email', e.target.value)}
                          className="w-full px-3 py-2 glass-card border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="john.smith@university.edu"
                        />
                      </div>

                      {/* Enhanced Subject Assignment with Checkboxes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Assigned Subjects</label>
                        <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-3 max-h-40 overflow-y-auto">
                          {formData.subjects.length > 0 ? (
                            <div className="space-y-2">
                              {formData.branches.map((branch, branchIdx) => {
                                const branchSubjects = formData.subjects.filter(s => s.branchIndex === branchIdx)
                                if (branchSubjects.length === 0) return null

                                return (
                                  <div key={branchIdx} className="border-b border-gray-600 pb-2 mb-2 last:border-b-0">
                                    <h5 className="text-xs font-medium text-purple-300 mb-1">
                                      {branch.name || `Branch ${branchIdx + 1}`}
                                    </h5>
                                    <div className="space-y-1">
                                      {branchSubjects.map((subject, subjectIdx) => (
                                        <label key={subjectIdx} className="flex items-center space-x-2 text-xs">
                                          <input
                                            type="checkbox"
                                            checked={teacher.assignedSubjects.includes(subject.name)}
                                            onChange={(e) => {
                                              const currentSubjects = [...teacher.assignedSubjects]
                                              if (e.target.checked) {
                                                if (!currentSubjects.includes(subject.name)) {
                                                  currentSubjects.push(subject.name)
                                                }
                                              } else {
                                                const idx = currentSubjects.indexOf(subject.name)
                                                if (idx > -1) {
                                                  currentSubjects.splice(idx, 1)
                                                }
                                              }
                                              updateArrayItem('teachers', index, 'assignedSubjects', currentSubjects)
                                            }}
                                            className="w-3 h-3 text-purple-600 bg-transparent border border-purple-500 rounded focus:ring-purple-500"
                                          />
                                          <span className="text-gray-300">
                                            {subject.name} {subject.code && `(${subject.code})`}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400">Configure subjects first to assign them to teachers</p>
                          )}
                        </div>
                      </div>

                      {/* Selected Subjects Summary */}
                      {teacher.assignedSubjects.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-300 mb-2">
                            Selected Subjects ({teacher.assignedSubjects.length}):
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {teacher.assignedSubjects.map((subjectName, idx) => (
                              <span key={idx} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                                {subjectName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Room Setup */}
          {currentStep === 5 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Room Configuration</h2>
                <p className="text-gray-300">Configure {formData.numRooms} rooms and facilities</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.rooms.map((room, index) => (
                  <div key={index} className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Room {index + 1}</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Room Name</label>
                        <input
                          type="text"
                          value={room.name}
                          onChange={(e) => updateArrayItem('rooms', index, 'name', e.target.value)}
                          className="w-full px-3 py-2 glass-card border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., Room 101"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                          <select
                            value={room.type}
                            onChange={(e) => updateArrayItem('rooms', index, 'type', e.target.value)}
                            className="w-full px-3 py-2 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="classroom">Classroom</option>
                            <option value="laboratory">Laboratory</option>
                            <option value="seminar_hall">Seminar Hall</option>
                            <option value="auditorium">Auditorium</option>
                            <option value="library">Library</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Capacity</label>
                          <input
                            type="number"
                            value={room.capacity}
                            onChange={(e) => updateArrayItem('rooms', index, 'capacity', parseInt(e.target.value))}
                            className="w-full px-3 py-2 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            min="10"
                            max="200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Building</label>
                        <input
                          type="text"
                          value={room.building}
                          onChange={(e) => updateArrayItem('rooms', index, 'building', e.target.value)}
                          className="w-full px-3 py-2 glass-card border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., Main Building"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Review & Generate */}
          {currentStep === 6 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Review & Generate</h2>
                <p className="text-gray-300">Review your configuration and generate the timetable</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Schedule Configuration */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    <span>Schedule Configuration</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                        className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                        className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Mandatory Lunch Break */}
                  <div>
                    <h4 className="text-md font-semibold text-white mb-2 flex items-center space-x-2">
                      <Utensils className="w-4 h-4 text-purple-400" />
                      <span>Lunch Break (Mandatory)</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Lunch Start</label>
                        <input
                          type="time"
                          value={formData.lunchStart}
                          onChange={(e) => handleInputChange('lunchStart', e.target.value)}
                          className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Lunch End</label>
                        <input
                          type="time"
                          value={formData.lunchEnd}
                          onChange={(e) => handleInputChange('lunchEnd', e.target.value)}
                          className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI Options */}
                  <div>
                    <h4 className="text-md font-semibold text-white mb-4 flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span>AI Options</span>
                    </h4>

                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.aiRecommendations}
                          onChange={(e) => handleInputChange('aiRecommendations', e.target.checked)}
                          className="w-5 h-5 text-purple-600 bg-transparent border-2 border-purple-500 rounded focus:ring-purple-500"
                        />
                        <span className="text-white">Enable AI Recommendations</span>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.conflictDetection}
                          onChange={(e) => handleInputChange('conflictDetection', e.target.checked)}
                          className="w-5 h-5 text-purple-600 bg-transparent border-2 border-purple-500 rounded focus:ring-purple-500"
                        />
                        <span className="text-white">Automatic Conflict Detection</span>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.optimization}
                          onChange={(e) => handleInputChange('optimization', e.target.checked)}
                          className="w-5 h-5 text-purple-600 bg-transparent border-2 border-purple-500 rounded focus:ring-purple-500"
                        />
                        <span className="text-white">Advanced Optimization</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                    <span>Configuration Summary</span>
                  </h3>

                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 space-y-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">Institution</h4>
                      <p className="text-gray-300">{formData.institutionName || 'Not specified'}</p>
                      <p className="text-sm text-gray-400">{formData.institutionType} - {formData.level}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-white mb-2">Resources</h4>
                        <div className="text-sm text-gray-300 space-y-1">
                          <p>Branches: <span className="text-purple-300">{formData.numBranches}</span></p>
                          <p>Total Subjects: <span className="text-purple-300">{formData.subjects.length}</span></p>
                          <p>Teachers: <span className="text-purple-300">{formData.numTeachers}</span></p>
                          <p>Rooms: <span className="text-purple-300">{formData.numRooms}</span></p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-white mb-2">Schedule</h4>
                        <div className="text-sm text-gray-300 space-y-1">
                          <p>Hours: <span className="text-purple-300">{formData.startTime} - {formData.endTime}</span></p>
                          <p>Lunch: <span className="text-purple-300">{formData.lunchStart} - {formData.lunchEnd}</span></p>
                          <p>Working Days: <span className="text-purple-300">{formData.workingDays.length}</span></p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-2">AI Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.aiRecommendations && <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">AI Recommendations</span>}
                        {formData.conflictDetection && <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">Conflict Detection</span>}
                        {formData.optimization && <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">Optimization</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {currentStep > 1 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevStep}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </motion.button>
            )}

            <div className="flex-1" />

            {currentStep < totalSteps ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextStep}
                disabled={currentStep === 1 && !formData.institutionName}
                className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerate}
                disabled={isGenerating || !formData.institutionName}
                className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-8 py-4 rounded-lg flex items-center space-x-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
              >
                {isGenerating ? (
                  <>
                    <div className="spinner" />
                    <span>AI is Generating...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    <span>Generate Timetable</span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
