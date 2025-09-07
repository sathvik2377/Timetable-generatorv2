'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  MapPin, 
  GraduationCap,
  Sparkles,
  Brain,
  Play,
  RefreshCw,
  Download,
  Eye,
  Settings,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb,
  Target,
  TrendingUp
} from 'lucide-react'
import { generateOptimizedTimetable } from '@/lib/timetableOptimizer'
import { toast } from 'react-hot-toast'

interface DemoData {
  branches: Array<{
    name: string
    code: string
    totalStudents: number
    sections: number
    yearLevel: number
  }>
  teachers: Array<{
    name: string
    employeeId: string
    email: string
    department: string
    subjects: string[]
    maxHoursPerDay: number
  }>
  subjects: Array<{
    name: string
    code: string
    type: 'theory' | 'practical' | 'tutorial'
    credits: number
    contactHours: number
    branch: string
    semester: number
  }>
  rooms: Array<{
    name: string
    type: 'classroom' | 'lab' | 'auditorium'
    capacity: number
    equipment: string[]
    branch?: string
  }>
  preferences: {
    startTime: string
    endTime: string
    lunchBreak: string
    workingDays: string[]
    periodDuration: number
  }
}

export default function DemoInteractivePage() {
  const [selectedBranch, setSelectedBranch] = useState<string>('all')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTimetable, setGeneratedTimetable] = useState<any>(null)
  const [optimizationScore, setOptimizationScore] = useState(0)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  // Indian demo data with proper names and context
  const demoData: DemoData = {
    branches: [
      { name: 'Computer Science Engineering', code: 'CSE', totalStudents: 120, sections: 2, yearLevel: 3 },
      { name: 'Electronics & Communication', code: 'ECE', totalStudents: 100, sections: 2, yearLevel: 3 },
      { name: 'Mechanical Engineering', code: 'ME', totalStudents: 80, sections: 2, yearLevel: 3 },
      { name: 'Civil Engineering', code: 'CE', totalStudents: 60, sections: 1, yearLevel: 3 }
    ],
    teachers: [
      { name: 'Dr. Rajesh Kumar', employeeId: 'EMP001', email: 'rajesh.kumar@institute.edu.in', department: 'CSE', subjects: ['Data Structures', 'Algorithms'], maxHoursPerDay: 6 },
      { name: 'Prof. Priya Sharma', employeeId: 'EMP002', email: 'priya.sharma@institute.edu.in', department: 'CSE', subjects: ['Database Systems', 'Web Development'], maxHoursPerDay: 6 },
      { name: 'Dr. Amit Singh', employeeId: 'EMP003', email: 'amit.singh@institute.edu.in', department: 'ECE', subjects: ['Digital Electronics', 'Microprocessors'], maxHoursPerDay: 6 },
      { name: 'Prof. Sunita Gupta', employeeId: 'EMP004', email: 'sunita.gupta@institute.edu.in', department: 'ECE', subjects: ['Communication Systems', 'Signal Processing'], maxHoursPerDay: 6 },
      { name: 'Dr. Vikram Patel', employeeId: 'EMP005', email: 'vikram.patel@institute.edu.in', department: 'ME', subjects: ['Thermodynamics', 'Fluid Mechanics'], maxHoursPerDay: 6 },
      { name: 'Prof. Meera Joshi', employeeId: 'EMP006', email: 'meera.joshi@institute.edu.in', department: 'CE', subjects: ['Structural Analysis', 'Construction Management'], maxHoursPerDay: 6 }
    ],
    subjects: [
      { name: 'Data Structures', code: 'CS301', type: 'theory', credits: 4, contactHours: 4, branch: 'CSE', semester: 5 },
      { name: 'Database Systems', code: 'CS302', type: 'theory', credits: 3, contactHours: 3, branch: 'CSE', semester: 5 },
      { name: 'Programming Lab', code: 'CS303', type: 'practical', credits: 2, contactHours: 3, branch: 'CSE', semester: 5 },
      { name: 'Digital Electronics', code: 'EC301', type: 'theory', credits: 4, contactHours: 4, branch: 'ECE', semester: 5 },
      { name: 'Microprocessors', code: 'EC302', type: 'theory', credits: 3, contactHours: 3, branch: 'ECE', semester: 5 },
      { name: 'Electronics Lab', code: 'EC303', type: 'practical', credits: 2, contactHours: 3, branch: 'ECE', semester: 5 },
      { name: 'Thermodynamics', code: 'ME301', type: 'theory', credits: 4, contactHours: 4, branch: 'ME', semester: 5 },
      { name: 'Fluid Mechanics', code: 'ME302', type: 'theory', credits: 3, contactHours: 3, branch: 'ME', semester: 5 },
      { name: 'Structural Analysis', code: 'CE301', type: 'theory', credits: 4, contactHours: 4, branch: 'CE', semester: 5 },
      { name: 'Construction Management', code: 'CE302', type: 'theory', credits: 3, contactHours: 3, branch: 'CE', semester: 5 }
    ],
    rooms: [
      { name: 'CSE-Room-101', type: 'classroom', capacity: 60, equipment: ['Projector', 'Whiteboard'], branch: 'CSE' },
      { name: 'CSE-Lab-201', type: 'lab', capacity: 30, equipment: ['Computers', 'Projector'], branch: 'CSE' },
      { name: 'ECE-Room-102', type: 'classroom', capacity: 50, equipment: ['Projector', 'Whiteboard'], branch: 'ECE' },
      { name: 'ECE-Lab-202', type: 'lab', capacity: 25, equipment: ['Electronics Kit', 'Oscilloscope'], branch: 'ECE' },
      { name: 'ME-Room-103', type: 'classroom', capacity: 40, equipment: ['Projector', 'Whiteboard'], branch: 'ME' },
      { name: 'CE-Room-104', type: 'classroom', capacity: 30, equipment: ['Projector', 'Whiteboard'], branch: 'CE' },
      { name: 'Main-Auditorium', type: 'auditorium', capacity: 200, equipment: ['Sound System', 'Projector'] }
    ],
    preferences: {
      startTime: '09:00',
      endTime: '16:00',
      lunchBreak: '13:00-14:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      periodDuration: 60
    }
  }

  const generateDemoTimetable = async () => {
    setIsGenerating(true)
    try {
      // Filter data based on selected branch
      let filteredData = demoData
      if (selectedBranch !== 'all') {
        filteredData = {
          ...demoData,
          branches: demoData.branches.filter(b => b.code === selectedBranch),
          teachers: demoData.teachers.filter(t => t.department === selectedBranch),
          subjects: demoData.subjects.filter(s => s.branch === selectedBranch),
          rooms: demoData.rooms.filter(r => r.branch === selectedBranch || !r.branch)
        }
      }

      const result = generateOptimizedTimetable(filteredData)
      setGeneratedTimetable(result)
      setOptimizationScore(result.optimizationScore)
      toast.success(`Timetable generated successfully! Optimization Score: ${result.optimizationScore}%`)
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate timetable. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const resetDemo = () => {
    setGeneratedTimetable(null)
    setOptimizationScore(0)
    setSelectedBranch('all')
    toast.success('Demo reset successfully!')
  }

  const exportTimetable = (format: string) => {
    if (!generatedTimetable) {
      toast.error('No timetable to export!')
      return
    }
    toast.success(`Exporting timetable as ${format.toUpperCase()}...`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-blue-400 mr-3" />
              <h1 className="text-3xl font-bold text-white">Interactive Timetable Demo</h1>
              <Brain className="w-8 h-8 text-purple-400 ml-3" />
            </div>
            <p className="text-gray-300 text-lg">
              Experience AI-powered timetable generation with real Indian academic data
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Demo Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Branch Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center mb-4">
              <GraduationCap className="w-6 h-6 text-blue-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Select Branch</h3>
            </div>
            
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Branches</option>
              {demoData.branches.map((branch) => (
                <option key={branch.code} value={branch.code}>
                  {branch.name} ({branch.code})
                </option>
              ))}
            </select>

            <div className="mt-4 text-sm text-gray-300">
              {selectedBranch === 'all' 
                ? `${demoData.branches.length} branches, ${demoData.subjects.length} subjects`
                : `${demoData.subjects.filter(s => s.branch === selectedBranch).length} subjects for ${selectedBranch}`
              }
            </div>
          </motion.div>

          {/* Generation Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center mb-4">
              <Brain className="w-6 h-6 text-purple-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">AI Generation</h3>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={generateDemoTimetable}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Generate Timetable</span>
                  </>
                )}
              </button>

              <button
                onClick={resetDemo}
                className="w-full bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Reset Demo</span>
              </button>
            </div>
          </motion.div>

          {/* Optimization Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center mb-4">
              <Target className="w-6 h-6 text-green-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Optimization</h3>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {optimizationScore}%
              </div>
              <div className="text-sm text-gray-300 mb-4">Current Score</div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    optimizationScore >= 80 ? 'bg-green-500' :
                    optimizationScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${optimizationScore}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Generated Timetable Display */}
        {generatedTimetable && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Calendar className="w-6 h-6 text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Generated Timetable</h3>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportTimetable('pdf')}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                
                <button
                  onClick={() => exportTimetable('excel')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Excel</span>
                </button>
              </div>
            </div>

            {/* Timetable Grid */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="border border-gray-600 px-4 py-3 text-white font-semibold">Time</th>
                    <th className="border border-gray-600 px-4 py-3 text-white font-semibold">Monday</th>
                    <th className="border border-gray-600 px-4 py-3 text-white font-semibold">Tuesday</th>
                    <th className="border border-gray-600 px-4 py-3 text-white font-semibold">Wednesday</th>
                    <th className="border border-gray-600 px-4 py-3 text-white font-semibold">Thursday</th>
                    <th className="border border-gray-600 px-4 py-3 text-white font-semibold">Friday</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Sample timetable rows */}
                  <tr>
                    <td className="border border-gray-600 px-4 py-3 text-white font-medium bg-gray-700">09:00-10:00</td>
                    <td className="border border-gray-600 px-4 py-3 bg-blue-900 text-blue-100">Data Structures<br/><small>Dr. Rajesh Kumar</small></td>
                    <td className="border border-gray-600 px-4 py-3 bg-green-900 text-green-100">Database Systems<br/><small>Prof. Priya Sharma</small></td>
                    <td className="border border-gray-600 px-4 py-3 bg-purple-900 text-purple-100">Digital Electronics<br/><small>Dr. Amit Singh</small></td>
                    <td className="border border-gray-600 px-4 py-3 bg-orange-900 text-orange-100">Thermodynamics<br/><small>Dr. Vikram Patel</small></td>
                    <td className="border border-gray-600 px-4 py-3 bg-red-900 text-red-100">Structural Analysis<br/><small>Prof. Meera Joshi</small></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-600 px-4 py-3 text-white font-medium bg-gray-700">10:00-11:00</td>
                    <td className="border border-gray-600 px-4 py-3 bg-green-900 text-green-100">Database Systems<br/><small>Prof. Priya Sharma</small></td>
                    <td className="border border-gray-600 px-4 py-3 bg-blue-900 text-blue-100">Data Structures<br/><small>Dr. Rajesh Kumar</small></td>
                    <td className="border border-gray-600 px-4 py-3 bg-orange-900 text-orange-100">Microprocessors<br/><small>Prof. Sunita Gupta</small></td>
                    <td className="border border-gray-600 px-4 py-3 bg-purple-900 text-purple-100">Fluid Mechanics<br/><small>Dr. Vikram Patel</small></td>
                    <td className="border border-gray-600 px-4 py-3 bg-red-900 text-red-100">Construction Mgmt<br/><small>Prof. Meera Joshi</small></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-600 px-4 py-3 text-white font-medium bg-gray-700">13:00-14:00</td>
                    <td colSpan={5} className="border border-gray-600 px-4 py-3 text-center bg-yellow-900 text-yellow-100 font-semibold">
                      🍽️ LUNCH BREAK
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Demo Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-blue-400 mr-3" />
              <h4 className="font-semibold text-white">Teachers</h4>
            </div>
            <div className="text-2xl font-bold text-blue-400 mb-2">{demoData.teachers.length}</div>
            <div className="text-sm text-gray-300">Qualified Faculty</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <div className="flex items-center mb-4">
              <BookOpen className="w-6 h-6 text-green-400 mr-3" />
              <h4 className="font-semibold text-white">Subjects</h4>
            </div>
            <div className="text-2xl font-bold text-green-400 mb-2">{demoData.subjects.length}</div>
            <div className="text-sm text-gray-300">Academic Courses</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <div className="flex items-center mb-4">
              <MapPin className="w-6 h-6 text-purple-400 mr-3" />
              <h4 className="font-semibold text-white">Facilities</h4>
            </div>
            <div className="text-2xl font-bold text-purple-400 mb-2">{demoData.rooms.length}</div>
            <div className="text-sm text-gray-300">Rooms & Labs</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6"
          >
            <div className="flex items-center mb-4">
              <GraduationCap className="w-6 h-6 text-orange-400 mr-3" />
              <h4 className="font-semibold text-white">Branches</h4>
            </div>
            <div className="text-2xl font-bold text-orange-400 mb-2">{demoData.branches.length}</div>
            <div className="text-sm text-gray-300">Engineering Depts</div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
