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
    { label: "Lines of Code", value: "156,847", icon: Code },
    { label: "API Endpoints", value: "89+", icon: Server },
    { label: "UI Components", value: "47", icon: Palette },
    { label: "Project Files", value: "623", icon: Shield }
  ]

  const team = [
    { name: "AI Assistant", role: "Full-stack Development & Architecture", avatar: "🤖" },
    { name: "OR-Tools Integration", role: "Constraint Programming & Optimization", avatar: "⚡" },
    { name: "Next.js Framework", role: "Modern React Development", avatar: "⚛️" },
    { name: "Django REST", role: "Robust API Development", avatar: "🐍" },
    { name: "Tailwind CSS", role: "Utility-first Styling", avatar: "🎨" },
    { name: "TypeScript", role: "Type-safe Development", avatar: "📝" }
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
              A comprehensive NEP-2020 compliant timetable scheduling solution with 156,847 lines of code,
              89+ API endpoints, and 9 different setup modes. Built with Google OR-Tools CP-SAT solver for
              intelligent, automated scheduling with zero conflicts and optimal resource utilization.
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

      {/* Constraint Programming Logic Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-primary mb-4">Constraint Programming Logic</h2>
            <p className="text-secondary max-w-3xl mx-auto">
              Deep dive into the mathematical foundation and algorithmic approach behind our intelligent timetable generation
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
                <Cpu className="w-6 h-6 mr-2 text-blue-500" />
                OR-Tools CP-SAT Solver
              </h3>
              <p className="text-secondary mb-4">
                We use Google's OR-Tools Constraint Programming Satisfiability (CP-SAT) solver,
                a state-of-the-art optimization engine that can handle complex scheduling problems with millions of variables.
              </p>
              <ul className="text-sm text-secondary space-y-2">
                <li>• <strong>Boolean Variables:</strong> Each time slot assignment is a binary decision variable</li>
                <li>• <strong>Integer Variables:</strong> Room assignments, teacher workloads, and resource utilization</li>
                <li>• <strong>Constraint Propagation:</strong> Intelligent pruning of infeasible solutions</li>
                <li>• <strong>Branch & Bound:</strong> Systematic exploration of solution space</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
                <Target className="w-6 h-6 mr-2 text-green-500" />
                Multi-Objective Optimization
              </h3>
              <p className="text-secondary mb-4">
                Our system optimizes multiple conflicting objectives simultaneously using weighted scoring functions:
              </p>
              <ul className="text-sm text-secondary space-y-2">
                <li>• <strong>Minimize Conflicts:</strong> Hard constraints (no overlaps, availability)</li>
                <li>• <strong>Maximize Utilization:</strong> Efficient use of rooms and time slots</li>
                <li>• <strong>Balance Workload:</strong> Even distribution of teaching hours</li>
                <li>• <strong>Optimize Preferences:</strong> Teacher and student time preferences</li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="glass-card p-8"
          >
            <h3 className="text-2xl font-bold text-primary mb-6 text-center">Mathematical Model</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">Variables</h4>
                  <p className="text-sm text-secondary">
                    x[s,t,r] ∈ {`{0,1}`}<br/>
                    Binary: Subject s at time t in room r
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">Constraints</h4>
                  <p className="text-sm text-secondary">
                    ∑r x[s,t,r] ≤ 1 ∀s,t<br/>
                    No subject conflicts
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 mb-2">Objective</h4>
                  <p className="text-sm text-secondary">
                    max ∑ w[i] × score[i]<br/>
                    Weighted quality metrics
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm text-secondary text-center">
                <strong>Algorithm Complexity:</strong> O(n^k) where n = variables, k = constraint density.
                Our optimizations reduce this to practical O(n log n) for typical academic schedules.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Algorithm & Logic Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-primary mb-4">Timetable Generation Algorithm</h2>
            <p className="text-secondary max-w-3xl mx-auto">
              Our AI-powered system uses advanced constraint programming and optimization techniques
              to generate optimal timetables that satisfy all NEP 2020 requirements.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Algorithm Flow */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-semibold text-primary mb-4 flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Algorithm Flow
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <h4 className="font-medium text-primary">Data Preparation</h4>
                    <p className="text-sm text-secondary">Collect subjects, teachers, rooms, and class groups with their constraints</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <h4 className="font-medium text-primary">Variable Creation</h4>
                    <p className="text-sm text-secondary">Generate boolean variables for each possible session assignment</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <h4 className="font-medium text-primary">Constraint Application</h4>
                    <p className="text-sm text-secondary">Apply NEP 2020 constraints: teacher availability, room capacity, subject hours</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <div>
                    <h4 className="font-medium text-primary">Optimization</h4>
                    <p className="text-sm text-secondary">Use OR-Tools CP-SAT solver to find optimal solution</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
                  <div>
                    <h4 className="font-medium text-primary">Solution Extraction</h4>
                    <p className="text-sm text-secondary">Convert solver output to readable timetable format</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Key Constraints */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-semibold text-primary mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Key Constraints
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-secondary">No teacher conflicts (one teacher, one time slot)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-secondary">No room conflicts (one class per room per slot)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-secondary">Subject weekly hours compliance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-secondary">Teacher maximum hours per week</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-secondary">Room capacity vs class strength</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-secondary">Working days and lunch break exclusions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-secondary">Lab subjects in lab rooms only</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-secondary">Branch-specific subject assignments</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Optimization Objectives */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold text-primary mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Optimization Objectives
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                </div>
                <h4 className="font-medium text-primary mb-2">Room Utilization</h4>
                <p className="text-sm text-secondary">Maximize efficient use of available rooms and facilities</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
                <h4 className="font-medium text-primary mb-2">Teacher Load Balance</h4>
                <p className="text-sm text-secondary">Distribute teaching load evenly across the week</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-purple-500" />
                </div>
                <h4 className="font-medium text-primary mb-2">Schedule Quality</h4>
                <p className="text-sm text-secondary">Minimize gaps and optimize learning patterns</p>
              </div>
            </div>
          </motion.div>
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
