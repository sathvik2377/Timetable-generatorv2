"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  BookOpen,
  MapPin,
  Clock,
  TrendingUp,
  BarChart3,
  Calendar,
  GraduationCap,
  Building2,
  Award,
  Target,
  Zap,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react'
import { generateRealisticTimetableData, RealisticDemoData } from '@/lib/realisticDemoData'

interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  totalSubjects: number
  totalRooms: number
  totalClasses: number
  averageClassSize: number
  utilizationRate: number
  satisfactionScore: number
}

interface EnhancedDemoDashboardProps {
  className?: string
}

export function EnhancedDemoDashboard({ className = '' }: EnhancedDemoDashboardProps) {
  const [demoData, setDemoData] = useState<RealisticDemoData | null>(null)
  const [timetableData, setTimetableData] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading realistic demo data
    const loadDemoData = async () => {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { demoData, timetable, statistics } = generateRealisticTimetableData()
      
      setDemoData(demoData)
      setTimetableData(timetable)
      setStats({
        totalStudents: statistics.totalStudents,
        totalTeachers: statistics.totalTeachers,
        totalSubjects: statistics.totalSubjects,
        totalRooms: statistics.totalRooms,
        totalClasses: statistics.totalClasses,
        averageClassSize: statistics.averageClassSize,
        utilizationRate: 87.5,
        satisfactionScore: 92.3
      })
      
      setLoading(false)
    }
    
    loadDemoData()
  }, [])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'performance', label: 'Performance', icon: Target },
    { id: 'insights', label: 'Insights', icon: Zap }
  ]

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center min-h-[400px]`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading realistic demo data...</p>
        </div>
      </div>
    )
  }

  if (!demoData || !stats) return null

  return (
    <div className={`${className} space-y-6`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">
          {demoData.institution.name}
        </h2>
        <p className="text-muted">
          Academic Year {demoData.institution.academicYear} • Semester {demoData.institution.currentSemester}
        </p>
        <div className="flex items-center justify-center space-x-4 mt-2 text-sm text-muted">
          <span>📍 {demoData.institution.address.split(',')[0]}</span>
          <span>📞 {demoData.institution.phone}</span>
          <span>📧 {demoData.institution.email}</span>
        </div>
      </div>

      {/* Key Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 text-center"
        >
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-primary">{stats.totalStudents.toLocaleString()}</div>
          <div className="text-sm text-muted">Total Students</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 text-center"
        >
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-primary">{stats.totalTeachers}</div>
          <div className="text-sm text-muted">Faculty Members</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 text-center"
        >
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-primary">{stats.totalSubjects}</div>
          <div className="text-sm text-muted">Subjects</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 text-center"
        >
          <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-primary">{stats.totalRooms}</div>
          <div className="text-sm text-muted">Facilities</div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-muted hover:text-primary hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Department Overview */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-blue-400" />
                  Department Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {demoData.branches.map((branch, index) => (
                    <motion.div
                      key={branch.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-primary">{branch.code}</h4>
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                          {branch.sections} sections
                        </span>
                      </div>
                      <p className="text-sm text-muted mb-3">{branch.name}</p>
                      <div className="flex items-center justify-between text-xs text-muted">
                        <span>{branch.totalStudents} students</span>
                        <span>HOD: {branch.headOfDepartment.split(' ')[0]}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-400" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {[
                    { action: 'Timetable generated for CSE-3A', time: '2 hours ago', type: 'success' },
                    { action: 'Room A-201 maintenance scheduled', time: '4 hours ago', type: 'warning' },
                    { action: 'New faculty Dr. Meera Joshi added', time: '1 day ago', type: 'info' },
                    { action: 'Semester exam schedule published', time: '2 days ago', type: 'success' },
                    { action: 'Lab equipment updated in CL-01', time: '3 days ago', type: 'info' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'success' ? 'bg-green-400' :
                        activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-primary">{activity.action}</p>
                        <p className="text-xs text-muted">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-green-400 mb-2">{stats.utilizationRate}%</div>
                  <div className="text-sm text-muted">Resource Utilization</div>
                  <div className="mt-2 text-xs text-green-300">↑ 5.2% from last month</div>
                </div>

                <div className="glass-card p-6 text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-blue-400 mb-2">{stats.satisfactionScore}%</div>
                  <div className="text-sm text-muted">Satisfaction Score</div>
                  <div className="mt-2 text-xs text-blue-300">↑ 2.1% from last month</div>
                </div>

                <div className="glass-card p-6 text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-purple-400 mb-2">98.5%</div>
                  <div className="text-sm text-muted">Schedule Efficiency</div>
                  <div className="mt-2 text-xs text-purple-300">↑ 1.8% from last month</div>
                </div>
              </div>

              {/* Faculty Workload Distribution */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                  Faculty Workload Distribution
                </h3>
                <div className="space-y-4">
                  {demoData.teachers.slice(0, 6).map((teacher, index) => {
                    const workloadPercentage = (teacher.maxHoursPerWeek / 24) * 100
                    return (
                      <div key={teacher.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-primary">{teacher.name}</span>
                          <span className="text-xs text-muted">{teacher.maxHoursPerWeek}h/week</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${workloadPercentage}%` }}
                            transition={{ delay: index * 0.1, duration: 0.8 }}
                            className={`h-2 rounded-full ${
                              workloadPercentage > 80 ? 'bg-red-400' :
                              workloadPercentage > 60 ? 'bg-yellow-400' : 'bg-green-400'
                            }`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Key Performance Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Avg Class Size', value: stats.averageClassSize, unit: 'students', trend: '+2.3%', color: 'blue' },
                  { label: 'Room Occupancy', value: 85.7, unit: '%', trend: '+1.5%', color: 'green' },
                  { label: 'Teacher-Student Ratio', value: '1:15', unit: '', trend: 'optimal', color: 'purple' },
                  { label: 'Schedule Conflicts', value: 0.8, unit: '%', trend: '-0.3%', color: 'orange' }
                ].map((kpi, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-4"
                  >
                    <div className="text-sm text-muted mb-1">{kpi.label}</div>
                    <div className={`text-xl font-bold text-${kpi.color}-400 mb-1`}>
                      {typeof kpi.value === 'number' && kpi.unit !== '' ? kpi.value.toFixed(1) : kpi.value}{kpi.unit}
                    </div>
                    <div className={`text-xs ${kpi.trend.startsWith('+') || kpi.trend === 'optimal' ? 'text-green-400' : 'text-red-400'}`}>
                      {kpi.trend}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Department Performance Comparison */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-green-400" />
                  Department Performance Comparison
                </h3>
                <div className="space-y-4">
                  {demoData.branches.map((branch, index) => {
                    const performance = 75 + Math.random() * 20 // Random performance between 75-95%
                    return (
                      <div key={branch.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-primary">{branch.code} - {branch.name}</span>
                          <span className="text-xs text-muted">{performance.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${performance}%` }}
                            transition={{ delay: index * 0.1, duration: 0.8 }}
                            className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-green-400"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* AI-Powered Insights */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  AI-Powered Insights
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      type: 'optimization',
                      title: 'Schedule Optimization Opportunity',
                      description: 'Moving CSE-3A\'s Database Management class to 10:00 AM could improve attendance by 12%',
                      impact: 'High',
                      action: 'Reschedule'
                    },
                    {
                      type: 'resource',
                      title: 'Resource Utilization Alert',
                      description: 'Computer Lab 2 is underutilized on Wednesdays. Consider scheduling additional practical sessions',
                      impact: 'Medium',
                      action: 'Optimize'
                    },
                    {
                      type: 'conflict',
                      title: 'Potential Conflict Prevention',
                      description: 'Dr. Rajesh Kumar has back-to-back classes in different buildings. Consider room reallocation',
                      impact: 'Low',
                      action: 'Review'
                    }
                  ].map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 rounded-lg p-4 border-l-4 border-yellow-400"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-primary mb-1">{insight.title}</h4>
                          <p className="text-sm text-muted mb-2">{insight.description}</p>
                          <div className="flex items-center space-x-4">
                            <span className={`text-xs px-2 py-1 rounded ${
                              insight.impact === 'High' ? 'bg-red-500/20 text-red-300' :
                              insight.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-green-500/20 text-green-300'
                            }`}>
                              {insight.impact} Impact
                            </span>
                            <button className="text-xs text-blue-400 hover:text-blue-300">
                              {insight.action} →
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                  <LineChart className="w-5 h-5 mr-2 text-blue-400" />
                  Smart Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Optimal Class Timing',
                      description: 'Schedule core subjects between 9-11 AM for better retention',
                      benefit: '+15% engagement'
                    },
                    {
                      title: 'Lab Session Distribution',
                      description: 'Distribute lab sessions evenly across the week',
                      benefit: '+20% utilization'
                    },
                    {
                      title: 'Faculty Load Balancing',
                      description: 'Redistribute teaching hours for better work-life balance',
                      benefit: '+8% satisfaction'
                    },
                    {
                      title: 'Room Allocation Strategy',
                      description: 'Group related subjects in nearby rooms',
                      benefit: '-25% transition time'
                    }
                  ].map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20"
                    >
                      <h4 className="font-medium text-primary mb-2">{rec.title}</h4>
                      <p className="text-sm text-muted mb-3">{rec.description}</p>
                      <div className="text-xs text-green-400 font-medium">{rec.benefit}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
