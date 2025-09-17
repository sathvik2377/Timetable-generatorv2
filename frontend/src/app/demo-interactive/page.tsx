"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Settings, 
  Users, 
  Calendar, 
  Clock,
  BookOpen,
  Download,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  FileText,
  Image,
  FileSpreadsheet
} from 'lucide-react'
import toast from 'react-hot-toast'

interface FormData {
  collegeName: string
  workingHours: number
  workingDays: string[]
  maxClassHours: number
  numBranches: number
  numTeachers: number
  maxTeacherHours: number
  branches: Array<{ name: string, code: string }>
  teachers: Array<{ name: string, code: string, subject: string }>
}

interface TimetableEntry {
  day: string
  timeSlot: string
  subject: string
  teacher: string
  room: string
}

const WORKING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const TIME_SLOTS = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '2:00-3:00', '3:00-4:00', '4:00-5:00']

export default function DemoInteractivePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState('')
  const [generationProgress, setGenerationProgress] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    collegeName: '',
    workingHours: 6,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    maxClassHours: 25,
    numBranches: 1,
    numTeachers: 5,
    maxTeacherHours: 6,
    branches: [{ name: '', code: '' }],
    teachers: Array(5).fill(null).map(() => ({ name: '', code: '', subject: '' }))
  })
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [validationError, setValidationError] = useState('')
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

  // Initialize branches and teachers arrays when component mounts
  useEffect(() => {
    initializeArrays()
  }, [])

  const initializeArrays = () => {
    setFormData(prev => ({
      ...prev,
      branches: Array(prev.numBranches).fill(null).map((_, i) =>
        prev.branches[i] || { name: '', code: '' }
      ),
      teachers: Array(prev.numTeachers).fill(null).map((_, i) =>
        prev.teachers[i] || { name: '', code: '', subject: '' }
      )
    }))
  }

  const steps = [
    "Institution Setup",
    "Resource Planning", 
    "Branch & Teacher Details",
    "Validation & Generation",
    "Timetable Result"
  ]

  const generationSteps = [
    "Initializing Points System...",
    "Calculating Resource Balance...",
    "Validating Constraints...",
    "Applying OR-Tools Algorithm...",
    "Optimizing Schedule Quality...",
    "Finalizing Timetable..."
  ]

  // Enhanced validation functions
  const validateStep = (step: number): boolean => {
    const errors: {[key: string]: string} = {}

    switch (step) {
      case 0:
        if (!formData.collegeName.trim()) {
          errors.collegeName = 'College name is required'
        }
        if (formData.workingHours < 1 || formData.workingHours > 12) {
          errors.workingHours = 'Working hours must be between 1 and 12'
        }
        if (formData.workingDays.length === 0) {
          errors.workingDays = 'At least one working day must be selected'
        }
        if (formData.maxClassHours < 1 || formData.maxClassHours > 50) {
          errors.maxClassHours = 'Max class hours must be between 1 and 50'
        }
        break

      case 1:
        if (formData.numBranches < 1 || formData.numBranches > 10) {
          errors.numBranches = 'Number of branches must be between 1 and 10'
        }
        if (formData.numTeachers < 1 || formData.numTeachers > 50) {
          errors.numTeachers = 'Number of teachers must be between 1 and 50'
        }
        if (formData.maxTeacherHours < 1 || formData.maxTeacherHours > 12) {
          errors.maxTeacherHours = 'Max teacher hours must be between 1 and 12'
        }
        break

      case 2:
        formData.branches.forEach((branch, index) => {
          if (!branch.name.trim()) {
            errors[`branch_${index}_name`] = `Branch ${index + 1} name is required`
          }
          if (!branch.code.trim()) {
            errors[`branch_${index}_code`] = `Branch ${index + 1} code is required`
          }
        })
        formData.teachers.forEach((teacher, index) => {
          if (!teacher.name.trim()) {
            errors[`teacher_${index}_name`] = `Teacher ${index + 1} name is required`
          }
          if (!teacher.code.trim()) {
            errors[`teacher_${index}_code`] = `Teacher ${index + 1} code is required`
          }
          if (!teacher.subject.trim()) {
            errors[`teacher_${index}_subject`] = `Teacher ${index + 1} subject is required`
          }
        })
        break
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateResourceBalance = () => {
    const totalAvailableHours = formData.numTeachers * formData.maxTeacherHours * formData.workingDays.length
    const totalRequiredHours = formData.numBranches * formData.maxClassHours

    if (totalAvailableHours !== totalRequiredHours) {
      setValidationError(
        `Resource Imbalance Detected!\n\n` +
        `Total Available Hours: ${totalAvailableHours}\n` +
        `(${formData.numTeachers} teachers × ${formData.maxTeacherHours} hours/day × ${formData.workingDays.length} days)\n\n` +
        `Total Required Hours: ${totalRequiredHours}\n` +
        `(${formData.numBranches} branches × ${formData.maxClassHours} hours/week)\n\n` +
        `These values must be equal for successful timetable generation.`
      )
      return false
    }
    setValidationError('')
    return true
  }

  // Enhanced number input handlers
  const updateNumBranches = (num: number) => {
    if (isNaN(num) || num < 1 || num > 10) return

    const newBranches = Array(num).fill(null).map((_, i) =>
      formData.branches[i] || { name: '', code: '' }
    )

    setFormData(prev => ({
      ...prev,
      numBranches: num,
      branches: newBranches
    }))
  }

  const updateNumTeachers = (num: number) => {
    if (isNaN(num) || num < 1 || num > 50) return

    const newTeachers = Array(num).fill(null).map((_, i) =>
      formData.teachers[i] || { name: '', code: '', subject: '' }
    )

    setFormData(prev => ({
      ...prev,
      numTeachers: num,
      teachers: newTeachers
    }))
  }

  // Generate demo data
  const generateDemoData = () => {
    const demoData: FormData = {
      collegeName: 'Smart India Institute of Technology',
      workingHours: 6,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      maxClassHours: 30,
      numBranches: 2,
      numTeachers: 6,
      maxTeacherHours: 5,
      branches: [
        { name: 'Computer Science Engineering', code: 'CSE' },
        { name: 'Information Technology', code: 'IT' }
      ],
      teachers: [
        { name: 'Dr. Rajesh Kumar', code: 'T001', subject: 'Data Structures' },
        { name: 'Prof. Priya Sharma', code: 'T002', subject: 'Database Systems' },
        { name: 'Dr. Amit Singh', code: 'T003', subject: 'Computer Networks' },
        { name: 'Ms. Neha Gupta', code: 'T004', subject: 'Software Engineering' },
        { name: 'Dr. Suresh Patel', code: 'T005', subject: 'Operating Systems' },
        { name: 'Prof. Kavita Jain', code: 'T006', subject: 'Web Development' }
      ]
    }
    setFormData(demoData)
    toast.success('Demo data loaded successfully!')
  }

  // Enhanced timetable generation with better progress tracking
  const generateTimetable = async () => {
    // Validate all steps before generation
    if (!validateStep(2)) {
      toast.error('Please fill in all branch and teacher details!')
      return
    }

    if (!validateResourceBalance()) {
      toast.error('Please fix resource balance issues first!')
      return
    }

    setIsGenerating(true)
    setCurrentStep(3)
    setGenerationProgress(0)

    try {
      // Simulate generation process with enhanced progress tracking
      for (let i = 0; i < generationSteps.length; i++) {
        setGenerationStep(generationSteps[i])
        setGenerationProgress(((i + 1) / generationSteps.length) * 100)

        // Simulate different processing times for realism
        const delay = i === 3 ? 2000 : i === 4 ? 1500 : 1000 // OR-Tools step takes longer
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      // Generate actual timetable using enhanced points system
      const newTimetable: TimetableEntry[] = []
      const teacherPoints: { [key: string]: number } = {}
      const teacherWorkload: { [key: string]: number } = {}

      // Initialize teacher points and workload tracking
      formData.teachers.forEach(teacher => {
        if (teacher.code && teacher.name) {
          teacherPoints[teacher.code] = formData.maxTeacherHours * 100 * formData.workingDays.length
          teacherWorkload[teacher.code] = 0
        }
      })

      // Generate schedule for first branch with better distribution
      const branch = formData.branches[0]
      let hoursScheduled = 0
      const targetHours = formData.maxClassHours
      const dailyHoursLimit = Math.ceil(targetHours / formData.workingDays.length)

      for (const day of formData.workingDays) {
        let dailyHours = 0

        for (const timeSlot of TIME_SLOTS.slice(0, formData.workingHours)) {
          if (hoursScheduled >= targetHours || dailyHours >= dailyHoursLimit) break

          // Find available teacher with points, prioritizing balanced workload
          const availableTeachers = formData.teachers.filter(teacher =>
            teacher.code && teacherPoints[teacher.code] >= 100
          ).sort((a, b) => teacherWorkload[a.code] - teacherWorkload[b.code])

          const selectedTeacher = availableTeachers[0]

          if (selectedTeacher) {
            teacherPoints[selectedTeacher.code] -= 100
            teacherWorkload[selectedTeacher.code]++

            newTimetable.push({
              day,
              timeSlot,
              subject: selectedTeacher.subject,
              teacher: selectedTeacher.name,
              room: `Room ${Math.floor(Math.random() * 10) + 101}`
            })
            hoursScheduled++
            dailyHours++
          }
        }
      }

      // Add lunch break if needed
      if (formData.workingHours > 4) {
        const lunchSlot = TIME_SLOTS[Math.floor(formData.workingHours / 2)]
        formData.workingDays.forEach(day => {
          newTimetable.push({
            day,
            timeSlot: lunchSlot,
            subject: 'Lunch Break',
            teacher: '',
            room: 'Cafeteria'
          })
        })
      }

      setTimetable(newTimetable)
      setIsGenerating(false)
      setCurrentStep(4)
      toast.success(`Timetable generated successfully! ${hoursScheduled} classes scheduled.`)

    } catch (error) {
      console.error('Generation error:', error)
      setIsGenerating(false)
      toast.error('Failed to generate timetable. Please try again.')
    }
  }

  // Export functions
  const exportToPNG = () => {
    toast.success('PNG export feature would be implemented here')
  }

  const exportToPDF = () => {
    toast.success('PDF export feature would be implemented here')
  }

  const exportToExcel = () => {
    toast.success('Excel export feature would be implemented here')
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      if (validateStep(currentStep)) {
        setCurrentStep(currentStep + 1)
        setFormErrors({}) // Clear errors when moving to next step
      } else {
        toast.error('Please fix the errors before proceeding')
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setFormErrors({}) // Clear errors when going back
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Institution Setup</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">College Name</label>
                <input
                  type="text"
                  value={formData.collegeName}
                  onChange={(e) => {
                    setFormData({...formData, collegeName: e.target.value})
                    if (formErrors.collegeName) {
                      const newErrors = {...formErrors}
                      delete newErrors.collegeName
                      setFormErrors(newErrors)
                    }
                  }}
                  className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                    formErrors.collegeName ? 'border-red-500' : 'border-gray-600'
                  } focus:border-purple-400`}
                  placeholder="Enter college name"
                />
                {formErrors.collegeName && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.collegeName}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Working Hours per Day</label>
                  <input
                    type="number"
                    value={formData.workingHours}
                    onChange={(e) => setFormData({...formData, workingHours: parseInt(e.target.value)})}
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-purple-400"
                    min="1"
                    max="12"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Maximum Class Hours per Week</label>
                  <input
                    type="number"
                    value={formData.maxClassHours}
                    onChange={(e) => setFormData({...formData, maxClassHours: parseInt(e.target.value)})}
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-purple-400"
                    min="1"
                    max="50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Working Days</label>
                <div className="grid grid-cols-3 gap-2">
                  {WORKING_DAYS.map(day => (
                    <label key={day} className="flex items-center space-x-2 text-white">
                      <input
                        type="checkbox"
                        checked={formData.workingDays.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, workingDays: [...formData.workingDays, day]})
                          } else {
                            setFormData({...formData, workingDays: formData.workingDays.filter(d => d !== day)})
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Resource Planning</h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white mb-2">Number of Branches</label>
                <input
                  type="number"
                  value={formData.numBranches}
                  onChange={(e) => updateNumBranches(parseInt(e.target.value))}
                  className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                    formErrors.numBranches ? 'border-red-500' : 'border-gray-600'
                  } focus:border-purple-400`}
                  min="1"
                  max="10"
                />
                {formErrors.numBranches && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.numBranches}</p>
                )}
              </div>

              <div>
                <label className="block text-white mb-2">Number of Teachers</label>
                <input
                  type="number"
                  value={formData.numTeachers}
                  onChange={(e) => updateNumTeachers(parseInt(e.target.value))}
                  className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                    formErrors.numTeachers ? 'border-red-500' : 'border-gray-600'
                  } focus:border-purple-400`}
                  min="1"
                  max="50"
                />
                {formErrors.numTeachers && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.numTeachers}</p>
                )}
              </div>

              <div>
                <label className="block text-white mb-2">Max Teacher Hours per Day</label>
                <input
                  type="number"
                  value={formData.maxTeacherHours}
                  onChange={(e) => setFormData({...formData, maxTeacherHours: parseInt(e.target.value)})}
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-purple-400"
                  min="1"
                  max="12"
                />
              </div>
            </div>

            {/* Resource Balance Validation */}
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Resource Balance Check</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Total Available Hours:</span>
                  <span className="text-white ml-2">
                    {formData.numTeachers} × {formData.maxTeacherHours} × {formData.workingDays.length} = {formData.numTeachers * formData.maxTeacherHours * formData.workingDays.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Total Required Hours:</span>
                  <span className="text-white ml-2">
                    {formData.numBranches} × {formData.maxClassHours} = {formData.numBranches * formData.maxClassHours}
                  </span>
                </div>
              </div>

              {formData.numTeachers * formData.maxTeacherHours * formData.workingDays.length === formData.numBranches * formData.maxClassHours ? (
                <div className="flex items-center space-x-2 text-green-400 mt-3">
                  <CheckCircle className="w-5 h-5" />
                  <span>Perfect resource balance achieved!</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-400 mt-3">
                  <AlertCircle className="w-5 h-5" />
                  <span>Resource imbalance detected - adjust values above</span>
                </div>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Branch & Teacher Details</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Branches */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Branches ({formData.branches.length})
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {formData.branches.map((branch, index) => (
                    <div key={index} className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Branch Name"
                            value={branch.name}
                            onChange={(e) => {
                              const newBranches = [...formData.branches]
                              newBranches[index].name = e.target.value
                              setFormData({...formData, branches: newBranches})
                              // Clear error when user starts typing
                              if (formErrors[`branch_${index}_name`]) {
                                const newErrors = {...formErrors}
                                delete newErrors[`branch_${index}_name`]
                                setFormErrors(newErrors)
                              }
                            }}
                            className={`p-2 rounded bg-gray-800 text-white border ${
                              formErrors[`branch_${index}_name`] ? 'border-red-500' : 'border-gray-600'
                            } focus:border-purple-400 text-sm`}
                          />
                          {formErrors[`branch_${index}_name`] && (
                            <p className="text-red-400 text-xs mt-1">{formErrors[`branch_${index}_name`]}</p>
                          )}
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Code"
                            value={branch.code}
                            onChange={(e) => {
                              const newBranches = [...formData.branches]
                              newBranches[index].code = e.target.value.toUpperCase()
                              setFormData({...formData, branches: newBranches})
                              // Clear error when user starts typing
                              if (formErrors[`branch_${index}_code`]) {
                                const newErrors = {...formErrors}
                                delete newErrors[`branch_${index}_code`]
                                setFormErrors(newErrors)
                              }
                            }}
                            className={`p-2 rounded bg-gray-800 text-white border ${
                              formErrors[`branch_${index}_code`] ? 'border-red-500' : 'border-gray-600'
                            } focus:border-purple-400 text-sm`}
                          />
                          {formErrors[`branch_${index}_code`] && (
                            <p className="text-red-400 text-xs mt-1">{formErrors[`branch_${index}_code`]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teachers */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Teachers ({formData.teachers.length})
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {formData.teachers.map((teacher, index) => (
                    <div key={index} className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Teacher Name"
                            value={teacher.name}
                            onChange={(e) => {
                              const newTeachers = [...formData.teachers]
                              newTeachers[index].name = e.target.value
                              setFormData({...formData, teachers: newTeachers})
                              // Clear error when user starts typing
                              if (formErrors[`teacher_${index}_name`]) {
                                const newErrors = {...formErrors}
                                delete newErrors[`teacher_${index}_name`]
                                setFormErrors(newErrors)
                              }
                            }}
                            className={`p-2 rounded bg-gray-800 text-white border ${
                              formErrors[`teacher_${index}_name`] ? 'border-red-500' : 'border-gray-600'
                            } focus:border-purple-400 text-sm`}
                          />
                          {formErrors[`teacher_${index}_name`] && (
                            <p className="text-red-400 text-xs mt-1">{formErrors[`teacher_${index}_name`]}</p>
                          )}
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Code"
                            value={teacher.code}
                            onChange={(e) => {
                              const newTeachers = [...formData.teachers]
                              newTeachers[index].code = e.target.value.toUpperCase()
                              setFormData({...formData, teachers: newTeachers})
                              // Clear error when user starts typing
                              if (formErrors[`teacher_${index}_code`]) {
                                const newErrors = {...formErrors}
                                delete newErrors[`teacher_${index}_code`]
                                setFormErrors(newErrors)
                              }
                            }}
                            className={`p-2 rounded bg-gray-800 text-white border ${
                              formErrors[`teacher_${index}_code`] ? 'border-red-500' : 'border-gray-600'
                            } focus:border-purple-400 text-sm`}
                          />
                          {formErrors[`teacher_${index}_code`] && (
                            <p className="text-red-400 text-xs mt-1">{formErrors[`teacher_${index}_code`]}</p>
                          )}
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Subject"
                            value={teacher.subject}
                            onChange={(e) => {
                              const newTeachers = [...formData.teachers]
                              newTeachers[index].subject = e.target.value
                              setFormData({...formData, teachers: newTeachers})
                              // Clear error when user starts typing
                              if (formErrors[`teacher_${index}_subject`]) {
                                const newErrors = {...formErrors}
                                delete newErrors[`teacher_${index}_subject`]
                                setFormErrors(newErrors)
                              }
                            }}
                            className={`p-2 rounded bg-gray-800 text-white border ${
                              formErrors[`teacher_${index}_subject`] ? 'border-red-500' : 'border-gray-600'
                            } focus:border-purple-400 text-sm`}
                          />
                          {formErrors[`teacher_${index}_subject`] && (
                            <p className="text-red-400 text-xs mt-1">{formErrors[`teacher_${index}_subject`]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={generateDemoData}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
              >
                <Sparkles className="w-5 h-5 inline mr-2" />
                Generate Demo Data
              </button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-purple-400 font-bold text-sm">{Math.round(generationProgress)}%</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white">Generating Timetable...</h2>

            <div className="bg-gray-800/50 p-6 rounded-lg max-w-lg mx-auto">
              <p className="text-purple-400 font-semibold mb-4">{generationStep}</p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>

              {/* Step Indicators */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                {generationSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-center ${
                      index < (generationProgress / 100) * generationSteps.length
                        ? 'bg-green-500/20 text-green-400'
                        : index === Math.floor((generationProgress / 100) * generationSteps.length)
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-gray-700/50 text-gray-500'
                    }`}
                  >
                    {step.replace('...', '')}
                  </div>
                ))}
              </div>
            </div>

            {validationError && (
              <div className="bg-red-500/20 border border-red-500 p-4 rounded-lg text-left max-w-lg mx-auto">
                <div className="flex items-center space-x-2 text-red-400 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">Validation Error</span>
                </div>
                <pre className="text-red-300 text-sm whitespace-pre-wrap">{validationError}</pre>
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white">Timetable Generated Successfully!</h2>
              <p className="text-gray-400">Branch: {formData.branches[0]?.name || 'First Branch'}</p>
            </div>

            {/* Timetable Display */}
            <div className="overflow-x-auto">
              <table className="w-full bg-gray-800/50 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-purple-600">
                    <th className="p-3 text-left text-white">Time</th>
                    {formData.workingDays.map(day => (
                      <th key={day} className="p-3 text-left text-white">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.slice(0, formData.workingHours).map(timeSlot => (
                    <tr key={timeSlot} className="border-b border-gray-700">
                      <td className="p-3 text-white font-semibold">{timeSlot}</td>
                      {formData.workingDays.map(day => {
                        const entry = timetable.find(t => t.day === day && t.timeSlot === timeSlot)
                        return (
                          <td key={day} className="p-3">
                            {entry ? (
                              <div className="bg-blue-500/20 p-2 rounded text-sm">
                                <div className="text-blue-400 font-semibold">{entry.subject}</div>
                                <div className="text-gray-400">{entry.teacher}</div>
                                <div className="text-gray-500">{entry.room}</div>
                              </div>
                            ) : (
                              <div className="text-gray-600 text-center">-</div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Export Options */}
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-white">Export Options</h3>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={exportToPNG}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Image className="w-4 h-4" />
                  <span>PNG</span>
                </button>
                <button
                  onClick={exportToPDF}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={exportToExcel}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel</span>
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Interactive Demo
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience our revolutionary points-based timetable generation system
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  index <= currentStep ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  index <= currentStep ? 'text-white' : 'text-gray-400'
                }`}>
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-600 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {!isGenerating && (
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentStep === 3 ? (
                <button
                  onClick={generateTimetable}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Generate Timetable</span>
                </button>
              ) : currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCurrentStep(0)
                    setTimetable([])
                    setFormData({
                      collegeName: '',
                      workingHours: 6,
                      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                      maxClassHours: 25,
                      numBranches: 1,
                      numTeachers: 5,
                      maxTeacherHours: 6,
                      branches: [],
                      teachers: []
                    })
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Start New Demo</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
