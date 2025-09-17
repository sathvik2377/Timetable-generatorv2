"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  Users, 
  BookOpen, 
  MapPin,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { apiClient } from '@/lib/api'

interface BatchSetupData {
  institution: {
    name: string
    type: 'school' | 'college' | 'university'
    address: string
    phone: string
    email: string
    academic_year: string
    start_time: string
    end_time: string
    slot_duration: number
    lunch_break_start: string
    lunch_break_end: string
    working_days: number[]
  }
  quantities: {
    numBranches: number
    numSubjectsPerBranch: number
    numTeachers: number
    numRooms: number
    numClassGroups: number
  }
  branches: Array<{
    name: string
    code: string
    description: string
  }>
  subjects: Array<{
    name: string
    code: string
    type: 'core' | 'elective' | 'lab' | 'skill' | 'project'
    credits: number
    semester: number
    year: number
    theory_hours: number
    practical_hours: number
    branchIndex: number
  }>
  teachers: Array<{
    name: string
    email: string
    employee_id: string
    designation: string
    specialization: string
    assignedSubjects: string[]
  }>
  rooms: Array<{
    name: string
    code: string
    type: 'classroom' | 'laboratory' | 'seminar_hall' | 'auditorium' | 'library'
    capacity: number
    building: string
    floor: number
  }>
  classGroups: Array<{
    name: string
    year: number
    section: string
    semester: number
    strength: number
    branchIndex: number
  }>
}

interface BatchSetupWizardProps {
  onComplete: () => void
  onCancel: () => void
}

