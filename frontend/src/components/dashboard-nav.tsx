"use client"

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Settings,
  Users,
  Calendar,
  BarChart3,
  LogOut,
  Menu,
  X,
  Home,
  BookOpen,
  GraduationCap,
  User,
  Edit3
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

interface DashboardNavProps {
  userRole: 'admin' | 'faculty' | 'student'
  userName?: string
}

export function DashboardNav({ userRole, userName }: DashboardNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await apiClient.logout()
      localStorage.removeItem('user')
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  const getNavItems = () => {
    const baseItems = [
      {
        href: `/dashboard/${userRole}`,
        label: 'Dashboard',
        icon: Home,
        active: pathname === `/dashboard/${userRole}`
      }
    ]

    if (userRole === 'admin') {
      return [
        ...baseItems,
        {
          href: `/dashboard/${userRole}/institutions`,
          label: 'Institutions',
          icon: Settings,
          active: pathname.includes('/institutions')
        },
        {
          href: `/dashboard/${userRole}/timetables`,
          label: 'Timetables',
          icon: Calendar,
          active: pathname.includes('/timetables')
        },

        {
          href: `/dashboard/${userRole}/analytics`,
          label: 'Analytics',
          icon: BarChart3,
          active: pathname.includes('/analytics')
        },
        {
          href: `/dashboard/${userRole}/users`,
          label: 'Users',
          icon: Users,
          active: pathname.includes('/users')
        }
      ]
    }

    if (userRole === 'faculty') {
      return [
        ...baseItems,
        {
          href: `/dashboard/${userRole}/schedule`,
          label: 'My Schedule',
          icon: Calendar,
          active: pathname.includes('/schedule')
        },
        {
          href: `/dashboard/${userRole}/subjects`,
          label: 'My Subjects',
          icon: BookOpen,
          active: pathname.includes('/subjects')
        },
        {
          href: `/dashboard/${userRole}/classes`,
          label: 'My Classes',
          icon: Users,
          active: pathname.includes('/classes')
        }
      ]
    }

    if (userRole === 'student') {
      return [
        ...baseItems,
        {
          href: `/dashboard/${userRole}/schedule`,
          label: 'My Schedule',
          icon: Calendar,
          active: pathname.includes('/schedule')
        },
        {
          href: `/dashboard/${userRole}/subjects`,
          label: 'Subjects',
          icon: BookOpen,
          active: pathname.includes('/subjects')
        },
        {
          href: `/dashboard/${userRole}/classmates`,
          label: 'Classmates',
          icon: Users,
          active: pathname.includes('/classmates')
        }
      ]
    }

    return baseItems
  }

  const navItems = getNavItems()

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin':
        return Settings
      case 'faculty':
        return GraduationCap
      case 'student':
        return User
      default:
        return User
    }
  }

  const RoleIcon = getRoleIcon()

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
        <div className="flex flex-col flex-grow bg-black/20 backdrop-blur-lg border-r border-white/10">
          {/* Logo/Brand */}
          <div className="flex items-center h-16 px-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Timetable</h1>
                <p className="text-xs text-gray-400 capitalize">{userRole} Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <motion.button
                key={item.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  item.active
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* User Profile & Actions */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <RoleIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {userName || 'User'}
                </p>
                <p className="text-xs text-gray-400 capitalize">{userRole}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <ThemeToggle />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between h-16 px-4 bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">Timetable</h1>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-black/20 backdrop-blur-lg border-b border-white/10"
          >
            <nav className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    item.active
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="px-4 py-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <RoleIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {userName || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{userRole}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}
