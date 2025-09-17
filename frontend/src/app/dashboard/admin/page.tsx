"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { withAuth, useAuth } from '@/lib/auth'
import {
  Settings,
  Users,
  Calendar,
  BarChart3,
  Plus,
  Play,
  CheckCircle,
  Sparkles,
  FileSpreadsheet,
  Brain,
  Eye,
  Edit,
  Edit3,
  CheckSquare,
  Zap,
  Trash2,
  Download,
  Clock,
  MapPin,
  GraduationCap,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Target,
  Layers,
  Database
} from 'lucide-react'
import { TodoList } from '@/components/todo-list'
import { EventPlanner } from '@/components/event-planner'

import { TimetableVariantSelector } from '@/components/TimetableVariantSelector'

import toast from 'react-hot-toast'
import axios from 'axios'

function AdminDashboard() {
  const router = useRouter()
  const auth = useAuth()
  const [currentView, setCurrentView] = useState('dashboard')
  const [showTodoList, setShowTodoList] = useState(false)
  const [showEventPlanner, setShowEventPlanner] = useState(false)
  const [institutions, setInstitutions] = useState<any[]>([])
  const [timetables, setTimetables] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [variants, setVariants] = useState<any[]>([])
  const [showVariantSelector, setShowVariantSelector] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  // Original 9 Setup Modes
  const setupModes = [
    {
      id: 'quick',
      title: 'Quick Setup',
      description: 'Fast setup for small institutions with basic requirements',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      route: '/dashboard/admin/setup/quick',
      features: ['5-10 minutes', 'Basic configuration', 'Single branch']
    },
    {
      id: 'smart',
      title: 'Smart Setup',
      description: 'AI-powered intelligent setup with recommendations',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      route: '/dashboard/admin/setup/smart',
      features: ['AI recommendations', 'Conflict detection', 'Optimization']
    },
    {
      id: 'batch',
      title: 'Batch Setup',
      description: 'Bulk setup for large institutions with multiple branches',
      icon: Database,
      color: 'from-green-500 to-emerald-500',
      route: '/dashboard/admin/setup/batch',
      features: ['Multi-branch', 'Bulk import', 'Enterprise scale']
    },
    {
      id: 'unified',
      title: 'Unified Setup',
      description: 'Comprehensive setup wizard with all features',
      icon: Layers,
      color: 'from-orange-500 to-red-500',
      route: '/dashboard/admin/setup/unified',
      features: ['All features', 'Step-by-step', 'Complete control']
    },
    {
      id: 'simple',
      title: 'Simple Creator',
      description: 'Visual drag-and-drop timetable builder',
      icon: Edit3,
      color: 'from-indigo-500 to-purple-500',
      route: '/dashboard/admin/setup/simple-creator',
      features: ['Visual builder', 'Drag & drop', 'Real-time preview']
    },
    {
      id: 'excel',
      title: 'Excel Import',
      description: 'Import existing data from Excel spreadsheets',
      icon: FileSpreadsheet,
      color: 'from-teal-500 to-green-500',
      route: '/dashboard/admin/setup/excel',
      features: ['Excel templates', 'Bulk import', 'Data validation']
    },
    {
      id: 'advanced',
      title: 'Advanced Setup',
      description: 'Advanced configuration with custom constraints',
      icon: Settings,
      color: 'from-gray-500 to-slate-500',
      route: '/dashboard/admin/setup/advanced',
      features: ['Custom rules', 'Advanced constraints', 'Expert mode']
    },
    {
      id: 'template',
      title: 'Template Based',
      description: 'Use pre-built templates for common scenarios',
      icon: BookOpen,
      color: 'from-yellow-500 to-orange-500',
      route: '/dashboard/admin/setup/template',
      features: ['Pre-built templates', 'Quick start', 'Best practices']
    },
    {
      id: 'wizard',
      title: 'Setup Wizard',
      description: 'Guided step-by-step setup process',
      icon: Target,
      color: 'from-rose-500 to-pink-500',
      route: '/dashboard/admin/setup/wizard',
      features: ['Guided process', 'Help at each step', 'Beginner friendly']
    }
  ]

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      // Load user data
      const userData = {
        id: 1,
        name: 'Admin User',
        email: 'admin@demo.edu',
        role: 'admin'
      }
      setUser(userData)

      // Load institutions
      const institutionsData = [
        { id: 1, name: 'Demo University', type: 'university', branches: 5 },
        { id: 2, name: 'Tech Institute', type: 'institute', branches: 3 }
      ]
      setInstitutions(institutionsData)

      // Load timetables
      const timetablesData = [
        { id: 1, name: 'Fall 2025 Schedule', status: 'active', institution_id: 1 },
        { id: 2, name: 'Spring 2025 Schedule', status: 'draft', institution_id: 1 }
      ]
      setTimetables(timetablesData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateTimetable = async () => {
    setIsGenerating(true)
    try {
      toast.loading('Generating multiple timetable variants with OR-Tools CP-SAT Solver...')

      // Generate multiple variants
      const response = await axios.post('http://localhost:8000/api/scheduler/generate-variants/', {
        institution_id: 1,
        name: 'Generated Timetable',
        num_variants: 3
      }, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('access_token=')[1]?.split(';')[0]}`
        }
      })

      toast.dismiss()

      if (response.data.success) {
        setVariants(response.data.variants)
        setShowVariantSelector(true)
        toast.success(`Generated ${response.data.successful_count} timetable variants!`)
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
      const response = await axios.post('http://localhost:8000/api/scheduler/generate-variants/', {
        institution_id: 1,
        name: 'Regenerated Timetable',
        num_variants: 3
      }, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('access_token=')[1]?.split(';')[0]}`
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
      const response = await axios.post('http://localhost:8000/api/scheduler/commit-variant/', {
        variant: variant,
        name: `Timetable Variant ${variant.variant_id}`,
        institution_id: 1
      }, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('access_token=')[1]?.split(';')[0]}`
        }
      })

      if (response.data.success) {
        toast.success('Timetable variant committed successfully!')
        setShowVariantSelector(false)
        loadInitialData()

        // Auto-download as PNG
        setTimeout(() => {
          const timetableElement = document.getElementById('timetable-grid')
          if (timetableElement) {
            import('@/lib/exportUtils').then(({ exportTimetableAsPNG }) => {
              exportTimetableAsPNG('timetable-grid', {
                filename: `timetable-variant-${variant.variant_id}`,
                title: `Timetable Variant ${variant.variant_id}`,
                institutionName: 'Demo Institution'
              }).then(() => {
                toast.success('Timetable automatically downloaded as PNG!')
              }).catch(() => {
                toast.error('Failed to auto-download timetable')
              })
            })
          }
        }, 1000)
      } else {
        toast.error('Failed to commit variant')
      }
    } catch (error: any) {
      toast.error('Failed to commit variant: ' + (error.response?.data?.message || error.message))
    }
  }

  const generateSampleSchedule = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science']
    const timeSlots = [
      '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
      '14:00-15:00', '15:00-16:00', '16:00-17:00'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-600 to-emerald-800 flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Show Todo List
  if (showTodoList) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-600 to-emerald-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Todo List</h1>
            <button
              onClick={() => setShowTodoList(false)}
              className="glass-card px-4 py-2 text-white hover:bg-white/10 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
          <TodoList />
        </div>
      </div>
    )
  }

  // Show Event Planner
  if (showEventPlanner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Event Planner</h1>
            <button
              onClick={() => setShowEventPlanner(false)}
              className="glass-card px-4 py-2 text-white hover:bg-white/10 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
          <EventPlanner />
        </div>
      </div>
    )
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
          <div>
            <h1 className="text-5xl font-black text-white mb-3 tracking-tight">Admin Dashboard</h1>
            <p className="text-xl font-medium text-gray-200">AI-Powered Academic Timetable Management System</p>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTodoList(true)}
              className="glass-card px-4 py-2 text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Todo List</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEventPlanner(true)}
              className="glass-card px-4 py-2 text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Event Planner</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/admin/edit-timetable')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Timetable</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-base font-semibold">Institutions</p>
                <p className="text-3xl font-black text-white">{institutions.length}</p>
              </div>
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Settings className="w-7 h-7 text-purple-300" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-base font-semibold">Active Timetables</p>
                <p className="text-3xl font-black text-white">{timetables.filter(t => t.status === 'active').length}</p>
              </div>
              <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-green-300" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-base font-semibold">Total Branches</p>
                <p className="text-3xl font-black text-white">{institutions.reduce((sum, inst) => sum + (inst.branches || 0), 0)}</p>
              </div>
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-blue-300" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-base font-semibold">System Status</p>
                <p className="text-3xl font-black text-green-300">Online</p>
              </div>
              <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-300" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Setup Modes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-white tracking-tight">Setup Modes</h2>
              <p className="text-lg font-medium text-gray-200">Choose your preferred setup method</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {setupModes.map((mode, index) => (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(mode.route)}
                  className="glass-card p-6 hover:bg-white/5 transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${mode.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <mode.icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-3">{mode.title}</h4>
                    <p className="text-base text-gray-200 mb-4 leading-relaxed">{mode.description}</p>
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                      {mode.features.map((feature, fIndex) => (
                        <span key={fIndex} className="text-sm bg-purple-900/60 text-purple-100 px-3 py-1.5 rounded-full font-medium">
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Interactive Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(mode.route)
                      }}
                      className={`w-full bg-gradient-to-r ${mode.color} text-white px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 hover:shadow-lg`}
                    >
                      Start {mode.title}
                    </motion.button>
                  </div>

                  {/* Hover overlay for additional interactivity */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-2xl font-bold text-white mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateTimetable}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="spinner" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span className="font-semibold">Generate Timetable</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTodoList(true)}
                  className="w-full glass-card border border-purple-500/30 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-purple-500/10 transition-colors"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Todo List</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowEventPlanner(true)}
                  className="w-full glass-card border border-green-500/30 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-500/10 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Event Planner</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/dashboard/admin/edit-timetable')}
                  className="w-full glass-card border border-blue-500/30 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-500/10 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Timetable</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/dashboard/admin/analytics')}
                  className="w-full glass-card border border-orange-500/30 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-orange-500/10 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>View Analytics</span>
                </motion.button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-6">
              <h3 className="text-2xl font-bold text-white mb-6">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-base font-medium text-white">Timetable generated</p>
                    <p className="text-sm text-gray-300">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-base font-medium text-white">New branch added</p>
                    <p className="text-sm text-gray-300">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-base font-medium text-white">System backup completed</p>
                    <p className="text-sm text-gray-300">3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Information */}
        <div className="glass-card p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-lg font-bold text-purple-200 mb-4">Setup Guide</h4>
              <div className="text-base text-gray-200 space-y-3 leading-relaxed">
                <p><strong className="text-white">First time?</strong> Start with Quick Setup or Setup Wizard for guided configuration.</p>
                <p><strong className="text-white">Large institution?</strong> Use Batch Setup for comprehensive multi-branch configuration.</p>
                <p><strong className="text-white">Have Excel data?</strong> Use Excel Import option to upload your existing data.</p>
                <p><strong className="text-white">Want AI help?</strong> Try Smart Setup for intelligent recommendations and optimization.</p>
                <p><strong className="text-white">Need visual builder?</strong> Use Simple Creator for drag-and-drop timetable building.</p>
              </div>
            </div>
          </div>
        </div>
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

// Export with auth guard
export default withAuth(AdminDashboard, ['admin'])
