"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Users, Building2, TrendingUp, Clock, AlertTriangle } from 'lucide-react'
import { ExportMenu } from '@/components/export-menu'
import { apiClient } from '@/lib/api'

interface AnalyticsDashboardProps {
  institutionId?: number
  timetableId?: number
}

export function AnalyticsDashboard({ institutionId, timetableId }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('faculty')
  const [facultyData, setFacultyData] = useState<any>(null)
  const [roomData, setRoomData] = useState<any>(null)
  const [studentData, setStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [institutionId, timetableId])

  const loadAnalyticsData = async () => {
    if (!institutionId && !timetableId) return

    try {
      setLoading(true)
      
      const [faculty, room, student] = await Promise.all([
        apiClient.getFacultyWorkloadAnalytics(institutionId, timetableId),
        apiClient.getRoomUtilizationAnalytics(institutionId, timetableId),
        apiClient.getStudentDensityAnalytics(institutionId, timetableId)
      ])

      setFacultyData(faculty)
      setRoomData(room)
      setStudentData(student)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'faculty', label: 'Faculty Workload', icon: Users },
    { id: 'rooms', label: 'Room Utilization', icon: Building2 },
    { id: 'students', label: 'Student Density', icon: BarChart3 }
  ]

  const renderFacultyAnalytics = () => {
    if (!facultyData) return null

    const { workload_data, summary } = facultyData

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Teachers</p>
                <p className="text-xl font-bold text-white">{summary.total_teachers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Hours</p>
                <p className="text-xl font-bold text-white">{summary.average_hours.toFixed(1)}</p>
              </div>
              <Clock className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Max Hours</p>
                <p className="text-xl font-bold text-white">{summary.max_hours}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Min Hours</p>
                <p className="text-xl font-bold text-white">{summary.min_hours}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Faculty List */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Faculty Workload Distribution</h3>
          <div className="space-y-3">
            {Object.entries(workload_data).map(([teacherName, data]: [string, any]) => (
              <div key={teacherName} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-white">{teacherName}</p>
                  <p className="text-sm text-gray-400">
                    {data.subject_count} subjects • {data.class_count} classes
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{data.total_hours}h</p>
                  <div className="w-24 h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${Math.min(100, (data.total_hours / 30) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderRoomAnalytics = () => {
    if (!roomData) return null

    const { utilization_data, summary } = roomData

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Rooms</p>
                <p className="text-xl font-bold text-white">{summary.total_rooms}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Utilization</p>
                <p className="text-xl font-bold text-white">{summary.average_utilization.toFixed(1)}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Most Used</p>
                <p className="text-sm font-medium text-white truncate">{summary.most_utilized_room}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Room List */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Room Utilization</h3>
          <div className="space-y-3">
            {Object.entries(utilization_data).map(([roomName, data]: [string, any]) => (
              <div key={roomName} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-white">{roomName}</p>
                  <p className="text-sm text-gray-400">
                    {data.room_type} • Capacity: {data.capacity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{data.utilization_percentage.toFixed(1)}%</p>
                  <div className="w-24 h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, data.utilization_percentage)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderStudentAnalytics = () => {
    if (!studentData) return null

    const { density_data, summary } = studentData

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Classes</p>
                <p className="text-xl font-bold text-white">{summary.total_classes}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Sessions</p>
                <p className="text-xl font-bold text-white">{summary.average_sessions_per_class.toFixed(1)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Busiest Class</p>
                <p className="text-sm font-medium text-white truncate">{summary.busiest_class}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Class List */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Class Load Distribution</h3>
          <div className="space-y-3">
            {Object.entries(density_data).map(([className, data]: [string, any]) => (
              <div key={className} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-white">{className}</p>
                  <p className="text-sm text-gray-400">
                    {data.branch} • Year {data.year} • {data.strength} students
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{data.total_sessions}</p>
                  <p className="text-sm text-gray-400">{data.avg_sessions_per_day.toFixed(1)}/day</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="text-gray-400">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Analytics Dashboard</h2>
        <ExportMenu
          institutionId={institutionId}
          timetableId={timetableId}
          type="analytics"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 glass-card p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
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
        {activeTab === 'faculty' && renderFacultyAnalytics()}
        {activeTab === 'rooms' && renderRoomAnalytics()}
        {activeTab === 'students' && renderStudentAnalytics()}
      </motion.div>
    </div>
  )
}
