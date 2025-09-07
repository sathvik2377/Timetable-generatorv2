"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Lock, Database, Users, FileText } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </motion.button>
            </Link>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Introduction */}
          <div className="glass-card p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
                <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed">
              At AI Academic Timetable Scheduler, we are committed to protecting your privacy and ensuring 
              the security of your personal information. This Privacy Policy explains how we collect, use, 
              and safeguard your data when you use our timetable scheduling system.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="glass-card p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Information We Collect</h3>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <div>
                <h4 className="font-medium text-white mb-2">Personal Information</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Name, email address, and contact information</li>
                  <li>Educational institution details</li>
                  <li>Role (student, faculty, administrator)</li>
                  <li>Academic credentials and department information</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">Academic Data</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Course schedules and timetable preferences</li>
                  <li>Subject enrollments and teaching assignments</li>
                  <li>Classroom and resource allocations</li>
                  <li>Academic calendar information</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">Usage Information</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>System usage patterns and feature interactions</li>
                  <li>Login times and session duration</li>
                  <li>Device information and browser details</li>
                  <li>IP addresses and location data (if permitted)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Information */}
          <div className="glass-card p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">How We Use Your Information</h3>
            </div>
            
            <div className="space-y-3 text-gray-300 text-sm">
              <p>• <strong>Timetable Generation:</strong> To create optimized schedules based on your preferences and constraints</p>
              <p>• <strong>System Optimization:</strong> To improve our AI algorithms and scheduling efficiency</p>
              <p>• <strong>Communication:</strong> To send important updates about your schedules and system changes</p>
              <p>• <strong>Support:</strong> To provide technical assistance and resolve issues</p>
              <p>• <strong>Analytics:</strong> To understand usage patterns and improve user experience</p>
              <p>• <strong>Compliance:</strong> To meet educational regulations and institutional requirements</p>
            </div>
          </div>

          {/* Data Security */}
          <div className="glass-card p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Data Security</h3>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <p>We implement industry-standard security measures to protect your data:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Technical Safeguards</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>SSL/TLS encryption for data transmission</li>
                    <li>Encrypted database storage</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Administrative Safeguards</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Limited access to personal data</li>
                    <li>Employee training on data protection</li>
                    <li>Regular backup and recovery procedures</li>
                    <li>Incident response protocols</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="glass-card p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Your Rights</h3>
            </div>
            
            <div className="space-y-3 text-gray-300 text-sm">
              <p>• <strong>Access:</strong> Request access to your personal data we hold</p>
              <p>• <strong>Correction:</strong> Request correction of inaccurate or incomplete data</p>
              <p>• <strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</p>
              <p>• <strong>Portability:</strong> Request transfer of your data to another service</p>
              <p>• <strong>Objection:</strong> Object to processing of your data for certain purposes</p>
              <p>• <strong>Restriction:</strong> Request restriction of processing under certain circumstances</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="glass-card p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Contact Us</h3>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> privacy@aitimetable.edu</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Address:</strong> Educational Technology Center, Privacy Office</p>
              </div>
            </div>
          </div>

          {/* Updates */}
          <div className="glass-card p-6 bg-blue-500/10 border border-blue-500/20">
            <h4 className="font-medium text-white mb-2">Policy Updates</h4>
            <p className="text-gray-300 text-sm">
              We may update this Privacy Policy from time to time. We will notify you of any material 
              changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
