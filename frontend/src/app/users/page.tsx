"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Search, Filter, Edit3, Trash2, Mail, Phone, Shield, GraduationCap, BookOpen } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'faculty' | 'student';
  phone?: string;
  department?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@demo.local',
      role: 'admin',
      phone: '+1-234-567-8900',
      department: 'Administration',
      status: 'active',
      lastLogin: '2024-01-15 10:30 AM'
    },
    {
      id: 2,
      name: 'Dr. John Smith',
      email: 'john.smith@demo.local',
      role: 'faculty',
      phone: '+1-234-567-8901',
      department: 'Computer Science',
      status: 'active',
      lastLogin: '2024-01-15 09:15 AM'
    },
    {
      id: 3,
      name: 'Prof. Sarah Johnson',
      email: 'sarah.johnson@demo.local',
      role: 'faculty',
      phone: '+1-234-567-8902',
      department: 'Mathematics',
      status: 'active',
      lastLogin: '2024-01-14 02:45 PM'
    },
    {
      id: 4,
      name: 'Alice Wilson',
      email: 'alice.wilson@demo.local',
      role: 'student',
      phone: '+1-234-567-8903',
      department: 'Computer Science',
      status: 'active',
      lastLogin: '2024-01-15 08:20 AM'
    },
    {
      id: 5,
      name: 'Bob Davis',
      email: 'bob.davis@demo.local',
      role: 'student',
      phone: '+1-234-567-8904',
      department: 'Mathematics',
      status: 'active',
      lastLogin: '2024-01-14 11:30 AM'
    },
    {
      id: 6,
      name: 'Carol Miller',
      email: 'carol.miller@demo.local',
      role: 'student',
      phone: '+1-234-567-8905',
      department: 'Physics',
      status: 'inactive',
      lastLogin: '2024-01-10 03:15 PM'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-red-400" />;
      case 'faculty': return <GraduationCap className="h-4 w-4 text-blue-400" />;
      case 'student': return <BookOpen className="h-4 w-4 text-green-400" />;
      default: return <Users className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-500/20 text-red-400 border-red-500/30',
      faculty: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      student: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${colors[role as keyof typeof colors]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        status === 'active' 
          ? 'bg-green-500/20 text-green-400' 
          : 'bg-gray-500/20 text-gray-400'
      }`}>
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
                👥 User Management
              </h1>
              <p className="text-xl text-readable">
                Manage administrators, faculty, and students
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
              <UserPlus className="h-5 w-5" />
              Add User
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
                <p className="text-sm text-readable">Total Users</p>
                <p className="text-2xl font-bold text-high-contrast">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
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
                <p className="text-sm text-readable">Faculty</p>
                <p className="text-2xl font-bold text-high-contrast">
                  {users.filter(u => u.role === 'faculty').length}
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-400" />
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
                <p className="text-2xl font-bold text-high-contrast">
                  {users.filter(u => u.role === 'student').length}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-green-400" />
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
                <p className="text-sm text-readable">Active</p>
                <p className="text-2xl font-bold text-high-contrast">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-400" />
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass border-0 rounded-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 glass border border-white/20 rounded-lg text-high-contrast placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 glass border border-white/20 rounded-lg text-high-contrast focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 glass border border-white/20 rounded-lg text-high-contrast focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass border-0 rounded-lg p-6"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-readable font-semibold">User</th>
                  <th className="text-left py-4 px-4 text-readable font-semibold">Role</th>
                  <th className="text-left py-4 px-4 text-readable font-semibold">Department</th>
                  <th className="text-left py-4 px-4 text-readable font-semibold">Status</th>
                  <th className="text-left py-4 px-4 text-readable font-semibold">Last Login</th>
                  <th className="text-left py-4 px-4 text-readable font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {getRoleIcon(user.role)}
                        <div>
                          <p className="font-medium text-high-contrast">{user.name}</p>
                          <p className="text-sm text-readable flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                          {user.phone && (
                            <p className="text-sm text-readable flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="py-4 px-4 text-readable">
                      {user.department || '-'}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="py-4 px-4 text-readable text-sm">
                      {user.lastLogin || 'Never'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-all">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-readable">No users found matching your criteria</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
