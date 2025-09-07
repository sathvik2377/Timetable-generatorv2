"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, BookOpen, Download, Filter } from 'lucide-react';

interface ScheduleSlot {
  time: string;
  subject: string;
  room: string;
  students: number;
  type: 'theory' | 'practical' | 'tutorial' | 'break';
}

interface DaySchedule {
  [key: string]: ScheduleSlot;
}

export default function FacultySchedulePage() {
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [selectedView, setSelectedView] = useState<'week' | 'day'>('week');

  const schedule: { [key: string]: DaySchedule } = {
    Monday: {
      '09:00-10:00': { time: '09:00-10:00', subject: 'Data Structures', room: 'Room 101', students: 35, type: 'theory' },
      '10:00-11:00': { time: '10:00-11:00', subject: 'Algorithms', room: 'Room 205', students: 40, type: 'theory' },
      '11:00-12:00': { time: '11:00-12:00', subject: 'Free Period', room: '-', students: 0, type: 'break' },
      '12:00-13:00': { time: '12:00-13:00', subject: 'Lunch Break', room: '-', students: 0, type: 'break' },
      '13:00-14:00': { time: '13:00-14:00', subject: 'Programming Lab', room: 'Lab A', students: 25, type: 'practical' },
      '14:00-15:00': { time: '14:00-15:00', subject: 'Programming Lab', room: 'Lab A', students: 25, type: 'practical' }
    },
    Tuesday: {
      '09:00-10:00': { time: '09:00-10:00', subject: 'Algorithms', room: 'Room 205', students: 40, type: 'theory' },
      '10:00-11:00': { time: '10:00-11:00', subject: 'Data Structures', room: 'Room 101', students: 35, type: 'theory' },
      '11:00-12:00': { time: '11:00-12:00', subject: 'Tutorial', room: 'Room 301', students: 20, type: 'tutorial' },
      '12:00-13:00': { time: '12:00-13:00', subject: 'Lunch Break', room: '-', students: 0, type: 'break' },
      '13:00-14:00': { time: '13:00-14:00', subject: 'Free Period', room: '-', students: 0, type: 'break' },
      '14:00-15:00': { time: '14:00-15:00', subject: 'Office Hours', room: 'Office 201', students: 0, type: 'tutorial' }
    },
    Wednesday: {
      '09:00-10:00': { time: '09:00-10:00', subject: 'Data Structures', room: 'Room 101', students: 35, type: 'theory' },
      '10:00-11:00': { time: '10:00-11:00', subject: 'Programming Lab', room: 'Lab B', students: 30, type: 'practical' },
      '11:00-12:00': { time: '11:00-12:00', subject: 'Programming Lab', room: 'Lab B', students: 30, type: 'practical' },
      '12:00-13:00': { time: '12:00-13:00', subject: 'Lunch Break', room: '-', students: 0, type: 'break' },
      '13:00-14:00': { time: '13:00-14:00', subject: 'Algorithms', room: 'Room 205', students: 40, type: 'theory' },
      '14:00-15:00': { time: '14:00-15:00', subject: 'Free Period', room: '-', students: 0, type: 'break' }
    },
    Thursday: {
      '09:00-10:00': { time: '09:00-10:00', subject: 'Tutorial', room: 'Room 301', students: 20, type: 'tutorial' },
      '10:00-11:00': { time: '10:00-11:00', subject: 'Data Structures', room: 'Room 101', students: 35, type: 'theory' },
      '11:00-12:00': { time: '11:00-12:00', subject: 'Algorithms', room: 'Room 205', students: 40, type: 'theory' },
      '12:00-13:00': { time: '12:00-13:00', subject: 'Lunch Break', room: '-', students: 0, type: 'break' },
      '13:00-14:00': { time: '13:00-14:00', subject: 'Office Hours', room: 'Office 201', students: 0, type: 'tutorial' },
      '14:00-15:00': { time: '14:00-15:00', subject: 'Free Period', room: '-', students: 0, type: 'break' }
    },
    Friday: {
      '09:00-10:00': { time: '09:00-10:00', subject: 'Programming Lab', room: 'Lab A', students: 25, type: 'practical' },
      '10:00-11:00': { time: '10:00-11:00', subject: 'Programming Lab', room: 'Lab A', students: 25, type: 'practical' },
      '11:00-12:00': { time: '11:00-12:00', subject: 'Data Structures', room: 'Room 101', students: 35, type: 'theory' },
      '12:00-13:00': { time: '12:00-13:00', subject: 'Lunch Break', room: '-', students: 0, type: 'break' },
      '13:00-14:00': { time: '13:00-14:00', subject: 'Algorithms', room: 'Room 205', students: 40, type: 'theory' },
      '14:00-15:00': { time: '14:00-15:00', subject: 'Free Period', room: '-', students: 0, type: 'break' }
    }
  };

  const timeSlots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const getSlotColor = (type: string) => {
    switch (type) {
      case 'theory': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'practical': return 'bg-green-100 border-green-300 text-green-800';
      case 'tutorial': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'break': return 'bg-gray-100 border-gray-300 text-gray-600';
      default: return 'bg-white border-gray-300 text-gray-800';
    }
  };

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
                📅 My Schedule
              </h1>
              <p className="text-xl text-readable">
                Your complete teaching schedule and class information
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="px-4 py-2 glass border border-white/20 rounded-lg text-high-contrast focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="current">Current Week</option>
                <option value="next">Next Week</option>
                <option value="previous">Previous Week</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass border-0 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-readable">This Week</p>
                <p className="text-2xl font-bold text-high-contrast">18</p>
                <p className="text-xs text-readable">Teaching Hours</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass border-0 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-readable">Total Classes</p>
                <p className="text-2xl font-bold text-high-contrast">15</p>
                <p className="text-xs text-readable">This Week</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass border-0 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-readable">Students</p>
                <p className="text-2xl font-bold text-high-contrast">120</p>
                <p className="text-xs text-readable">Total Enrolled</p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass border-0 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-readable">Next Class</p>
                <p className="text-lg font-bold text-high-contrast">10:00 AM</p>
                <p className="text-xs text-readable">Data Structures</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-400" />
            </div>
          </motion.div>
        </div>

        {/* Schedule Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass border-0 rounded-lg p-6"
        >
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-xl font-bold text-high-contrast">Weekly Schedule</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedView('week')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedView === 'week' 
                    ? 'bg-blue-500 text-white' 
                    : 'glass border-white/20 text-readable hover:bg-white/10'
                }`}
              >
                Week View
              </button>
              <button
                onClick={() => setSelectedView('day')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedView === 'day' 
                    ? 'bg-blue-500 text-white' 
                    : 'glass border-white/20 text-readable hover:bg-white/10'
                }`}
              >
                Day View
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-400 bg-white rounded-lg">
              <thead>
                <tr>
                  <th className="border border-gray-400 bg-gray-100 p-3 text-center font-bold text-gray-800 min-w-[100px]">
                    Time
                  </th>
                  {days.map((day) => (
                    <th key={day} className="border border-gray-400 bg-gray-100 p-3 text-center font-bold text-gray-800 min-w-[150px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot}>
                    <td className="border border-gray-400 bg-gray-50 p-3 text-center font-semibold text-gray-800 align-top">
                      {timeSlot}
                    </td>
                    {days.map((day) => {
                      const slot = schedule[day][timeSlot];
                      return (
                        <td key={`${day}-${timeSlot}`} className="border border-gray-400 p-2 align-top min-h-[80px]">
                          {slot ? (
                            <div className={`p-3 rounded border-2 ${getSlotColor(slot.type)}`}>
                              <div className="font-bold text-sm mb-1">
                                {slot.subject}
                              </div>
                              {slot.room !== '-' && (
                                <div className="text-xs flex items-center gap-1 mb-1">
                                  <MapPin className="h-3 w-3" />
                                  {slot.room}
                                </div>
                              )}
                              {slot.students > 0 && (
                                <div className="text-xs flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {slot.students} students
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center text-gray-400 text-xs p-3">
                              Free
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
              <span className="text-sm text-readable">Theory</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
              <span className="text-sm text-readable">Practical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 border-2 border-purple-300 rounded"></div>
              <span className="text-sm text-readable">Tutorial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
              <span className="text-sm text-readable">Break/Free</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
