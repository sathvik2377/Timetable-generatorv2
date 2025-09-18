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
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

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
  branchId?: string
  color?: string
}

interface BranchTimetable {
  branchId: string
  branchName: string
  entries: TimetableEntry[]
}

const WORKING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const TIME_SLOTS = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '2:00-3:00', '3:00-4:00', '4:00-5:00']

const SUBJECT_COLORS: { [key: string]: string } = {
  'Mathematics': 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
  'Physics': 'bg-gradient-to-br from-green-500 to-green-600 text-white',
  'Chemistry': 'bg-gradient-to-br from-orange-500 to-orange-600 text-white',
  'Biology': 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white',
  'English': 'bg-gradient-to-br from-purple-500 to-purple-600 text-white',
  'Hindi': 'bg-gradient-to-br from-pink-500 to-pink-600 text-white',
  'History': 'bg-gradient-to-br from-amber-500 to-amber-600 text-white',
  'Geography': 'bg-gradient-to-br from-teal-500 to-teal-600 text-white',
  'Computer Science': 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white',
  'Economics': 'bg-gradient-to-br from-red-500 to-red-600 text-white',
  'Political Science': 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white',
  'Sociology': 'bg-gradient-to-br from-violet-500 to-violet-600 text-white',
  'Psychology': 'bg-gradient-to-br from-rose-500 to-rose-600 text-white',
  'Philosophy': 'bg-gradient-to-br from-slate-500 to-slate-600 text-white',
  'Physical Education': 'bg-gradient-to-br from-lime-500 to-lime-600 text-white',
  'Art': 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 text-white',
  'Music': 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white',
  'Lunch Break': 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
}

