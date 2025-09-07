"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronLeft,
  School,
  GraduationCap,
  Building2,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Brain,
  Lightbulb,
  Target,
  Users,
  BookOpen,
  MapPin,
  Clock,
  Settings,
  Info,
  Download,
  Upload,
  FileSpreadsheet,
  Zap,
  TrendingUp,
  Shield,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { templateManager } from '@/lib/templateManager'
import { smartSuggestionsEngine } from '@/lib/smartSuggestions'
import toast from 'react-hot-toast'

interface SetupWizardProps {
  onComplete: () => void
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [smartSuggestions, setSmartSuggestions] = useState<any[]>([])
  const [validationErrors, setValidationErrors] = useState<any[]>([])
  const [optimizationScore, setOptimizationScore] = useState(0)
  const [showTemplateUpload, setShowTemplateUpload] = useState(false)
  const [uploadedData, setUploadedData] = useState<any>({})
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([])
  const [stepCompletion, setStepCompletion] = useState<boolean[]>(new Array(8).fill(false))
  
  const [formData, setFormData] = useState({
    institutionType: '',
    institution: {
      name: '',
      type: '',
      address: '',
      phone: '',
      email: '',
      academic_year: '2024-25',
      start_time: '09:00',
      end_time: '17:00',
      slot_duration: 60,
      lunch_break_start: '13:00',
      lunch_break_end: '14:00',
      working_days: [0, 1, 2, 3, 4] // Monday to Friday
    },
    branches: [{ name: '', code: '', description: '' }],
    subjects: [{ code: '', name: '', type: 'core', credits: 3, semester: 1, year: 1, theory_hours: 3, practical_hours: 0 }],
    teachers: [{ name: '', email: '', employee_id: '', designation: 'assistant_professor', specialization: '' }],
    rooms: [{ name: '', code: '', type: 'classroom', capacity: 60, building: '', floor: 1 }],
    classGroups: [{ name: '', year: 1, section: 'A', semester: 1, strength: 60 }]
  })

  const steps = [
    {
      title: 'Smart Institution Setup',
      description: 'AI-powered institution configuration with intelligent recommendations',
      icon: Sparkles,
      features: ['AI Recommendations', 'Smart Defaults', 'Best Practices']
    },
    {
      title: 'Intelligent Data Collection',
      description: 'Upload templates or use smart forms with validation',
      icon: Brain,
      features: ['Excel Templates', 'Bulk Upload', 'Smart Validation']
    },
    {
      title: 'Branch Intelligence',
      description: 'Multi-branch setup with resource optimization',
      icon: Target,
      features: ['Multi-Branch Support', 'Resource Sharing', 'Load Balancing']
    },
    {
      title: 'Smart Subject Management',
      description: 'Curriculum planning with AI suggestions',
      icon: BookOpen,
      features: ['Credit Optimization', 'Prerequisite Mapping', 'Workload Analysis']
    },
    {
      title: 'Faculty Optimization',
      description: 'Teacher assignment with expertise matching',
      icon: Users,
      features: ['Skill Matching', 'Workload Distribution', 'Conflict Prevention']
    },
    {
      title: 'Facility Intelligence',
      description: 'Smart room allocation and resource management',
      icon: MapPin,
      features: ['Capacity Optimization', 'Equipment Matching', 'Utilization Analysis']
    },
    {
      title: 'Schedule Preferences',
      description: 'Intelligent timing and constraint configuration',
      icon: Clock,
      features: ['Optimal Timing', 'Break Management', 'Conflict Resolution']
    },
    {
      title: 'AI Validation & Preview',
      description: 'Smart validation with optimization preview',
      icon: CheckCircle,
      features: ['Conflict Detection', 'Performance Metrics', 'Optimization Score']
    }
  ]

  // Smart features and AI functions
  useEffect(() => {
    generateSmartSuggestions()
    calculateOptimizationScore()
  }, [formData, currentStep])

