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
      id: 'branches',
      title: 'Branches & Departments',
      description: 'Define academic branches and their details',
      icon: Users,
      completed: (generationData.branches?.length || 0) > 0
    },
    {
      id: 'teachers',
      title: 'Faculty Information',
      description: 'Add teachers and their specializations',
      icon: Users,
      completed: (generationData.teachers?.length || 0) > 0
    },
    {
      id: 'subjects',
      title: 'Subject Curriculum',
      description: 'Configure subjects for each branch',
      icon: BookOpen,
      completed: (generationData.subjects?.length || 0) > 0
    },
    {
      id: 'rooms',
      title: 'Facilities & Rooms',
      description: 'Set up classrooms and laboratories',
      icon: MapPin,
      completed: (generationData.rooms?.length || 0) > 0
    },
    {
      id: 'preferences',
      title: 'Schedule Preferences',
      description: 'Configure timing and constraints',
      icon: Settings,
      completed: true
    }
  ]

  const handleFileUpload = useCallback(async (file: File, templateType: 'branches' | 'teachers' | 'subjects' | 'rooms') => {
    try {
      const data = await templateManager.parseExcelFile(file, templateType)
      
      setGenerationData(prev => ({
        ...prev,
        [templateType]: data
      }))
      
      toast.success(`${templateType} data uploaded successfully! (${data.length} entries)`)
    } catch (error) {
      console.error('File upload error:', error)
      toast.error(`Failed to upload ${templateType} data. Please check the file format.`)
    }
  }, [])

  const handleTemplateDownload = useCallback(async (templateType: 'branches' | 'teachers' | 'subjects' | 'rooms' | 'all') => {
    try {
      if (templateType === 'all') {
        await templateManager.downloadAllTemplates()
        toast.success('All templates downloaded successfully!')
      } else {
        switch (templateType) {
          case 'branches':
            await templateManager.createBranchesTemplate()
            break
          case 'teachers':
            await templateManager.createTeachersTemplate()
            break
          case 'subjects':
            await templateManager.createSubjectsTemplate()
            break
          case 'rooms':
            await templateManager.createRoomsTemplate()
            break
        }
        toast.success(`${templateType} template downloaded!`)
      }
    } catch (error) {
      console.error('Template download error:', error)
      toast.error('Failed to download template')
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
      case 'branches':
        return (
          <BranchesStep 
            data={generationData.branches || []}
            onFileUpload={(file) => handleFileUpload(file, 'branches')}
            onTemplateDownload={() => handleTemplateDownload('branches')}
          />
        )
      case 'teachers':
        return (
          <TeachersStep 
            data={generationData.teachers || []}
            onFileUpload={(file) => handleFileUpload(file, 'teachers')}
            onTemplateDownload={() => handleTemplateDownload('teachers')}
          />
        )
      case 'subjects':
        return (
          <SubjectsStep 
            data={generationData.subjects || []}
            onFileUpload={(file) => handleFileUpload(file, 'subjects')}
            onTemplateDownload={() => handleTemplateDownload('subjects')}
          />
        )
      case 'rooms':
        return (
          <RoomsStep 
            data={generationData.rooms || []}
            onFileUpload={(file) => handleFileUpload(file, 'rooms')}
            onTemplateDownload={() => handleTemplateDownload('rooms')}
          />
        )
      case 'preferences':
        return (
          <PreferencesStep 
            data={generationData.preferences!}
            onChange={(preferences) => setGenerationData(prev => ({ ...prev, preferences }))}
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
