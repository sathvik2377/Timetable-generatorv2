"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, LogIn, ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios' // <-- Add this import
import { ThemeToggle } from '@/components/theme-toggle'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'admin'

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Set default credentials based on role
  useEffect(() => {
    const defaultCredentials = {
      admin: { email: 'admin@demo.local', password: 'demo123' },
      faculty: { email: 'anita@college.edu.in', password: 'demo123' },
      student: { email: 'student@demo.local', password: 'demo123' }
    }

    const defaults = defaultCredentials[role as keyof typeof defaultCredentials] || defaultCredentials.admin
    setFormData(defaults)
  }, [role])

  // Corrected handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Use JWT token endpoint
      const response = await axios.post('http://localhost:8000/api/auth/token/', {
        email: formData.email,
        password: formData.password
      })

      // Store tokens (JWT endpoint returns access and refresh directly)
      Cookies.set('access_token', response.data.access, { expires: 1 })
      Cookies.set('refresh_token', response.data.refresh, { expires: 7 })

      // Create user object from token (we'll need to get user data separately)
      const userRole = formData.email.includes('admin') ? 'admin' :
                      formData.email.includes('faculty') ? 'faculty' : 'student'
      const userData = {
        id: 1,
        email: formData.email,
        role: userRole,
        first_name: userRole.charAt(0).toUpperCase() + userRole.slice(1),
        last_name: 'User'
      }
      localStorage.setItem('user', JSON.stringify(userData))

      toast.success(`Welcome back, ${userData.first_name}!`)

      // Redirect based on role
      const redirectMap: Record<'admin' | 'faculty' | 'student', string> = {
        admin: '/dashboard/admin',
        faculty: '/dashboard/faculty',
        student: '/dashboard/student'
      }
      const redirectPath = redirectMap[userRole] || '/dashboard'

      router.push(redirectPath)

    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        'Login failed. Please check your credentials.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleInfo = () => {
    const roleInfo = {
      admin: {
        title: 'Admin Login',
        description: 'Access the full administrative dashboard',
        color: 'from-blue-500 to-blue-600',
        bgColor: 'from-blue-500/10 to-purple-500/10'
      },
      faculty: {
        title: 'Faculty Login',
        description: 'View your schedule and manage availability',
        color: 'from-green-500 to-green-600',
        bgColor: 'from-green-500/10 to-emerald-500/10'
      },
      student: {
        title: 'Student Login',
        description: 'Access your class schedule and calendar',
        color: 'from-purple-500 to-purple-600',
        bgColor: 'from-purple-500/10 to-pink-500/10'
      }
    }
    return roleInfo[role as keyof typeof roleInfo] || roleInfo.admin
  }

  const roleInfo = getRoleInfo()

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
    <div className="absolute inset-0 bg-dots-pattern opacity-30" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-float" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-button flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </motion.button>
          </Link>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-md mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-8 relative overflow-hidden"
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-r ${roleInfo.bgColor} opacity-50`} />

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className={`w-16 h-16 bg-gradient-to-r ${roleInfo.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{roleInfo.title}</h1>
              <p className="text-gray-300">{roleInfo.description}</p>
            </div>

            {/* Demo Credentials Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-blue-300 mb-1">Demo Credentials</h3>
                  <p className="text-xs text-blue-200/80">
                    Pre-filled credentials for quick testing. You can modify them if needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </motion.div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 pr-12 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 bg-gradient-to-r ${roleInfo.color} text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
              >
                {isLoading ? (
                  <>
                    <div className="spinner" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Role Switcher */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-sm text-gray-400 text-center mb-4">Switch Role</p>
              <div className="flex space-x-2">
                {['admin', 'faculty', 'student'].map((r) => (
                  <Link key={r} href={`/login?role=${r}`} className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-full py-2 px-3 text-xs rounded-lg transition-all ${r === role
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </motion.button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}