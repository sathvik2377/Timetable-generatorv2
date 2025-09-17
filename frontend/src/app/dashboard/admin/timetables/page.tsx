"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Edit3, Download, Eye, Trash2, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Timetable {
  id: number;
  name: string;
  semester: string;
  department: string;
  status: 'active' | 'draft' | 'archived';
  lastModified: string;
  totalClasses: number;
  conflicts: number;
  utilization: number;
}

export default function TimetablesPage() {
  const [timetables, setTimetables] = useState<Timetable[]>([
    {
      id: 1,
      name: 'Computer Science - Fall 2025',
      semester: 'Fall 2025',
      department: 'Computer Science',
      status: 'active',
      lastModified: '2025-01-15 10:30 AM',
      totalClasses: 45,
      conflicts: 0,
      utilization: 85
    },
    {
      id: 2,
      name: 'Mathematics - Fall 2025',
      semester: 'Fall 2025',
      department: 'Mathematics',
      status: 'active',
      lastModified: '2025-01-14 02:15 PM',
      totalClasses: 38,
      conflicts: 1,
      utilization: 78
    },
    {
      id: 3,
      name: 'Physics - Fall 2025',
      semester: 'Fall 2025',
      department: 'Physics',
      status: 'draft',
      lastModified: '2025-01-13 11:45 AM',
      totalClasses: 32,
      conflicts: 3,
      utilization: 72
    },
    {
      id: 4,
      name: 'Computer Science - Spring 2025',
      semester: 'Spring 2025',
      department: 'Computer Science',
      status: 'archived',
      lastModified: '2025-01-10 09:20 AM',
      totalClasses: 42,
      conflicts: 0,
      utilization: 88
    }
  ]);

  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Timetable management functions
  const handleViewTimetable = (timetable: Timetable) => {
    setSelectedTimetable(timetable);
    setShowViewModal(true);
  };

  const handleEditTimetable = (timetable: Timetable) => {
    // Navigate to edit page
    window.location.href = `/dashboard/admin/edit-timetable?id=${timetable.id}`;
  };

  const handleDownloadTimetable = async (timetable: Timetable) => {
    try {
      // Create a simple CSV export for now
      const csvContent = `Timetable: ${timetable.name}\nSemester: ${timetable.semester}\nDepartment: ${timetable.department}\nStatus: ${timetable.status}\nTotal Classes: ${timetable.totalClasses}\nConflicts: ${timetable.conflicts}\nLast Modified: ${timetable.lastModified}`;

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${timetable.name.replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('Timetable downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download timetable');
    }
  };

  const handleDeleteTimetable = (timetable: Timetable) => {
    if (confirm(`Are you sure you want to delete "${timetable.name}"?`)) {
      setTimetables(prev => prev.filter(t => t.id !== timetable.id));
      alert('Timetable deleted successfully!');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${colors[status as keyof typeof colors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
                📅 Timetable Management
              </h1>
              <p className="text-xl text-readable">
                Create, manage, and optimize academic timetables
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/demo-interactive">
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
                  <Plus className="h-5 w-5" />
                  Create Timetable
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass border-0 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-readable">Total Timetables</p>
                <p className="text-2xl font-bold text-high-contrast">{timetables.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
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
                <p className="text-sm text-readable">Active</p>
                <p className="text-2xl font-bold text-high-contrast">
                  {timetables.filter(t => t.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
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
                <p className="text-sm text-readable">Draft</p>
                <p className="text-2xl font-bold text-high-contrast">
                  {timetables.filter(t => t.status === 'draft').length}
                </p>
              </div>
              <Edit3 className="h-8 w-8 text-yellow-400" />
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
                <p className="text-sm text-readable">Total Conflicts</p>
                <p className="text-2xl font-bold text-high-contrast">
                  {timetables.reduce((sum, t) => sum + t.conflicts, 0)}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </motion.div>
        </div>

        {/* Timetables Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass border-0 rounded-lg p-6"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-readable font-semibold">Timetable</th>
                  <th className="text-left py-4 px-4 text-readable font-semibold">Department</th>
                  <th className="text-left py-4 px-4 text-readable font-semibold">Status</th>
                  <th className="text-left py-4 px-4 text-readable font-semibold">Classes</th>
                  <th className="text-left py-4 px-4 text-readable font-semibold">Conflicts</th>
                  <th className="text-left py-4 px-4 text-readable font-semibold">Utilization</th>
                  <th className="text-left py-4 px-4 text-readable font-semibold">Last Modified</th>
                  <th className="text-left py-4 px-4 text-readable font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {timetables.map((timetable, index) => (
                  <motion.tr
                    key={timetable.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-high-contrast">{timetable.name}</p>
                        <p className="text-sm text-readable">{timetable.semester}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-readable">
                      {timetable.department}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(timetable.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span className="text-high-contrast font-medium">{timetable.totalClasses}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {timetable.conflicts === 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className={`font-medium ${
                          timetable.conflicts === 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {timetable.conflicts}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${timetable.utilization}%` }}
                          ></div>
                        </div>
                        <span className="text-high-contrast text-sm font-medium">{timetable.utilization}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-readable text-sm">
                      {timetable.lastModified}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewTimetable(timetable)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-all"
                          title="View Timetable"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditTimetable(timetable)}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded transition-all"
                          title="Edit Timetable"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadTimetable(timetable)}
                          className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded transition-all"
                          title="Download Timetable"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTimetable(timetable)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all"
                          title="Delete Timetable"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* View Timetable Modal */}
        {showViewModal && selectedTimetable && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass border-0 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-high-contrast">
                  {selectedTimetable.name}
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-readable hover:text-high-contrast text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-subtitle">Semester:</span>
                    <p className="text-readable font-medium">{selectedTimetable.semester}</p>
                  </div>
                  <div>
                    <span className="text-sm text-subtitle">Department:</span>
                    <p className="text-readable font-medium">{selectedTimetable.department}</p>
                  </div>
                  <div>
                    <span className="text-sm text-subtitle">Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedTimetable.status)}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-subtitle">Total Classes:</span>
                    <p className="text-readable font-medium">{selectedTimetable.totalClasses}</p>
                  </div>
                  <div>
                    <span className="text-sm text-subtitle">Conflicts:</span>
                    <p className="text-readable font-medium">{selectedTimetable.conflicts}</p>
                  </div>
                  <div>
                    <span className="text-sm text-subtitle">Last Modified:</span>
                    <p className="text-readable font-medium">{selectedTimetable.lastModified}</p>
                  </div>
                </div>
              </div>

              {/* Sample Timetable Preview */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-high-contrast mb-4">Timetable Preview</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="border border-white/20 p-3 text-left text-readable">Time</th>
                        <th className="border border-white/20 p-3 text-left text-readable">Monday</th>
                        <th className="border border-white/20 p-3 text-left text-readable">Tuesday</th>
                        <th className="border border-white/20 p-3 text-left text-readable">Wednesday</th>
                        <th className="border border-white/20 p-3 text-left text-readable">Thursday</th>
                        <th className="border border-white/20 p-3 text-left text-readable">Friday</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['09:00-10:00', '10:00-11:00', '11:00-12:00', '13:00-14:00', '14:00-15:00'].map((time) => (
                        <tr key={time}>
                          <td className="border border-white/20 p-3 text-readable font-medium">{time}</td>
                          <td className="border border-white/20 p-3 text-sm text-subtitle">
                            {time === '13:00-14:00' ? 'Lunch Break' : 'Sample Subject'}
                          </td>
                          <td className="border border-white/20 p-3 text-sm text-subtitle">
                            {time === '13:00-14:00' ? 'Lunch Break' : 'Sample Subject'}
                          </td>
                          <td className="border border-white/20 p-3 text-sm text-subtitle">
                            {time === '13:00-14:00' ? 'Lunch Break' : 'Sample Subject'}
                          </td>
                          <td className="border border-white/20 p-3 text-sm text-subtitle">
                            {time === '13:00-14:00' ? 'Lunch Break' : 'Sample Subject'}
                          </td>
                          <td className="border border-white/20 p-3 text-sm text-subtitle">
                            {time === '13:00-14:00' ? 'Lunch Break' : 'Sample Subject'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleEditTimetable(selectedTimetable)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                >
                  Edit Timetable
                </button>
                <button
                  onClick={() => handleDownloadTimetable(selectedTimetable)}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                >
                  Download
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 px-4 py-2 glass border border-white/20 text-readable rounded-lg hover:bg-white/10 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
