"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Edit3,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  Database,
  Utensils,
  Clock,
  Eye
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { TimetableVariantSelector } from '@/components/TimetableVariantSelector'
import { withAuth } from '@/lib/auth'
import { generateTimetableVariants } from '@/lib/apiUtils'

function SimpleCreatorPage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [variants, setVariants] = useState<any[]>([])
  const [showVariantSelector, setShowVariantSelector] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [formData, setFormData] = useState({
    institutionName: '',
    startTime: '09:00',
    endTime: '16:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'],
    timeSlots: [
      '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
      '13:00-14:00', '14:00-15:00', '15:00-16:00'
    ]
  })

  const [timetable, setTimetable] = useState<any[]>([])
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUseSampleData = () => {
    setFormData({
      institutionName: 'Creative Learning Center',
      startTime: '08:30',
      endTime: '15:30',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Art'],
      timeSlots: [
        '08:30-09:30', '09:30-10:30', '10:30-11:30', '11:30-12:30',
        '13:00-14:00', '14:00-15:00', '15:00-16:00'
      ]
    })
    
    // Generate initial timetable
    const initialTimetable = formData.timeSlots.map((time, timeIndex) => {
      const row: any = { Time: time }
      
      if (time.includes('12:00') || time.includes('13:00')) {
        days.forEach(day => {
          row[day] = 'LUNCH BREAK'
        })
      } else {
        days.forEach((day, dayIndex) => {
          const subjectIndex = (timeIndex + dayIndex) % formData.subjects.length
          row[day] = formData.subjects[subjectIndex]
        })
      }
      
      return row
    })
    
    setTimetable(initialTimetable)
    toast.success('Sample data loaded with visual timetable!')
  }

  const addSubject = () => {
    const newSubject = `Subject ${formData.subjects.length + 1}`
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, newSubject]
    }))
  }

  const removeSubject = (index: number) => {
    if (formData.subjects.length > 1) {
      setFormData(prev => ({
        ...prev,
        subjects: prev.subjects.filter((_, i) => i !== index)
      }))
    }
  }

  const updateSubject = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map((subject, i) => i === index ? value : subject)
    }))
  }

  const updateTimetableCell = (timeIndex: number, day: string, value: string) => {
    setTimetable(prev => 
      prev.map((row, i) => 
        i === timeIndex ? { ...row, [day]: value } : row
      )
    )
  }

  const generateTimetable = async () => {
    setIsGenerating(true)
    try {
      toast.loading('Generating simple timetable variants with OR-Tools...')

      const response = await generateTimetableVariants('simple_creator', {
        institution_id: 1,
        name: `Simple Creator - ${formData.institutionName || 'Untitled'}`,
        semester: 1,
        num_variants: 3,
        parameters: {
          setup_mode: 'simple_creator',
          ...formData
        }
      })

      if (response.data.variants && response.data.variants.length > 0) {
        setVariants(response.data.variants)
        setShowVariantSelector(true)
        toast.dismiss()
        toast.success(`Generated ${response.data.variants.length} timetable variants!`)
      } else {
        toast.error('No valid timetable variants could be generated')
      }
    } catch (error: any) {
      console.error('Timetable generation error:', error)
      toast.error(error.response?.data?.error || 'Failed to generate timetable')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectVariant = async (variant: any) => {
    try {
      toast.loading('Committing selected timetable variant...')

      const token = document.cookie.split('access_token=')[1]?.split(';')[0]
      const response = await axios.post('http://localhost:8000/api/scheduler/commit-variant/', {
        variant: variant,
        name: `Simple Creator - Variant ${variant.variant_id}`,
        institution_id: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        toast.dismiss()
        toast.success('Timetable variant committed successfully!')

        // Auto-download as PNG
        if (response.data.download_url) {
          const link = document.createElement('a')
          link.href = response.data.download_url
          link.download = `simple_creator_timetable_${new Date().toISOString().split('T')[0]}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }

        setShowVariantSelector(false)
        router.push('/dashboard/admin')
      }
    } catch (error: any) {
      console.error('Commit variant error:', error)
      toast.error(error.response?.data?.error || 'Failed to commit timetable variant')
    }
  }

  const handleRegenerateVariants = async () => {
    setIsRegenerating(true)
    try {
      toast.loading('Regenerating timetable variants...')

      const response = await generateTimetableVariants('simple_creator', { ...formData, regenerate: true })

      if (response.data.variants && response.data.variants.length > 0) {
        setVariants(response.data.variants)
        toast.dismiss()
        toast.success(`Regenerated ${response.data.variants.length} new variants!`)
      }
    } catch (error: any) {
      console.error('Regenerate variants error:', error)
      toast.error(error.response?.data?.error || 'Failed to regenerate variants')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsGenerating(true)
      toast.loading('Saving timetable...')
      
      const timetableData = {
        institution: formData.institutionName || 'Simple Creator Institution',
        type: 'simple_creator',
        schedule: timetable,
        metadata: {
          generated_at: new Date().toISOString(),
          creation_method: 'simple_creator',
          total_subjects: formData.subjects.length,
          total_sessions: timetable.length * days.length
        }
      }
      
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.dismiss()
      toast.success('Timetable saved successfully!')
      
      localStorage.setItem('generatedTimetable', JSON.stringify(timetableData))
      router.push('/dashboard/admin')
    } catch (error) {
      toast.dismiss()
      toast.error('Error saving timetable')
      console.error('Save error:', error)
    } finally {
      setIsGenerating(false)
    }
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
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Edit3 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">Simple Creator</h1>
              </div>
              <p className="text-gray-300">Visual drag-and-drop timetable builder</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUseSampleData}
              className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Database className="w-4 h-4" />
              <span>Use Sample Data</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Open sample timetable in new tab
                window.open('/demo-interactive', '_blank');
                toast.success('Opening sample timetable in new tab');
              }}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Show Sample Timetable</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateTimetable}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Generate</span>
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Configuration Panel */}
          <div className="xl:col-span-1 space-y-6">
            {/* Basic Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Basic Settings</h3>
              
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
            </motion.div>

            {/* Lunch Break */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Utensils className="w-5 h-5 text-purple-400" />
                <span>Lunch Break (Mandatory)</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start</label>
                  <input
                    type="time"
                    value={formData.lunchStart}
                    onChange={(e) => handleInputChange('lunchStart', e.target.value)}
                    className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End</label>
                  <input
                    type="time"
                    value={formData.lunchEnd}
                    onChange={(e) => handleInputChange('lunchEnd', e.target.value)}
                    className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Subjects */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Subjects</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addSubject}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {formData.subjects.map((subject, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => updateSubject(index, e.target.value)}
                      className="flex-1 px-3 py-2 glass-card border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    {formData.subjects.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeSubject(index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Timetable Grid */}
          <div className="xl:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Visual Timetable Editor</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={isGenerating || !formData.institutionName || timetable.length === 0}
                  className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="spinner" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Timetable</span>
                    </>
                  )}
                </motion.button>
              </div>

              {timetable.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-purple-500/30 bg-purple-900/30 text-white p-3 text-left">
                          <Clock className="w-4 h-4 inline mr-2" />
                          Time
                        </th>
                        {days.map(day => (
                          <th key={day} className="border border-purple-500/30 bg-purple-900/30 text-white p-3 text-center">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timetable.map((row, timeIndex) => (
                        <tr key={timeIndex}>
                          <td className="border border-purple-500/30 bg-purple-900/20 text-white p-3 font-medium">
                            {row.Time}
                          </td>
                          {days.map(day => (
                            <td key={day} className="border border-purple-500/30 p-1">
                              {row[day] === 'LUNCH BREAK' ? (
                                <div className="bg-orange-500/20 text-orange-200 p-2 rounded text-center font-medium">
                                  🍽️ LUNCH BREAK
                                </div>
                              ) : (
                                <select
                                  value={row[day] || ''}
                                  onChange={(e) => updateTimetableCell(timeIndex, day, e.target.value)}
                                  className="w-full p-2 glass-card border border-purple-500/30 rounded text-white bg-purple-900/20 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                >
                                  <option value="">Select Subject</option>
                                  {formData.subjects.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                  ))}
                                </select>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Edit3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">No Timetable Created</h4>
                  <p className="text-gray-400 mb-6">Click "Generate" or "Use Sample Data" to create your timetable</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Simple Creator Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Visual drag-and-drop interface</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Real-time editing</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Instant preview</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Timetable Variant Selector Modal */}
      <TimetableVariantSelector
        variants={variants}
        isOpen={showVariantSelector}
        onClose={() => setShowVariantSelector(false)}
        onSelectVariant={handleSelectVariant}
        onRegenerateVariants={handleRegenerateVariants}
        isRegenerating={isRegenerating}
      />
    </div>
  )
}

export default withAuth(SimpleCreatorPage, ['admin'])
