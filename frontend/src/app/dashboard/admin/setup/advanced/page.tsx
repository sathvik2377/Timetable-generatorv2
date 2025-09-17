"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Settings, 
  Shield, 
  Zap, 
  Users, 
  BookOpen, 
  MapPin,
  CheckCircle,
  AlertCircle,
  Play,
  Database,
  Utensils,
  Clock,
  Target,
  Cpu
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { TimetableVariantSelector } from '@/components/TimetableVariantSelector'
import { withAuth } from '@/lib/auth'
import { generateTimetableVariants } from '@/lib/apiUtils'

function AdvancedSetupPage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [variants, setVariants] = useState<any[]>([])
  const [showVariantSelector, setShowVariantSelector] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionType: 'university',
    campuses: 3,
    branches: 15,
    subjects: 20,
    teachers: 75,
    rooms: 60,
    startTime: '07:00',
    endTime: '19:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    workingDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    constraints: {
      maxConsecutiveClasses: 3,
      minBreakBetweenClasses: 15,
      teacherMaxHoursPerDay: 8,
      roomUtilizationTarget: 85,
      conflictResolution: true,
      loadBalancing: true,
      priorityScheduling: true
    },
    advancedFeatures: {
      multiCampusSync: true,
      realTimeOptimization: true,
      predictiveAnalytics: true,
      customRules: true,
      apiIntegration: true
    }
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleConstraintChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        [field]: value
      }
    }))
  }

  const handleFeatureChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      advancedFeatures: {
        ...prev.advancedFeatures,
        [field]: value
      }
    }))
  }

  const handleUseSampleData = () => {
    setFormData({
      institutionName: 'Advanced Tech University',
      institutionType: 'university',
      campuses: 5,
      branches: 25,
      subjects: 35,
      teachers: 150,
      rooms: 120,
      startTime: '06:30',
      endTime: '20:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      workingDays: [1, 2, 3, 4, 5, 6],
      constraints: {
        maxConsecutiveClasses: 4,
        minBreakBetweenClasses: 10,
        teacherMaxHoursPerDay: 9,
        roomUtilizationTarget: 90,
        conflictResolution: true,
        loadBalancing: true,
        priorityScheduling: true
      },
      advancedFeatures: {
        multiCampusSync: true,
        realTimeOptimization: true,
        predictiveAnalytics: true,
        customRules: true,
        apiIntegration: true
      }
    })
    toast.success('Advanced enterprise sample data loaded!')
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      toast.loading('Processing advanced constraints with OR-Tools CP-SAT Solver...')

      const response = await generateTimetableVariants('advanced', formData)

      if (response.data.variants && response.data.variants.length > 0) {
        setVariants(response.data.variants)
        setShowVariantSelector(true)
        toast.dismiss()
        toast.success(`Generated ${response.data.variants.length} advanced timetable variants!`)
      } else {
        toast.error('No timetable variants generated')
      }
    } catch (error: any) {
      console.error('Advanced timetable generation error:', error)
      toast.error(error.response?.data?.error || 'Failed to generate advanced timetable')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerateVariants = async () => {
    setIsRegenerating(true)
    try {
      toast.loading('Regenerating advanced timetable variants...')

      const response = await generateTimetableVariants('advanced', formData)

      if (response.data.variants && response.data.variants.length > 0) {
        setVariants(response.data.variants)
        toast.dismiss()
        toast.success(`Regenerated ${response.data.variants.length} new variants!`)
      }
    } catch (error: any) {
      console.error('Regeneration error:', error)
      toast.error('Failed to regenerate variants')
    } finally {
      setIsRegenerating(false)
    }
  }

  const generateAdvancedSchedule = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const subjects = [
      'Advanced Mathematics', 'Quantum Physics', 'Organic Chemistry', 
      'Molecular Biology', 'Machine Learning', 'Data Structures',
      'Computer Networks', 'Database Systems', 'Software Engineering',
      'Artificial Intelligence', 'Cybersecurity', 'Cloud Computing',
      'Blockchain Technology', 'IoT Systems', 'Robotics Engineering',
      'Biomedical Engineering', 'Aerospace Engineering', 'Nanotechnology'
    ]
    const timeSlots = [
      '06:30-07:30', '07:30-08:30', '08:30-09:30', '09:30-10:30',
      '10:30-11:30', '11:30-12:30', '13:00-14:00', '14:00-15:00',
      '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00'
    ]
    
    const schedule = []
    
    timeSlots.forEach((time, timeIndex) => {
      const row: any = { Time: time }
      
      if (time.includes('12:30') || time.includes('13:00')) {
        days.forEach(day => {
          row[day] = 'LUNCH BREAK'
        })
      } else {
        days.forEach((day, dayIndex) => {
          // Advanced scheduling with constraint optimization
          const subjectIndex = (timeIndex * 3 + dayIndex * 2) % subjects.length
          row[day] = subjects[subjectIndex]
        })
      }
      
      schedule.push(row)
    })
    
    return schedule
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
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
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">Advanced Setup</h1>
              </div>
              <p className="text-gray-300">Professional setup with custom constraints and rules</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUseSampleData}
            className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Database className="w-4 h-4" />
            <span>Use Enterprise Sample Data</span>
          </motion.button>
        </motion.div>

        {/* Advanced Features Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8 border border-red-500/30"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-semibold text-white">Enterprise-Grade Features</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-red-500/10 rounded-lg">
              <Cpu className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-white font-medium">Advanced Constraints</p>
                <p className="text-gray-400 text-sm">Custom rules & optimization</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-red-500/10 rounded-lg">
              <Target className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-white font-medium">Multi-Campus Sync</p>
                <p className="text-gray-400 text-sm">Enterprise coordination</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-red-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-white font-medium">Real-time Optimization</p>
                <p className="text-gray-400 text-sm">Live constraint solving</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-red-500/10 rounded-lg">
              <Shield className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-white font-medium">API Integration</p>
                <p className="text-gray-400 text-sm">External system sync</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Institution Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                <span>Institution Configuration</span>
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
                      <option value="institute">Institute</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Campuses</label>
                    <input
                      type="number"
                      value={formData.campuses}
                      onChange={(e) => handleInputChange('campuses', parseInt(e.target.value))}
                      className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                      max="20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Branches</label>
                    <input
                      type="number"
                      value={formData.branches}
                      onChange={(e) => handleInputChange('branches', parseInt(e.target.value))}
                      className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="5"
                      max="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subjects</label>
                    <input
                      type="number"
                      value={formData.subjects}
                      onChange={(e) => handleInputChange('subjects', parseInt(e.target.value))}
                      className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="10"
                      max="50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Teachers</label>
                    <input
                      type="number"
                      value={formData.teachers}
                      onChange={(e) => handleInputChange('teachers', parseInt(e.target.value))}
                      className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="25"
                      max="500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rooms</label>
                    <input
                      type="number"
                      value={formData.rooms}
                      onChange={(e) => handleInputChange('rooms', parseInt(e.target.value))}
                      className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="20"
                      max="200"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Schedule Configuration */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-400" />
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

              {/* Lunch Break */}
              <div className="mb-4">
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
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Advanced Constraints */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-400" />
                <span>Advanced Constraints</span>
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Consecutive Classes</label>
                    <input
                      type="number"
                      value={formData.constraints.maxConsecutiveClasses}
                      onChange={(e) => handleConstraintChange('maxConsecutiveClasses', parseInt(e.target.value))}
                      className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="2"
                      max="6"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Min Break (minutes)</label>
                    <input
                      type="number"
                      value={formData.constraints.minBreakBetweenClasses}
                      onChange={(e) => handleConstraintChange('minBreakBetweenClasses', parseInt(e.target.value))}
                      className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="5"
                      max="30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Teacher Max Hours/Day</label>
                    <input
                      type="number"
                      value={formData.constraints.teacherMaxHoursPerDay}
                      onChange={(e) => handleConstraintChange('teacherMaxHoursPerDay', parseInt(e.target.value))}
                      className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="4"
                      max="12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Room Utilization (%)</label>
                    <input
                      type="number"
                      value={formData.constraints.roomUtilizationTarget}
                      onChange={(e) => handleConstraintChange('roomUtilizationTarget', parseInt(e.target.value))}
                      className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="60"
                      max="100"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.constraints.conflictResolution}
                      onChange={(e) => handleConstraintChange('conflictResolution', e.target.checked)}
                      className="w-5 h-5 text-purple-600 bg-transparent border-2 border-purple-500 rounded focus:ring-purple-500"
                    />
                    <span className="text-white">Automatic Conflict Resolution</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.constraints.loadBalancing}
                      onChange={(e) => handleConstraintChange('loadBalancing', e.target.checked)}
                      className="w-5 h-5 text-purple-600 bg-transparent border-2 border-purple-500 rounded focus:ring-purple-500"
                    />
                    <span className="text-white">Teacher Load Balancing</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.constraints.priorityScheduling}
                      onChange={(e) => handleConstraintChange('priorityScheduling', e.target.checked)}
                      className="w-5 h-5 text-purple-600 bg-transparent border-2 border-purple-500 rounded focus:ring-purple-500"
                    />
                    <span className="text-white">Priority-based Scheduling</span>
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Enterprise Features */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <span>Enterprise Features</span>
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.advancedFeatures.multiCampusSync}
                    onChange={(e) => handleFeatureChange('multiCampusSync', e.target.checked)}
                    className="w-5 h-5 text-purple-600 bg-transparent border-2 border-purple-500 rounded focus:ring-purple-500"
                  />
                  <span className="text-white">Multi-Campus Synchronization</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.advancedFeatures.realTimeOptimization}
                    onChange={(e) => handleFeatureChange('realTimeOptimization', e.target.checked)}
                    className="w-5 h-5 text-purple-600 bg-transparent border-2 border-purple-500 rounded focus:ring-purple-500"
                  />
                  <span className="text-white">Real-time Optimization</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.advancedFeatures.predictiveAnalytics}
                    onChange={(e) => handleFeatureChange('predictiveAnalytics', e.target.checked)}
                    className="w-5 h-5 text-purple-600 bg-transparent border-2 border-purple-500 rounded focus:ring-purple-500"
                  />
                  <span className="text-white">Predictive Analytics</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.advancedFeatures.customRules}
                    onChange={(e) => handleFeatureChange('customRules', e.target.checked)}
                    className="w-5 h-5 text-purple-600 bg-transparent border-2 border-purple-500 rounded focus:ring-purple-500"
                  />
                  <span className="text-white">Custom Business Rules</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.advancedFeatures.apiIntegration}
                    onChange={(e) => handleFeatureChange('apiIntegration', e.target.checked)}
                    className="w-5 h-5 text-purple-600 bg-transparent border-2 border-purple-500 rounded focus:ring-purple-500"
                  />
                  <span className="text-white">External API Integration</span>
                </label>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Generate Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerate}
            disabled={isGenerating || !formData.institutionName}
            className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-12 py-4 rounded-lg flex items-center space-x-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
          >
            {isGenerating ? (
              <>
                <div className="spinner" />
                <span>Processing Advanced Constraints...</span>
              </>
            ) : (
              <>
                <Settings className="w-5 h-5" />
                <span>Generate Advanced Timetable</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Advanced Setup Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{formData.campuses}</div>
              <div className="text-gray-300 text-sm">Campuses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{formData.branches}</div>
              <div className="text-gray-300 text-sm">Branches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{Object.values(formData.constraints).filter(Boolean).length}</div>
              <div className="text-gray-300 text-sm">Active Constraints</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{Object.values(formData.advancedFeatures).filter(Boolean).length}</div>
              <div className="text-gray-300 text-sm">Enterprise Features</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Timetable Variant Selector Modal */}
      {showVariantSelector && (
        <TimetableVariantSelector
          variants={variants}
          onClose={() => setShowVariantSelector(false)}
          onRegenerate={handleRegenerateVariants}
          isRegenerating={isRegenerating}
          setupMode="advanced"
        />
      )}
    </div>
  )
}

export default withAuth(AdvancedSetupPage, ['admin'])
