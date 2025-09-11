"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  School, 
  GraduationCap, 
  Building2,
  Users, 
  BookOpen, 
  FlaskConical,
  MapPin,
  Clock,
  ChevronRight, 
  ChevronLeft, 
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Brain,
  Target,
  Settings,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SmartSetupWizardProps {
  onComplete: (data: any) => void
  onCancel: () => void
}

interface InstitutionConfig {
  name: string
  type: 'school' | 'college' | 'university'
  level: 'high_school' | 'undergraduate' | 'postgraduate' | 'mixed'
  numberOfBranches: number
  academicYear: string
  semester: number
}

interface BranchConfig {
  id: string
  name: string
  code: string
  numberOfSubjects: number
  numberOfLabs: number
  studentsPerSection: number
  numberOfSections: number
  subjects: SubjectConfig[]
  labs: LabConfig[]
}

interface SubjectConfig {
  id: string
  name: string
  code: string
  type: 'core' | 'elective' | 'skill' | 'project'
  credits: number
  theoryHours: number
  practicalHours: number
  semester: number
}

interface LabConfig {
  id: string
  name: string
  code: string
  type: 'computer' | 'physics' | 'chemistry' | 'biology' | 'engineering' | 'language'
  capacity: number
  equipment: string[]
}

export function SmartSetupWizard({ onComplete, onCancel }: SmartSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [institutionConfig, setInstitutionConfig] = useState<InstitutionConfig>({
    name: '',
    type: 'college',
    level: 'undergraduate',
    numberOfBranches: 1,
    academicYear: '2024-25',
    semester: 1
  })
  const [branches, setBranches] = useState<BranchConfig[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const steps = [
    {
      id: 'institution',
      title: 'Institution Setup',
      description: 'Configure your institution type and basic details',
      icon: School,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'branches',
      title: 'Branch Configuration',
      description: 'Set up academic branches and their requirements',
      icon: Building2,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'subjects',
      title: 'Subject Planning',
      description: 'Configure subjects for each branch',
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'labs',
      title: 'Laboratory Setup',
      description: 'Set up laboratories and practical sessions',
      icon: FlaskConical,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'review',
      title: 'Review & Generate',
      description: 'Review configuration and generate timetables',
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-600'
    }
  ]

  // Initialize branches when numberOfBranches changes
  useEffect(() => {
    if (institutionConfig.numberOfBranches > 0) {
      const recommendations = getInstitutionTypeRecommendations(institutionConfig.type, institutionConfig.level)
      const newBranches: BranchConfig[] = []

      for (let i = 0; i < institutionConfig.numberOfBranches; i++) {
        newBranches.push({
          id: `branch-${i + 1}`,
          name: '',
          code: '',
          numberOfSubjects: recommendations.subjects.length,
          numberOfLabs: recommendations.labs.length,
          studentsPerSection: recommendations.studentsPerSection,
          numberOfSections: recommendations.sections,
          subjects: [],
          labs: []
        })
      }
      setBranches(newBranches)
    }
  }, [institutionConfig.numberOfBranches, institutionConfig.type, institutionConfig.level])

  // Initialize subjects for a branch
  const initializeSubjects = (branchIndex: number) => {
    const branch = branches[branchIndex]
    const recommendations = getInstitutionTypeRecommendations(institutionConfig.type, institutionConfig.level)
    const subjects: SubjectConfig[] = []

    let subjectIndex = 0

    // Add core subjects
    for (let i = 0; i < recommendations.subjectTypes.core; i++) {
      subjects.push({
        id: `${branch.id}-subject-${subjectIndex + 1}`,
        name: recommendations.subjects[subjectIndex] || `Core Subject ${i + 1}`,
        code: `${branch.code || 'BR'}${String(subjectIndex + 1).padStart(2, '0')}`,
        type: 'core',
        credits: 4,
        theoryHours: 3,
        practicalHours: 1,
        semester: institutionConfig.semester
      })
      subjectIndex++
    }

    // Add elective subjects
    for (let i = 0; i < recommendations.subjectTypes.elective; i++) {
      subjects.push({
        id: `${branch.id}-subject-${subjectIndex + 1}`,
        name: recommendations.subjects[subjectIndex] || `Elective ${i + 1}`,
        code: `${branch.code || 'BR'}${String(subjectIndex + 1).padStart(2, '0')}`,
        type: 'elective',
        credits: 3,
        theoryHours: 3,
        practicalHours: 0,
        semester: institutionConfig.semester
      })
      subjectIndex++
    }

    // Add skill subjects
    for (let i = 0; i < recommendations.subjectTypes.skill; i++) {
      subjects.push({
        id: `${branch.id}-subject-${subjectIndex + 1}`,
        name: recommendations.subjects[subjectIndex] || `Skill Development ${i + 1}`,
        code: `${branch.code || 'BR'}${String(subjectIndex + 1).padStart(2, '0')}`,
        type: 'skill',
        credits: 2,
        theoryHours: 1,
        practicalHours: 2,
        semester: institutionConfig.semester
      })
      subjectIndex++
    }

    // Add project subjects
    for (let i = 0; i < recommendations.subjectTypes.project; i++) {
      subjects.push({
        id: `${branch.id}-subject-${subjectIndex + 1}`,
        name: recommendations.subjects[subjectIndex] || `Project Work ${i + 1}`,
        code: `${branch.code || 'BR'}${String(subjectIndex + 1).padStart(2, '0')}`,
        type: 'project',
        credits: 4,
        theoryHours: 1,
        practicalHours: 4,
        semester: institutionConfig.semester
      })
      subjectIndex++
    }

    const updatedBranches = [...branches]
    updatedBranches[branchIndex].subjects = subjects
    setBranches(updatedBranches)
  }

  // Initialize labs for a branch
  const initializeLabs = (branchIndex: number) => {
    const branch = branches[branchIndex]
    const recommendations = getInstitutionTypeRecommendations(institutionConfig.type, institutionConfig.level)
    const labs: LabConfig[] = []

    const labTypes = ['computer', 'physics', 'chemistry', 'biology', 'engineering', 'language'] as const

    for (let i = 0; i < branch.numberOfLabs; i++) {
      const labName = recommendations.labs[i] || `Lab ${i + 1}`
      const labType = labTypes[i % labTypes.length]

      labs.push({
        id: `${branch.id}-lab-${i + 1}`,
        name: labName,
        code: `${branch.code || 'BR'}L${String(i + 1).padStart(2, '0')}`,
        type: labType,
        capacity: Math.floor(recommendations.studentsPerSection * 0.6), // 60% of section size
        equipment: getLabEquipment(labType)
      })
    }

    const updatedBranches = [...branches]
    updatedBranches[branchIndex].labs = labs
    setBranches(updatedBranches)
  }

  const getLabEquipment = (labType: string): string[] => {
    const equipmentMap = {
      computer: ['Desktop Computers', 'Projector', 'Whiteboard', 'Network Equipment', 'Software Licenses'],
      physics: ['Oscilloscope', 'Multimeter', 'Power Supply', 'Function Generator', 'Measuring Instruments'],
      chemistry: ['Fume Hood', 'Analytical Balance', 'pH Meter', 'Spectrophotometer', 'Glassware'],
      biology: ['Microscopes', 'Incubator', 'Centrifuge', 'Autoclave', 'Specimen Collection'],
      engineering: ['CAD Workstations', 'Simulation Software', 'Testing Equipment', 'Measurement Tools', 'Safety Equipment'],
      language: ['Audio System', 'Headphones', 'Recording Equipment', 'Interactive Boards', 'Language Software']
    }
    return equipmentMap[labType as keyof typeof equipmentMap] || ['Basic Equipment']
  }

  const getInstitutionTypeRecommendations = (type: string, level: string) => {
    const recommendations = {
      school: {
        high_school: {
          subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Physical Education'],
          labs: ['Physics Lab', 'Chemistry Lab', 'Biology Lab', 'Computer Lab'],
          sections: 3,
          studentsPerSection: 35,
          periodsPerDay: 7,
          workingDays: 6,
          subjectTypes: { core: 6, elective: 2, skill: 0, project: 0 }
        }
      },
      college: {
        undergraduate: {
          subjects: ['Core Subject 1', 'Core Subject 2', 'Core Subject 3', 'Core Subject 4', 'Elective 1', 'Elective 2', 'Skill Development', 'Project Work'],
          labs: ['Computer Lab', 'Language Lab', 'Technical Lab', 'Research Lab'],
          sections: 2,
          studentsPerSection: 60,
          periodsPerDay: 6,
          workingDays: 5,
          subjectTypes: { core: 4, elective: 2, skill: 1, project: 1 }
        },
        postgraduate: {
          subjects: ['Advanced Core 1', 'Advanced Core 2', 'Specialization 1', 'Specialization 2', 'Research Methodology', 'Dissertation'],
          labs: ['Advanced Lab', 'Research Lab', 'Specialized Equipment Lab'],
          sections: 1,
          studentsPerSection: 30,
          periodsPerDay: 5,
          workingDays: 5,
          subjectTypes: { core: 2, elective: 2, skill: 0, project: 2 }
        }
      },
      university: {
        undergraduate: {
          subjects: ['Major 1', 'Major 2', 'Major 3', 'Minor 1', 'Minor 2', 'General Education', 'Capstone Project'],
          labs: ['Department Lab', 'Research Lab', 'Multi-purpose Lab'],
          sections: 2,
          studentsPerSection: 80,
          periodsPerDay: 6,
          workingDays: 5,
          subjectTypes: { core: 3, elective: 2, skill: 1, project: 1 }
        },
        postgraduate: {
          subjects: ['Advanced Theory', 'Research Methods', 'Thesis Work', 'Seminar', 'Independent Study'],
          labs: ['Research Lab', 'Advanced Equipment Lab', 'Thesis Lab'],
          sections: 1,
          studentsPerSection: 25,
          periodsPerDay: 4,
          workingDays: 5,
          subjectTypes: { core: 2, elective: 1, skill: 0, project: 2 }
        },
        mixed: {
          subjects: ['Foundation Course', 'Core Subject', 'Advanced Subject', 'Elective', 'Research Component', 'Practical Training'],
          labs: ['Multi-level Lab', 'Research Facility', 'Training Center'],
          sections: 2,
          studentsPerSection: 50,
          periodsPerDay: 6,
          workingDays: 5,
          subjectTypes: { core: 3, elective: 2, skill: 1, project: 1 }
        }
      }
    }

    const typeRec = recommendations[type as keyof typeof recommendations]
    if (typeRec && typeRec[level as keyof typeof typeRec]) {
      return typeRec[level as keyof typeof typeRec]
    }

    // Default fallback
    return {
      subjects: ['Subject 1', 'Subject 2', 'Subject 3', 'Subject 4', 'Subject 5', 'Subject 6'],
      labs: ['Lab 1', 'Lab 2'],
      sections: 2,
      studentsPerSection: 60,
      periodsPerDay: 6,
      workingDays: 5,
      subjectTypes: { core: 4, elective: 2, skill: 0, project: 0 }
    }
  }

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

  const handleComplete = async () => {
    setIsGenerating(true)
    try {
      const setupData = {
        institution: institutionConfig,
        branches: branches,
        totalSubjects: branches.reduce((sum, branch) => sum + branch.subjects.length, 0),
        totalLabs: branches.reduce((sum, branch) => sum + branch.labs.length, 0),
        totalStudents: branches.reduce((sum, branch) => sum + (branch.studentsPerSection * branch.numberOfSections), 0)
      }
      
      toast.success('Smart setup completed successfully!')
      onComplete(setupData)
    } catch (error) {
      toast.error('Failed to complete setup. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const renderStepContent = () => {
    const step = steps[currentStep]
    
    switch (step.id) {
      case 'institution':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <School className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Institution Configuration</h2>
              <p className="text-muted">Set up your institution's basic information and structure</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Institution Name *</label>
                <input
                  type="text"
                  value={institutionConfig.name}
                  onChange={(e) => setInstitutionConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 glass border rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter institution name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Institution Type *</label>
                <select
                  value={institutionConfig.type}
                  onChange={(e) => setInstitutionConfig(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-4 py-3 glass border rounded-lg text-primary focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="school">School</option>
                  <option value="college">College</option>
                  <option value="university">University</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Education Level *</label>
                <select
                  value={institutionConfig.level}
                  onChange={(e) => setInstitutionConfig(prev => ({ ...prev, level: e.target.value as any }))}
                  className="w-full px-4 py-3 glass border rounded-lg text-primary focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="high_school">High School</option>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="postgraduate">Postgraduate</option>
                  <option value="mixed">Mixed Levels</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Number of Branches *</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={institutionConfig.numberOfBranches}
                  onChange={(e) => setInstitutionConfig(prev => ({ ...prev, numberOfBranches: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-3 glass border rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., 4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Academic Year *</label>
                <input
                  type="text"
                  value={institutionConfig.academicYear}
                  onChange={(e) => setInstitutionConfig(prev => ({ ...prev, academicYear: e.target.value }))}
                  className="w-full px-4 py-3 glass border rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="2024-25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Current Semester *</label>
                <select
                  value={institutionConfig.semester}
                  onChange={(e) => setInstitutionConfig(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 glass border rounded-lg text-primary focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="glass-card p-4 bg-blue-500/10 border-blue-500/20">
              <div className="flex items-center space-x-2 mb-3">
                <Brain className="w-5 h-5 text-blue-400" />
                <h4 className="font-semibold text-blue-300">AI Recommendations</h4>
              </div>
              <div className="text-sm text-blue-200">
                Based on your {institutionConfig.type} ({institutionConfig.level}), we recommend:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>{getInstitutionTypeRecommendations(institutionConfig.type, institutionConfig.level).subjects.length} subjects per branch</li>
                  <li>{getInstitutionTypeRecommendations(institutionConfig.type, institutionConfig.level).labs.length} laboratories per branch</li>
                  <li>{getInstitutionTypeRecommendations(institutionConfig.type, institutionConfig.level).studentsPerSection} students per section</li>
                  <li>{getInstitutionTypeRecommendations(institutionConfig.type, institutionConfig.level).sections} sections per branch</li>
                  <li>{getInstitutionTypeRecommendations(institutionConfig.type, institutionConfig.level).periodsPerDay} periods per day</li>
                  <li>{getInstitutionTypeRecommendations(institutionConfig.type, institutionConfig.level).workingDays} working days per week</li>
                </ul>
              </div>

              <div className="mt-3 p-3 bg-blue-600/20 rounded-lg">
                <div className="text-xs text-blue-100 font-medium mb-1">Subject Distribution:</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {Object.entries(getInstitutionTypeRecommendations(institutionConfig.type, institutionConfig.level).subjectTypes).map(([type, count]) => (
                    <span key={type} className="px-2 py-1 bg-blue-500/30 rounded capitalize">
                      {count} {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'branches':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Branch Configuration</h2>
              <p className="text-muted">Configure each academic branch with specific requirements</p>

              <div className="flex justify-center mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const recommendations = getInstitutionTypeRecommendations(institutionConfig.type, institutionConfig.level)
                    const updatedBranches = branches.map(branch => ({
                      ...branch,
                      numberOfSubjects: recommendations.subjects.length,
                      numberOfLabs: recommendations.labs.length,
                      studentsPerSection: recommendations.studentsPerSection,
                      numberOfSections: recommendations.sections
                    }))
                    setBranches(updatedBranches)
                    toast.success('AI recommendations applied to all branches!')
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Brain className="w-4 h-4" />
                  <span>Apply AI Recommendations</span>
                </motion.button>
              </div>
            </div>

            <div className="space-y-6">
              {branches.map((branch, index) => (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 border border-green-500/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-primary">Branch {index + 1}</h3>
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-green-300">
                        {branch.numberOfSubjects} subjects, {branch.numberOfLabs} labs
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Branch Name *</label>
                      <input
                        type="text"
                        value={branch.name}
                        onChange={(e) => {
                          const updatedBranches = [...branches]
                          updatedBranches[index].name = e.target.value
                          setBranches(updatedBranches)
                        }}
                        className="w-full px-3 py-2 glass border rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-green-500 focus:outline-none"
                        placeholder="e.g., Computer Science"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Branch Code *</label>
                      <input
                        type="text"
                        value={branch.code}
                        onChange={(e) => {
                          const updatedBranches = [...branches]
                          updatedBranches[index].code = e.target.value.toUpperCase()
                          setBranches(updatedBranches)
                        }}
                        className="w-full px-3 py-2 glass border rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-green-500 focus:outline-none"
                        placeholder="e.g., CSE"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Number of Subjects</label>
                      <input
                        type="number"
                        min="1"
                        max="15"
                        value={branch.numberOfSubjects}
                        onChange={(e) => {
                          const updatedBranches = [...branches]
                          updatedBranches[index].numberOfSubjects = parseInt(e.target.value) || 1
                          setBranches(updatedBranches)
                        }}
                        className="w-full px-3 py-2 glass border rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-green-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Number of Labs</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={branch.numberOfLabs}
                        onChange={(e) => {
                          const updatedBranches = [...branches]
                          updatedBranches[index].numberOfLabs = parseInt(e.target.value) || 0
                          setBranches(updatedBranches)
                        }}
                        className="w-full px-3 py-2 glass border rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-green-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Students per Section</label>
                      <input
                        type="number"
                        min="20"
                        max="100"
                        value={branch.studentsPerSection}
                        onChange={(e) => {
                          const updatedBranches = [...branches]
                          updatedBranches[index].studentsPerSection = parseInt(e.target.value) || 60
                          setBranches(updatedBranches)
                        }}
                        className="w-full px-3 py-2 glass border rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-green-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Number of Sections</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={branch.numberOfSections}
                        onChange={(e) => {
                          const updatedBranches = [...branches]
                          updatedBranches[index].numberOfSections = parseInt(e.target.value) || 1
                          setBranches(updatedBranches)
                        }}
                        className="w-full px-3 py-2 glass border rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-green-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center space-x-2 text-green-300 text-sm">
                      <Info className="w-4 h-4" />
                      <span>
                        Total students: {branch.studentsPerSection * branch.numberOfSections} |
                        Total sessions needed: ~{(branch.numberOfSubjects * 3) + (branch.numberOfLabs * 2)} per week
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 'subjects':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Subject Configuration</h2>
              <p className="text-muted">Configure subjects for each branch</p>
            </div>

            <div className="space-y-8">
              {branches.map((branch, branchIndex) => (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: branchIndex * 0.1 }}
                  className="glass-card p-6 border border-purple-500/20"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-primary">{branch.name || `Branch ${branchIndex + 1}`}</h3>
                      <p className="text-sm text-muted">Configure {branch.numberOfSubjects} subjects</p>
                    </div>
                    <button
                      onClick={() => initializeSubjects(branchIndex)}
                      className="glass-button px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Auto-fill Subjects
                    </button>
                  </div>

                  <div className="grid gap-4">
                    {Array.from({ length: branch.numberOfSubjects }, (_, subjectIndex) => {
                      const subject = branch.subjects[subjectIndex] || {
                        id: `${branch.id}-subject-${subjectIndex + 1}`,
                        name: '',
                        code: '',
                        type: 'core',
                        credits: 3,
                        theoryHours: 3,
                        practicalHours: 0,
                        semester: institutionConfig.semester
                      }

                      return (
                        <div key={subject.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 bg-white/5 rounded-lg">
                          <div>
                            <label className="block text-xs font-medium text-secondary mb-1">Subject Name</label>
                            <input
                              type="text"
                              value={subject.name}
                              onChange={(e) => {
                                const updatedBranches = [...branches]
                                if (!updatedBranches[branchIndex].subjects[subjectIndex]) {
                                  updatedBranches[branchIndex].subjects[subjectIndex] = { ...subject }
                                }
                                updatedBranches[branchIndex].subjects[subjectIndex].name = e.target.value
                                setBranches(updatedBranches)
                              }}
                              className="w-full px-2 py-1 text-sm glass border rounded text-primary placeholder-muted focus:ring-1 focus:ring-purple-500 focus:outline-none"
                              placeholder="Subject name"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-secondary mb-1">Code</label>
                            <input
                              type="text"
                              value={subject.code}
                              onChange={(e) => {
                                const updatedBranches = [...branches]
                                if (!updatedBranches[branchIndex].subjects[subjectIndex]) {
                                  updatedBranches[branchIndex].subjects[subjectIndex] = { ...subject }
                                }
                                updatedBranches[branchIndex].subjects[subjectIndex].code = e.target.value.toUpperCase()
                                setBranches(updatedBranches)
                              }}
                              className="w-full px-2 py-1 text-sm glass border rounded text-primary placeholder-muted focus:ring-1 focus:ring-purple-500 focus:outline-none"
                              placeholder="Code"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-secondary mb-1">Type</label>
                            <select
                              value={subject.type}
                              onChange={(e) => {
                                const updatedBranches = [...branches]
                                if (!updatedBranches[branchIndex].subjects[subjectIndex]) {
                                  updatedBranches[branchIndex].subjects[subjectIndex] = { ...subject }
                                }
                                updatedBranches[branchIndex].subjects[subjectIndex].type = e.target.value as any
                                setBranches(updatedBranches)
                              }}
                              className="w-full px-2 py-1 text-sm glass border rounded text-primary focus:ring-1 focus:ring-purple-500 focus:outline-none"
                            >
                              <option value="core">Core</option>
                              <option value="elective">Elective</option>
                              <option value="skill">Skill</option>
                              <option value="project">Project</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-secondary mb-1">Credits</label>
                            <input
                              type="number"
                              min="1"
                              max="6"
                              value={subject.credits}
                              onChange={(e) => {
                                const updatedBranches = [...branches]
                                if (!updatedBranches[branchIndex].subjects[subjectIndex]) {
                                  updatedBranches[branchIndex].subjects[subjectIndex] = { ...subject }
                                }
                                updatedBranches[branchIndex].subjects[subjectIndex].credits = parseInt(e.target.value) || 1
                                setBranches(updatedBranches)
                              }}
                              className="w-full px-2 py-1 text-sm glass border rounded text-primary placeholder-muted focus:ring-1 focus:ring-purple-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-secondary mb-1">Theory Hrs</label>
                            <input
                              type="number"
                              min="0"
                              max="6"
                              value={subject.theoryHours}
                              onChange={(e) => {
                                const updatedBranches = [...branches]
                                if (!updatedBranches[branchIndex].subjects[subjectIndex]) {
                                  updatedBranches[branchIndex].subjects[subjectIndex] = { ...subject }
                                }
                                updatedBranches[branchIndex].subjects[subjectIndex].theoryHours = parseInt(e.target.value) || 0
                                setBranches(updatedBranches)
                              }}
                              className="w-full px-2 py-1 text-sm glass border rounded text-primary placeholder-muted focus:ring-1 focus:ring-purple-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-secondary mb-1">Practical Hrs</label>
                            <input
                              type="number"
                              min="0"
                              max="6"
                              value={subject.practicalHours}
                              onChange={(e) => {
                                const updatedBranches = [...branches]
                                if (!updatedBranches[branchIndex].subjects[subjectIndex]) {
                                  updatedBranches[branchIndex].subjects[subjectIndex] = { ...subject }
                                }
                                updatedBranches[branchIndex].subjects[subjectIndex].practicalHours = parseInt(e.target.value) || 0
                                setBranches(updatedBranches)
                              }}
                              className="w-full px-2 py-1 text-sm glass border rounded text-primary placeholder-muted focus:ring-1 focus:ring-purple-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 'labs':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Laboratory Setup</h2>
              <p className="text-muted">Configure laboratories and practical facilities</p>
            </div>

            <div className="space-y-8">
              {branches.map((branch, branchIndex) => (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: branchIndex * 0.1 }}
                  className="glass-card p-6 border border-orange-500/20"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-primary">{branch.name || `Branch ${branchIndex + 1}`}</h3>
                      <p className="text-sm text-muted">Configure {branch.numberOfLabs} laboratories</p>
                    </div>
                    <button
                      onClick={() => initializeLabs(branchIndex)}
                      className="glass-button px-4 py-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Auto-fill Labs
                    </button>
                  </div>

                  <div className="grid gap-4">
                    {Array.from({ length: branch.numberOfLabs }, (_, labIndex) => {
                      const lab = branch.labs[labIndex] || {
                        id: `${branch.id}-lab-${labIndex + 1}`,
                        name: '',
                        code: '',
                        type: 'computer',
                        capacity: 30,
                        equipment: []
                      }

                      return (
                        <div key={lab.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-white/5 rounded-lg">
                          <div>
                            <label className="block text-xs font-medium text-secondary mb-1">Lab Name</label>
                            <input
                              type="text"
                              value={lab.name}
                              onChange={(e) => {
                                const updatedBranches = [...branches]
                                if (!updatedBranches[branchIndex].labs[labIndex]) {
                                  updatedBranches[branchIndex].labs[labIndex] = { ...lab }
                                }
                                updatedBranches[branchIndex].labs[labIndex].name = e.target.value
                                setBranches(updatedBranches)
                              }}
                              className="w-full px-2 py-1 text-sm glass border rounded text-primary placeholder-muted focus:ring-1 focus:ring-orange-500 focus:outline-none"
                              placeholder="Lab name"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-secondary mb-1">Lab Code</label>
                            <input
                              type="text"
                              value={lab.code}
                              onChange={(e) => {
                                const updatedBranches = [...branches]
                                if (!updatedBranches[branchIndex].labs[labIndex]) {
                                  updatedBranches[branchIndex].labs[labIndex] = { ...lab }
                                }
                                updatedBranches[branchIndex].labs[labIndex].code = e.target.value.toUpperCase()
                                setBranches(updatedBranches)
                              }}
                              className="w-full px-2 py-1 text-sm glass border rounded text-primary placeholder-muted focus:ring-1 focus:ring-orange-500 focus:outline-none"
                              placeholder="Code"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-secondary mb-1">Lab Type</label>
                            <select
                              value={lab.type}
                              onChange={(e) => {
                                const updatedBranches = [...branches]
                                if (!updatedBranches[branchIndex].labs[labIndex]) {
                                  updatedBranches[branchIndex].labs[labIndex] = { ...lab }
                                }
                                updatedBranches[branchIndex].labs[labIndex].type = e.target.value as any
                                setBranches(updatedBranches)
                              }}
                              className="w-full px-2 py-1 text-sm glass border rounded text-primary focus:ring-1 focus:ring-orange-500 focus:outline-none"
                            >
                              <option value="computer">Computer Lab</option>
                              <option value="physics">Physics Lab</option>
                              <option value="chemistry">Chemistry Lab</option>
                              <option value="biology">Biology Lab</option>
                              <option value="engineering">Engineering Lab</option>
                              <option value="language">Language Lab</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-secondary mb-1">Capacity</label>
                            <input
                              type="number"
                              min="10"
                              max="100"
                              value={lab.capacity}
                              onChange={(e) => {
                                const updatedBranches = [...branches]
                                if (!updatedBranches[branchIndex].labs[labIndex]) {
                                  updatedBranches[branchIndex].labs[labIndex] = { ...lab }
                                }
                                updatedBranches[branchIndex].labs[labIndex].capacity = parseInt(e.target.value) || 30
                                setBranches(updatedBranches)
                              }}
                              className="w-full px-2 py-1 text-sm glass border rounded text-primary placeholder-muted focus:ring-1 focus:ring-orange-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Review & Generate</h2>
              <p className="text-muted">Review your configuration and generate the timetable system</p>
            </div>

            {/* Institution Summary */}
            <div className="glass-card p-6 border border-emerald-500/20">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <School className="w-5 h-5 mr-2 text-emerald-400" />
                Institution Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-400">{institutionConfig.name}</div>
                  <div className="text-sm text-muted">{institutionConfig.type} • {institutionConfig.level}</div>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{institutionConfig.numberOfBranches}</div>
                  <div className="text-sm text-muted">Academic Branches</div>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{institutionConfig.academicYear}</div>
                  <div className="text-sm text-muted">Academic Year • Sem {institutionConfig.semester}</div>
                </div>
              </div>
            </div>

            {/* Branch Summary */}
            <div className="space-y-4">
              {branches.map((branch, index) => (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-primary flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-green-400" />
                      {branch.name || `Branch ${index + 1}`} ({branch.code})
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-muted">
                      <span>{branch.numberOfSections} sections</span>
                      <span>{branch.studentsPerSection * branch.numberOfSections} students</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-purple-500/10 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-300">Subjects</span>
                        <BookOpen className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="text-xl font-bold text-purple-400">{branch.numberOfSubjects}</div>
                      <div className="text-xs text-muted">
                        {branch.subjects.filter(s => s?.type === 'core').length} core, {' '}
                        {branch.subjects.filter(s => s?.type === 'elective').length} elective
                      </div>
                    </div>

                    <div className="bg-orange-500/10 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-orange-300">Laboratories</span>
                        <FlaskConical className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="text-xl font-bold text-orange-400">{branch.numberOfLabs}</div>
                      <div className="text-xs text-muted">
                        Avg capacity: {Math.round(branch.labs.reduce((sum, lab) => sum + (lab?.capacity || 0), 0) / Math.max(branch.numberOfLabs, 1))}
                      </div>
                    </div>

                    <div className="bg-blue-500/10 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-300">Weekly Sessions</span>
                        <Clock className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-xl font-bold text-blue-400">
                        {branch.subjects.reduce((sum, subject) => sum + (subject?.theoryHours || 0) + (subject?.practicalHours || 0), 0)}
                      </div>
                      <div className="text-xs text-muted">Theory + Practical hours</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Generation Summary */}
            <div className="glass-card p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-emerald-400" />
                What will be generated
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {branches.reduce((sum, branch) => sum + branch.numberOfSubjects, 0)}
                  </div>
                  <div className="text-sm text-muted">Total Subjects</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-400">
                    {branches.reduce((sum, branch) => sum + branch.numberOfLabs, 0)}
                  </div>
                  <div className="text-sm text-muted">Total Labs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {branches.reduce((sum, branch) => sum + (branch.studentsPerSection * branch.numberOfSections), 0)}
                  </div>
                  <div className="text-sm text-muted">Total Students</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {branches.reduce((sum, branch) => sum + branch.numberOfSections, 0)}
                  </div>
                  <div className="text-sm text-muted">Total Sections</div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Step content for {step.id}</div>
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-6xl max-h-[90vh] overflow-hidden glass-card"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Smart Timetable Setup</h1>
              <p className="text-muted">AI-powered intelligent setup wizard</p>
            </div>
            <button
              onClick={onCancel}
              className="glass-button p-2 rounded-lg hover:bg-red-500/20"
            >
              ✕
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-3 ${
                  index <= currentStep ? 'text-primary' : 'text-muted'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index < currentStep 
                      ? 'bg-green-500 text-white' 
                      : index === currentStep 
                      ? `bg-gradient-to-r ${step.color} text-white`
                      : 'bg-white/10 text-muted'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="hidden md:block">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-xs text-muted">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-muted mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
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

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="glass-button px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          {currentStep === steps.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleComplete}
              disabled={isGenerating}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="spinner mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Complete Setup
                </>
              )}
            </motion.button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
