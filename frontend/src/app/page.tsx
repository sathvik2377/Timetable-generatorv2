"use client"

import { motion } from 'framer-motion'
import { GraduationCap, Users, Calendar, BarChart3, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20" />
      <div className="absolute inset-0 bg-dots-pattern opacity-20 dark:opacity-30" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-float" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-pink-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">AI Academic Timetable</h1>
              <p className="text-sm text-secondary">Smart India Hackathon 2025</p>
            </div>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            <Link href="/nep-2020">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-button text-sm"
              >
                NEP 2020
              </motion.button>
            </Link>

            <Link href="/about">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-button text-sm"
              >
                About
              </motion.button>
            </Link>

            <Link href="/how-to-use">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-button text-sm"
              >
                How to Use
              </motion.button>
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">AI-Powered</span>
              <br />
              <span className="text-high-contrast">Timetable Scheduler</span>
            </h1>
            <p className="text-xl md:text-2xl text-readable max-w-3xl mx-auto leading-relaxed">
              Revolutionizing academic scheduling with intelligent algorithms,
              supporting NEP 2020 guidelines for modern educational institutions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <div className="glass-card px-4 py-2 text-sm text-readable">
              <Sparkles className="w-4 h-4 inline mr-2" />
              OR-Tools Optimization
            </div>
            <div className="glass-card px-4 py-2 text-sm text-readable">
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Real-time Analytics
            </div>
            <div className="glass-card px-4 py-2 text-sm text-readable">
              <Calendar className="w-4 h-4 inline mr-2" />
              Multi-format Export
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-8 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/how-to-use">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                📚 Complete Guide & Setup Instructions
              </motion.button>
            </Link>

            <Link href="/demo-interactive">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                🚀 Try Interactive Demo
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Role Selection Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {/* Admin Card */}
          <Link href="/login?role=admin">
            <motion.div
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              className="glass-card p-8 text-center group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-pulse-glow">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-high-contrast mb-3">Login as Admin</h3>
                <p className="text-readable mb-6">
                  Full access to setup, manage, and generate timetables.
                  Configure institutions, branches, and scheduling parameters.
                </p>
                <div className="flex items-center justify-center text-blue-400 group-hover:text-blue-300">
                  <span className="mr-2">Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Faculty Card */}
          <Link href="/login?role=faculty">
            <motion.div
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              className="glass-card p-8 text-center group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-pulse-glow">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-high-contrast mb-3">Login as Faculty</h3>
                <p className="text-readable mb-6">
                  View your personal schedule, manage availability,
                  and access workload analytics and insights.
                </p>
                <div className="flex items-center justify-center text-green-400 group-hover:text-green-300">
                  <span className="mr-2">View Schedule</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Student Card */}
          <Link href="/login?role=student">
            <motion.div
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              className="glass-card p-8 text-center group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-pulse-glow">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-high-contrast mb-3">Login as Student</h3>
                <p className="text-readable mb-6">
                  Access your class schedule, export to calendar apps,
                  and stay updated with timetable changes.
                </p>
                <div className="flex items-center justify-center text-purple-400 group-hover:text-purple-300">
                  <span className="mr-2">My Classes</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* NEP 2020 Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="glass-card p-8 mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-high-contrast mb-4">NEP 2020 Compliant</h2>
            <p className="text-readable text-lg max-w-3xl mx-auto">
              Our system is designed to support the National Education Policy 2020 guidelines,
              enabling flexible credit systems, skill-based courses, and interdisciplinary learning.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-high-contrast mb-2">Flexible Credits</h3>
              <p className="text-subtitle text-sm">Support for variable credit systems and elective courses</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-high-contrast mb-2">Skill Development</h3>
              <p className="text-subtitle text-sm">Integrated skill-based and vocational course scheduling</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-high-contrast mb-2">Multi-level Support</h3>
              <p className="text-subtitle text-sm">School, College, and University level scheduling</p>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { icon: Sparkles, title: "AI Optimization", desc: "OR-Tools powered scheduling" },
            { icon: Calendar, title: "Multi-format Export", desc: "PDF, Excel, PNG, ICS support" },
            { icon: BarChart3, title: "Analytics Dashboard", desc: "Workload and utilization insights" },
            { icon: Users, title: "Role-based Access", desc: "Admin, Faculty, Student views" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="glass-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-high-contrast mb-2">{feature.title}</h3>
              <p className="text-subtitle text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-subtitle">
        <p>&copy; 2025 Smart India Hackathon. Built with ❤️ for educational institutions worldwide.</p>
      </footer>
    </div>
  )
}
