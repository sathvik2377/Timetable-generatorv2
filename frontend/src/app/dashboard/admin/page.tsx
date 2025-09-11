"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
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
import ExportDropdown from '@/components/ExportDropdown'
import { apiClient } from '@/lib/api'
import { User, Institution, Timetable } from '@/types'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState('dashboard')
  const [showTodoList, setShowTodoList] = useState(false)
  const [showEventPlanner, setShowEventPlanner] = useState(false)
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [timetables, setTimetables] = useState<Timetable[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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
        { id: 1, name: 'Fall 2024 Schedule', status: 'active', institution_id: 1 },
        { id: 2, name: 'Spring 2024 Schedule', status: 'draft', institution_id: 1 }
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
    try {
      setIsGenerating(true)
      toast.loading('Generating timetable with OR-Tools CP-SAT Solver...')
      
      const response = await apiClient.generateTimetable({
        institution_id: institutions[0]?.id || 1,
        academic_year: '2024-25',
        semester: 1
      })
      
      toast.dismiss()
      if (response.success) {
        toast.success(`Timetable generated successfully! Optimization score: ${response.optimization_score}%`)
        loadInitialData() // Reload data
      } else {
        toast.error('Failed to generate timetable')
      }
    } catch (error) {
      toast.dismiss()
      toast.error('Error generating timetable')
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
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
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-300">AI-Powered Academic Timetable Management System</p>
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

            <ExportDropdown />
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
                <p className="text-gray-400 text-sm">Institutions</p>
                <p className="text-2xl font-bold text-white">{institutions.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-400" />
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
                <p className="text-gray-400 text-sm">Active Timetables</p>
                <p className="text-2xl font-bold text-white">{timetables.filter(t => t.status === 'active').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-400" />
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
                <p className="text-gray-400 text-sm">Total Branches</p>
                <p className="text-2xl font-bold text-white">{institutions.reduce((sum, inst) => sum + (inst.branches || 0), 0)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-blue-400" />
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
                <p className="text-gray-400 text-sm">System Status</p>
                <p className="text-2xl font-bold text-green-400">Online</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Setup Modes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Setup Modes</h2>
              <p className="text-gray-400">Choose your preferred setup method</p>
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
                  className="glass-card p-6 cursor-pointer hover:bg-white/5 transition-all duration-300 group"
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${mode.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <mode.icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">{mode.title}</h4>
                    <p className="text-sm text-gray-400 mb-4">{mode.description}</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {mode.features.map((feature, fIndex) => (
                        <span key={fIndex} className="text-xs bg-purple-900/50 text-purple-200 px-2 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
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
                      <span>Generate Timetable</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/dashboard/admin/analytics')}
                  className="w-full glass-card border border-purple-500/30 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-purple-500/10 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>View Analytics</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/dashboard/admin/settings')}
                  className="w-full glass-card border border-gray-500/30 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-500/10 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </motion.button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Timetable generated</p>
                    <p className="text-xs text-gray-400">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">New branch added</p>
                    <p className="text-xs text-gray-400">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">System backup completed</p>
                    <p className="text-xs text-gray-400">3 hours ago</p>
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
              <h4 className="font-medium text-purple-300 mb-2">Setup Guide</h4>
              <div className="text-sm text-gray-300 space-y-2">
                <p><strong>First time?</strong> Start with Quick Setup or Setup Wizard for guided configuration.</p>
                <p><strong>Large institution?</strong> Use Batch Setup for comprehensive multi-branch configuration.</p>
                <p><strong>Have Excel data?</strong> Use Excel Import option to upload your existing data.</p>
                <p><strong>Want AI help?</strong> Try Smart Setup for intelligent recommendations and optimization.</p>
                <p><strong>Need visual builder?</strong> Use Simple Creator for drag-and-drop timetable building.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