const DEMO_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi',
  'History', 'Geography', 'Computer Science', 'Economics', 'Political Science',
  'Sociology', 'Psychology', 'Philosophy', 'Physical Education', 'Art', 'Music'
]

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
  const [branchTimetables, setBranchTimetables] = useState<BranchTimetable[]>([])
  const [currentBranchIndex, setCurrentBranchIndex] = useState(0)
  const [validationError, setValidationError] = useState('')
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [isExporting, setIsExporting] = useState(false)

  // Initialize branches and teachers arrays when component mounts
  useEffect(() => {
    initializeArrays()
  }, [])

  // Keyboard navigation for branch switching
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (currentStep === 4 && branchTimetables.length > 1) {
        if (e.key === 'ArrowLeft' && currentBranchIndex > 0) {
          setCurrentBranchIndex(currentBranchIndex - 1)
        } else if (e.key === 'ArrowRight' && currentBranchIndex < branchTimetables.length - 1) {
          setCurrentBranchIndex(currentBranchIndex + 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentStep, currentBranchIndex, branchTimetables.length])

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

  // Enhanced demo data generation that respects user-specified counts
  const generateDemoData = () => {
    const branchNames = [
      'Computer Science Engineering', 'Electronics & Communication', 'Mechanical Engineering',
      'Civil Engineering', 'Electrical Engineering', 'Chemical Engineering',
      'Aerospace Engineering', 'Biotechnology', 'Information Technology', 'Automobile Engineering'
    ]

    const teacherNames = [
      'Dr. Rajesh Kumar', 'Prof. Priya Sharma', 'Dr. Amit Singh', 'Ms. Neha Gupta', 'Prof. Suresh Patel',
      'Dr. Kavita Jain', 'Mr. Ravi Verma', 'Prof. Sunita Rao', 'Dr. Manoj Tiwari', 'Ms. Pooja Agarwal',
      'Prof. Vikash Yadav', 'Dr. Rekha Mishra', 'Mr. Deepak Joshi', 'Prof. Anita Kumari', 'Dr. Sanjay Pandey',
      'Ms. Shweta Singh', 'Prof. Rahul Gupta', 'Dr. Meera Patel', 'Mr. Arjun Sharma', 'Prof. Divya Rao',
      'Dr. Kiran Joshi', 'Ms. Nisha Verma', 'Prof. Rohit Kumar', 'Dr. Seema Agarwal', 'Mr. Ajay Tiwari',
      'Prof. Ritu Mishra', 'Dr. Vinod Yadav', 'Ms. Preeti Jain', 'Prof. Sachin Pandey', 'Dr. Geeta Kumari',
      'Mr. Nitin Singh', 'Prof. Madhuri Sharma', 'Dr. Anil Gupta', 'Ms. Swati Patel', 'Prof. Manish Rao',
      'Dr. Sunita Joshi', 'Mr. Rakesh Verma', 'Prof. Kavya Kumar', 'Dr. Sunil Agarwal', 'Ms. Priyanka Tiwari',
      'Prof. Deepika Mishra', 'Dr. Ashok Yadav', 'Ms. Renu Jain', 'Prof. Vikas Pandey', 'Dr. Sushma Kumari',
      'Mr. Rajiv Singh', 'Prof. Neelam Sharma', 'Dr. Mukesh Gupta', 'Ms. Anjali Patel', 'Prof. Sudhir Rao'
    ]

    // Generate branches based on user-specified count
    const demoBranches = Array(formData.numBranches).fill(null).map((_, i) => ({
      name: branchNames[i] || `Branch ${i + 1}`,
      code: branchNames[i] ? branchNames[i].split(' ').map(word => word[0]).join('') : `BR${i + 1}`
    }))

    // Generate teachers based on user-specified count
    const demoTeachers = Array(formData.numTeachers).fill(null).map((_, i) => ({
      name: teacherNames[i] || `Teacher ${i + 1}`,
      code: `T${String(i + 1).padStart(3, '0')}`,
      subject: DEMO_SUBJECTS[i % DEMO_SUBJECTS.length]
    }))

    setFormData(prev => ({
      ...prev,
      collegeName: 'Smart India Institute of Technology',
      branches: demoBranches,
      teachers: demoTeachers
    }))

    toast.success(`Generated demo data for ${formData.numBranches} branches and ${formData.numTeachers} teachers!`)
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

      // Generate timetables for all branches using enhanced points system
      const newBranchTimetables: BranchTimetable[] = []

      for (let branchIndex = 0; branchIndex < formData.branches.length; branchIndex++) {
        const branch = formData.branches[branchIndex]
        const branchTimetable: TimetableEntry[] = []

        // Reset teacher points for each branch
        const teacherPoints: { [key: string]: number } = {}
        const teacherWorkload: { [key: string]: number } = {}

        // Initialize teacher points and workload tracking
        formData.teachers.forEach(teacher => {
          if (teacher.code && teacher.name) {
            teacherPoints[teacher.code] = formData.maxTeacherHours * 100 * formData.workingDays.length
            teacherWorkload[teacher.code] = 0
          }
        })

        let hoursScheduled = 0
        const targetHours = formData.maxClassHours
        const dailyHoursLimit = Math.ceil(targetHours / formData.workingDays.length)

        // Generate unique schedule for each branch
        for (const day of formData.workingDays) {
          let dailyHours = 0

          for (const timeSlot of TIME_SLOTS.slice(0, formData.workingHours)) {
            if (hoursScheduled >= targetHours || dailyHours >= dailyHoursLimit) break

            // Add some randomization to create different schedules per branch
            const shuffledTeachers = [...formData.teachers]
              .filter(teacher => teacher.code && teacherPoints[teacher.code] >= 100)
              .sort((a, b) => {
                // Add branch-specific randomization
                const randomFactor = (branchIndex + 1) * Math.sin(hoursScheduled + branchIndex)
                return (teacherWorkload[a.code] + randomFactor) - (teacherWorkload[b.code] + randomFactor)
              })

            const selectedTeacher = shuffledTeachers[0]

            if (selectedTeacher) {
              teacherPoints[selectedTeacher.code] -= 100
              teacherWorkload[selectedTeacher.code]++

              branchTimetable.push({
                day,
                timeSlot,
                subject: selectedTeacher.subject,
                teacher: selectedTeacher.name,
                room: `Room ${Math.floor(Math.random() * 20) + 101}`,
                branchId: branch.code,
                color: SUBJECT_COLORS[selectedTeacher.subject] || 'bg-gradient-to-br from-gray-500 to-gray-600 text-white'
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
            branchTimetable.push({
              day,
              timeSlot: lunchSlot,
              subject: 'Lunch Break',
              teacher: '',
              room: 'Cafeteria',
              branchId: branch.code,
              color: SUBJECT_COLORS['Lunch Break']
            })
          })
        }

        newBranchTimetables.push({
          branchId: branch.code,
          branchName: branch.name,
          entries: branchTimetable
        })
      }

      setBranchTimetables(newBranchTimetables)
      setCurrentBranchIndex(0)
      setIsGenerating(false)
      setCurrentStep(4)
      toast.success(`Generated ${newBranchTimetables.length} unique timetables successfully!`)

    } catch (error) {
      console.error('Generation error:', error)
      setIsGenerating(false)
      toast.error('Failed to generate timetable. Please try again.')
    }
  }

  // Export functionality
  const exportTimetable = async (format: 'png' | 'pdf' | 'excel') => {
    if (branchTimetables.length === 0) {
      toast.error('No timetable to export!')
      return
    }

    setIsExporting(true)
    const currentBranch = branchTimetables[currentBranchIndex]
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `${currentBranch.branchName.replace(/\s+/g, '_')}_Timetable_${timestamp}`

    try {
      if (format === 'png') {
        const timetableElement = document.getElementById('timetable-display')
        if (timetableElement) {
          const canvas = await html2canvas(timetableElement, {
            backgroundColor: '#1f2937',
            scale: 2,
            logging: false
          })

          const link = document.createElement('a')
          link.download = `${filename}.png`
          link.href = canvas.toDataURL()
          link.click()

          toast.success('PNG exported successfully!')
        }
      } else if (format === 'pdf') {
        const timetableElement = document.getElementById('timetable-display')
        if (timetableElement) {
          const canvas = await html2canvas(timetableElement, {
            backgroundColor: '#1f2937',
            scale: 2,
            logging: false
          })

          const pdf = new jsPDF('l', 'mm', 'a4')
          const imgData = canvas.toDataURL('image/png')
          const imgWidth = 297
          const imgHeight = (canvas.height * imgWidth) / canvas.width

          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
          pdf.save(`${filename}.pdf`)

          toast.success('PDF exported successfully!')
        }
      } else if (format === 'excel') {
        const worksheetData = []

        // Add header
        worksheetData.push([
          `${currentBranch.branchName} Timetable`,
          '', '', '', '', ''
        ])
        worksheetData.push(['Day', 'Time', 'Subject', 'Teacher', 'Room', ''])

        // Add timetable data
        currentBranch.entries.forEach(entry => {
          worksheetData.push([
            entry.day,
            entry.timeSlot,
            entry.subject,
            entry.teacher,
            entry.room,
            ''
          ])
        })

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetable')

        XLSX.writeFile(workbook, `${filename}.xlsx`)
        toast.success('Excel file exported successfully!')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export timetable. Please try again.')
    } finally {
      setIsExporting(false)
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
        const currentBranch = branchTimetables[currentBranchIndex]
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white">Timetables Generated Successfully!</h2>
              <p className="text-gray-400">Generated {branchTimetables.length} unique timetables</p>
            </div>

            {/* Branch Navigation */}
            {branchTimetables.length > 1 && (
              <div className="flex items-center justify-center space-x-4 mb-6">
                <button
                  onClick={() => setCurrentBranchIndex(Math.max(0, currentBranchIndex - 1))}
                  disabled={currentBranchIndex === 0}
                  className="p-2 rounded-lg bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white">{currentBranch?.branchName}</h3>
                  <p className="text-gray-400 text-sm">
                    Branch {currentBranchIndex + 1} of {branchTimetables.length}
                  </p>
                  <p className="text-purple-400 text-xs mt-1">
                    Use ← → arrow keys to navigate
                  </p>
                </div>

                <button
                  onClick={() => setCurrentBranchIndex(Math.min(branchTimetables.length - 1, currentBranchIndex + 1))}
                  disabled={currentBranchIndex === branchTimetables.length - 1}
                  className="p-2 rounded-lg bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Enhanced Timetable Display with Colors */}
            <div id="timetable-display" className="overflow-x-auto bg-gray-900 p-4 rounded-lg">
              <table className="w-full bg-gray-800/50 rounded-lg overflow-hidden shadow-2xl">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-600 to-violet-600">
                    <th className="p-4 text-left text-white font-bold">Time</th>
                    {formData.workingDays.map(day => (
                      <th key={day} className="p-4 text-left text-white font-bold">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.slice(0, formData.workingHours).map(timeSlot => (
                    <tr key={timeSlot} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                      <td className="p-4 text-white font-semibold bg-gray-800">{timeSlot}</td>
                      {formData.workingDays.map(day => {
                        const entry = currentBranch?.entries.find(t => t.day === day && t.timeSlot === timeSlot)
                        return (
                          <td key={day} className="p-2">
                            {entry ? (
                              <motion.div
                                className={`${entry.color} p-3 rounded-lg text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <div className="font-bold text-sm">{entry.subject}</div>
                                <div className="text-xs opacity-90 mt-1">{entry.teacher}</div>
                                <div className="text-xs opacity-75 mt-1">{entry.room}</div>
                              </motion.div>
                            ) : (
                              <div className="text-gray-600 text-center p-3">-</div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Enhanced Export Options */}
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-white">Export Current Timetable</h3>
              <p className="text-gray-400 text-sm">
                Exporting: {currentBranch?.branchName} ({currentBranch?.entries.length} classes)
              </p>
              <div className="flex justify-center space-x-4 flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => exportTimetable('png')}
                  disabled={isExporting}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-semibold shadow-lg disabled:opacity-50"
                >
                  <Image className="w-5 h-5" />
                  <span>{isExporting ? 'Exporting...' : 'Export PNG'}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => exportTimetable('pdf')}
                  disabled={isExporting}
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-semibold shadow-lg disabled:opacity-50"
                >
                  <FileText className="w-5 h-5" />
                  <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => exportTimetable('excel')}
                  disabled={isExporting}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-semibold shadow-lg disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  <span>{isExporting ? 'Exporting...' : 'Export Excel'}</span>
                </motion.button>
              </div>

              {/* Start New Demo Button */}
              <div className="mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCurrentStep(0)
                    setBranchTimetables([])
                    setCurrentBranchIndex(0)
                    setFormData({
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
                    toast.success('Started new demo!')
                  }}
                  className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg"
                >
                  <Sparkles className="w-5 h-5 inline mr-2" />
                  Start New Demo
                </motion.button>
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
