"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Users,
  GraduationCap,
  Building,
  Loader2,
  Download,
  FileImage,
  FileText,
  FileSpreadsheet,
  Sparkles,
  Target,
  Brain,
  Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { withAuth } from '@/lib/auth'

interface InstitutionData {
  name: string
  startTime: string
  endTime: string
  workingDays: string[]
  maxClassHoursPerWeek: number
}

interface ResourceData {
  numBranches: number
  numTeachers: number
  maxTeacherHoursPerDay: number
}

interface Branch {
  name: string
  code: string
  subjects: string[]
}

interface Teacher {
  name: string
  code: string
  specialization: string
  maxHours: number
}

interface LoadingStep {
  text: string
  completed: boolean
}

function SimpleCreatorPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([])
  const [generatedTimetable, setGeneratedTimetable] = useState<any>(null)

  // Step 1: Institution Data
  const [institutionData, setInstitutionData] = useState<InstitutionData>({
    name: '',
    startTime: '08:00',
    endTime: '18:00',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    maxClassHoursPerWeek: 30
  })

  // Step 2: Resource Data
  const [resourceData, setResourceData] = useState<ResourceData>({
    numBranches: 2,
    numTeachers: 5,
    maxTeacherHoursPerDay: 6
  })

  // Step 3: Validation Results
  const [validationError, setValidationError] = useState<string>('')
  const [isValid, setIsValid] = useState(false)

  // Step 4: Dynamic Forms
  const [branches, setBranches] = useState<Branch[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Calculate feasibility whenever resource data changes
  useEffect(() => {
    validateFeasibility()
  }, [resourceData, institutionData])

  // Initialize dynamic forms when counts change
  useEffect(() => {
    if (resourceData.numBranches > 0) {
      setBranches(Array.from({ length: resourceData.numBranches }, (_, i) => ({
        name: `Branch ${i + 1}`,
        code: `BR${String(i + 1).padStart(2, '0')}`,
        subjects: ['Mathematics', 'Physics', 'Chemistry']
      })))
    }
  }, [resourceData.numBranches])

  useEffect(() => {
    if (resourceData.numTeachers > 0) {
      setTeachers(Array.from({ length: resourceData.numTeachers }, (_, i) => ({
        name: `Teacher ${i + 1}`,
        code: `T${String(i + 1).padStart(3, '0')}`,
        specialization: 'General',
        maxHours: resourceData.maxTeacherHoursPerDay
      })))
    }
  }, [resourceData.numTeachers, resourceData.maxTeacherHoursPerDay])

  const validateFeasibility = () => {
    const totalAvailableHours = resourceData.maxTeacherHoursPerDay * institutionData.workingDays.length * resourceData.numTeachers
    const totalRequiredHours = resourceData.numBranches * institutionData.maxClassHoursPerWeek

    if (totalAvailableHours !== totalRequiredHours) {
      setValidationError(
        `Total available teacher hours (${totalAvailableHours}) must equal total required class hours (${totalRequiredHours}) to generate a valid timetable. ` +
        `Available: ${resourceData.maxTeacherHoursPerDay} hours/day × ${institutionData.workingDays.length} days × ${resourceData.numTeachers} teachers = ${totalAvailableHours}. ` +
        `Required: ${resourceData.numBranches} branches × ${institutionData.maxClassHoursPerWeek} hours/week = ${totalRequiredHours}.`
      )
      setIsValid(false)
    } else {
      setValidationError('')
      setIsValid(true)
    }
  }

  const handleDemoData = () => {
    setInstitutionData({
      name: 'Demo Technical Institute',
      startTime: '08:00',
      endTime: '17:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      maxClassHoursPerWeek: 25
    })

    setResourceData({
      numBranches: 2,
      numTeachers: 5,
      maxTeacherHoursPerDay: 5
    })

    setBranches([
      {
        name: 'Computer Science Engineering',
        code: 'CSE',
        subjects: ['Data Structures', 'Database Management', 'Computer Networks', 'Operating Systems', 'Software Engineering']
      },
      {
        name: 'Electronics & Communication',
        code: 'ECE',
        subjects: ['Digital Electronics', 'Signals & Systems', 'Communication Systems', 'Microprocessors', 'VLSI Design']
      }
    ])

    setTeachers([
      { name: 'Dr. Rajesh Kumar', code: 'T001', specialization: 'Computer Science', maxHours: 5 },
      { name: 'Prof. Priya Sharma', code: 'T002', specialization: 'Electronics', maxHours: 5 },
      { name: 'Dr. Amit Singh', code: 'T003', specialization: 'Mathematics', maxHours: 5 },
      { name: 'Ms. Neha Gupta', code: 'T004', specialization: 'Physics', maxHours: 5 },
      { name: 'Mr. Suresh Patel', code: 'T005', specialization: 'General', maxHours: 5 }
    ])

    toast.success('Demo data loaded successfully!')
    setCurrentStep(5) // Skip to final step
  }

  const generateTimetableWithPoints = async () => {
    setIsGenerating(true)
    setLoadingSteps([
      { text: 'Initializing OR-Tools solver...', completed: false },
      { text: 'Calculating teacher availability...', completed: false },
      { text: 'Applying points-based constraints...', completed: false },
      { text: 'Optimizing schedule...', completed: false },
      { text: 'Finalizing timetable...', completed: false }
    ])

    try {
      // Simulate loading steps
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setLoadingSteps(prev => prev.map((step, index) =>
          index === i ? { ...step, completed: true } : step
        ))
      }

      // Prepare data for API
      const timetableData = {
        institution: institutionData,
        branches: branches.slice(0, 1), // Generate for first branch only as requested
        teachers: teachers,
        pointsSystem: {
          teacherTotalPoints: resourceData.maxTeacherHoursPerDay * 100,
          classPointsPerHour: 100,
          requiredPointsPerClass: institutionData.maxClassHoursPerWeek * 100
        }
      }

      // Call API to generate timetable
      const response = await axios.post('http://127.0.0.1:8000/api/scheduler/generate/', timetableData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data.status === 'success') {
        setGeneratedTimetable(response.data.timetable)
        toast.success('Timetable generated successfully!')
      } else {
        throw new Error(response.data.message || 'Generation failed')
      }
    } catch (error: any) {
      console.error('Generation error:', error)
      toast.error(error.response?.data?.message || 'Failed to generate timetable')
    } finally {
      setIsGenerating(false)
    }
  }

  const exportTimetable = async (format: 'png' | 'pdf' | 'excel') => {
    if (!generatedTimetable) return

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/scheduler/export/`, {
        timetable_id: generatedTimetable.id,
        format: format
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `timetable.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success(`Timetable exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error(`Failed to export as ${format.toUpperCase()}`)
    }
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2:
        return institutionData.name.trim() !== '' && institutionData.maxClassHoursPerWeek > 0
      case 3:
        return resourceData.numBranches > 0 && resourceData.numTeachers > 0 && resourceData.maxTeacherHoursPerDay > 0
      case 4:
        return isValid
      case 5:
        return branches.length > 0 && teachers.length > 0
      default:
        return true
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === step
              ? 'bg-blue-500 text-white'
              : currentStep > step
                ? 'bg-green-500 text-white'
                : 'bg-gray-600 text-gray-300'
          }`}>
            {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
          </div>
          {step < 5 && (
            <div className={`w-16 h-1 mx-2 ${
              currentStep > step ? 'bg-green-500' : 'bg-gray-600'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <Building className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-primary mb-2">Institution Information</h2>
        <p className="text-secondary">Enter your college/institution basic details</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Institution/College Name *
          </label>
          <input
            type="text"
            value={institutionData.name}
            onChange={(e) => setInstitutionData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter institution name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Maximum Class Hours per Week *
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={institutionData.maxClassHoursPerWeek}
            onChange={(e) => setInstitutionData(prev => ({ ...prev, maxClassHoursPerWeek: parseInt(e.target.value) || 0 }))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Working Hours - Start Time
          </label>
          <input
            type="time"
            value={institutionData.startTime}
            onChange={(e) => setInstitutionData(prev => ({ ...prev, startTime: e.target.value }))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Working Hours - End Time
          </label>
          <input
            type="time"
            value={institutionData.endTime}
            onChange={(e) => setInstitutionData(prev => ({ ...prev, endTime: e.target.value }))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-3">
          Working Days
        </label>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {allDays.map((day) => (
            <label key={day} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={institutionData.workingDays.includes(day)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setInstitutionData(prev => ({
                      ...prev,
                      workingDays: [...prev.workingDays, day]
                    }))
                  } else {
                    setInstitutionData(prev => ({
                      ...prev,
                      workingDays: prev.workingDays.filter(d => d !== day)
                    }))
                  }
                }}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-primary">{day.slice(0, 3)}</span>
            </label>
          ))}
        </div>
      </div>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <Users className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-primary mb-2">Resource Planning</h2>
        <p className="text-secondary">Define your institution's teaching resources</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Number of Branches/Departments *
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={resourceData.numBranches}
            onChange={(e) => setResourceData(prev => ({ ...prev, numBranches: parseInt(e.target.value) || 0 }))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Number of Teachers *
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={resourceData.numTeachers}
            onChange={(e) => setResourceData(prev => ({ ...prev, numTeachers: parseInt(e.target.value) || 0 }))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Max Working Hours per Teacher per Day *
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value={resourceData.maxTeacherHoursPerDay}
            onChange={(e) => setResourceData(prev => ({ ...prev, maxTeacherHoursPerDay: parseInt(e.target.value) || 0 }))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="6"
          />
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-400 mb-2">Resource Summary</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-secondary">Total Available Hours per Week:</p>
            <p className="text-primary font-medium">
              {resourceData.maxTeacherHoursPerDay} × {institutionData.workingDays.length} × {resourceData.numTeachers} = {' '}
              <span className="text-blue-400">{resourceData.maxTeacherHoursPerDay * institutionData.workingDays.length * resourceData.numTeachers} hours</span>
            </p>
          </div>
          <div>
            <p className="text-secondary">Total Required Hours per Week:</p>
            <p className="text-primary font-medium">
              {resourceData.numBranches} × {institutionData.maxClassHoursPerWeek} = {' '}
              <span className="text-green-400">{resourceData.numBranches * institutionData.maxClassHoursPerWeek} hours</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <Target className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-primary mb-2">Feasibility Validation</h2>
        <p className="text-secondary">Checking if your resource allocation is valid</p>
      </div>

      <div className={`p-6 rounded-lg border-2 ${
        isValid
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-red-500/10 border-red-500/30'
      }`}>
        <div className="flex items-center mb-4">
          {isValid ? (
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
          ) : (
            <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
          )}
          <h3 className={`text-xl font-semibold ${
            isValid ? 'text-green-400' : 'text-red-400'
          }`}>
            {isValid ? 'Validation Passed!' : 'Validation Failed!'}
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-4">
          <div className="bg-white/5 p-4 rounded-lg">
            <h4 className="font-medium text-blue-400 mb-2">Available Teacher Hours</h4>
            <p className="text-2xl font-bold text-blue-400">
              {resourceData.maxTeacherHoursPerDay * institutionData.workingDays.length * resourceData.numTeachers}
            </p>
            <p className="text-sm text-secondary mt-1">
              {resourceData.maxTeacherHoursPerDay} hrs/day × {institutionData.workingDays.length} days × {resourceData.numTeachers} teachers
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-lg">
            <h4 className="font-medium text-green-400 mb-2">Required Class Hours</h4>
            <p className="text-2xl font-bold text-green-400">
              {resourceData.numBranches * institutionData.maxClassHoursPerWeek}
            </p>
            <p className="text-sm text-secondary mt-1">
              {resourceData.numBranches} branches × {institutionData.maxClassHoursPerWeek} hrs/week
            </p>
          </div>
        </div>

        {!isValid && (
          <div className="bg-red-500/20 p-4 rounded-lg">
            <h4 className="font-medium text-red-400 mb-2">Error Explanation:</h4>
            <p className="text-red-300 text-sm leading-relaxed">
              {validationError}
            </p>
          </div>
        )}

        {isValid && (
          <div className="bg-green-500/20 p-4 rounded-lg">
            <h4 className="font-medium text-green-400 mb-2">Points System Ready:</h4>
            <p className="text-green-300 text-sm leading-relaxed">
              Each teacher will start with {resourceData.maxTeacherHoursPerDay * 100} points
              ({resourceData.maxTeacherHoursPerDay} hours × 100 points/hour).
              Classes will receive 100 points per hour taught, and each class needs exactly {institutionData.maxClassHoursPerWeek * 100} points
              ({institutionData.maxClassHoursPerWeek} hours × 100 points/hour) per week.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <GraduationCap className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-primary mb-2">Branch & Teacher Details</h2>
        <p className="text-secondary">Configure your branches and teaching staff</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Branches */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-4">Branches ({branches.length})</h3>
          <div className="space-y-4">
            {branches.map((branch, index) => (
              <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={branch.name}
                    onChange={(e) => {
                      const newBranches = [...branches]
                      newBranches[index].name = e.target.value
                      setBranches(newBranches)
                    }}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded text-primary text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="Branch name"
                  />
                  <input
                    type="text"
                    value={branch.code}
                    onChange={(e) => {
                      const newBranches = [...branches]
                      newBranches[index].code = e.target.value
                      setBranches(newBranches)
                    }}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded text-primary text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="Code"
                  />
                </div>
                <textarea
                  value={branch.subjects.join(', ')}
                  onChange={(e) => {
                    const newBranches = [...branches]
                    newBranches[index].subjects = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    setBranches(newBranches)
                  }}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-primary text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Subjects (comma separated)"
                  rows={2}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Teachers */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-4">Teachers ({teachers.length})</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {teachers.map((teacher, index) => (
              <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={teacher.name}
                    onChange={(e) => {
                      const newTeachers = [...teachers]
                      newTeachers[index].name = e.target.value
                      setTeachers(newTeachers)
                    }}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded text-primary text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="Teacher name"
                  />
                  <input
                    type="text"
                    value={teacher.code}
                    onChange={(e) => {
                      const newTeachers = [...teachers]
                      newTeachers[index].code = e.target.value
                      setTeachers(newTeachers)
                    }}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded text-primary text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="Code"
                  />
                </div>
                <input
                  type="text"
                  value={teacher.specialization}
                  onChange={(e) => {
                    const newTeachers = [...teachers]
                    newTeachers[index].specialization = e.target.value
                    setTeachers(newTeachers)
                  }}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-primary text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Specialization"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderStep5 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-primary mb-2">Generate Timetable</h2>
        <p className="text-secondary">Ready to create your optimized timetable using points-based system</p>
      </div>

      {!generatedTimetable && !isGenerating && (
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-8 rounded-lg border border-blue-500/20 mb-6">
            <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">Points-Based Algorithm Ready</h3>
            <p className="text-secondary mb-4">
              Our advanced OR-Tools solver will generate a timetable for <strong>{branches[0]?.name}</strong> using the points system:
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/5 p-3 rounded">
                <p className="text-blue-400 font-medium">Teacher Points</p>
                <p className="text-primary">{resourceData.maxTeacherHoursPerDay * 100} each</p>
              </div>
              <div className="bg-white/5 p-3 rounded">
                <p className="text-green-400 font-medium">Class Points Needed</p>
                <p className="text-primary">{institutionData.maxClassHoursPerWeek * 100}</p>
              </div>
              <div className="bg-white/5 p-3 rounded">
                <p className="text-purple-400 font-medium">Points per Hour</p>
                <p className="text-primary">100</p>
              </div>
            </div>
          </div>

          <button
            onClick={generateTimetableWithPoints}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center mx-auto"
          >
            <Zap className="w-5 h-5 mr-2" />
            Generate Timetable with Points System
          </button>
        </div>
      )}

      {isGenerating && (
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-8 rounded-lg border border-blue-500/20">
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-6 animate-spin" />
            <h3 className="text-xl font-semibold text-primary mb-6">Generating Your Timetable...</h3>

            <div className="space-y-3">
              {loadingSteps.map((step, index) => (
                <div key={index} className="flex items-center justify-center space-x-3">
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  <span className={`text-sm ${step.completed ? 'text-green-400' : 'text-blue-400'}`}>
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {generatedTimetable && (
        <div className="space-y-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-400 mb-2">Timetable Generated Successfully!</h3>
            <p className="text-secondary">Your optimized timetable is ready for {branches[0]?.name}</p>
          </div>

          {/* Export Options */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => exportTimetable('png')}
              className="flex items-center space-x-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all"
            >
              <FileImage className="w-4 h-4" />
              <span>Export PNG</span>
            </button>
            <button
              onClick={() => exportTimetable('pdf')}
              className="flex items-center space-x-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => exportTimetable('excel')}
              className="flex items-center space-x-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>

          {/* Timetable Display */}
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <h4 className="text-lg font-semibold text-primary mb-4">Generated Timetable Preview</h4>
            <div className="text-center text-secondary">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Timetable visualization will be displayed here</p>
              <p className="text-sm">Use export options above to download the complete timetable</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-primary" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primary">Simple Setup</h1>
              <p className="text-secondary">Step-by-step timetable creation with points-based system</p>
            </div>
          </div>

          <button
            onClick={handleDemoData}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Demo Data</span>
          </button>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 max-w-4xl mx-auto">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
              currentStep === 1
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-white/10 text-primary hover:bg-white/20'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-center">
            <p className="text-sm text-secondary">
              Step {currentStep} of 5
            </p>
          </div>

          <button
            onClick={nextStep}
            disabled={currentStep === 5 || !canProceedToStep(currentStep + 1)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
              currentStep === 5 || !canProceedToStep(currentStep + 1)
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default withAuth(SimpleCreatorPage, ['admin'])
