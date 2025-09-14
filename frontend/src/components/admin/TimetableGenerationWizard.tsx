'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Users, 
  BookOpen, 
  MapPin, 
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Play
} from 'lucide-react'
import { templateManager, TimetableGenerationData } from '@/lib/templateManager'
import { generateAdvancedTimetable, AdvancedOptimizationConfig } from '@/lib/advancedTimetableOptimizer'
import TemplateUploadSection from './TemplateUploadSection'
import { SubjectsStep, TeachersStep, ReviewStep, ResultsStep } from './WizardSteps'
import { toast } from 'react-hot-toast'

interface WizardStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  completed: boolean
}

interface TimetableGenerationWizardProps {
  onComplete: (data: TimetableGenerationData) => void
  onCancel: () => void
}

export default function TimetableGenerationWizard({ onComplete, onCancel }: TimetableGenerationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [generationData, setGenerationData] = useState<Partial<TimetableGenerationData>>({
    // NEP-2020 College Details
    college: {
      name: '',
      academicYear: '2024-25',
      type: 'college', // school vs college
      startTime: '09:00',
      endTime: '17:00',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      lunchStart: '13:00',
      lunchEnd: '14:00',
      maxTeacherHoursPerWeek: 24
    },
    branches: [],
    teachers: [],
    subjects: [],
    rooms: [],
    preferences: {
      startTime: '09:00',
      endTime: '17:00',
      lunchBreak: '13:00-14:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      periodDuration: 60
    }
  })

  const steps: WizardStep[] = [
    {
      id: 'college',
      title: 'College Details',
      description: 'Basic information about your institution',
      icon: Settings,
      completed: !!(generationData.college?.name)
    },
    {
      id: 'branches-rooms',
      title: 'Branches & Rooms',
      description: 'Academic branches and facility setup',
      icon: MapPin,
      completed: (generationData.branches?.length || 0) > 0 && (generationData.rooms?.length || 0) > 0
    },
    {
      id: 'subjects',
      title: 'Subjects',
      description: 'NEP-2020 compliant subject configuration',
      icon: BookOpen,
      completed: (generationData.subjects?.length || 0) > 0
    },
    {
      id: 'teachers',
      title: 'Teachers',
      description: 'Faculty with subject and class assignments',
      icon: Users,
      completed: (generationData.teachers?.length || 0) > 0
    },
    {
      id: 'review',
      title: 'Review & Generate',
      description: 'Review your setup and generate timetable',
      icon: CheckCircle,
      completed: false
    },
    {
      id: 'results',
      title: 'Results',
      description: 'View and export your timetable',
      icon: Play,
      completed: false
    }
  ]

  const handleFileUpload = useCallback(async (file: File, templateType: 'branches' | 'teachers' | 'subjects' | 'rooms') => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', templateType)

      const response = await fetch('/api/timetable/bulk-upload/', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()

        // Update the local state with uploaded data
        setGenerationData(prev => ({
          ...prev,
          [templateType]: result.data || []
        }))

        toast.success(`${templateType} data uploaded successfully! Created: ${result.created}, Updated: ${result.updated}`)
      } else {
        const errorData = await response.json()
        toast.error(`Upload failed: ${errorData.error || 'Unknown error'}`)
        if (errorData.details) {
          console.error('Upload error details:', errorData.details)
        }
      }
    } catch (error) {
      console.error('File upload error:', error)
      toast.error(`Failed to upload ${templateType} data. Please check the file format.`)
    }
  }, [])

  const handleTemplateDownload = useCallback(async (templateType: 'branches' | 'teachers' | 'subjects' | 'rooms' | 'all') => {
    try {
      const response = await fetch(`/api/timetable/template-download/?type=${templateType}`, {
        method: 'GET',
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${templateType}_template.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast.success(`${templateType} template downloaded successfully!`)
      } else {
        const errorData = await response.json()
        toast.error(`Download failed: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Template download error:', error)
      toast.error(`Failed to download ${templateType} template`)
    }
  }, [])

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = () => {
    if (generationData.branches && generationData.teachers && generationData.subjects && generationData.rooms && generationData.preferences) {
      // Ensure mandatory lunch break is set
      const preferences = {
        ...generationData.preferences,
        lunchBreak: generationData.preferences.lunchBreak || '13:00-14:00',
        mandatoryLunchBreak: true // Enforce lunch break
      }

      // Use advanced optimization with enhanced configuration
      const defaultConfig: AdvancedOptimizationConfig = {
        maxIterations: 1000,
        populationSize: 50,
        mutationRate: 0.1,
        crossoverRate: 0.8,
        elitismRate: 0.2,
        convergenceThreshold: 0.001,
        weightings: {
          teacherConflicts: 10.0, // Prevent teacher conflicts (highest priority)
          roomConflicts: 8.0,
          classConflicts: 10.0,
          teacherPreferences: 3.0,
          roomUtilization: 2.0,
          timeDistribution: 4.0,
          consecutiveHours: 5.0,
          lunchBreakViolations: 9.0 // High priority for lunch break enforcement
        }
      }

      const optimizationConfig: AdvancedOptimizationConfig = {
        ...defaultConfig,
        ...((generationData.preferences as any)?.optimizationConfig || {})
      }

      toast.success('🚀 Generating advanced timetable with conflict prevention...')

      try {
        const result = generateAdvancedTimetable({
          ...generationData as TimetableGenerationData,
          preferences
        }, optimizationConfig)

        // Add optimization results to the data
        const enhancedData = {
          ...generationData as TimetableGenerationData,
          preferences,
          optimizationResult: result
        }

        const conflictMessage = result.conflicts.length === 0
          ? '✅ No conflicts detected!'
          : `⚠️ ${result.conflicts.length} conflicts found and resolved`

        toast.success(`🎉 Timetable generated successfully! Score: ${result.optimizationScore.toFixed(1)}/100. ${conflictMessage}`)
        onComplete(enhancedData)
      } catch (error) {
        console.error('Advanced timetable generation failed:', error)
        toast.error('❌ Timetable generation failed. Please check your data and try again.')
      }
    } else {
      toast.error('⚠️ Please complete all steps before generating timetable')
    }
  }

  const renderStepContent = () => {
    const step = steps[currentStep]
    
    switch (step.id) {
      case 'college':
        return (
          <CollegeDetailsStep
            data={generationData.college || {}}
            onChange={(college) => setGenerationData(prev => ({ ...prev, college }))}
          />
        )
      case 'branches-rooms':
        return (
          <BranchesRoomsStep
            branchesData={generationData.branches || []}
            roomsData={generationData.rooms || []}
            onBranchesChange={(branches) => setGenerationData(prev => ({ ...prev, branches }))}
            onRoomsChange={(rooms) => setGenerationData(prev => ({ ...prev, rooms }))}
            onFileUpload={handleFileUpload}
            onTemplateDownload={handleTemplateDownload}
          />
        )
      case 'subjects':
        return (
          <SubjectsStep
            data={generationData.subjects || []}
            branches={generationData.branches || []}
            onDataChange={(subjects) => setGenerationData(prev => ({ ...prev, subjects }))}
            onFileUpload={(file) => handleFileUpload(file, 'subjects')}
            onTemplateDownload={() => handleTemplateDownload('subjects')}
          />
        )
      case 'teachers':
        return (
          <TeachersStep
            data={generationData.teachers || []}
            subjects={generationData.subjects || []}
            branches={generationData.branches || []}
            onDataChange={(teachers) => setGenerationData(prev => ({ ...prev, teachers }))}
            onFileUpload={(file) => handleFileUpload(file, 'teachers')}
            onTemplateDownload={() => handleTemplateDownload('teachers')}
          />
        )
      case 'review':
        return (
          <ReviewStep
            data={generationData}
            onGenerate={handleGenerate}
          />
        )
      case 'results':
        return (
          <ResultsStep
            data={generationData}
            onExport={(format) => console.log('Export:', format)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Intelligent Timetable Generation</h2>
          <p className="text-blue-100">Create comprehensive timetables with AI-powered optimization</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                  }
                  ${step.completed ? 'bg-green-600' : ''}
                `}>
                  {step.completed ? (
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

        {/* Content */}
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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleTemplateDownload('all')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download All Templates</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            
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
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Generate Timetable</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Step Components

// College Details Step
interface CollegeDetailsStepProps {
  data: any
  onChange: (data: any) => void
}

function CollegeDetailsStep({ data, onChange }: CollegeDetailsStepProps) {
  const workingDayOptions = [
    { value: 'Mon', label: 'Monday' },
    { value: 'Tue', label: 'Tuesday' },
    { value: 'Wed', label: 'Wednesday' },
    { value: 'Thu', label: 'Thursday' },
    { value: 'Fri', label: 'Friday' },
    { value: 'Sat', label: 'Saturday' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
        <Settings className="w-5 h-5" />
        <span className="font-medium">Configure your institution details</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Institution Name *
            </label>
            <input
              type="text"
              value={data.name || ''}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
              placeholder="Enter institution name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Academic Year *
            </label>
            <input
              type="text"
              value={data.academicYear || '2024-25'}
              onChange={(e) => onChange({ ...data, academicYear: e.target.value })}
              placeholder="2024-25"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Institution Type
            </label>
            <select
              value={data.type || 'college'}
              onChange={(e) => onChange({ ...data, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="school">School</option>
              <option value="college">College</option>
              <option value="university">University</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={data.startTime || '09:00'}
                onChange={(e) => onChange({ ...data, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={data.endTime || '17:00'}
                onChange={(e) => onChange({ ...data, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Working Days
            </label>
            <div className="grid grid-cols-3 gap-2">
              {workingDayOptions.map((day) => (
                <label key={day.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(data.workingDays || []).includes(day.value)}
                    onChange={(e) => {
                      const workingDays = data.workingDays || []
                      if (e.target.checked) {
                        onChange({ ...data, workingDays: [...workingDays, day.value] })
                      } else {
                        onChange({ ...data, workingDays: workingDays.filter((d: string) => d !== day.value) })
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{day.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lunch Start
              </label>
              <input
                type="time"
                value={data.lunchStart || '13:00'}
                onChange={(e) => onChange({ ...data, lunchStart: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lunch End
              </label>
              <input
                type="time"
                value={data.lunchEnd || '14:00'}
                onChange={(e) => onChange({ ...data, lunchEnd: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Teacher Hours per Week (NEP-2020)
            </label>
            <input
              type="number"
              value={data.maxTeacherHoursPerWeek || 24}
              onChange={(e) => onChange({ ...data, maxTeacherHoursPerWeek: parseInt(e.target.value) })}
              min="12"
              max="40"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">NEP-2020 compliant teaching load (12-40 hours)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Branches & Rooms Combined Step
interface BranchesRoomsStepProps {
  branchesData: any[]
  roomsData: any[]
  onBranchesChange: (data: any[]) => void
  onRoomsChange: (data: any[]) => void
  onFileUpload: (file: File, type: string) => void
  onTemplateDownload: (type: string) => void
}

function BranchesRoomsStep({
  branchesData,
  roomsData,
  onBranchesChange,
  onRoomsChange,
  onFileUpload,
  onTemplateDownload
}: BranchesRoomsStepProps) {
  const [activeTab, setActiveTab] = useState<'branches' | 'rooms'>('branches')

  const addBranch = () => {
    const newBranch = {
      id: Date.now(),
      code: '',
      name: '',
      description: ''
    }
    onBranchesChange([...branchesData, newBranch])
  }

  const addRoom = () => {
    const newRoom = {
      id: Date.now(),
      code: '',
      name: '',
      type: 'classroom',
      capacity: 60,
      isLab: false,
      building: '',
      floor: 1
    }
    onRoomsChange([...roomsData, newRoom])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
        <MapPin className="w-5 h-5" />
        <span className="font-medium">Set up your academic structure and facilities</span>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('branches')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'branches'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Branches ({branchesData.length})
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'rooms'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Rooms ({roomsData.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Academic Branches</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => onTemplateDownload('branches')}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Template</span>
              </button>
              <button
                onClick={() => document.getElementById('branches-upload')?.click()}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center space-x-1"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
              <input
                id="branches-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0], 'branches')}
                className="hidden"
              />
              <button
                onClick={addBranch}
                className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800"
              >
                Add Branch
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {branchesData.map((branch, index) => (
              <div key={branch.id || index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Branch Code *
                    </label>
                    <input
                      type="text"
                      value={branch.code || ''}
                      onChange={(e) => {
                        const updated = [...branchesData]
                        updated[index] = { ...branch, code: e.target.value }
                        onBranchesChange(updated)
                      }}
                      placeholder="CSE, ECE, ME..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Branch Name *
                    </label>
                    <input
                      type="text"
                      value={branch.name || ''}
                      onChange={(e) => {
                        const updated = [...branchesData]
                        updated[index] = { ...branch, name: e.target.value }
                        onBranchesChange(updated)
                      }}
                      placeholder="Computer Science Engineering..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        const updated = branchesData.filter((_, i) => i !== index)
                        onBranchesChange(updated)
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Facilities & Rooms</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => onTemplateDownload('rooms')}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Template</span>
              </button>
              <button
                onClick={() => document.getElementById('rooms-upload')?.click()}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center space-x-1"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
              <input
                id="rooms-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0], 'rooms')}
                className="hidden"
              />
              <button
                onClick={addRoom}
                className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800"
              >
                Add Room
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {roomsData.map((room, index) => (
              <div key={room.id || index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Room Code *
                    </label>
                    <input
                      type="text"
                      value={room.code || ''}
                      onChange={(e) => {
                        const updated = [...roomsData]
                        updated[index] = { ...room, code: e.target.value }
                        onRoomsChange(updated)
                      }}
                      placeholder="CR101, LAB201..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Room Name *
                    </label>
                    <input
                      type="text"
                      value={room.name || ''}
                      onChange={(e) => {
                        const updated = [...roomsData]
                        updated[index] = { ...room, name: e.target.value }
                        onRoomsChange(updated)
                      }}
                      placeholder="Classroom 101..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type & Capacity
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={room.type || 'classroom'}
                        onChange={(e) => {
                          const updated = [...roomsData]
                          updated[index] = { ...room, type: e.target.value, isLab: e.target.value === 'laboratory' }
                          onRoomsChange(updated)
                        }}
                        className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      >
                        <option value="classroom">Classroom</option>
                        <option value="laboratory">Laboratory</option>
                        <option value="seminar_hall">Seminar Hall</option>
                      </select>
                      <input
                        type="number"
                        value={room.capacity || 60}
                        onChange={(e) => {
                          const updated = [...roomsData]
                          updated[index] = { ...room, capacity: parseInt(e.target.value) }
                          onRoomsChange(updated)
                        }}
                        placeholder="60"
                        className="w-16 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        const updated = roomsData.filter((_, i) => i !== index)
                        onRoomsChange(updated)
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface StepProps {
  data: any[]
  onFileUpload: (file: File) => void
  onTemplateDownload: () => void
}

function BranchesStep({ data, onFileUpload, onTemplateDownload }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
        <Info className="w-5 h-5" />
        <span className="font-medium">Define your academic branches and departments</span>
      </div>

      <TemplateUploadSection
        title="Branches Data"
        description="Upload branch information including names, codes, student counts, and sections"
        templateType="branches"
        data={data}
        onFileUpload={onFileUpload}
        onTemplateDownload={onTemplateDownload}
      />
    </div>
  )
}

function TeachersStep({ data, onFileUpload, onTemplateDownload }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
        <Info className="w-5 h-5" />
        <span className="font-medium">Add faculty members and their subject specializations</span>
      </div>

      <TemplateUploadSection
        title="Faculty Data"
        description="Upload teacher information including names, IDs, departments, and subject expertise"
        templateType="teachers"
        data={data}
        onFileUpload={onFileUpload}
        onTemplateDownload={onTemplateDownload}
      />
    </div>
  )
}

function SubjectsStep({ data, onFileUpload, onTemplateDownload }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
        <Info className="w-5 h-5" />
        <span className="font-medium">Configure subjects for each branch with credits and contact hours</span>
      </div>

      <TemplateUploadSection
        title="Subjects Data"
        description="Upload subject information including names, codes, types, credits, and branch assignments"
        templateType="subjects"
        data={data}
        onFileUpload={onFileUpload}
        onTemplateDownload={onTemplateDownload}
      />
    </div>
  )
}

function RoomsStep({ data, onFileUpload, onTemplateDownload }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
        <Info className="w-5 h-5" />
        <span className="font-medium">Set up classrooms, laboratories, and other facilities</span>
      </div>

      <TemplateUploadSection
        title="Facilities Data"
        description="Upload room information including names, types, capacity, and equipment"
        templateType="rooms"
        data={data}
        onFileUpload={onFileUpload}
        onTemplateDownload={onTemplateDownload}
      />
    </div>
  )
}

interface PreferencesStepProps {
  data: any
  onChange: (preferences: any) => void
}

function PreferencesStep({ data, onChange }: PreferencesStepProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Initialize optimization config if not present
  const optimizationConfig = data.optimizationConfig || {
    maxIterations: 1000,
    populationSize: 50,
    mutationRate: 0.1,
    crossoverRate: 0.8,
    elitismRate: 0.2,
    convergenceThreshold: 0.001,
    weightings: {
      teacherConflicts: 10.0,
      roomConflicts: 8.0,
      classConflicts: 10.0,
      teacherPreferences: 3.0,
      roomUtilization: 2.0,
      timeDistribution: 4.0,
      consecutiveHours: 5.0,
      lunchBreakViolations: 7.0
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
        <Info className="w-5 h-5" />
        <span className="font-medium">Configure schedule timing and optimization settings</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={data.startTime}
              onChange={(e) => onChange({ ...data, startTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Time
            </label>
            <input
              type="time"
              value={data.endTime}
              onChange={(e) => onChange({ ...data, endTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mandatory Lunch Break <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.lunchBreak}
              onChange={(e) => onChange({ ...data, lunchBreak: e.target.value })}
              placeholder="13:00-14:00"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              🍽️ Mandatory lunch break ensures no classes are scheduled during this time
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Period Duration (minutes)
            </label>
            <input
              type="number"
              value={data.periodDuration}
              onChange={(e) => onChange({ ...data, periodDuration: parseInt(e.target.value) })}
              min="30"
              max="120"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Working Days
            </label>
            <div className="space-y-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <label key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.workingDays.includes(day)}
                    onChange={(e) => {
                      const newDays = e.target.checked
                        ? [...data.workingDays, day]
                        : data.workingDays.filter((d: string) => d !== day)
                      onChange({ ...data, workingDays: newDays })
                    }}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{day}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Optimization Settings */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <Settings className="w-4 h-4" />
          <span className="font-medium">Advanced Optimization Settings</span>
          <ChevronRight className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-4"
            >
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Genetic Algorithm Parameters</h4>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Max Iterations
                    </label>
                    <input
                      type="number"
                      value={optimizationConfig.maxIterations}
                      onChange={(e) => onChange({
                        ...data,
                        optimizationConfig: {
                          ...optimizationConfig,
                          maxIterations: parseInt(e.target.value)
                        }
                      })}
                      min="100"
                      max="5000"
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Population Size
                    </label>
                    <input
                      type="number"
                      value={optimizationConfig.populationSize}
                      onChange={(e) => onChange({
                        ...data,
                        optimizationConfig: {
                          ...optimizationConfig,
                          populationSize: parseInt(e.target.value)
                        }
                      })}
                      min="10"
                      max="200"
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Mutation Rate
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={optimizationConfig.mutationRate}
                      onChange={(e) => onChange({
                        ...data,
                        optimizationConfig: {
                          ...optimizationConfig,
                          mutationRate: parseFloat(e.target.value)
                        }
                      })}
                      min="0.01"
                      max="0.5"
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-3">Conflict Weightings</h4>

                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(optimizationConfig.weightings).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={value}
                        onChange={(e) => onChange({
                          ...data,
                          optimizationConfig: {
                            ...optimizationConfig,
                            weightings: {
                              ...optimizationConfig.weightings,
                              [key]: parseFloat(e.target.value)
                            }
                          }
                        })}
                        min="0"
                        max="20"
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p><strong>Tip:</strong> Higher weights prioritize avoiding those types of conflicts. Adjust based on your institution's priorities.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
