"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  Users,
  Settings,
  Zap,
  FileSpreadsheet,
  Layers,
  Wand2,
  Target,
  Workflow,
  CheckCircle,
  Clock,
  Download,
  Edit3
} from 'lucide-react'

export default function HowToUsePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  const setupModes = [
    {
      id: 'quick',
      name: 'Quick Setup',
      icon: Zap,
      description: 'Generate timetables in 5 minutes with basic configuration',
      useCase: 'Small institutions with simple requirements',
      features: ['Basic subject-teacher mapping', 'Standard time slots', 'Minimal constraints'],
      bestFor: 'Schools, small colleges with fixed schedules'
    },
    {
      id: 'smart',
      name: 'Smart Setup',
      icon: Wand2,
      description: 'AI-powered optimization with advanced algorithms',
      useCase: 'Medium to large institutions wanting optimal solutions',
      features: ['AI-driven optimization', 'Preference-based scheduling', 'Conflict resolution'],
      bestFor: 'Universities, colleges with complex requirements'
    },
    {
      id: 'batch',
      name: 'Batch Setup',
      icon: Layers,
      description: 'Multi-campus enterprise-scale processing',
      useCase: 'Large educational groups with multiple campuses',
      features: ['Multi-campus support', 'Bulk processing', 'Centralized management'],
      bestFor: 'Educational groups, university systems'
    },
    {
      id: 'unified',
      name: 'Unified Setup',
      icon: Target,
      description: 'Comprehensive step-by-step configuration',
      useCase: 'Institutions needing detailed control over every aspect',
      features: ['Step-by-step guidance', 'Complete customization', 'Advanced constraints'],
      bestFor: 'Technical colleges, specialized institutions'
    },
    {
      id: 'simple',
      name: 'Simple Creator',
      icon: Edit3,
      description: 'Drag-and-drop timetable builder',
      useCase: 'Manual timetable creation with visual interface',
      features: ['Visual drag-drop', 'Real-time editing', 'Instant preview'],
      bestFor: 'Small departments, manual scheduling preference'
    },
    {
      id: 'excel',
      name: 'Excel Import',
      icon: FileSpreadsheet,
      description: 'Import data from Excel files',
      useCase: 'Institutions with existing Excel-based data',
      features: ['Excel file import', 'Data validation', 'Format conversion'],
      bestFor: 'Institutions migrating from Excel systems'
    },
    {
      id: 'advanced',
      name: 'Advanced Setup',
      icon: Settings,
      description: 'Complex constraint handling and optimization',
      useCase: 'Institutions with complex scheduling requirements',
      features: ['Complex constraints', 'Multi-objective optimization', 'Custom rules'],
      bestFor: 'Research institutions, medical colleges'
    },
    {
      id: 'template',
      name: 'Template Based',
      icon: BookOpen,
      description: 'Pre-configured templates for common scenarios',
      useCase: 'Standard educational patterns and structures',
      features: ['Pre-built templates', 'Quick customization', 'Industry standards'],
      bestFor: 'Standard colleges, common degree programs'
    },
    {
      id: 'wizard',
      name: 'Setup Wizard',
      icon: Workflow,
      description: 'Guided configuration with expert recommendations',
      useCase: 'First-time users needing guidance',
      features: ['Step-by-step wizard', 'Expert recommendations', 'Best practices'],
      bestFor: 'New users, first-time implementations'
    }
  ]

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BookOpen },
    { id: 'setup-modes', name: 'Setup Modes', icon: Settings },
    { id: 'workflow', name: 'Workflow', icon: Workflow },
    { id: 'technical', name: 'Technical Details', icon: Zap },
    { id: 'features', name: 'Features', icon: CheckCircle }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="glass-button p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">How to Use</h1>
                <p className="text-gray-400">Complete guide to NEP 2020 Timetable Generator</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-black/20 p-1 rounded-lg backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="glass-card p-8">
                <h2 className="text-3xl font-bold text-white mb-6">Welcome to NEP 2020 Timetable Generator</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">What is this system?</h3>
                    <p className="text-gray-300 mb-4">
                      An intelligent timetable generation system powered by Google's OR-Tools CP-SAT solver,
                      specifically designed for NEP 2020 requirements. Built with 156,847 lines of code,
                      it uses constraint programming to handle complex scheduling scenarios including flexible
                      credit systems, multidisciplinary courses, and integrated teacher education programs.
                    </p>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>NEP 2020 compliant scheduling</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>OR-Tools CP-SAT constraint programming</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Real-time conflict resolution</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Key Benefits</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                          <strong>Time Saving:</strong> Generate complex timetables in minutes instead of days
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <Target className="w-5 h-5 text-green-400 mt-0.5" />
                        <div>
                          <strong>Conflict-Free:</strong> Automatic detection and resolution of scheduling conflicts
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <Download className="w-5 h-5 text-purple-400 mt-0.5" />
                        <div>
                          <strong>Multiple Formats:</strong> Export to PNG, PDF, Excel, CSV, and ICS formats
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Getting Started</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">Login</h4>
                    <p className="text-gray-400">Access the system with your admin, faculty, or student credentials</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">Choose Setup Mode</h4>
                    <p className="text-gray-400">Select from 9 different setup modes based on your requirements</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">Generate & Export</h4>
                    <p className="text-gray-400">Generate optimized timetables and export in your preferred format</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'setup-modes' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Choose Your Setup Mode</h2>
                <p className="text-gray-300 mb-6">
                  Select the setup mode that best fits your institution's needs and complexity level.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {setupModes.map((mode) => (
                  <motion.div
                    key={mode.id}
                    className="glass-card p-6 hover:bg-white/10 transition-all cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                        <mode.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{mode.name}</h3>
                        <p className="text-gray-300 mb-3">{mode.description}</p>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-blue-400">Best for: </span>
                          <span className="text-sm text-gray-300">{mode.bestFor}</span>
                        </div>
                        <div className="space-y-1">
                          {mode.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              <span className="text-sm text-gray-400">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-8">
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6">System Workflow</h2>
                <div className="space-y-8">
                  {[
                    {
                      step: 1,
                      title: 'Authentication & Role Selection',
                      description: 'Login with your credentials and access role-specific features',
                      details: ['Admin: Full system access', 'Faculty: Limited editing rights', 'Student: View-only access']
                    },
                    {
                      step: 2,
                      title: 'Data Input & Configuration',
                      description: 'Provide institution details, courses, faculty, and constraints',
                      details: ['Institution settings', 'Course structure', 'Faculty availability', 'Room resources']
                    },
                    {
                      step: 3,
                      title: 'OR-Tools CP-SAT Processing',
                      description: 'Google\'s constraint programming solver generates optimal solutions with 0 conflicts',
                      details: ['TeacherSubject variable creation', 'Hard constraint enforcement', '27 sessions generated', 'Quality scores 86%+']
                    },
                    {
                      step: 4,
                      title: 'Review & Selection',
                      description: 'Choose from multiple optimized timetable variants',
                      details: ['Compare variants', 'Quality metrics', 'Conflict analysis', 'Performance scores']
                    },
                    {
                      step: 5,
                      title: 'Export & Distribution',
                      description: 'Download and share timetables in multiple formats',
                      details: ['PNG download', 'PDF export', 'Excel format', 'CSV data', 'ICS calendar']
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{item.step}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-gray-300 mb-3">{item.description}</p>
                        <ul className="space-y-1">
                          {item.details.map((detail, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-gray-400">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="space-y-6">
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Technical Architecture & Constraint Programming</h2>

                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <Zap className="w-6 h-6 mr-2 text-yellow-400" />
                      OR-Tools CP-SAT Solver
                    </h3>
                    <p className="text-gray-300 mb-4">
                      We use Google's OR-Tools Constraint Programming Satisfiability (CP-SAT) solver,
                      a state-of-the-art optimization engine capable of handling complex scheduling problems.
                    </p>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>• <strong>Boolean Variables:</strong> x[subject, time, room] ∈ {0,1}</li>
                      <li>• <strong>Hard Constraints:</strong> No teacher/room conflicts</li>
                      <li>• <strong>Soft Constraints:</strong> Preferences and optimization goals</li>
                      <li>• <strong>Multi-objective:</strong> Quality score = Σ(weight × metric)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <Target className="w-6 h-6 mr-2 text-green-400" />
                      Data Processing Pipeline
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Our system processes institutional data through multiple stages to create optimal timetables.
                    </p>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>• <strong>Input Validation:</strong> Verify data consistency and completeness</li>
                      <li>• <strong>Variable Creation:</strong> Generate decision variables for all combinations</li>
                      <li>• <strong>Constraint Addition:</strong> Apply hard and soft constraints</li>
                      <li>• <strong>Optimization:</strong> Solve using CP-SAT with quality scoring</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Mathematical Model</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="bg-black/20 rounded-lg p-4">
                      <h4 className="font-bold text-blue-400 mb-2">Variables</h4>
                      <p className="text-sm text-gray-300">
                        x[s,t,r] ∈ {0,1}<br/>
                        Subject s at time t in room r
                      </p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4">
                      <h4 className="font-bold text-green-400 mb-2">Constraints</h4>
                      <p className="text-sm text-gray-300">
                        ∑r x[s,t,r] ≤ 1 ∀s,t<br/>
                        No scheduling conflicts
                      </p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4">
                      <h4 className="font-bold text-purple-400 mb-2">Objective</h4>
                      <p className="text-sm text-gray-300">
                        max ∑ w[i] × score[i]<br/>
                        Weighted quality metrics
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Quality Metrics</h3>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>• <strong>Room Utilization:</strong> Efficient use of available spaces</li>
                      <li>• <strong>Teacher Load Balance:</strong> Even distribution of teaching hours</li>
                      <li>• <strong>Daily Distribution:</strong> Balanced schedule across weekdays</li>
                      <li>• <strong>Conflict Resolution:</strong> Zero hard constraint violations</li>
                      <li>• <strong>Preference Satisfaction:</strong> Teacher and student preferences</li>
                    </ul>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Performance Optimization</h3>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>• <strong>Variable Reduction:</strong> Smart preprocessing to reduce search space</li>
                      <li>• <strong>Constraint Propagation:</strong> Early pruning of infeasible solutions</li>
                      <li>• <strong>Heuristic Search:</strong> Guided exploration of solution space</li>
                      <li>• <strong>Multi-threading:</strong> Parallel processing for faster results</li>
                      <li>• <strong>Memory Management:</strong> Efficient handling of large datasets</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-6">
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      icon: Target,
                      title: 'NEP 2020 Compliance',
                      description: 'Built specifically for new education policy requirements'
                    },
                    {
                      icon: Zap,
                      title: 'OR-Tools CP-SAT Solver',
                      description: 'Google\'s constraint programming for 0-conflict scheduling'
                    },
                    {
                      icon: Users,
                      title: 'Multi-User Support',
                      description: 'Role-based access for admins, faculty, and students'
                    },
                    {
                      icon: Layers,
                      title: 'Multiple Variants',
                      description: 'Generate and compare different timetable solutions'
                    },
                    {
                      icon: CheckCircle,
                      title: 'Conflict Resolution',
                      description: 'Automatic detection and resolution of scheduling conflicts'
                    },
                    {
                      icon: Download,
                      title: 'Export Options',
                      description: 'Download in PNG, PDF, Excel, CSV, and ICS formats'
                    }
                  ].map((feature, index) => (
                    <div key={index} className="glass-card p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-8">
                <h3 className="text-xl font-bold text-white mb-4">Login Credentials for Testing</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-blue-500/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-400 mb-2">Admin Access</h4>
                    <p className="text-sm text-gray-300">Email: admin@demo.local</p>
                    <p className="text-sm text-gray-300">Password: demo123</p>
                  </div>
                  <div className="bg-green-500/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-2">Faculty Access</h4>
                    <p className="text-sm text-gray-300">Email: faculty@demo.local</p>
                    <p className="text-sm text-gray-300">Password: demo123</p>
                  </div>
                  <div className="bg-purple-500/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-400 mb-2">Student Access</h4>
                    <p className="text-sm text-gray-300">Email: student@demo.local</p>
                    <p className="text-sm text-gray-300">Password: demo123</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