  const generateSmartSuggestions = () => {
    try {
      const suggestions = smartSuggestionsEngine.generateSuggestions({
        branches: formData.branches.map(b => ({
          name: b.name,
          code: b.code,
          totalStudents: 100,
          sections: 2,
          yearLevel: 1
        })),
        teachers: formData.teachers.map(t => ({
          name: t.name,
          employeeId: t.employee_id,
          email: t.email,
          department: t.specialization,
          subjects: [t.specialization],
          maxHoursPerDay: 6
        })),
        subjects: formData.subjects.map(s => ({
          name: s.name,
          code: s.code,
          type: s.type as any,
          credits: s.credits,
          contactHours: s.theory_hours + s.practical_hours,
          branch: 'General',
          semester: s.semester
        })),
        rooms: formData.rooms.map(r => ({
          name: r.name,
          type: r.type as any,
          capacity: r.capacity,
          equipment: [],
          branch: undefined
        })),
        preferences: {
          startTime: formData.institution.start_time,
          endTime: formData.institution.end_time,
          lunchBreak: `${formData.institution.lunch_break_start}-${formData.institution.lunch_break_end}`,
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          periodDuration: formData.institution.slot_duration
        }
      })
      setSmartSuggestions(suggestions)
    } catch (error) {
      console.error('Error generating suggestions:', error)
    }
  }

  const calculateOptimizationScore = () => {
    let score = 0
    const weights = {
      branches: 15,
      subjects: 20,
      teachers: 25,
      rooms: 20,
      institution: 20
    }

    // Calculate score based on data completeness and quality
    if (formData.branches.length > 0 && formData.branches[0].name) score += weights.branches
    if (formData.subjects.length > 0 && formData.subjects[0].name) score += weights.subjects
    if (formData.teachers.length > 0 && formData.teachers[0].name) score += weights.teachers
    if (formData.rooms.length > 0 && formData.rooms[0].name) score += weights.rooms
    if (formData.institution.name) score += weights.institution

    setOptimizationScore(score)
  }

