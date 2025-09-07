"use client"

import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Users, 
  Target, 
  Lightbulb, 
  Globe, 
  Award,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Zap,
  Heart
} from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export default function NEP2020Page() {
  const nepFeatures = [
    {
      icon: BookOpen,
      title: "Flexible Credit System",
      description: "Support for variable credit courses, allowing students to choose subjects based on interest and career goals.",
      implementation: "Our scheduler handles subjects with different credit values (1-6 credits) and adjusts time allocation accordingly."
    },
    {
      icon: Users,
      title: "Multidisciplinary Learning",
      description: "Students can take courses across different disciplines, breaking traditional academic silos.",
      implementation: "Cross-branch subject scheduling with conflict resolution for students from different departments."
    },
    {
      icon: Target,
      title: "Skill-based Education",
      description: "Integration of vocational training and skill development courses alongside traditional academics.",
      implementation: "Dedicated scheduling for skill development sessions, workshops, and practical training programs."
    },
    {
      icon: Lightbulb,
      title: "Research & Innovation",
      description: "Emphasis on research projects, internships, and innovation-driven learning.",
      implementation: "Flexible time blocks for research projects, thesis work, and industry collaboration sessions."
    },
    {
      icon: Globe,
      title: "Global Standards",
      description: "Alignment with international educational frameworks and quality standards.",
      implementation: "Support for semester systems, GPA calculations, and international credit transfer protocols."
    },
    {
      icon: Award,
      title: "Outcome-based Learning",
      description: "Focus on learning outcomes rather than just curriculum completion.",
      implementation: "Analytics to track learning objectives achievement and competency-based scheduling."
    }
  ]

  const comparisonData = [
    {
      aspect: "Course Structure",
      traditional: "Fixed subjects per semester",
      nep2020: "Flexible choice with major/minor combinations",
      benefit: "Personalized learning paths"
    },
    {
      aspect: "Credit System",
      traditional: "Uniform credits for all subjects",
      nep2020: "Variable credits (1-6) based on complexity",
      benefit: "Better workload distribution"
    },
    {
      aspect: "Assessment",
      traditional: "Annual/Semester exams only",
      nep2020: "Continuous assessment + final exams",
      benefit: "Reduced exam stress"
    },
    {
      aspect: "Skills Focus",
      traditional: "Theoretical knowledge emphasis",
      nep2020: "50% theory + 50% practical/skills",
      benefit: "Industry-ready graduates"
    },
    {
      aspect: "Research Component",
      traditional: "Research only at PhD level",
      nep2020: "Research from undergraduate level",
      benefit: "Innovation mindset development"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-button flex items-center space-x-2"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span>Back to Home</span>
              </motion.button>
            </Link>
            
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">National Education Policy 2025</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">NEP 2020</span>
              <br />
              <span className="text-high-contrast">Compliant Scheduling</span>
            </h1>
            
            <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed mb-8">
              Our AI-powered timetable scheduler is designed from the ground up to support 
              the revolutionary changes introduced by India's National Education Policy 2020.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="glass-card px-4 py-2 text-sm">
                <Heart className="w-4 h-4 inline mr-2 text-red-400" />
                Student-Centric
              </div>
              <div className="glass-card px-4 py-2 text-sm">
                <Zap className="w-4 h-4 inline mr-2 text-yellow-400" />
                Flexible & Dynamic
              </div>
              <div className="glass-card px-4 py-2 text-sm">
                <TrendingUp className="w-4 h-4 inline mr-2 text-green-400" />
                Future-Ready
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What is NEP 2020 */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-card p-8 mb-12"
          >
            <h2 className="text-3xl font-bold text-primary mb-6">What is NEP 2020?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-secondary leading-relaxed mb-4">
                  The National Education Policy (NEP) 2020 is India's comprehensive framework for 
                  transforming the education system. It replaces the previous National Policy on 
                  Education (1986) and introduces revolutionary changes to make education more 
                  flexible, multidisciplinary, and aligned with 21st-century needs.
                </p>
                <p className="text-secondary leading-relaxed">
                  NEP 2020 emphasizes critical thinking, creativity, scientific inquiry, and 
                  innovation while maintaining India's rich cultural heritage and values.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-secondary">Holistic & Multidisciplinary Education</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-secondary">Flexible Curriculum Structure</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-secondary">Multiple Entry & Exit Points</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-secondary">Technology Integration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-secondary">Continuous Assessment</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* NEP 2020 Features Implementation */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-primary mb-4">How We Implement NEP 2020</h2>
            <p className="text-secondary max-w-3xl mx-auto">
              Our timetable scheduler incorporates every major aspect of NEP 2020, 
              ensuring your institution is fully compliant with the new educational framework.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nepFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * index }}
                className="glass-card p-6 hover:scale-105 transition-transform duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">{feature.title}</h3>
                <p className="text-secondary text-sm mb-4">{feature.description}</p>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-blue-300">
                    <strong>Implementation:</strong> {feature.implementation}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Traditional vs NEP 2020 Comparison */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-primary mb-4">Traditional vs NEP 2020</h2>
            <p className="text-secondary max-w-3xl mx-auto">
              See how NEP 2020 transforms the educational landscape compared to traditional approaches.
            </p>
          </motion.div>

          <div className="glass-card p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-primary font-semibold">Aspect</th>
                    <th className="text-left py-4 px-4 text-red-400 font-semibold">Traditional System</th>
                    <th className="text-left py-4 px-4 text-green-400 font-semibold">NEP 2020</th>
                    <th className="text-left py-4 px-4 text-blue-400 font-semibold">Benefit</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium text-primary">{row.aspect}</td>
                      <td className="py-4 px-4 text-secondary text-sm">{row.traditional}</td>
                      <td className="py-4 px-4 text-secondary text-sm">{row.nep2020}</td>
                      <td className="py-4 px-4 text-secondary text-sm">{row.benefit}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="glass-card p-8"
          >
            <h2 className="text-3xl font-bold text-primary mb-4">Ready to Transform Your Institution?</h2>
            <p className="text-secondary mb-8 max-w-2xl mx-auto">
              Join the educational revolution with our NEP 2020 compliant timetable scheduler. 
              Experience the future of academic planning today.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/login?role=admin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg flex items-center space-x-2 font-medium"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              
              <Link href="/about">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-button flex items-center space-x-2 font-medium"
                >
                  <span>Learn More</span>
                  <BookOpen className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
