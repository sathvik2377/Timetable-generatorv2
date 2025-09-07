"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Users, BookOpen, Calendar, Clock, Building2, Download } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-high-contrast mb-4">
                📊 Analytics Dashboard
              </h1>
              <p className="text-xl text-readable">
                Comprehensive insights into your academic timetable system
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
              <Download className="h-5 w-5" />
              Export Report
            </button>
          </div>
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
              <span className="text-2xl font-bold text-high-contrast">1,250</span>
            </div>
            <h3 className="text-lg font-semibold text-high-contrast">Total Students</h3>
            <p className="text-sm text-readable">Across all programs</p>
            <div className="mt-2 flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp className="h-3 w-3" />
              +12% from last semester
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass border-0 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="h-8 w-8 text-green-400" />
              <span className="text-2xl font-bold text-high-contrast">45</span>
            </div>
            <h3 className="text-lg font-semibold text-high-contrast">Faculty Members</h3>
            <p className="text-sm text-readable">Active teaching staff</p>
            <div className="mt-2 flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp className="h-3 w-3" />
              +3 new this semester
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass border-0 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-high-contrast">85%</span>
            </div>
            <h3 className="text-lg font-semibold text-high-contrast">Room Utilization</h3>
            <p className="text-sm text-readable">Average across all rooms</p>
            <div className="mt-2 flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp className="h-3 w-3" />
              +2% improvement
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass border-0 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Building2 className="h-8 w-8 text-orange-400" />
              <span className="text-2xl font-bold text-high-contrast">98%</span>
            </div>
            <h3 className="text-lg font-semibold text-high-contrast">Conflict Resolution</h3>
            <p className="text-sm text-readable">AI optimization success</p>
            <div className="mt-2 flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp className="h-3 w-3" />
              Excellent performance
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Faculty Workload Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass border-0 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-high-contrast mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Faculty Workload Distribution
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Dr. Smith', hours: 18, max: 20, color: 'bg-blue-500' },
                { name: 'Prof. Johnson', hours: 20, max: 20, color: 'bg-green-500' },
                { name: 'Dr. Williams', hours: 16, max: 20, color: 'bg-purple-500' },
                { name: 'Prof. Brown', hours: 22, max: 24, color: 'bg-orange-500' },
                { name: 'Dr. Davis', hours: 19, max: 20, color: 'bg-pink-500' }
              ].map((faculty, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-readable">{faculty.name}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className={`${faculty.color} h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${(faculty.hours / faculty.max) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm text-high-contrast font-medium">
                    {faculty.hours}/{faculty.max}h
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Room Utilization Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="glass border-0 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-high-contrast mb-6 flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Room Utilization by Type
            </h3>
            <div className="space-y-4">
              {[
                { type: 'Classrooms', utilization: 90, total: 8, color: 'bg-blue-500' },
                { type: 'Laboratories', utilization: 75, total: 4, color: 'bg-green-500' },
                { type: 'Auditoriums', utilization: 60, total: 2, color: 'bg-purple-500' },
                { type: 'Seminar Rooms', utilization: 85, total: 3, color: 'bg-orange-500' }
              ].map((room, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${room.color} rounded`}></div>
                    <div>
                      <p className="font-medium text-high-contrast">{room.type}</p>
                      <p className="text-sm text-readable">{room.total} rooms</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-high-contrast">{room.utilization}%</p>
                    <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`${room.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${room.utilization}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass border-0 rounded-lg p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-high-contrast mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            System Performance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-high-contrast mb-2">2.3s</p>
              <p className="text-sm text-readable">Average Generation Time</p>
              <p className="text-xs text-green-400 mt-1">45% faster than last month</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-high-contrast mb-2">99.2%</p>
              <p className="text-sm text-readable">System Uptime</p>
              <p className="text-xs text-green-400 mt-1">Excellent reliability</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-high-contrast mb-2">4.8/5</p>
              <p className="text-sm text-readable">User Satisfaction</p>
              <p className="text-xs text-green-400 mt-1">Based on 127 responses</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass border-0 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-high-contrast mb-6">Recent System Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'Timetable generated for Computer Science', time: '10 minutes ago', type: 'success' },
              { action: 'New faculty member added to Mathematics', time: '1 hour ago', type: 'info' },
              { action: 'Room conflict resolved automatically', time: '2 hours ago', type: 'warning' },
              { action: 'System backup completed successfully', time: '6 hours ago', type: 'success' },
              { action: 'Analytics report generated', time: '1 day ago', type: 'info' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-400' :
                  activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                }`}></div>
                <div className="flex-1">
                  <p className="text-high-contrast">{activity.action}</p>
                  <p className="text-sm text-readable">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
