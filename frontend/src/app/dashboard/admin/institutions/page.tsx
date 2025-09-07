"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, Edit3, Trash2, Users, Calendar, MapPin } from 'lucide-react';

interface Institution {
  id: number;
  name: string;
  code: string;
  address: string;
  totalStudents: number;
  totalFaculty: number;
  departments: number;
  status: 'active' | 'inactive';
}

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([
    {
      id: 1,
      name: 'Main Campus',
      code: 'MAIN',
      address: '123 University Ave, City, State',
      totalStudents: 1250,
      totalFaculty: 45,
      departments: 8,
      status: 'active'
    },
    {
      id: 2,
      name: 'Engineering Campus',
      code: 'ENG',
      address: '456 Tech Street, City, State',
      totalStudents: 800,
      totalFaculty: 32,
      departments: 5,
      status: 'active'
    },
    {
      id: 3,
      name: 'Medical Campus',
      code: 'MED',
      address: '789 Health Blvd, City, State',
      totalStudents: 400,
      totalFaculty: 28,
      departments: 3,
      status: 'active'
    }
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-high-contrast mb-4">
                🏛️ Institution Management
              </h1>
              <p className="text-xl text-readable">
                Manage your educational institutions and campuses
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
              <Plus className="h-5 w-5" />
              Add Institution
            </button>
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
                <p className="text-sm text-readable">Total Institutions</p>
                <p className="text-2xl font-bold text-high-contrast">{institutions.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-400" />
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
                <p className="text-sm text-readable">Total Students</p>
                <p className="text-2xl font-bold text-high-contrast">
                  {institutions.reduce((sum, inst) => sum + inst.totalStudents, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-400" />
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
                <p className="text-sm text-readable">Total Faculty</p>
                <p className="text-2xl font-bold text-high-contrast">
                  {institutions.reduce((sum, inst) => sum + inst.totalFaculty, 0)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-400" />
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
                <p className="text-sm text-readable">Active Campuses</p>
                <p className="text-2xl font-bold text-high-contrast">
                  {institutions.filter(inst => inst.status === 'active').length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-orange-400" />
            </div>
          </motion.div>
        </div>

        {/* Institutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {institutions.map((institution, index) => (
            <motion.div
              key={institution.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="glass border-0 rounded-lg p-6 hover:bg-white/10 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-high-contrast">{institution.name}</h3>
                    <p className="text-sm text-readable">Code: {institution.code}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  institution.status === 'active' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {institution.status}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-readable flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4" />
                  {institution.address}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-high-contrast">{institution.totalStudents}</p>
                  <p className="text-xs text-readable">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-high-contrast">{institution.totalFaculty}</p>
                  <p className="text-xs text-readable">Faculty</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-high-contrast">{institution.departments}</p>
                  <p className="text-xs text-readable">Departments</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-all">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
