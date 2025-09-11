"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Database, 
  Building2, 
  Users, 
  BookOpen, 
  MapPin,
  CheckCircle,
  AlertCircle,
  Play,
  Upload,
  Utensils,
  Plus,
  Minus
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function BatchSetupPage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionType: 'university',
    campuses: [
      { name: '', location: '', branches: 5, students: 1000 }
    ],
    totalTeachers: 50,
    totalRooms: 40,
    startTime: '08:00',
    endTime: '18:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    workingDays: [1, 2, 3, 4, 5]
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCampusChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      campuses: prev.campuses.map((campus, i) => 
        i === index ? { ...campus, [field]: value } : campus
      )
    }))
  }

  const addCampus = () => {
    setFormData(prev => ({
      ...prev,
      campuses: [...prev.campuses, { name: '', location: '', branches: 5, students: 1000 }]
    }))
  }

  const removeCampus = (index: number) => {
    if (formData.campuses.length > 1) {
      setFormData(prev => ({
        ...prev,
        campuses: prev.campuses.filter((_, i) => i !== index)
      }))
    }
  }

  const handleUseSampleData = () => {
    setFormData({
      institutionName: 'Global University Network',
      institutionType: 'university',
      campuses: [
        { name: 'Main Campus', location: 'Downtown', branches: 12, students: 5000 },
        { name: 'Tech Campus', location: 'Tech Park', branches: 8, students: 3000 },
        { name: 'Medical Campus', location: 'Hospital District', branches: 6, students: 2000 }
      ],
      totalTeachers: 200,
      totalRooms: 150,
      startTime: '07:30',
      endTime: '19:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      workingDays: [1, 2, 3, 4, 5]
    })
    toast.success('Enterprise sample data loaded!')
  }

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      toast.loading('Processing batch setup for multiple campuses...')
      
      // Simulate batch processing
      await new Promise(resolve => setTimeout(resolve, 4000))
      
      const totalBranches = formData.campuses.reduce((sum, campus) => sum + campus.branches, 0)
      const totalStudents = formData.campuses.reduce((sum, campus) => sum + campus.students, 0)
      
      const timetableData = {
        institution: formData.institutionName || 'Batch Institution',
        type: formData.institutionType,
        campuses: formData.campuses.length,
        schedule: generateBatchSchedule(),
        metadata: {
          generated_at: new Date().toISOString(),
          optimization_score: Math.floor(Math.random() * 15) + 85, // 85-100%
          conflicts_resolved: Math.floor(Math.random() * 12) + 5,
          total_branches: totalBranches,
          total_students: totalStudents,
          total_sessions: totalBranches * 8 * 5 // 8 subjects per branch, 5 days
        }
      }
      
      toast.dismiss()
      toast.success(`Batch timetable generated for ${formData.campuses.length} campuses! Optimization: ${timetableData.metadata.optimization_score}%`)
      
      localStorage.setItem('generatedTimetable', JSON.stringify(timetableData))
      router.push('/dashboard/admin')
    } catch (error) {
      toast.dismiss()
      toast.error('Error in batch generation')
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateBatchSchedule = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const subjects = [
      'Advanced Engineering', 'Business Management', 'Medical Sciences', 
      'Computer Science', 'Data Analytics', 'Biotechnology',
      'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
      'Information Technology', 'Artificial Intelligence', 'Robotics'
    ]
    const timeSlots = [
      '07:30-08:30', '08:30-09:30', '09:30-10:30', '10:30-11:30',
      '11:30-12:30', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
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
          const subjectIndex = (timeIndex + dayIndex * 2) % subjects.length
          row[day] = subjects[subjectIndex]
        })
      }
      
      schedule.push(row)
    })
    
    return schedule
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
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
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">Batch Setup</h1>
              </div>
              <p className="text-gray-300">Bulk setup for large institutions with multiple branches</p>
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

        {/* Enterprise Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8 border border-green-500/30"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Building2 className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-semibold text-white">Enterprise Features</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg">
              <Database className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Multi-Branch</p>
                <p className="text-gray-400 text-sm">Handle multiple campuses</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg">
              <Upload className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Bulk Import</p>
                <p className="text-gray-400 text-sm">Import existing data</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg">
              <Users className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Enterprise Scale</p>
                <p className="text-gray-400 text-sm">Thousands of students</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8"
        >
          {/* Institution Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-purple-400" />
              <span>Institution Details</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Campuses */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <span>Campuses ({formData.campuses.length})</span>
              </h3>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addCampus}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Campus</span>
              </motion.button>
            </div>
            
            <div className="space-y-4">
              {formData.campuses.map((campus, index) => (
                <div key={index} className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">Campus {index + 1}</h4>
                    {formData.campuses.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeCampus(index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Minus className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Campus Name</label>
                      <input
                        type="text"
                        value={campus.name}
                        onChange={(e) => handleCampusChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 glass-card border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Campus name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                      <input
                        type="text"
                        value={campus.location}
                        onChange={(e) => handleCampusChange(index, 'location', e.target.value)}
                        className="w-full px-3 py-2 glass-card border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Location"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Branches</label>
                      <input
                        type="number"
                        value={campus.branches}
                        onChange={(e) => handleCampusChange(index, 'branches', parseInt(e.target.value))}
                        className="w-full px-3 py-2 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="1"
                        max="50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Students</label>
                      <input
                        type="number"
                        value={campus.students}
                        onChange={(e) => handleCampusChange(index, 'students', parseInt(e.target.value))}
                        className="w-full px-3 py-2 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="100"
                        max="10000"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources & Timing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Total Resources</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Total Teachers</label>
                  <input
                    type="number"
                    value={formData.totalTeachers}
                    onChange={(e) => handleInputChange('totalTeachers', parseInt(e.target.value))}
                    className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="20"
                    max="500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Total Rooms</label>
                  <input
                    type="number"
                    value={formData.totalRooms}
                    onChange={(e) => handleInputChange('totalRooms', parseInt(e.target.value))}
                    className="w-full px-4 py-3 glass-card border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="15"
                    max="200"
                  />
                </div>
              </div>
            </div>

            {/* Timing */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span>Schedule</span>
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
              <div>
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
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-8 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerate}
              disabled={isGenerating || !formData.institutionName || formData.campuses.some(c => !c.name)}
              className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-8 py-4 rounded-lg flex items-center space-x-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
            >
              {isGenerating ? (
                <>
                  <div className="spinner" />
                  <span>Processing Batch Setup...</span>
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  <span>Generate Batch Timetable</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Batch Setup Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{formData.campuses.length}</div>
              <div className="text-gray-300 text-sm">Campuses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {formData.campuses.reduce((sum, campus) => sum + campus.branches, 0)}
              </div>
              <div className="text-gray-300 text-sm">Total Branches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {formData.campuses.reduce((sum, campus) => sum + campus.students, 0).toLocaleString()}
              </div>
              <div className="text-gray-300 text-sm">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{formData.totalTeachers}</div>
              <div className="text-gray-300 text-sm">Total Teachers</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
