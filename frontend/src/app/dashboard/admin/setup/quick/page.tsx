"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Zap, 
  Clock, 
  Users, 
  BookOpen, 
  MapPin,
  CheckCircle,
  AlertCircle,
  Play,
  Database,
  Utensils
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { apiClient } from '@/lib/api'
import { generateTimetableVariants, commitTimetableVariant } from '@/lib/apiUtils'
import { TimetableVariantSelector } from '@/components/TimetableVariantSelector'
import SetupLayout from '@/components/SetupLayout'

export default function QuickSetupPage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [variants, setVariants] = useState<any[]>([])
  const [showVariantSelector, setShowVariantSelector] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionType: 'school',
    branches: 1,
    subjects: 6,
    teachers: 10,
    rooms: 8,
    startTime: '09:00',
    endTime: '16:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    workingDays: [1, 2, 3, 4, 5] // Monday to Friday
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUseSampleData = () => {
    setFormData({
      institutionName: 'Demo High School',
      institutionType: 'school',
      branches: 3,
      subjects: 8,
      teachers: 15,
      rooms: 12,
      startTime: '08:30',
      endTime: '15:30',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      workingDays: [1, 2, 3, 4, 5]
    })
    toast.success('Sample data loaded successfully!')
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      toast.loading('Generating multiple timetable variants with OR-Tools CP-SAT Solver...')

      // First create/update institution with form data
      const institutionData = {
        name: formData.institutionName || 'Demo Institution',
        type: formData.institutionType,
        start_time: formData.startTime,
        end_time: formData.endTime,
        lunch_break_start: formData.lunchStart,
        lunch_break_end: formData.lunchEnd,
        working_days: formData.workingDays,
        slot_duration: 60 // 1 hour slots
      }

      // Generate multiple variants
      const response = await generateTimetableVariants('quick', {
        institution_id: 1,
        name: `Quick Setup - ${formData.institutionName}`,
        semester: 1,
        num_variants: 3,
        parameters: {
          setup_mode: 'quick',
          ...formData
        }
      })

      toast.dismiss()

      if (response.data.success) {
        setVariants(response.data.variants)
        setShowVariantSelector(true)
        toast.success(`Generated ${response.data.successful_count} timetable variants using Quick Setup!`)
      } else {
        toast.error('Failed to generate timetable variants')
      }
    } catch (error: any) {
      toast.dismiss()
      console.error('Generation error:', error)
      toast.error('Failed to generate timetable: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerateVariants = async () => {
    setIsRegenerating(true)
    try {
      const response = await generateTimetableVariants('quick', {
        institution_id: 1,
        name: `Quick Setup Regenerated - ${formData.institutionName}`,
        semester: 1,
        num_variants: 3,
        parameters: {
          setup_mode: 'quick',
          regenerate: true,
          ...formData
        }
      })

      if (response.data.success) {
        setVariants(response.data.variants)
        toast.success(`Regenerated ${response.data.successful_count} new variants!`)
      } else {
        toast.error('Failed to regenerate variants')
      }
    } catch (error: any) {
      toast.error('Failed to regenerate variants: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleSelectVariant = async (variant: any) => {
    try {
      const response = await commitTimetableVariant(variant.variant_id, 'quick')

      if (response.data.success) {
        toast.success('Timetable variant committed successfully!')
        setShowVariantSelector(false)

        // Auto-download as PNG
        setTimeout(() => {
          import('@/lib/exportUtils').then(({ exportTimetableAsPNG }) => {
            // Create a temporary timetable element for export
            const tempDiv = document.createElement('div')
            tempDiv.id = 'temp-timetable-export'
            tempDiv.innerHTML = `
              <div style="padding: 20px; background: white; color: black;">
                <h2>Quick Setup Timetable - Variant ${variant.variant_id}</h2>
                <p>Institution: ${formData.institutionName}</p>
                <p>Quality Score: ${variant.metrics.quality_score}%</p>
                <p>Total Sessions: ${variant.metrics.total_sessions}</p>
                <p>Generated: ${new Date().toLocaleString()}</p>
              </div>
            `
            document.body.appendChild(tempDiv)

            exportTimetableAsPNG('temp-timetable-export', {
              filename: `quick-setup-timetable-variant-${variant.variant_id}`,
              title: `Quick Setup Timetable - Variant ${variant.variant_id}`,
              institutionName: formData.institutionName
            }).then(() => {
              toast.success('Timetable automatically downloaded as PNG!')
              document.body.removeChild(tempDiv)
            }).catch(() => {
              toast.error('Failed to auto-download timetable')
              document.body.removeChild(tempDiv)
            })
          })
        }, 1000)

        router.push('/dashboard/admin')
      } else {
        toast.error('Failed to commit variant')
      }
    } catch (error: any) {
      toast.error('Failed to commit variant: ' + (error.response?.data?.message || error.message))
    }
  }

  const generateRealisticSchedule = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science']
    const timeSlots = [
      '08:30-09:30', '09:30-10:30', '10:30-11:30', '11:30-12:30',
      '13:00-14:00', '14:00-15:00', '15:00-16:00'
    ]
    
    const schedule = []
    
    timeSlots.forEach((time, timeIndex) => {
      const row: any = { Time: time }
      
      if (time.includes('12:30') || time.includes('13:00')) {
        // Lunch break
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

  return (
    <SetupLayout
      title="Quick Setup"
      description="Fast setup for small institutions with basic requirements"
      icon={<Zap className="w-6 h-6 text-white" />}
      headerActions={
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUseSampleData}
          className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Database className="w-4 h-4" />
          <span>Use Sample Data</span>
        </motion.button>
      }
    >

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Institution Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                <span>Institution Details</span>
              </h3>
              
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
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Resources</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Branches</label>
                  <input
                    type="number"
                    value={formData.branches}
                    onChange={(e) => handleInputChange('branches', parseInt(e.target.value))}
                    className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subjects</label>
                  <input
                    type="number"
                    value={formData.subjects}
                    onChange={(e) => handleInputChange('subjects', parseInt(e.target.value))}
                    className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="3"
                    max="15"
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
                    max="50"
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
                    max="30"
                  />
                </div>
              </div>
            </div>

            {/* Timing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span>Timing</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Lunch Break */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Utensils className="w-5 h-5 text-purple-400" />
                <span>Lunch Break (Mandatory)</span>
              </h3>
              
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
              
              <div className="flex items-start space-x-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-200">
                  <p className="font-medium">Lunch break is mandatory</p>
                  <p>All students and teachers must have a lunch break during the specified time.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-8 flex justify-center">
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
                  <span>Generating Timetable...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Generate Timetable</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Setup Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">5-10 minute setup</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Basic configuration</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Single branch support</span>
            </div>
          </div>
        </motion.div>

      {/* Timetable Variant Selector Modal */}
      <TimetableVariantSelector
        variants={variants}
        isOpen={showVariantSelector}
        onClose={() => setShowVariantSelector(false)}
        onSelectVariant={handleSelectVariant}
        onRegenerateVariants={handleRegenerateVariants}
        isRegenerating={isRegenerating}
      />
    </SetupLayout>
  )
}
