'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  School, 
  Users, 
  BookOpen, 
  GraduationCap,
  ChevronRight, 
  ChevronLeft, 
  Plus,
  Trash2,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Brain,
  Calendar,
  Clock,
  MapPin,
  FileSpreadsheet,
  Eye,
  Edit,
  Save,
  Info
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { templateManager } from '@/lib/templateManager'
import { generateOptimizedTimetable } from '@/lib/timetableOptimizer'

interface InstituteData {
  name: string
  academicYear: string
  semester: number
  numberOfBranches: number
}

interface BranchData {
  name: string
  code: string
  numberOfSubjects: number
  numberOfSections: number
  subjects: SubjectData[]
  teachers: TeacherData[]
}

interface SubjectData {
  name: string
  code: string
  type: 'theory' | 'practical' | 'tutorial'
  hoursPerWeek: number
}

interface TeacherData {
  name: string
  employeeId: string
  email: string
  phone: string
  subjectAssigned: string
}

interface UnifiedTimetableSetupProps {
  currentStep?: number
  setupData?: any
  onStepComplete?: (stepData: any) => void
  onGenerateTimetable?: () => void
  isGenerating?: boolean
  onComplete?: (timetableData: any) => void
  onCancel?: () => void
}

export default function UnifiedTimetableSetup({
  currentStep: externalCurrentStep,
  setupData: externalSetupData,
  onStepComplete,
  onGenerateTimetable,
  isGenerating: externalIsGenerating,
  onComplete,
  onCancel
}: UnifiedTimetableSetupProps) {
  const [currentStep, setCurrentStep] = useState(externalCurrentStep || 0)
  const [isGenerating, setIsGenerating] = useState(externalIsGenerating || false)

  // Use external state when available
  useEffect(() => {
    if (externalCurrentStep !== undefined) {
      setCurrentStep(externalCurrentStep)
    }
  }, [externalCurrentStep])

  useEffect(() => {
    if (externalIsGenerating !== undefined) {
      setIsGenerating(externalIsGenerating)
    }
  }, [externalIsGenerating])
  const [instituteData, setInstituteData] = useState<InstituteData>({
    name: '',
    academicYear: '2024-25',
    semester: 1,
    numberOfBranches: 0
  })
  const [branches, setBranches] = useState<BranchData[]>([])
  const [currentBranchIndex, setCurrentBranchIndex] = useState(0)
  const [generatedTimetables, setGeneratedTimetables] = useState<any>({})

  const steps = [
    {
      title: 'Institute Details',
      description: 'Basic institute information and academic setup',
      icon: School
    },
    {
      title: 'Branch Configuration',
      description: 'Define academic branches and their structure',
      icon: GraduationCap
    },
    {
      title: 'Subject Management',
      description: 'Add subjects for each branch',
      icon: BookOpen
    },
    {
      title: 'Faculty Assignment',
      description: 'Assign teachers to subjects',
      icon: Users
    },
    {
      title: 'Timetable Generation',
      description: 'Generate intelligent timetables',
      icon: Calendar
    },
    {
      title: 'Review & Export',
      description: 'Review and export timetables',
      icon: Eye
    }
  ]

  // Indian names for sample data
  const sampleTeacherNames = [
    'Dr. Rajesh Kumar', 'Prof. Priya Sharma', 'Dr. Amit Singh', 'Prof. Sunita Gupta',
    'Dr. Vikram Patel', 'Prof. Meera Joshi', 'Dr. Arjun Reddy', 'Prof. Kavita Nair',
    'Dr. Suresh Yadav', 'Prof. Anita Desai', 'Dr. Ravi Agarwal', 'Prof. Deepika Rao'
  ]

  const sampleSubjects = [
    { name: 'Data Structures', code: 'CS301', type: 'theory' as const, hoursPerWeek: 4 },
    { name: 'Database Management', code: 'CS302', type: 'theory' as const, hoursPerWeek: 3 },
    { name: 'Programming Lab', code: 'CS303', type: 'practical' as const, hoursPerWeek: 3 },
    { name: 'Web Development', code: 'CS304', type: 'theory' as const, hoursPerWeek: 4 },
    { name: 'Software Engineering', code: 'CS305', type: 'theory' as const, hoursPerWeek: 3 },
    { name: 'Network Security', code: 'CS306', type: 'theory' as const, hoursPerWeek: 3 }
  ]

  useEffect(() => {
    if (instituteData.numberOfBranches > 0 && branches.length === 0) {
      initializeBranches()
    }
  }, [instituteData.numberOfBranches])

  const initializeBranches = () => {
    const newBranches: BranchData[] = []
    for (let i = 0; i < instituteData.numberOfBranches; i++) {
      newBranches.push({
        name: '',
        code: '',
        numberOfSubjects: 0,
        numberOfSections: 1,
        subjects: [],
        teachers: []
      })
    }
    setBranches(newBranches)
  }

  const updateBranch = (index: number, field: keyof BranchData, value: any) => {
    const updatedBranches = [...branches]
    updatedBranches[index] = { ...updatedBranches[index], [field]: value }

    // Initialize subjects and teachers arrays when numbers change
    // IMPORTANT: Number of teachers MUST equal number of subjects (1:1 mapping)
    if (field === 'numberOfSubjects') {
      const subjects = []
      const teachers = []

      // Create exactly the same number of subjects and teachers
      for (let i = 0; i < value; i++) {
        subjects.push({
          name: '',
          code: '',
          type: 'theory' as const,
          hoursPerWeek: 3
        })
        teachers.push({
          name: '',
          employeeId: '',
          email: '',
          phone: '',
          subjectAssigned: '' // Will be mapped to subjects[i].name
        })
      }

      updatedBranches[index].subjects = subjects
      updatedBranches[index].teachers = teachers
      updatedBranches[index].numberOfSubjects = value
    }

    setBranches(updatedBranches)
  }

  const updateSubject = (branchIndex: number, subjectIndex: number, field: keyof SubjectData, value: any) => {
    const updatedBranches = [...branches]
    updatedBranches[branchIndex].subjects[subjectIndex] = {
      ...updatedBranches[branchIndex].subjects[subjectIndex],
      [field]: value
    }
    setBranches(updatedBranches)
  }

  const updateTeacher = (branchIndex: number, teacherIndex: number, field: keyof TeacherData, value: any) => {
    const updatedBranches = [...branches]
    updatedBranches[branchIndex].teachers[teacherIndex] = {
      ...updatedBranches[branchIndex].teachers[teacherIndex],
      [field]: value
    }
    setBranches(updatedBranches)
  }

  const autoAssignTeachersToSubjects = (branchIndex: number) => {
    const updatedBranches = [...branches]
    const branch = updatedBranches[branchIndex]

    // Auto-assign each teacher to corresponding subject (1:1 mapping)
    branch.teachers.forEach((teacher, index) => {
      if (branch.subjects[index]) {
        teacher.subjectAssigned = branch.subjects[index].name
      }
    })

    setBranches(updatedBranches)
    toast.success('Teachers auto-assigned to subjects!')
  }

  const generateTimetables = async () => {
    setIsGenerating(true)
    try {
      const timetables: any = {}
      let totalBranches = branches.length
      let processedBranches = 0

      toast.success(`🚀 Starting timetable generation for ${totalBranches} branches...`)

      for (const branch of branches) {
        toast.loading(`📚 Processing ${branch.name}...`, { id: `branch-${branch.code}` })

        // Validate branch data
        if (!branch.subjects || branch.subjects.length === 0) {
          toast.error(`❌ No subjects found for ${branch.name}. Skipping...`, { id: `branch-${branch.code}` })
          continue
        }

        if (!branch.teachers || branch.teachers.length === 0) {
          toast.error(`❌ No teachers found for ${branch.name}. Skipping...`, { id: `branch-${branch.code}` })
          continue
        }

        for (let section = 1; section <= branch.numberOfSections; section++) {
          const sectionKey = `${branch.code}-Section-${section}`

          try {
            // Prepare data for optimization with enhanced validation
            const optimizationData = {
              branches: [{
                name: branch.name,
                code: branch.code,
                totalStudents: branch.studentsPerSection || 40,
                sections: branch.numberOfSections,
                yearLevel: 3
              }],
              teachers: branch.teachers.map(t => ({
                name: t.name || `Teacher-${Math.random().toString(36).substr(2, 5)}`,
                employeeId: t.employeeId || `EMP-${Math.random().toString(36).substr(2, 5)}`,
                email: t.email || `${t.name?.toLowerCase().replace(/\s+/g, '.')}@institution.edu`,
                department: branch.name,
                subjects: [t.subjectAssigned || branch.subjects[0]?.name || 'General Subject'],
                maxHoursPerDay: 6,
                availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
              })),
              subjects: branch.subjects.map(s => ({
                name: s.name || `Subject-${Math.random().toString(36).substr(2, 5)}`,
                code: s.code || s.name?.substring(0, 3).toUpperCase() || 'SUB',
                type: s.type || 'theory',
                credits: Math.max(1, Math.ceil((s.hoursPerWeek || 3) / 2)),
                contactHours: s.hoursPerWeek || 3,
                branch: branch.name,
                semester: instituteData.semester,
                requiresLab: s.type === 'practical' || s.type === 'lab'
              })),
              rooms: [
                {
                  name: `${branch.code}-Room-1`,
                  type: 'classroom' as const,
                  capacity: branch.studentsPerSection || 40,
                  equipment: ['Projector', 'Whiteboard'],
                  branch: branch.name
                },
                {
                  name: `${branch.code}-Lab-1`,
                  type: 'lab' as const,
                  capacity: Math.min(30, branch.studentsPerSection || 30),
                  equipment: ['Computers', 'Lab Equipment'],
                  branch: branch.name
                },
                {
                  name: `${branch.code}-Room-2`,
                  type: 'classroom' as const,
                  capacity: branch.studentsPerSection || 40,
                  equipment: ['Smart Board'],
                  branch: branch.name
                }
              ],
              preferences: {
                startTime: '09:00',
                endTime: '16:00',
                lunchBreak: '13:00-14:00',
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                periodDuration: 60,
                mandatoryLunchBreak: true
              }
            }

            const result = generateOptimizedTimetable(optimizationData)

            // Validate the generated result
            if (!result || !result.schedule || Object.keys(result.schedule).length === 0) {
              throw new Error('Generated timetable is empty or invalid')
            }

            timetables[sectionKey] = {
              branch: branch.name,
              branchCode: branch.code,
              section: section,
              schedule: result.schedule,
              optimizationScore: result.optimizationScore || 75,
              totalPeriods: result.totalPeriods || 0,
              conflictsResolved: result.conflictsResolved || 0,
              branchSchedules: result.branchSchedules || {},
              sectionSchedules: result.sectionSchedules || {},
              colorMapping: result.colorMapping || {},
              generatedAt: new Date().toISOString(),
              studentsCount: branch.studentsPerSection || 40,
              subjectsCount: branch.subjects.length,
              teachersCount: branch.teachers.length
            }

            toast.success(`✅ Section ${section} completed for ${branch.name}`, { id: `section-${sectionKey}` })

          } catch (sectionError) {
            console.error(`Error generating timetable for ${sectionKey}:`, sectionError)
            toast.error(`❌ Failed to generate timetable for ${branch.name} Section ${section}`)

            // Create a fallback timetable
            timetables[sectionKey] = {
              branch: branch.name,
              branchCode: branch.code,
              section: section,
              schedule: createFallbackSchedule(branch),
              optimizationScore: 60,
              totalPeriods: 15,
              conflictsResolved: 0,
              error: sectionError.message,
              generatedAt: new Date().toISOString(),
              studentsCount: branch.studentsPerSection || 40,
              subjectsCount: branch.subjects.length,
              teachersCount: branch.teachers.length
            }
          }
        }

        processedBranches++
        toast.success(`✅ ${branch.name} completed (${processedBranches}/${totalBranches})`, { id: `branch-${branch.code}` })
      }

      setGeneratedTimetables(timetables)

      const totalTimetables = Object.keys(timetables).length
      const successfulTimetables = Object.values(timetables).filter((t: any) => !t.error).length

      if (successfulTimetables === totalTimetables) {
        toast.success(`🎉 All ${totalTimetables} timetables generated successfully!`)
      } else {
        toast.success(`⚠️ Generated ${successfulTimetables}/${totalTimetables} timetables (${totalTimetables - successfulTimetables} with fallbacks)`)
      }

      setCurrentStep(5) // Move to review step
    } catch (error) {
      console.error('Timetable generation error:', error)
      toast.error('❌ Failed to generate timetables. Please check your data and try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Create a fallback schedule when optimization fails
  const createFallbackSchedule = (branch: BranchData) => {
    const schedule: Record<string, Record<string, any>> = {}
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const timeSlots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '14:00-15:00', '15:00-16:00']

    days.forEach(day => {
      schedule[day] = {}
      timeSlots.forEach((timeSlot, index) => {
        if (timeSlot !== '13:00-14:00') { // Skip lunch
          const subject = branch.subjects[index % branch.subjects.length]
          const teacher = branch.teachers[index % branch.teachers.length]

          schedule[day][timeSlot] = {
            subject: subject?.name || 'General Subject',
            teacher: teacher?.name || 'Faculty',
            room: `${branch.code}-Room-${(index % 2) + 1}`,
            branch: branch.name,
            section: '1',
            type: subject?.type || 'theory',
            students: branch.studentsPerSection || 40,
            subjectCode: subject?.code || 'GEN',
            color: '#6B7280'
          }
        }
      })

      // Add lunch break
      schedule[day]['13:00-14:00'] = {
        subject: 'Lunch Break',
        teacher: '',
        room: 'Cafeteria',
        branch: branch.name,
        section: '1',
        type: 'break',
        students: 0,
        isBreak: true,
        color: '#10B981'
      }
    })

    return schedule
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)

      // Call external onStepComplete if available
      if (onStepComplete) {
        onStepComplete({
          step: newStep,
          instituteData,
          branches,
          generatedTimetables
        })
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const loadSampleData = () => {
    // Set institute data
    setInstituteData({
      name: 'Bharatiya Shiksha Sansthan',
      academicYear: '2024-25',
      semester: 1,
      numberOfBranches: 3
    })

    // Set sample branches
    const sampleBranches = [
      {
        name: 'Computer Science',
        code: 'CS',
        numberOfSubjects: 4,
        numberOfSections: 2,
        subjects: [
          { name: 'Data Structures', code: 'CS101', credits: 4, type: 'core' },
          { name: 'Algorithms', code: 'CS102', credits: 4, type: 'core' },
          { name: 'Database Systems', code: 'CS201', credits: 3, type: 'core' },
          { name: 'Web Development', code: 'CS301', credits: 3, type: 'elective' }
        ],
        teachers: [
          { name: 'Dr. Vikram Agarwal', email: 'vikram@college.edu.in', phone: '+91-9876543210', subjectAssigned: 'Data Structures' },
          { name: 'Prof. Kavita Joshi', email: 'kavita@college.edu.in', phone: '+91-9876543211', subjectAssigned: 'Algorithms' }
        ]
      },
      {
        name: 'Mathematics',
        code: 'MATH',
        numberOfSubjects: 3,
        numberOfSections: 1,
        subjects: [
          { name: 'Calculus I', code: 'MATH101', credits: 4, type: 'core' },
          { name: 'Linear Algebra', code: 'MATH102', credits: 3, type: 'core' },
          { name: 'Statistics', code: 'MATH201', credits: 3, type: 'elective' }
        ],
        teachers: [
          { name: 'Dr. Suresh Reddy', email: 'suresh@college.edu.in', phone: '+91-9876543212', subjectAssigned: 'Calculus I' }
        ]
      },
      {
        name: 'Physics',
        code: 'PHY',
        numberOfSubjects: 2,
        numberOfSections: 1,
        subjects: [
          { name: 'Mechanics', code: 'PHY101', credits: 4, type: 'core' },
          { name: 'Thermodynamics', code: 'PHY102', credits: 3, type: 'core' }
        ],
        teachers: [
          { name: 'Prof. Anita Verma', email: 'anita@college.edu.in', phone: '+91-9876543213', subjectAssigned: 'Mechanics' }
        ]
      }
    ]

    setBranches(sampleBranches)
    toast.success('Complete sample data loaded!')
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return instituteData.name && instituteData.numberOfBranches > 0
      case 1:
        return branches.every(b => b.name && b.code && b.numberOfSubjects > 0)
      case 2:
        return branches.every(b => b.subjects.every(s => s.name && s.code))
      case 3:
        return branches.every(b => b.teachers.every(t => t.name && t.subjectAssigned))
      case 4:
        return Object.keys(generatedTimetables).length > 0
      case 5:
        return true // Review step, always can proceed
      default:
        return true
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <School className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Institute Information
              </h3>
              <p className="text-gray-300">
                Enter your institute details to begin the setup process
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Institute Name *
                </label>
                <input
                  type="text"
                  value={instituteData.name}
                  onChange={(e) => setInstituteData({...instituteData, name: e.target.value})}
                  placeholder="e.g., Indian Institute of Technology Delhi"
                  className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Academic Year *
                </label>
                <select
                  value={instituteData.academicYear}
                  onChange={(e) => setInstituteData({...instituteData, academicYear: e.target.value})}
                  className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="2024-25">2024-25</option>
                  <option value="2025-26">2025-26</option>
                  <option value="2026-27">2026-27</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Semester *
                </label>
                <select
                  value={instituteData.semester}
                  onChange={(e) => setInstituteData({...instituteData, semester: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Branches *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={instituteData.numberOfBranches || ''}
                  onChange={(e) => setInstituteData({...instituteData, numberOfBranches: parseInt(e.target.value) || 0})}
                  placeholder="e.g., 4"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Sample Data Buttons */}
            <div className="text-center space-x-4">
              <button
                onClick={loadSampleData}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors"
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Load Complete Sample Data
              </button>

              <button
                onClick={() => {
                  // Open sample timetable in new tab
                  window.open('/demo-interactive', '_blank');
                  toast.success('Opening sample timetable in new tab');
                }}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-colors"
              >
                <Eye className="w-4 h-4 inline mr-2" />
                Show Sample Timetable
              </button>
            </div>

            {instituteData.numberOfBranches > 0 && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    Ready to configure {instituteData.numberOfBranches} branches
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You'll be able to set up subjects and teachers for each branch in the next steps.
                </p>
              </div>
            )}
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <GraduationCap className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Branch Configuration
              </h3>
              <p className="text-gray-300">
                Configure each academic branch with subjects and sections
              </p>
            </div>

            <div className="space-y-8">
              {branches.map((branch, index) => (
                <div key={index} className="glass-card border border-purple-500/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Branch {index + 1}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Branch Name *
                      </label>
                      <input
                        type="text"
                        value={branch.name}
                        onChange={(e) => updateBranch(index, 'name', e.target.value)}
                        placeholder="e.g., Computer Science"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Branch Code *
                      </label>
                      <input
                        type="text"
                        value={branch.code}
                        onChange={(e) => updateBranch(index, 'code', e.target.value.toUpperCase())}
                        placeholder="e.g., CSE"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Number of Subjects *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="15"
                        value={branch.numberOfSubjects || ''}
                        onChange={(e) => updateBranch(index, 'numberOfSubjects', parseInt(e.target.value) || 0)}
                        placeholder="e.g., 6"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Number of Sections
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={branch.numberOfSections}
                        onChange={(e) => updateBranch(index, 'numberOfSections', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {branch.numberOfSubjects > 0 && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-green-900 dark:text-green-100">
                          Ready for {branch.numberOfSubjects} subjects and {branch.numberOfSubjects} teachers (1:1 mapping)
                        </span>
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300">
                        Each subject will be assigned to exactly one teacher for optimal scheduling
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <BookOpen className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Subject Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Define subjects for each branch
              </p>
            </div>

            {branches.map((branch, branchIndex) => (
              <div key={branchIndex} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {branch.name} ({branch.code}) - Subjects
                </h4>

                <div className="space-y-4">
                  {branch.subjects.map((subject, subjectIndex) => (
                    <div key={subjectIndex} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Subject Name *
                        </label>
                        <input
                          type="text"
                          value={subject.name}
                          onChange={(e) => updateSubject(branchIndex, subjectIndex, 'name', e.target.value)}
                          placeholder="e.g., Data Structures"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Subject Code *
                        </label>
                        <input
                          type="text"
                          value={subject.code}
                          onChange={(e) => updateSubject(branchIndex, subjectIndex, 'code', e.target.value.toUpperCase())}
                          placeholder="e.g., CS301"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Type
                        </label>
                        <select
                          value={subject.type}
                          onChange={(e) => updateSubject(branchIndex, subjectIndex, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        >
                          <option value="theory">Theory</option>
                          <option value="practical">Practical</option>
                          <option value="tutorial">Tutorial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Hours/Week
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="8"
                          value={subject.hoursPerWeek}
                          onChange={(e) => updateSubject(branchIndex, subjectIndex, 'hoursPerWeek', parseInt(e.target.value) || 3)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const sampleSubject = sampleSubjects[Math.floor(Math.random() * sampleSubjects.length)]
                      updateSubject(branchIndex, 0, 'name', sampleSubject.name)
                      updateSubject(branchIndex, 0, 'code', sampleSubject.code)
                      updateSubject(branchIndex, 0, 'type', sampleSubject.type)
                      updateSubject(branchIndex, 0, 'hoursPerWeek', sampleSubject.hoursPerWeek)
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Fill Sample Data</span>
                  </button>

                  <button
                    className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import Excel</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Users className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Faculty Assignment
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Assign teachers to subjects for each branch (1:1 mapping)
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-center mb-2">
                  <Info className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">Important: Teacher-Subject Mapping</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Each teacher will be assigned to exactly one subject. This ensures optimal scheduling and prevents conflicts.
                  Use the "Auto-Assign" button to automatically map teachers to subjects in order.
                </p>
              </div>
            </div>

            {branches.map((branch, branchIndex) => (
              <div key={branchIndex} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {branch.name} ({branch.code}) - Faculty
                </h4>

                <div className="space-y-4">
                  {branch.teachers.map((teacher, teacherIndex) => (
                    <div key={teacherIndex} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Teacher Name *
                        </label>
                        <input
                          type="text"
                          value={teacher.name}
                          onChange={(e) => updateTeacher(branchIndex, teacherIndex, 'name', e.target.value)}
                          placeholder="e.g., Dr. Rajesh Kumar"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Employee ID
                        </label>
                        <input
                          type="text"
                          value={teacher.employeeId}
                          onChange={(e) => updateTeacher(branchIndex, teacherIndex, 'employeeId', e.target.value)}
                          placeholder="e.g., EMP001"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={teacher.email}
                          onChange={(e) => updateTeacher(branchIndex, teacherIndex, 'email', e.target.value)}
                          placeholder="xxxx@institute.edu.in"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={teacher.phone}
                          onChange={(e) => updateTeacher(branchIndex, teacherIndex, 'phone', e.target.value)}
                          placeholder="+91-XXXX-XXXXXX"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Subject Assigned *
                        </label>
                        <select
                          value={teacher.subjectAssigned}
                          onChange={(e) => updateTeacher(branchIndex, teacherIndex, 'subjectAssigned', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        >
                          <option value="">Select Subject</option>
                          {branch.subjects.map((subject, idx) => (
                            <option key={idx} value={subject.name}>
                              {subject.name} ({subject.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const randomName = sampleTeacherNames[Math.floor(Math.random() * sampleTeacherNames.length)]
                        updateTeacher(branchIndex, 0, 'name', randomName)
                        updateTeacher(branchIndex, 0, 'employeeId', `EMP${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`)
                        updateTeacher(branchIndex, 0, 'email', `${randomName.toLowerCase().replace(/[^a-z]/g, '')}@institute.edu.in`)
                        updateTeacher(branchIndex, 0, 'phone', `+91-XXXX-${String(Math.floor(Math.random() * 999999) + 100000)}`)
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Fill Sample Data</span>
                    </button>

                    <button
                      onClick={() => autoAssignTeachersToSubjects(branchIndex)}
                      disabled={branch.subjects.some(s => !s.name)}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Brain className="w-4 h-4" />
                      <span>Auto-Assign to Subjects</span>
                    </button>
                  </div>

                  <button
                    className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import Excel</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Calendar className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Intelligent Timetable Generation
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Generate optimized timetables for all branches and sections
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center mb-4">
                <Brain className="w-6 h-6 text-blue-500 mr-3" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI-Powered Generation Summary
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {branches.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Branches</div>
                </div>

                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {branches.reduce((total, branch) => total + branch.numberOfSections, 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Sections</div>
                </div>

                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {branches.reduce((total, branch) => total + branch.subjects.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Subjects</div>
                </div>
              </div>

              <div className="space-y-4">
                {branches.map((branch, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        {branch.name} ({branch.code})
                      </h5>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {branch.numberOfSections} section{branch.numberOfSections > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {branch.subjects.length} subjects • {branch.teachers.length} teachers
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={generateTimetables}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-8 py-3 rounded-lg flex items-center space-x-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-blue-700 transition-all duration-300"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating Timetables...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Intelligent Timetables</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Eye className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Review & Export Timetables
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Review generated timetables and export in your preferred format
              </p>
            </div>

            {Object.keys(generatedTimetables).length > 0 ? (
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Timetables Generated Successfully!
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {Object.keys(generatedTimetables).length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Timetables Created</div>
                    </div>

                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {Math.round(Object.values(generatedTimetables).reduce((avg: number, tt: any) => avg + tt.optimizationScore, 0) / Object.keys(generatedTimetables).length)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Avg. Optimization</div>
                    </div>

                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {Object.values(generatedTimetables).reduce((total: number, tt: any) => total + tt.conflictsResolved, 0)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Conflicts Resolved</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(generatedTimetables).map(([key, timetable]: [string, any]) => (
                    <div key={key} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {timetable.branch} - Section {timetable.section}
                          </h5>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Optimization: {timetable.optimizationScore}%
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Periods: {timetable.totalPeriods}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Conflicts: {timetable.conflictsResolved}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm">
                            <Eye className="w-4 h-4" />
                            <span>View Full</span>
                          </button>

                          <button className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm">
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                          </button>
                        </div>
                      </div>

                      {/* Enhanced Color-Coded Timetable Preview */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Color-Coded Schedule Preview:
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-200 dark:bg-gray-600">
                                <th className="border border-gray-300 dark:border-gray-500 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Time</th>
                                <th className="border border-gray-300 dark:border-gray-500 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Monday</th>
                                <th className="border border-gray-300 dark:border-gray-500 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Tuesday</th>
                                <th className="border border-gray-300 dark:border-gray-500 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Wednesday</th>
                                <th className="border border-gray-300 dark:border-gray-500 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Thursday</th>
                                <th className="border border-gray-300 dark:border-gray-500 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Friday</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Sample color-coded schedule rows */}
                              <tr>
                                <td className="border border-gray-300 dark:border-gray-500 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600">09:00-10:00</td>
                                <td className="border border-gray-300 dark:border-gray-500 p-1">
                                  <div className="bg-blue-500 text-white p-2 rounded text-center text-xs">
                                    <div className="font-semibold">Data Structures</div>
                                    <div className="text-xs opacity-90">Dr. Rajesh Kumar</div>
                                  </div>
                                </td>
                                <td className="border border-gray-300 dark:border-gray-500 p-1">
                                  <div className="bg-green-500 text-white p-2 rounded text-center text-xs">
                                    <div className="font-semibold">Database Systems</div>
                                    <div className="text-xs opacity-90">Prof. Priya Sharma</div>
                                  </div>
                                </td>
                                <td className="border border-gray-300 dark:border-gray-500 p-1">
                                  <div className="bg-purple-500 text-white p-2 rounded text-center text-xs">
                                    <div className="font-semibold">Web Development</div>
                                    <div className="text-xs opacity-90">Dr. Amit Singh</div>
                                  </div>
                                </td>
                                <td className="border border-gray-300 dark:border-gray-500 p-1">
                                  <div className="bg-orange-500 text-white p-2 rounded text-center text-xs">
                                    <div className="font-semibold">Software Engg</div>
                                    <div className="text-xs opacity-90">Prof. Sunita Gupta</div>
                                  </div>
                                </td>
                                <td className="border border-gray-300 dark:border-gray-500 p-1">
                                  <div className="bg-red-500 text-white p-2 rounded text-center text-xs">
                                    <div className="font-semibold">Network Security</div>
                                    <div className="text-xs opacity-90">Dr. Vikram Patel</div>
                                  </div>
                                </td>
                              </tr>

                              <tr>
                                <td className="border border-gray-300 dark:border-gray-500 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600">13:00-14:00</td>
                                <td colSpan={5} className="border border-gray-300 dark:border-gray-500 p-2 text-center bg-yellow-100 dark:bg-yellow-900">
                                  <div className="text-yellow-800 dark:text-yellow-200 font-semibold text-sm">
                                    🍽️ LUNCH BREAK
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Color Legend */}
                        <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                          <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">Subject Color Legend:</div>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 bg-blue-500 rounded"></div>
                              <span className="text-xs text-gray-600 dark:text-gray-300">Theory</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 bg-green-500 rounded"></div>
                              <span className="text-xs text-gray-600 dark:text-gray-300">Database</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 bg-purple-500 rounded"></div>
                              <span className="text-xs text-gray-600 dark:text-gray-300">Practical</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 bg-orange-500 rounded"></div>
                              <span className="text-xs text-gray-600 dark:text-gray-300">Engineering</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-4">
                    <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Download className="w-5 h-5" />
                      <span>Export All as PDF</span>
                    </button>

                    <button className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <FileSpreadsheet className="w-5 h-5" />
                      <span>Export All as Excel</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Timetables Generated Yet
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Please go back to the previous step to generate timetables.
                </p>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go Back to Generation
                </button>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Step Under Development
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              This step is being implemented. Please continue to the next step.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="glass-card rounded-2xl w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white p-6">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-purple-200 mr-3" />
            <h2 className="text-2xl font-bold">Smart Timetable Setup & Generation</h2>
            <Brain className="w-8 h-8 text-violet-200 ml-3" />
          </div>
          <p className="text-purple-100 text-center">Complete setup and intelligent timetable generation in one flow</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                  }
                  ${index === currentStep ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}
                `}>
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-16 h-1 mx-2
                    ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}
                  `} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {steps[currentStep].title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {steps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Content will be added in the next part */}
        <div className="p-6 overflow-y-auto max-h-96">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex items-center space-x-4">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex items-center space-x-2 px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed() || (currentStep === 4 && isGenerating)}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>{currentStep === 4 ? 'Review Generated' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onComplete(generatedTimetables)}
                disabled={Object.keys(generatedTimetables).length === 0}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Complete Setup</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