export function BatchSetupWizard({ onComplete, onCancel }: BatchSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<BatchSetupData>({
    institution: {
      name: '',
      type: 'college',
      address: '',
      phone: '',
      email: '',
      academic_year: '2025-26',
      start_time: '09:00',
      end_time: '17:00',
      slot_duration: 60,
      lunch_break_start: '13:00',
      lunch_break_end: '14:00',
      working_days: [1, 2, 3, 4, 5, 6] // Monday to Saturday
    },
    quantities: {
      numBranches: 3,
      numSubjectsPerBranch: 6,
      numTeachers: 8,
      numRooms: 10,
      numClassGroups: 6
    },
    branches: [],
    subjects: [],
    teachers: [],
    rooms: [],
    classGroups: []
  })

  const steps = [
    { id: 1, title: 'Institution Setup', description: 'Basic institution information', icon: Building2 },
    { id: 2, title: 'Quantity Planning', description: 'How many of each item do you need?', icon: Users },
    { id: 3, title: 'Branch Details', description: 'Configure your academic branches', icon: GraduationCap },
    { id: 4, title: 'Subject Configuration', description: 'Set up subjects for each branch', icon: BookOpen },
    { id: 5, title: 'Teacher Assignment', description: 'Add teachers and assign subjects', icon: Users },
    { id: 6, title: 'Room & Class Setup', description: 'Configure rooms and class groups', icon: MapPin },
    { id: 7, title: 'Review & Complete', description: 'Review your setup and finish', icon: CheckCircle }
  ]

  // Initialize arrays when quantities change
  const initializeArrays = () => {
    const { quantities } = formData
    
    // Initialize branches
    if (formData.branches.length !== quantities.numBranches) {
      const branches = Array.from({ length: quantities.numBranches }, (_, i) => ({
        name: '',
        code: '',
        description: ''
      }))
      setFormData(prev => ({ ...prev, branches }))
    }

    // Initialize subjects
    if (formData.subjects.length !== quantities.numBranches * quantities.numSubjectsPerBranch) {
      const subjects = []
      for (let branchIndex = 0; branchIndex < quantities.numBranches; branchIndex++) {
        for (let subjectIndex = 0; subjectIndex < quantities.numSubjectsPerBranch; subjectIndex++) {
          subjects.push({
            name: '',
            code: '',
            type: 'core' as const,
            credits: 3,
            semester: 1,
            year: 1,
            theory_hours: 3,
            practical_hours: 0,
            branchIndex
          })
        }
      }
      setFormData(prev => ({ ...prev, subjects }))
    }

    // Initialize teachers
    if (formData.teachers.length !== quantities.numTeachers) {
      const teachers = Array.from({ length: quantities.numTeachers }, (_, i) => ({
        name: '',
        email: '',
        employee_id: '',
        designation: 'assistant_professor',
        specialization: '',
        assignedSubjects: []
      }))
      setFormData(prev => ({ ...prev, teachers }))
    }

    // Initialize rooms
    if (formData.rooms.length !== quantities.numRooms) {
      const rooms = Array.from({ length: quantities.numRooms }, (_, i) => ({
        name: '',
        code: '',
        type: 'classroom' as const,
        capacity: 60,
        building: 'Main Building',
        floor: 1
      }))
      setFormData(prev => ({ ...prev, rooms }))
    }

    // Initialize class groups
    if (formData.classGroups.length !== quantities.numClassGroups) {
      const classGroups = Array.from({ length: quantities.numClassGroups }, (_, i) => ({
        name: '',
        year: 1,
        section: 'A',
        semester: 1,
        strength: 60,
        branchIndex: 0
      }))
      setFormData(prev => ({ ...prev, classGroups }))
    }
  }

  const updateQuantity = (field: keyof BatchSetupData['quantities'], value: number) => {
    setFormData(prev => ({
      ...prev,
      quantities: {
        ...prev.quantities,
        [field]: Math.max(1, Math.min(20, value)) // Limit between 1 and 20
      }
    }))
  }

  const updateInstitution = (field: keyof BatchSetupData['institution'], value: any) => {
    setFormData(prev => ({
      ...prev,
      institution: {
        ...prev.institution,
        [field]: value
      }
    }))
  }

  const updateArrayItem = <T extends keyof BatchSetupData>(
    arrayName: T,
    index: number,
    field: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] as any[]).map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const nextStep = () => {
    if (currentStep === 2) {
      initializeArrays()
    }
    setCurrentStep(Math.min(currentStep + 1, steps.length))
  }

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Create institution
      const institution = await apiClient.createInstitution({
        ...formData.institution
      })

      // Create branches
      const createdBranches = []
      for (const branch of formData.branches) {
        if (branch.name && branch.code) {
          try {
            const createdBranch = await apiClient.createBranch({
              ...branch,
              institution: institution.id
            })
            createdBranches.push(createdBranch)
          } catch (error: any) {
            console.error('Branch creation error:', error)
            toast.error(`Failed to create branch ${branch.code}`)
          }
        }
      }

      // Create subjects
      for (const subject of formData.subjects) {
        if (subject.name && subject.code && createdBranches[subject.branchIndex]) {
          try {
            await apiClient.createSubject({
              ...subject,
              branch: createdBranches[subject.branchIndex].id
            })
          } catch (error: any) {
            console.error('Subject creation error:', error)
            toast.error(`Failed to create subject ${subject.code}`)
          }
        }
      }

      // Create teachers
      for (const teacher of formData.teachers) {
        if (teacher.name && teacher.email) {
          try {
            await apiClient.createTeacher({
              ...teacher,
              department: createdBranches[0]?.id // Assign to first branch for now
            })
          } catch (error: any) {
            console.error('Teacher creation error:', error)
            toast.error(`Failed to create teacher ${teacher.name}`)
          }
        }
      }

      // Create rooms
      for (const room of formData.rooms) {
        if (room.name && room.code) {
          try {
            await apiClient.createRoom({
              ...room,
              institution: institution.id
            })
          } catch (error: any) {
            console.error('Room creation error:', error)
            toast.error(`Failed to create room ${room.code}`)
          }
        }
      }

      // Create class groups
      for (const classGroup of formData.classGroups) {
        if (classGroup.name && createdBranches[classGroup.branchIndex]) {
          try {
            await apiClient.createClassGroup({
              ...classGroup,
              branch: createdBranches[classGroup.branchIndex].id
            })
          } catch (error: any) {
            console.error('Class group creation error:', error)
            toast.error(`Failed to create class group ${classGroup.name}`)
          }
        }
      }

      toast.success('Institution setup completed successfully!')
      onComplete()
      
    } catch (error: any) {
      console.error('Setup error:', error)
      toast.error('Failed to complete setup. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-primary mb-2">Institution Information</h2>
              <p className="text-muted">Enter basic details about your institution</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Institution Name</label>
                <input
                  type="text"
                  value={formData.institution.name}
                  onChange={(e) => updateInstitution('name', e.target.value)}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter institution name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2">Institution Type</label>
                <select
                  value={formData.institution.type}
                  onChange={(e) => updateInstitution('type', e.target.value)}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="school">School</option>
                  <option value="college">College</option>
                  <option value="university">University</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted mb-2">Address</label>
                <textarea
                  value={formData.institution.address}
                  onChange={(e) => updateInstitution('address', e.target.value)}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.institution.phone}
                  onChange={(e) => updateInstitution('phone', e.target.value)}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="+1-234-567-8900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2">Email</label>
                <input
                  type="email"
                  value={formData.institution.email}
                  onChange={(e) => updateInstitution('email', e.target.value)}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="info@institution.edu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2">Academic Year</label>
                <input
                  type="text"
                  value={formData.institution.academic_year}
                  onChange={(e) => updateInstitution('academic_year', e.target.value)}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="2025-26"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2">Period Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.institution.slot_duration}
                  onChange={(e) => updateInstitution('slot_duration', parseInt(e.target.value))}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  min="30"
                  max="120"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-primary mb-2">Quantity Planning</h2>
              <p className="text-muted">How many of each item do you need? We'll create forms accordingly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { key: 'numBranches', label: 'Number of Branches', icon: GraduationCap, description: 'Academic departments/streams' },
                { key: 'numSubjectsPerBranch', label: 'Subjects per Branch', icon: BookOpen, description: 'Average subjects per branch' },
                { key: 'numTeachers', label: 'Number of Teachers', icon: Users, description: 'Total faculty members' },
                { key: 'numRooms', label: 'Number of Rooms', icon: MapPin, description: 'Classrooms and labs' },
                { key: 'numClassGroups', label: 'Number of Classes', icon: Users, description: 'Student class groups' }
              ].map(({ key, label, icon: Icon, description }) => (
                <div key={key} className="glass-card p-6 text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-primary mb-2">{label}</h3>
                  <p className="text-sm text-muted mb-4">{description}</p>
                  
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() => updateQuantity(key as keyof BatchSetupData['quantities'], formData.quantities[key as keyof BatchSetupData['quantities']] - 1)}
                      className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <span className="text-2xl font-bold text-primary w-12 text-center">
                      {formData.quantities[key as keyof BatchSetupData['quantities']]}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(key as keyof BatchSetupData['quantities'], formData.quantities[key as keyof BatchSetupData['quantities']] + 1)}
                      className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card p-6 bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-300 mb-1">Planning Summary</h4>
                  <p className="text-sm text-blue-200">
                    You'll create <strong>{formData.quantities.numBranches}</strong> branches with{' '}
                    <strong>{formData.quantities.numBranches * formData.quantities.numSubjectsPerBranch}</strong> total subjects,{' '}
                    <strong>{formData.quantities.numTeachers}</strong> teachers,{' '}
                    <strong>{formData.quantities.numRooms}</strong> rooms, and{' '}
                    <strong>{formData.quantities.numClassGroups}</strong> class groups.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-primary mb-2">Branch Configuration</h2>
              <p className="text-muted">Configure your {formData.quantities.numBranches} academic branches</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.branches.map((branch, index) => (
                <div key={index} className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Branch {index + 1}</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted mb-2">Branch Name</label>
                      <input
                        type="text"
                        value={branch.name}
                        onChange={(e) => updateArrayItem('branches', index, 'name', e.target.value)}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Computer Science Engineering"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted mb-2">Branch Code</label>
                      <input
                        type="text"
                        value={branch.code}
                        onChange={(e) => updateArrayItem('branches', index, 'code', e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="CSE"
                        maxLength={10}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted mb-2">Description</label>
                      <textarea
                        value={branch.description}
                        onChange={(e) => updateArrayItem('branches', index, 'description', e.target.value)}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Brief description of the branch"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-primary mb-2">Subject Configuration</h2>
              <p className="text-muted">Configure {formData.quantities.numBranches * formData.quantities.numSubjectsPerBranch} subjects across all branches</p>
            </div>

            <div className="space-y-8">
              {formData.branches.map((branch, branchIndex) => (
                <div key={branchIndex} className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    {branch.name || `Branch ${branchIndex + 1}`} - Subjects
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.subjects
                      .filter(subject => subject.branchIndex === branchIndex)
                      .map((subject, subjectIndex) => {
                        const globalIndex = branchIndex * formData.quantities.numSubjectsPerBranch + subjectIndex
                        return (
                          <div key={globalIndex} className="bg-white/5 rounded-lg p-4">
                            <h4 className="font-medium text-primary mb-3">Subject {subjectIndex + 1}</h4>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-muted mb-1">Subject Name</label>
                                <input
                                  type="text"
                                  value={subject.name}
                                  onChange={(e) => updateArrayItem('subjects', globalIndex, 'name', e.target.value)}
                                  className="w-full px-3 py-2 glass-card border-0 rounded text-primary placeholder-muted focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                  placeholder="Data Structures"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-muted mb-1">Subject Code</label>
                                <input
                                  type="text"
                                  value={subject.code}
                                  onChange={(e) => updateArrayItem('subjects', globalIndex, 'code', e.target.value.toUpperCase())}
                                  className="w-full px-3 py-2 glass-card border-0 rounded text-primary placeholder-muted focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                  placeholder="CS301"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-muted mb-1">Type</label>
                                <select
                                  value={subject.type}
                                  onChange={(e) => updateArrayItem('subjects', globalIndex, 'type', e.target.value)}
                                  className="w-full px-3 py-2 glass-card border-0 rounded text-primary focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                >
                                  <option value="core">Core</option>
                                  <option value="elective">Elective</option>
                                  <option value="lab">Lab</option>
                                  <option value="skill">Skill</option>
                                  <option value="project">Project</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-muted mb-1">Credits</label>
                                <input
                                  type="number"
                                  value={subject.credits}
                                  onChange={(e) => updateArrayItem('subjects', globalIndex, 'credits', parseInt(e.target.value))}
                                  className="w-full px-3 py-2 glass-card border-0 rounded text-primary focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                  min="1"
                                  max="6"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-muted mb-1">Theory Hours</label>
                                <input
                                  type="number"
                                  value={subject.theory_hours}
                                  onChange={(e) => updateArrayItem('subjects', globalIndex, 'theory_hours', parseInt(e.target.value))}
                                  className="w-full px-3 py-2 glass-card border-0 rounded text-primary focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                  min="0"
                                  max="6"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-muted mb-1">Practical Hours</label>
                                <input
                                  type="number"
                                  value={subject.practical_hours}
                                  onChange={(e) => updateArrayItem('subjects', globalIndex, 'practical_hours', parseInt(e.target.value))}
                                  className="w-full px-3 py-2 glass-card border-0 rounded text-primary focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                  min="0"
                                  max="6"
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-primary mb-2">Teacher Assignment</h2>
              <p className="text-muted">Configure {formData.quantities.numTeachers} teachers and assign them to subjects</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.teachers.map((teacher, index) => (
                <div key={index} className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Teacher {index + 1}</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted mb-2">Full Name</label>
                      <input
                        type="text"
                        value={teacher.name}
                        onChange={(e) => updateArrayItem('teachers', index, 'name', e.target.value)}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Dr. John Smith"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted mb-2">Email</label>
                      <input
                        type="email"
                        value={teacher.email}
                        onChange={(e) => updateArrayItem('teachers', index, 'email', e.target.value)}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="john.smith@institution.edu"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted mb-2">Employee ID</label>
                      <input
                        type="text"
                        value={teacher.employee_id}
                        onChange={(e) => updateArrayItem('teachers', index, 'employee_id', e.target.value)}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="EMP001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted mb-2">Designation</label>
                      <select
                        value={teacher.designation}
                        onChange={(e) => updateArrayItem('teachers', index, 'designation', e.target.value)}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="professor">Professor</option>
                        <option value="associate_professor">Associate Professor</option>
                        <option value="assistant_professor">Assistant Professor</option>
                        <option value="lecturer">Lecturer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted mb-2">Specialization</label>
                      <input
                        type="text"
                        value={teacher.specialization}
                        onChange={(e) => updateArrayItem('teachers', index, 'specialization', e.target.value)}
                        className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Computer Science, Data Structures"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted mb-2">Assigned Subjects</label>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {formData.subjects.map((subject, subjectIndex) => (
                          <label key={subjectIndex} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={teacher.assignedSubjects.includes(subject.code)}
                              onChange={(e) => {
                                const currentSubjects = teacher.assignedSubjects
                                const newSubjects = e.target.checked
                                  ? [...currentSubjects, subject.code]
                                  : currentSubjects.filter(code => code !== subject.code)
                                updateArrayItem('teachers', index, 'assignedSubjects', newSubjects)
                              }}
                              className="rounded border-gray-600 bg-transparent text-blue-500 focus:ring-blue-500"
                            />
                            <span className="text-muted">
                              {subject.name || subject.code} ({formData.branches[subject.branchIndex]?.code})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-primary mb-2">Room & Class Setup</h2>
              <p className="text-muted">Configure {formData.quantities.numRooms} rooms and {formData.quantities.numClassGroups} class groups</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Rooms Section */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Rooms Configuration</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {formData.rooms.map((room, index) => (
                    <div key={index} className="glass-card p-4">
                      <h4 className="font-medium text-primary mb-3">Room {index + 1}</h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-muted mb-1">Room Name</label>
                          <input
                            type="text"
                            value={room.name}
                            onChange={(e) => updateArrayItem('rooms', index, 'name', e.target.value)}
                            className="w-full px-3 py-2 glass-card border-0 rounded text-primary placeholder-muted focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                            placeholder="Classroom A-101"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-muted mb-1">Room Code</label>
                          <input
                            type="text"
                            value={room.code}
                            onChange={(e) => updateArrayItem('rooms', index, 'code', e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 glass-card border-0 rounded text-primary placeholder-muted focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                            placeholder="A-101"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-muted mb-1">Type</label>
                          <select
                            value={room.type}
                            onChange={(e) => updateArrayItem('rooms', index, 'type', e.target.value)}
                            className="w-full px-3 py-2 glass-card border-0 rounded text-primary focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                          >
                            <option value="classroom">Classroom</option>
                            <option value="laboratory">Laboratory</option>
                            <option value="seminar_hall">Seminar Hall</option>
                            <option value="auditorium">Auditorium</option>
                            <option value="library">Library</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-muted mb-1">Capacity</label>
                          <input
                            type="number"
                            value={room.capacity}
                            onChange={(e) => updateArrayItem('rooms', index, 'capacity', parseInt(e.target.value))}
                            className="w-full px-3 py-2 glass-card border-0 rounded text-primary focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                            min="10"
                            max="500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-muted mb-1">Building</label>
                          <input
                            type="text"
                            value={room.building}
                            onChange={(e) => updateArrayItem('rooms', index, 'building', e.target.value)}
                            className="w-full px-3 py-2 glass-card border-0 rounded text-primary placeholder-muted focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                            placeholder="Main Building"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-muted mb-1">Floor</label>
                          <input
                            type="number"
                            value={room.floor}
                            onChange={(e) => updateArrayItem('rooms', index, 'floor', parseInt(e.target.value))}
                            className="w-full px-3 py-2 glass-card border-0 rounded text-primary focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                            min="0"
                            max="10"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Class Groups Section */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Class Groups Configuration</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {formData.classGroups.map((classGroup, index) => (
                    <div key={index} className="glass-card p-4">
                      <h4 className="font-medium text-primary mb-3">Class Group {index + 1}</h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-muted mb-1">Class Name</label>
                          <input
                            type="text"
                            value={classGroup.name}
                            onChange={(e) => updateArrayItem('classGroups', index, 'name', e.target.value)}
                            className="w-full px-3 py-2 glass-card border-0 rounded text-primary placeholder-muted focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                            placeholder="CSE-3A"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-muted mb-1">Branch</label>
                          <select
                            value={classGroup.branchIndex}
                            onChange={(e) => updateArrayItem('classGroups', index, 'branchIndex', parseInt(e.target.value))}
                            className="w-full px-3 py-2 glass-card border-0 rounded text-primary focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                          >
                            {formData.branches.map((branch, branchIndex) => (
                              <option key={branchIndex} value={branchIndex}>
                                {branch.name || `Branch ${branchIndex + 1}`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-muted mb-1">Year</label>
                          <input
                            type="number"
                            value={classGroup.year}
                            onChange={(e) => updateArrayItem('classGroups', index, 'year', parseInt(e.target.value))}
                            className="w-full px-3 py-2 glass-card border-0 rounded text-primary focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                            min="1"
                            max="4"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-muted mb-1">Section</label>
                          <input
                            type="text"
                            value={classGroup.section}
                            onChange={(e) => updateArrayItem('classGroups', index, 'section', e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 glass-card border-0 rounded text-primary placeholder-muted focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                            placeholder="A"
                            maxLength={2}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-muted mb-1">Semester</label>
                          <input
                            type="number"
                            value={classGroup.semester}
                            onChange={(e) => updateArrayItem('classGroups', index, 'semester', parseInt(e.target.value))}
                            className="w-full px-3 py-2 glass-card border-0 rounded text-primary focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                            min="1"
                            max="8"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-muted mb-1">Strength</label>
                          <input
                            type="number"
                            value={classGroup.strength}
                            onChange={(e) => updateArrayItem('classGroups', index, 'strength', parseInt(e.target.value))}
                            className="w-full px-3 py-2 glass-card border-0 rounded text-primary focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                            min="10"
                            max="200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-primary mb-2">Review & Complete</h2>
              <p className="text-muted">Review your setup before creating the institution</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Institution Summary */}
              <div className="glass-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Building2 className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-primary">Institution</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted">Name:</span> <span className="text-primary">{formData.institution.name}</span></div>
                  <div><span className="text-muted">Type:</span> <span className="text-primary capitalize">{formData.institution.type}</span></div>
                  <div><span className="text-muted">Academic Year:</span> <span className="text-primary">{formData.institution.academic_year}</span></div>
                  <div><span className="text-muted">Period Duration:</span> <span className="text-primary">{formData.institution.slot_duration} minutes</span></div>
                </div>
              </div>

              {/* Branches Summary */}
              <div className="glass-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <GraduationCap className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-primary">Branches</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted">Total:</span> <span className="text-primary">{formData.quantities.numBranches}</span></div>
                  {formData.branches.slice(0, 3).map((branch, index) => (
                    <div key={index}>
                      <span className="text-muted">{branch.code}:</span> <span className="text-primary">{branch.name}</span>
                    </div>
                  ))}
                  {formData.branches.length > 3 && (
                    <div className="text-muted text-xs">...and {formData.branches.length - 3} more</div>
                  )}
                </div>
              </div>

              {/* Subjects Summary */}
              <div className="glass-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <BookOpen className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-primary">Subjects</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted">Total:</span> <span className="text-primary">{formData.subjects.length}</span></div>
                  <div><span className="text-muted">Per Branch:</span> <span className="text-primary">{formData.quantities.numSubjectsPerBranch}</span></div>
                  <div className="space-y-1">
                    {['core', 'elective', 'lab', 'skill', 'project'].map(type => {
                      const count = formData.subjects.filter(s => s.type === type).length
                      return count > 0 ? (
                        <div key={type}>
                          <span className="text-muted capitalize">{type}:</span> <span className="text-primary">{count}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              </div>

              {/* Teachers Summary */}
              <div className="glass-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="w-6 h-6 text-orange-400" />
                  <h3 className="text-lg font-semibold text-primary">Teachers</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted">Total:</span> <span className="text-primary">{formData.quantities.numTeachers}</span></div>
                  {formData.teachers.slice(0, 3).map((teacher, index) => (
                    <div key={index}>
                      <span className="text-primary">{teacher.name}</span>
                      <div className="text-xs text-muted">{teacher.assignedSubjects.length} subjects assigned</div>
                    </div>
                  ))}
                  {formData.teachers.length > 3 && (
                    <div className="text-muted text-xs">...and {formData.teachers.length - 3} more</div>
                  )}
                </div>
              </div>

              {/* Rooms Summary */}
              <div className="glass-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <MapPin className="w-6 h-6 text-red-400" />
                  <h3 className="text-lg font-semibold text-primary">Rooms</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted">Total:</span> <span className="text-primary">{formData.quantities.numRooms}</span></div>
                  <div className="space-y-1">
                    {['classroom', 'laboratory', 'seminar_hall', 'auditorium', 'library'].map(type => {
                      const count = formData.rooms.filter(r => r.type === type).length
                      return count > 0 ? (
                        <div key={type}>
                          <span className="text-muted capitalize">{type.replace('_', ' ')}:</span> <span className="text-primary">{count}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              </div>

              {/* Class Groups Summary */}
              <div className="glass-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-primary">Class Groups</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted">Total:</span> <span className="text-primary">{formData.quantities.numClassGroups}</span></div>
                  <div><span className="text-muted">Total Students:</span> <span className="text-primary">{formData.classGroups.reduce((sum, cg) => sum + cg.strength, 0)}</span></div>
                  {formData.classGroups.slice(0, 3).map((classGroup, index) => (
                    <div key={index}>
                      <span className="text-primary">{classGroup.name}</span>
                      <div className="text-xs text-muted">{classGroup.strength} students</div>
                    </div>
                  ))}
                  {formData.classGroups.length > 3 && (
                    <div className="text-muted text-xs">...and {formData.classGroups.length - 3} more</div>
                  )}
                </div>
              </div>
            </div>

            <div className="glass-card p-6 bg-green-500/10 border border-green-500/20">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-300 mb-1">Ready to Create</h4>
                  <p className="text-sm text-green-200">
                    Your institution setup is complete and ready to be created. Click "Complete Setup" to proceed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Step {currentStep} content will be implemented</div>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-blue-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <h1 className="text-xl font-semibold text-primary">
              {steps[currentStep - 1]?.title}
            </h1>
            <p className="text-muted">
              {steps[currentStep - 1]?.description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8 mb-8"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={currentStep === 1 ? onCancel : prevStep}
            className="flex items-center space-x-2 px-6 py-3 glass-card hover:bg-white/10 transition-colors rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? 'Cancel' : 'Previous'}</span>
          </button>

          <div className="text-sm text-muted">
            Step {currentStep} of {steps.length}
          </div>

          <button
            onClick={currentStep === steps.length ? handleSubmit : nextStep}
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg text-white"
          >
            <span>{currentStep === steps.length ? (isSubmitting ? 'Creating...' : 'Complete Setup') : 'Next'}</span>
            {currentStep < steps.length && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
