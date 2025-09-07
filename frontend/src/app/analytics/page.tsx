"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Users, BookOpen, Calendar, Clock, Building2 } from 'lucide-react';

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    totalStudents: 1250,
    totalTeachers: 45,
    totalSubjects: 28,
    totalRooms: 15,
    utilizationRate: 85,
    conflictResolution: 98,
    averageClassSize: 35,
    peakHours: '10:00-12:00'
  });

  const [facultyWorkload, setFacultyWorkload] = useState([
    { name: 'Dr. Smith', hours: 18, subjects: 3, efficiency: 92 },
    { name: 'Prof. Johnson', hours: 20, subjects: 4, efficiency: 88 },
    { name: 'Dr. Williams', hours: 16, subjects: 2, efficiency: 95 },
    { name: 'Prof. Brown', hours: 22, subjects: 5, efficiency: 85 },
    { name: 'Dr. Davis', hours: 19, subjects: 3, efficiency: 90 }
  ]);

  const [roomUtilization, setRoomUtilization] = useState([
    { room: 'Room 101', utilization: 90, capacity: 40, type: 'Classroom' },
    { room: 'Lab A', utilization: 75, capacity: 30, type: 'Laboratory' },
    { room: 'Room 205', utilization: 85, capacity: 35, type: 'Classroom' },
    { room: 'Auditorium', utilization: 60, capacity: 200, type: 'Auditorium' },
    { room: 'Lab B', utilization: 80, capacity: 25, type: 'Laboratory' }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-high-contrast mb-4">
            📊 Analytics Dashboard
          </h1>
          <p className="text-xl text-readable">
            Comprehensive insights into your academic timetable system
          </p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass border-0 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-high-contrast">{analyticsData.totalStudents}</span>
            </div>
            <h3 className="text-lg font-semibold text-high-contrast">Total Students</h3>
            <p className="text-sm text-readable">Across all programs</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass border-0 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="h-8 w-8 text-green-400" />
              <span className="text-2xl font-bold text-high-contrast">{analyticsData.totalTeachers}</span>
            </div>
            <h3 className="text-lg font-semibold text-high-contrast">Faculty Members</h3>
            <p className="text-sm text-readable">Active teaching staff</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass border-0 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-high-contrast">{analyticsData.totalSubjects}</span>
            </div>
            <h3 className="text-lg font-semibold text-high-contrast">Active Subjects</h3>
            <p className="text-sm text-readable">Current semester</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass border-0 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Building2 className="h-8 w-8 text-orange-400" />
              <span className="text-2xl font-bold text-high-contrast">{analyticsData.totalRooms}</span>
            </div>
            <h3 className="text-lg font-semibold text-high-contrast">Available Rooms</h3>
            <p className="text-sm text-readable">All facilities</p>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass border-0 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-high-contrast mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              System Performance
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-readable">Room Utilization</span>
                  <span className="text-high-contrast font-semibold">{analyticsData.utilizationRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analyticsData.utilizationRate}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-readable">Conflict Resolution</span>
                  <span className="text-high-contrast font-semibold">{analyticsData.conflictResolution}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analyticsData.conflictResolution}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="glass border-0 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-high-contrast mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Usage Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-readable">Average Class Size</span>
                <span className="text-high-contrast font-semibold">{analyticsData.averageClassSize} students</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-readable">Peak Usage Hours</span>
                <span className="text-high-contrast font-semibold">{analyticsData.peakHours}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-readable">Optimization Score</span>
                <span className="text-green-400 font-semibold">Excellent</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Faculty Workload Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass border-0 rounded-lg p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-high-contrast mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Faculty Workload Analysis
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-readable font-semibold">Faculty</th>
                  <th className="text-left py-3 px-4 text-readable font-semibold">Weekly Hours</th>
                  <th className="text-left py-3 px-4 text-readable font-semibold">Subjects</th>
                  <th className="text-left py-3 px-4 text-readable font-semibold">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {facultyWorkload.map((faculty, index) => (
                  <tr key={index} className="border-b border-white/5">
                    <td className="py-3 px-4 text-high-contrast font-medium">{faculty.name}</td>
                    <td className="py-3 px-4 text-readable">{faculty.hours} hrs</td>
                    <td className="py-3 px-4 text-readable">{faculty.subjects}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        faculty.efficiency >= 90 ? 'bg-green-500/20 text-green-400' :
                        faculty.efficiency >= 85 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {faculty.efficiency}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Room Utilization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass border-0 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-high-contrast mb-6 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Room Utilization Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roomUtilization.map((room, index) => (
              <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-high-contrast">{room.room}</h4>
                  <span className="text-sm text-readable">{room.type}</span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-readable">Utilization</span>
                    <span className="text-sm text-high-contrast font-semibold">{room.utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${room.utilization}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-readable">Capacity: {room.capacity} students</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
