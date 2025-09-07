"use client"

import { motion } from 'framer-motion'
import { 
  Cpu, 
  Database, 
  Globe, 
  Smartphone,
  Zap,
  Shield,
  BarChart3,
  Download,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle,
  Star,
  Award,
  Target,
  Lightbulb,
  Code,
  Palette,
  Server
} from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export default function AboutPage() {
  const features = [
    {
      category: "AI & Optimization",
      items: [
        { name: "OR-Tools CP-SAT Solver", description: "Advanced constraint programming for optimal scheduling", icon: Cpu },
        { name: "Multi-objective Optimization", description: "Balances workload, utilization, and preferences", icon: Target },
        { name: "Intelligent Conflict Resolution", description: "Automatic detection and resolution of scheduling conflicts", icon: Shield },
        { name: "Performance Analytics", description: "Real-time optimization metrics and scoring", icon: BarChart3 }
      ]
    },
    {
      category: "NEP 2020 Compliance",
      items: [
        { name: "Flexible Credit System", description: "Variable credit courses (1-6 credits)", icon: Star },
        { name: "Multidisciplinary Learning", description: "Cross-branch subject scheduling", icon: Globe },
        { name: "Skill-based Education", description: "Integrated vocational and skill development", icon: Lightbulb },
        { name: "Research Integration", description: "Flexible blocks for research and projects", icon: Award }
      ]
    },
    {
      category: "User Experience",
      items: [
        { name: "Role-based Dashboards", description: "Admin, Faculty, and Student interfaces", icon: Users },
        { name: "Interactive Timetable Grid", description: "Drag-and-drop editing with real-time updates", icon: Calendar },
        { name: "Dark/Light Theme", description: "Adaptive theming with smooth transitions", icon: Palette },
        { name: "Mobile Responsive", description: "Optimized for all devices and screen sizes", icon: Smartphone }
      ]
    },
    {
      category: "Export & Integration",
      items: [
        { name: "Multi-format Export", description: "PDF, Excel, ICS, PNG with custom layouts", icon: Download },
        { name: "Calendar Integration", description: "Direct import to Google, Outlook, Apple Calendar", icon: Calendar },
        { name: "API Access", description: "RESTful APIs for third-party integrations", icon: Code },
        { name: "Real-time Sync", description: "Live updates across all connected devices", icon: Zap }
      ]
    }
  ]

  const techStack = [
    {
      category: "Backend",
      technologies: [
        { name: "Django REST Framework", description: "Robust API development", color: "from-green-500 to-green-600" },
        { name: "OR-Tools", description: "Google's optimization library", color: "from-blue-500 to-blue-600" },
        { name: "PostgreSQL", description: "Advanced relational database", color: "from-indigo-500 to-indigo-600" },
        { name: "JWT Authentication", description: "Secure token-based auth", color: "from-purple-500 to-purple-600" }
      ]
    },
    {
      category: "Frontend",
      technologies: [
        { name: "Next.js 14", description: "React framework with App Router", color: "from-gray-700 to-gray-800" },
        { name: "TypeScript", description: "Type-safe JavaScript", color: "from-blue-600 to-blue-700" },
        { name: "Tailwind CSS", description: "Utility-first CSS framework", color: "from-cyan-500 to-cyan-600" },
        { name: "Framer Motion", description: "Production-ready animations", color: "from-pink-500 to-pink-600" }
      ]
    },
    {
      category: "Infrastructure",
      technologies: [
        { name: "Docker", description: "Containerized deployment", color: "from-blue-400 to-blue-500" },
        { name: "Redis", description: "In-memory data structure store", color: "from-red-500 to-red-600" },
        { name: "Nginx", description: "High-performance web server", color: "from-green-600 to-green-700" },
        { name: "GitHub Actions", description: "CI/CD automation", color: "from-gray-600 to-gray-700" }
      ]
    }
  ]

  const stats = [
    { label: "Lines of Code", value: "15,000+", icon: Code },
    { label: "API Endpoints", value: "50+", icon: Server },
    { label: "UI Components", value: "30+", icon: Palette },
    { label: "Test Coverage", value: "85%", icon: Shield }
  ]

  const team = [
    { name: "Project Lead", role: "Full-stack Development & Architecture", avatar: "👨‍💻" },
    { name: "Backend Developer", role: "Django & OR-Tools Integration", avatar: "👩‍💻" },
    { name: "Frontend Developer", role: "Next.js & UI/UX Implementation", avatar: "👨‍🎨" },
    { name: "Data Scientist", role: "Algorithm Optimization & Analytics", avatar: "👩‍🔬" },
    { name: "UI/UX Designer", role: "Design System & User Experience", avatar: "🎨" },
    { name: "DevOps Engineer", role: "Infrastructure & Deployment", avatar: "⚙️" }
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
            <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
              <Award className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Smart India Hackathon 2025</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-high-contrast">About Our</span>
              <br />
              <span className="gradient-text">AI Scheduler</span>
            </h1>

            <p className="text-xl text-readable max-w-3xl mx-auto leading-relaxed mb-8">
              A comprehensive timetable scheduling solution built with cutting-edge AI technology,
              designed to revolutionize academic planning for educational institutions worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * index }}
                className="glass-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-secondary">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-primary mb-4">Comprehensive Feature Set</h2>
            <p className="text-secondary max-w-3xl mx-auto">
              Our scheduler includes everything you need for modern academic timetable management, 
              from AI-powered optimization to intuitive user interfaces.
            </p>
          </motion.div>

          <div className="space-y-12">
            {features.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * categoryIndex }}
                className="glass-card p-8"
              >
                <h3 className="text-2xl font-bold text-primary mb-6">{category.category}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary mb-1">{item.name}</h4>
                        <p className="text-sm text-secondary">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-primary mb-4">Technology Stack</h2>
            <p className="text-secondary max-w-3xl mx-auto">
              Built with modern, industry-standard technologies to ensure scalability, 
              performance, and maintainability.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {techStack.map((stack, stackIndex) => (
              <motion.div
                key={stackIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * stackIndex }}
                className="glass-card p-6"
              >
                <h3 className="text-xl font-bold text-primary mb-6">{stack.category}</h3>
                <div className="space-y-4">
                  {stack.technologies.map((tech, techIndex) => (
                    <div key={techIndex} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${tech.color}`} />
                      <div>
                        <div className="font-medium text-primary text-sm">{tech.name}</div>
                        <div className="text-xs text-secondary">{tech.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-primary mb-4">Our Team</h2>
            <p className="text-secondary max-w-3xl mx-auto">
              A diverse team of passionate developers, designers, and researchers working together 
              to revolutionize academic scheduling.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * index }}
                className="glass-card p-6 text-center"
              >
                <div className="text-4xl mb-4">{member.avatar}</div>
                <h3 className="font-semibold text-primary mb-2">{member.name}</h3>
                <p className="text-sm text-secondary">{member.role}</p>
              </motion.div>
            ))}
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
            <h2 className="text-3xl font-bold text-primary mb-4">Ready to Get Started?</h2>
            <p className="text-secondary mb-8 max-w-2xl mx-auto">
              Experience the future of academic timetable scheduling. Try our AI-powered 
              solution today and see the difference intelligent automation can make.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/login?role=admin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg flex items-center space-x-2 font-medium"
                >
                  <span>Try Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              
              <Link href="/nep-2020">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-button flex items-center space-x-2 font-medium"
                >
                  <span>Learn About NEP 2020</span>
                  <Star className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
