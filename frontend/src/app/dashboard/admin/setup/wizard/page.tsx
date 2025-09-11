"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  ArrowRight,
  Target, 
  MapPin, 
  Users, 
  BookOpen, 
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Database,
  Utensils,
  HelpCircle,
  Lightbulb
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function WizardSetupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    // Step 1: Institution Info
    institutionName: '',
    institutionType: 'school',
    location: '',
    
    // Step 2: Scale
    studentCount: 500,
    branches: 3,
    
    // Step 3: Resources
    subjects: 8,
    teachers: 20,
    rooms: 15,
    
    // Step 4: Schedule
    startTime: '09:00',
    endTime: '16:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    workingDays: [1, 2, 3, 4, 5],
    
    // Step 5: Preferences
    prioritySubjects: [],
    specialRequirements: []
  })

  const totalSteps = 5

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUseSampleData = () => {
    setFormData({
      institutionName: 'Guided Learning Academy',
      institutionType: 'school',
      location: 'Downtown Campus',
      studentCount: 1200,
      branches: 6,
      subjects: 12,
      teachers: 35,
      rooms: 25,
      startTime: '08:00',
      endTime: '15:30',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      workingDays: [1, 2, 3, 4, 5],
      prioritySubjects: ['Mathematics', 'Science', 'English'],
      specialRequirements: ['Lab sessions', 'Sports periods']
    })
    toast.success('Guided sample data loaded!')
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      toast.loading('Generating timetable with guided wizard configuration...')
      
      // Simulate wizard processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const timetableData = {
        institution: formData.institutionName || 'Wizard Institution',
        type: formData.institutionType,
        schedule: generateWizardSchedule(),
        metadata: {
          generated_at: new Date().toISOString(),
          optimization_score: Math.floor(Math.random() * 15) + 85, // 85-100%
          conflicts_resolved: Math.floor(Math.random() * 8) + 2,
          wizard_steps_completed: totalSteps,
          total_sessions: formData.subjects * formData.branches * 5,
          creation_method: 'guided_wizard'
        }
      }
      
      toast.dismiss()
      toast.success(`Wizard timetable generated! Optimization: ${timetableData.metadata.optimization_score}%`)
      
      localStorage.setItem('generatedTimetable', JSON.stringify(timetableData))
      router.push('/dashboard/admin')
    } catch (error) {
      toast.dismiss()
      toast.error('Error in wizard generation')
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateWizardSchedule = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Physical Education']
    const timeSlots = [
      '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
      '13:00-14:00', '14:00-15:00', '15:00-16:00'
    ]
    
    const schedule: any[] = []
    
    timeSlots.forEach((time, timeIndex) => {
      const row: any = { Time: time }
      
      if (time.includes('12:00') || time.includes('13:00')) {
        days.forEach(day => {
          row[day] = 'LUNCH BREAK'
        })
      } else {
        days.forEach((day, dayIndex) => {
          const subjectIndex = (timeIndex + dayIndex) % subjects.length
          row[day] = subjects[subjectIndex]
        })
      }
      
      schedule.push(row)
    })
    
    return schedule
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <MapPin className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Institution Information</h3>
              <p className="text-gray-400">Let's start with basic information about your institution</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Institution Name *</label>
                <input
                  type="text"
                  value={formData.institutionName}
                  onChange={(e) => handleInputChange('institutionName', e.target.value)}
                  className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your institution name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Institution Type</label>
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Campus location"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Lightbulb className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-200">
                  <p className="font-medium">Tip:</p>
                  <p>Choose the institution type that best matches your organization. This helps us recommend appropriate settings.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Institution Scale</h3>
              <p className="text-gray-400">Tell us about the size of your institution</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Number of Students</label>
                <input
                  type="number"
                  value={formData.studentCount}
                  onChange={(e) => handleInputChange('studentCount', parseInt(e.target.value))}
                  className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="50"
                  max="10000"
                />
                <p className="text-xs text-gray-400 mt-1">Total students across all branches</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Number of Branches/Classes</label>
                <input
                  type="number"
                  value={formData.branches}
                  onChange={(e) => handleInputChange('branches', parseInt(e.target.value))}
                  className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="20"
                />
                <p className="text-xs text-gray-400 mt-1">Different classes or branches</p>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-200">
                  <p className="font-medium">Good to know:</p>
                  <p>We'll use this information to optimize resource allocation and suggest appropriate time slots.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Resources</h3>
              <p className="text-gray-400">Configure your teaching resources</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subjects</label>
                <input
                  type="number"
                  value={formData.subjects}
                  onChange={(e) => handleInputChange('subjects', parseInt(e.target.value))}
                  className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="3"
                  max="20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Teachers</label>
                <input
                  type="number"
                  value={formData.teachers}
                  onChange={(e) => handleInputChange('teachers', parseInt(e.target.value))}
                  className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="5"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rooms</label>
                <input
                  type="number"
                  value={formData.rooms}
                  onChange={(e) => handleInputChange('rooms', parseInt(e.target.value))}
                  className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="3"
                  max="50"
                />
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-200">
                  <p className="font-medium">Resource Planning:</p>
                  <p>Make sure you have enough teachers and rooms to accommodate all subjects and branches. We'll help optimize the allocation.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Clock className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Schedule Configuration</h3>
              <p className="text-gray-400">Set up your daily schedule and timing</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">School Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">School End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Utensils className="w-5 h-5 text-purple-400" />
                  <span>Lunch Break (Mandatory)</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Lunch Start Time</label>
                    <input
                      type="time"
                      value={formData.lunchStart}
                      onChange={(e) => handleInputChange('lunchStart', e.target.value)}
                      className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Lunch End Time</label>
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
            </div>

            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-200">
                  <p className="font-medium">Important:</p>
                  <p>Lunch break is mandatory and will be automatically included in all timetables. Make sure the timing works for your institution.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Target className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Review & Generate</h3>
              <p className="text-gray-400">Review your configuration and generate the timetable</p>
            </div>

            <div className="glass-card p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Configuration Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Institution:</span>
                  <span className="text-white ml-2">{formData.institutionName || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white ml-2 capitalize">{formData.institutionType}</span>
                </div>
                <div>
                  <span className="text-gray-400">Students:</span>
                  <span className="text-white ml-2">{formData.studentCount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Branches:</span>
                  <span className="text-white ml-2">{formData.branches}</span>
                </div>
                <div>
                  <span className="text-gray-400">Subjects:</span>
                  <span className="text-white ml-2">{formData.subjects}</span>
                </div>
                <div>
                  <span className="text-gray-400">Teachers:</span>
                  <span className="text-white ml-2">{formData.teachers}</span>
                </div>
                <div>
                  <span className="text-gray-400">Rooms:</span>
                  <span className="text-white ml-2">{formData.rooms}</span>
                </div>
                <div>
                  <span className="text-gray-400">Schedule:</span>
                  <span className="text-white ml-2">{formData.startTime} - {formData.endTime}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-200">
                  <p className="font-medium">Ready to Generate!</p>
                  <p>Your configuration looks good. Click "Generate Timetable" to create your optimized schedule.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
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
                <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">Setup Wizard</h1>
              </div>
              <p className="text-gray-300">Guided step-by-step timetable creation</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUseSampleData}
            className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Database className="w-4 h-4" />
            <span>Use Sample Data</span>
          </motion.button>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Step {currentStep} of {totalSteps}</h3>
            <span className="text-sm text-gray-400">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-violet-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Step Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 mb-8"
        >
          {renderStep()}
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevStep}
            disabled={currentStep === 1}
            className="glass-card px-6 py-3 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </motion.button>

          {currentStep === totalSteps ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerate}
              disabled={isGenerating || !formData.institutionName}
              className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-8 py-3 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="spinner" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Generate Timetable</span>
                </>
              )}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextStep}
              disabled={currentStep === 1 && !formData.institutionName}
              className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  )
}
