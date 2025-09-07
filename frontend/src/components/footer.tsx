"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  GraduationCap, 
  Calendar, 
  Users, 
  Settings, 
  BarChart3, 
  BookOpen,
  Edit3,
  Home,
  Info,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin,
  Heart
} from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/about', label: 'About', icon: Info },
    { href: '/nep-2020', label: 'NEP 2020', icon: BookOpen },
    { href: '/demo-interactive', label: 'Interactive Demo', icon: Calendar },
    { href: '/setup-wizard', label: 'Setup Wizard', icon: Settings }
  ]

  const dashboardLinks = [
    { href: '/dashboard/admin', label: 'Admin Dashboard', icon: Settings },
    { href: '/dashboard/admin/timetables', label: 'Manage Timetables', icon: Calendar },
    { href: '/dashboard/admin/users', label: 'User Management', icon: Users },
    { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/faculty/schedule', label: 'Faculty Schedule', icon: BookOpen },
    { href: '/dashboard/student/schedule', label: 'Student Schedule', icon: GraduationCap }
  ]

  const studentLinks = [
    { href: '/dashboard/student', label: 'Student Dashboard', icon: Home },
    { href: '/dashboard/student/schedule', label: 'My Schedule', icon: Calendar },
    { href: '/dashboard/student/subjects', label: 'My Subjects', icon: BookOpen },
    { href: '/dashboard/student/classmates', label: 'Classmates', icon: Users }
  ]

  const legalLinks = [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms-of-service', label: 'Terms of Service' },
    { href: '/cookie-policy', label: 'Cookie Policy' },
    { href: '/disclaimer', label: 'Disclaimer' }
  ]

  return (
    <footer className="bg-black/40 backdrop-blur-lg border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">AI Timetable</h3>
                <p className="text-sm text-gray-400">Scheduler</p>
              </div>
            </motion.div>
            
            <p className="text-gray-400 text-sm leading-relaxed">
              Revolutionizing academic scheduling with AI-powered optimization. 
              Create perfect timetables that balance efficiency, preferences, and constraints.
            </p>

            <div className="flex space-x-4">
              <motion.a
                href="https://github.com/sathvik2377/Timetable-generator"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all"
              >
                <Github className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all"
              >
                <Twitter className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Quick Links</h4>
            <nav className="space-y-2">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
                  >
                    <link.icon className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                    <span className="text-sm">{link.label}</span>
                  </motion.div>
                </Link>
              ))}
            </nav>
          </div>

          {/* Dashboard Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Dashboards</h4>
            <nav className="space-y-2">
              {dashboardLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
                  >
                    <link.icon className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                    <span className="text-sm">{link.label}</span>
                  </motion.div>
                </Link>
              ))}
            </nav>
          </div>

          {/* Student Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Student Portal</h4>
            <nav className="space-y-2">
              {studentLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
                  >
                    <link.icon className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                    <span className="text-sm">{link.label}</span>
                  </motion.div>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h5 className="text-white font-medium">Contact Information</h5>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Mail className="w-4 h-4" />
                  <span>support@aitimetable.edu</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Educational Technology Center</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-white font-medium">Features</h5>
              <div className="text-gray-400 text-sm space-y-1">
                <p>• AI-Powered Optimization</p>
                <p>• Multi-Branch Support</p>
                <p>• Conflict Detection</p>
                <p>• Export to Multiple Formats</p>
                <p>• Real-time Collaboration</p>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-white font-medium">Technology</h5>
              <div className="text-gray-400 text-sm space-y-1">
                <p>• Next.js 14 & React 18</p>
                <p>• Django REST Framework</p>
                <p>• OR-Tools Optimization</p>
                <p>• PostgreSQL Database</p>
                <p>• Tailwind CSS</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-white/10 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap gap-6">
              {legalLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400" />
              <span>for Education</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <div className="space-y-2">
            <p className="text-gray-400 text-sm">
              © {currentYear} AI Academic Timetable Scheduler. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs">
              This software is designed to optimize academic scheduling using advanced algorithms and AI.
              Developed as part of the Smart India Hackathon initiative to revolutionize educational technology.
            </p>
            <p className="text-gray-500 text-xs">
              <strong>Disclaimer:</strong> Please ensure data privacy and security
              measures are implemented before using in production environments.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