  const handleTemplateUpload = async (file: File, type: string) => {
    try {
      const data = await templateManager.parseExcelFile(file, type as any)
      setUploadedData(prev => ({ ...prev, [type]: data }))

      // Apply uploaded data to form
      if (type === 'branches' && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          branches: data.map((item: any) => ({
            name: item.branchname || item.name,
            code: item.branchcode || item.code,
            description: item.description || ''
          }))
        }))
      }

      toast.success(`${type} data uploaded successfully! (${data.length} entries)`)
    } catch (error) {
      toast.error(`Failed to upload ${type} data`)
    }
  }

  const generateAIRecommendations = () => {
    const recommendations = []

    // Smart recommendations based on current data
    if (formData.branches.length === 0) {
      recommendations.push({
        type: 'warning',
        title: 'Add Academic Branches',
        description: 'Define at least one academic branch to organize your curriculum',
        action: () => setCurrentStep(2)
      })
    }

    if (formData.teachers.length < formData.subjects.length) {
      recommendations.push({
        type: 'suggestion',
        title: 'Teacher-Subject Ratio',
        description: 'Consider adding more teachers to maintain optimal teaching loads',
        action: () => setCurrentStep(4)
      })
    }

    if (formData.rooms.length === 0) {
      recommendations.push({
        type: 'error',
        title: 'No Facilities Defined',
        description: 'Add classrooms and labs for proper space allocation',
        action: () => setCurrentStep(5)
      })
    }

    setAiRecommendations(recommendations)
  }

  const institutionTypes = [
    {
      id: 'school',
      title: 'School Level',
      description: 'Primary and secondary education with uniform periods and fixed subjects',
      icon: School,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'college',
      title: 'College Level', 
      description: 'Undergraduate programs with branch-based subjects and flexible credits',
      icon: GraduationCap,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'university',
      title: 'University Level',
      description: 'Graduate programs with semester-based scheduling and research flexibility',
      icon: Building2,
      color: 'from-purple-500 to-purple-600'
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Create institution
      const institution = await apiClient.createInstitution({
        ...formData.institution,
        type: formData.institutionType as 'school' | 'college' | 'university'
      })

      // Create branches
      const createdBranches = []
      for (const branch of formData.branches) {
        if (branch.name && branch.code) {
          const createdBranch = await apiClient.createBranch({
            ...branch,
            institution: institution.id
          })
          createdBranches.push(createdBranch)
        }
      }

      // Create subjects
      for (const subject of formData.subjects) {
        if (subject.name && subject.code && createdBranches.length > 0) {
          await apiClient.createSubject({
            ...subject,
            type: subject.type as 'core' | 'elective' | 'lab' | 'skill' | 'project',
            branch: createdBranches[0].id // Assign to first branch for now
          })
        }
      }

      // Create rooms
      for (const room of formData.rooms) {
        if (room.name && room.code) {
          await apiClient.createRoom({
            ...room,
            type: room.type as 'classroom' | 'laboratory' | 'seminar_hall' | 'auditorium' | 'library',
            institution: institution.id
          })
        }
      }

      // Create class groups
      for (const classGroup of formData.classGroups) {
        if (classGroup.name && createdBranches.length > 0) {
          await apiClient.createClassGroup({
            ...classGroup,
            branch: createdBranches[0].id
          })
        }
      }

      toast.success('Institution setup completed successfully!')
      onComplete()
      
    } catch (error) {
      console.error('Setup error:', error)
      toast.error('Failed to complete setup. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addItem = (field: string) => {
    const newItem = {
      branches: { name: '', code: '', description: '' },
      subjects: { code: '', name: '', type: 'core', credits: 3, semester: 1, year: 1, theory_hours: 3, practical_hours: 0 },
      teachers: { name: '', email: '', employee_id: '', designation: 'assistant_professor', specialization: '' },
      rooms: { name: '', code: '', type: 'classroom', capacity: 60, building: '', floor: 1 },
      classGroups: { name: '', year: 1, section: 'A', semester: 1, strength: 60 }
    }[field]

    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field as keyof typeof prev] as any[], newItem]
    }))
  }

  const removeItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as any[]).filter((_, i) => i !== index)
    }))
  }

  const updateItem = (field: string, index: number, updates: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as any[]).map((item, i) => 
        i === index ? { ...item, ...updates } : item
      )
    }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Choose Your Institution Type</h2>
              <p className="text-gray-300">This will customize the scheduling logic for your needs</p>
            </div>
            
            <div className="grid gap-4">
              {institutionTypes.map((type) => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    institutionType: type.id,
                    institution: { ...prev.institution, type: type.id }
                  }))}
                  className={`glass-card p-6 text-left transition-all ${
                    formData.institutionType === type.id 
                      ? 'ring-2 ring-blue-500 bg-blue-500/10' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${type.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <type.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{type.title}</h3>
                      <p className="text-gray-300 text-sm">{type.description}</p>
                    </div>
                    {formData.institutionType === type.id && (
                      <Check className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Institution Details</h2>
              <p className="text-gray-300">Basic information and academic settings</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Institution Name</label>
                <input
                  type="text"
                  value={formData.institution.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    institution: { ...prev.institution, name: e.target.value }
                  }))}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter institution name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Academic Year</label>
                <input
                  type="text"
                  value={formData.institution.academic_year}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    institution: { ...prev.institution, academic_year: e.target.value }
                  }))}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="2024-25"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.institution.start_time}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    institution: { ...prev.institution, start_time: e.target.value }
                  }))}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.institution.end_time}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    institution: { ...prev.institution, end_time: e.target.value }
                  }))}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Slot Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.institution.slot_duration}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    institution: { ...prev.institution, slot_duration: parseInt(e.target.value) }
                  }))}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  min="30"
                  max="120"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.institution.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    institution: { ...prev.institution, email: e.target.value }
                  }))}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="admin@institute.edu.in"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
              <textarea
                value={formData.institution.address}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  institution: { ...prev.institution, address: e.target.value }
                }))}
                className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows={3}
                placeholder="Enter institution address"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Branches & Departments</h2>
              <p className="text-gray-300">Define academic divisions and departments</p>
            </div>

            <div className="space-y-4">
              {formData.branches.map((branch, index) => (
                <div key={index} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-white">Branch {index + 1}</h4>
                    {formData.branches.length > 1 && (
                      <button
                        onClick={() => removeItem('branches', index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Branch Name</label>
                      <input
                        type="text"
                        value={branch.name}
                        onChange={(e) => updateItem('branches', index, { name: e.target.value })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Computer Science"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Branch Code</label>
                      <input
                        type="text"
                        value={branch.code}
                        onChange={(e) => updateItem('branches', index, { code: e.target.value })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="CSE"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <input
                        type="text"
                        value={branch.description}
                        onChange={(e) => updateItem('branches', index, { description: e.target.value })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Computer Science & Engineering"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => addItem('branches')}
                className="w-full glass-card p-4 border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors flex items-center justify-center space-x-2 text-gray-400 hover:text-blue-400"
              >
                <Plus className="w-5 h-5" />
                <span>Add Another Branch</span>
              </button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Subjects & Courses</h2>
              <p className="text-gray-300">Define academic subjects and their details</p>
            </div>

            <div className="space-y-4">
              {formData.subjects.map((subject, index) => (
                <div key={index} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-white">Subject {index + 1}</h4>
                    {formData.subjects.length > 1 && (
                      <button
                        onClick={() => removeItem('subjects', index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Subject Code</label>
                      <input
                        type="text"
                        value={subject.code}
                        onChange={(e) => updateItem('subjects', index, { code: e.target.value })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="CS101"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Subject Name</label>
                      <input
                        type="text"
                        value={subject.name}
                        onChange={(e) => updateItem('subjects', index, { name: e.target.value })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Programming Fundamentals"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                      <select
                        value={subject.type}
                        onChange={(e) => updateItem('subjects', index, { type: e.target.value })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="core">Core</option>
                        <option value="elective">Elective</option>
                        <option value="lab">Lab</option>
                        <option value="skill">Skill Development</option>
                        <option value="project">Project</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Credits</label>
                      <input
                        type="number"
                        value={subject.credits}
                        onChange={(e) => updateItem('subjects', index, { credits: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        min="1"
                        max="6"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                      <input
                        type="number"
                        value={subject.year}
                        onChange={(e) => updateItem('subjects', index, { year: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        min="1"
                        max="4"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Semester</label>
                      <input
                        type="number"
                        value={subject.semester}
                        onChange={(e) => updateItem('subjects', index, { semester: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        min="1"
                        max="8"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Theory Hours</label>
                      <input
                        type="number"
                        value={subject.theory_hours}
                        onChange={(e) => updateItem('subjects', index, { theory_hours: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        min="0"
                        max="10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Practical Hours</label>
                      <input
                        type="number"
                        value={subject.practical_hours}
                        onChange={(e) => updateItem('subjects', index, { practical_hours: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        min="0"
                        max="10"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => addItem('subjects')}
                className="w-full glass-card p-4 border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors flex items-center justify-center space-x-2 text-gray-400 hover:text-blue-400"
              >
                <Plus className="w-5 h-5" />
                <span>Add Another Subject</span>
              </button>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Faculty & Teachers</h2>
              <p className="text-gray-300">Add teaching staff and their details</p>
            </div>

            <div className="space-y-4">
              {formData.teachers.map((teacher, index) => (
                <div key={index} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-white">Teacher {index + 1}</h4>
                    {formData.teachers.length > 1 && (
                      <button
                        onClick={() => removeItem('teachers', index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={teacher.name}
                        onChange={(e) => updateItem('teachers', index, { name: e.target.value })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Dr. Rajesh Kumar"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={teacher.email}
                        onChange={(e) => updateItem('teachers', index, { email: e.target.value })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="rajesh.kumar@institute.edu.in"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Employee ID</label>
                      <input
                        type="text"
                        value={teacher.employee_id}
                        onChange={(e) => updateItem('teachers', index, { employee_id: e.target.value })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="EMP001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Designation</label>
                      <select
                        value={teacher.designation}
                        onChange={(e) => updateItem('teachers', index, { designation: e.target.value })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="professor">Professor</option>
                        <option value="associate_professor">Associate Professor</option>
                        <option value="assistant_professor">Assistant Professor</option>
                        <option value="lecturer">Lecturer</option>
                        <option value="visiting_faculty">Visiting Faculty</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Specialization</label>
                      <input
                        type="text"
                        value={teacher.specialization}
                        onChange={(e) => updateItem('teachers', index, { specialization: e.target.value })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Computer Networks, Machine Learning"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => addItem('teachers')}
                className="w-full glass-card p-4 border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors flex items-center justify-center space-x-2 text-gray-400 hover:text-blue-400"
              >
                <Plus className="w-5 h-5" />
                <span>Add Another Teacher</span>
              </button>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Rooms & Facilities</h2>
              <p className="text-gray-300">Define classrooms and laboratory spaces</p>
            </div>

            <div className="space-y-4">
              {formData.rooms.map((room, index) => (
                <div key={index} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-white">Room {index + 1}</h4>
                    {formData.rooms.length > 1 && (
                      <button
                        onClick={() => removeItem('rooms', index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Room Name</label>
                      <input
                        type="text"
                        value={room.name}
                        onChange={(e) => updateItem('rooms', index, { name: e.target.value })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Room 101"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Room Code</label>
                      <input
                        type="text"
                        value={room.code}
                        onChange={(e) => updateItem('rooms', index, { code: e.target.value })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="R101"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                      <select
                        value={room.type}
                        onChange={(e) => updateItem('rooms', index, { type: e.target.value })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="classroom">Classroom</option>
                        <option value="laboratory">Laboratory</option>
                        <option value="seminar_hall">Seminar Hall</option>
                        <option value="auditorium">Auditorium</option>
                        <option value="library">Library</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Capacity</label>
                      <input
                        type="number"
                        value={room.capacity}
                        onChange={(e) => updateItem('rooms', index, { capacity: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        min="10"
                        max="500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Building</label>
                      <input
                        type="text"
                        value={room.building}
                        onChange={(e) => updateItem('rooms', index, { building: e.target.value })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Main Building"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Floor</label>
                      <input
                        type="number"
                        value={room.floor}
                        onChange={(e) => updateItem('rooms', index, { floor: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        min="0"
                        max="20"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => addItem('rooms')}
                className="w-full glass-card p-4 border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors flex items-center justify-center space-x-2 text-gray-400 hover:text-blue-400"
              >
                <Plus className="w-5 h-5" />
                <span>Add Another Room</span>
              </button>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Class Groups</h2>
              <p className="text-gray-300">Define student groups and sections</p>
            </div>

            <div className="space-y-4">
              {formData.classGroups.map((classGroup, index) => (
                <div key={index} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-white">Class Group {index + 1}</h4>
                    {formData.classGroups.length > 1 && (
                      <button
                        onClick={() => removeItem('classGroups', index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Group Name</label>
                      <input
                        type="text"
                        value={classGroup.name}
                        onChange={(e) => updateItem('classGroups', index, { name: e.target.value })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="CSE-1A"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                      <input
                        type="number"
                        value={classGroup.year}
                        onChange={(e) => updateItem('classGroups', index, { year: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        min="1"
                        max="4"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Section</label>
                      <input
                        type="text"
                        value={classGroup.section}
                        onChange={(e) => updateItem('classGroups', index, { section: e.target.value })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="A"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Semester</label>
                      <input
                        type="number"
                        value={classGroup.semester}
                        onChange={(e) => updateItem('classGroups', index, { semester: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        min="1"
                        max="8"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Student Strength</label>
                      <input
                        type="number"
                        value={classGroup.strength}
                        onChange={(e) => updateItem('classGroups', index, { strength: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        min="10"
                        max="200"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => addItem('classGroups')}
                className="w-full glass-card p-4 border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors flex items-center justify-center space-x-2 text-gray-400 hover:text-blue-400"
              >
                <Plus className="w-5 h-5" />
                <span>Add Another Class Group</span>
              </button>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Step Under Development</h3>
            <p className="text-gray-400">This step is being implemented. Please continue to the next step.</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Header with AI Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">AI-Powered Setup Wizard</h1>
            <Brain className="w-8 h-8 text-purple-400 ml-3" />
          </div>
          <p className="text-gray-300 text-lg">Intelligent timetable system configuration with smart recommendations</p>
        </div>

        {/* Smart Progress Bar */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center mb-3 mx-auto transition-all duration-300
                  ${index <= currentStep
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-400'
                  }
                  ${index === currentStep ? 'ring-4 ring-blue-400 ring-opacity-50 animate-pulse' : ''}
                `}>
                  {stepCompletion[index] ? (
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  ) : (
                    <step.icon className="w-8 h-8" />
                  )}
                </div>

                <h4 className="text-sm font-medium text-white mb-2">{step.title}</h4>
                <div className="flex flex-wrap gap-1 justify-center">
                  {step.features?.map((feature, fIndex) => (
                    <span key={fIndex} className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Current Step Info with Smart Features */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2 flex items-center">
                  {React.createElement(steps[currentStep].icon, { className: "w-6 h-6 mr-3 text-blue-400" })}
                  {steps[currentStep].title}
                </h3>
                <p className="text-gray-300 text-lg">
                  {steps[currentStep].description}
                </p>
              </div>

              {/* Optimization Score */}
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">{optimizationScore}%</div>
                <div className="text-sm text-gray-400">Setup Score</div>
                <div className="w-20 h-2 bg-gray-700 rounded-full mt-2">
                  <div className={`h-2 rounded-full transition-all duration-300 ${
                    optimizationScore >= 80 ? 'bg-green-500' :
                    optimizationScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} style={{ width: `${optimizationScore}%` }} />
                </div>
              </div>
            </div>

            {/* Smart Suggestions Panel */}
            {smartSuggestions.length > 0 && (
              <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-700">
                <div className="flex items-center mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-400 mr-2" />
                  <h4 className="font-semibold text-white">AI Recommendations</h4>
                </div>
                <div className="space-y-2">
                  {smartSuggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        suggestion.type === 'warning' ? 'bg-yellow-400' :
                        suggestion.type === 'conflict' ? 'bg-red-400' : 'bg-blue-400'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-white">{suggestion.title}</p>
                        <p className="text-xs text-gray-300">{suggestion.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-card p-8 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="glass-button flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStep === steps.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  <span>Setting up...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Complete Setup</span>
                </>
              )}
            </motion.button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentStep === 0 && !formData.institutionType}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
